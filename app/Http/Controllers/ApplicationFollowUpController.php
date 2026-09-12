<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompleteApplicationRequest;
use App\Models\Application;
use App\Models\Department;
use App\Support\ApplicationFiles;
use App\Support\Cms;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Suivi d'une demande déjà déposée, et dépôts qui viennent après elle.
 *
 * Deux moments demandent au candidat de revenir : le dossier déclaré
 * « à compléter », et le bordereau des frais généraux dû une fois le dossier
 * validé. Ni l'un ni l'autre ne justifie de refaire les sept étapes — le
 * dossier existe, il porte un numéro, et il ne manque qu'une pièce ou une
 * correction.
 *
 * **Le numéro de demande n'ouvre rien à lui seul.** Il est séquentiel, donc
 * devinable : `ASJA-2026-0002` se déduit de `ASJA-2026-0001`. La recherche
 * exige donc aussi l'adresse e-mail déclarée au dépôt, elle est limitée en
 * cadence, et sa réponse ne dit jamais si le numéro existe — sans quoi elle
 * servirait à énumérer les dossiers. Le droit ainsi obtenu est ensuite gardé
 * en session, et c'est lui, et non le numéro dans l'adresse, qui autorise les
 * envois.
 */
class ApplicationFollowUpController extends Controller
{
    /** Dossiers que la session en cours a le droit d'ouvrir. */
    private const SESSION_KEY = 'candidature.granted';

    /** Durée de validité du lien de suivi, celui de l'accusé de réception compris. */
    private const LINK_DAYS = 30;

    /** Recherche du dossier : numéro de demande et adresse e-mail. */
    public function create(): Response
    {
        return Inertia::render('Application/Track', [
            'seo' => Seo::make(
                title: 'Suivi de ma demande',
                description: "Suivez l'instruction de votre demande d'inscription à l'Université ASJA à partir de votre numéro de demande.",
                url: route('candidature.suivi.create'),
            )->noindex()->toArray(),

            ...$this->layout(),
        ]);
    }

    /**
     * Retrouve le dossier, ou ne dit rien.
     *
     * Le message d'échec est le même que le numéro soit inconnu ou que
     * l'adresse ne corresponde pas : distinguer les deux confirmerait
     * l'existence d'un dossier à qui en essaie les numéros. La cadence est
     * bornée par le `throttle` porté par la route.
     */
    public function find(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reference' => ['required', 'string', 'max:40'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
        ], [], [
            'reference' => 'numéro de demande',
            'email' => 'adresse e-mail',
        ]);

        $application = Application::where('reference', trim($validated['reference']))->first();

        if (! $application || ! $application->belongsToApplicant($validated['email'])) {
            throw ValidationException::withMessages([
                'reference' => 'Aucun dossier ne correspond à ce numéro de demande et à cette adresse e-mail. '
                    . 'Vérifiez l\'accusé de réception reçu par e-mail, ou contactez le bureau de la scolarité.',
            ]);
        }

        $this->grant($request, $application);

        return redirect()->to(static::followUpUrl($application));
    }

    /**
     * État du dossier, et l'action qu'il ouvre — s'il en ouvre une.
     *
     * La route porte `signed` : le lien vient de la recherche ci-dessus ou de
     * l'accusé de réception, et il expire. L'arrivée vaut droit d'accès pour
     * la session, ce qui dispense les envois qui suivent de rejouer la
     * signature dans un formulaire multipart.
     */
    public function show(Request $request, Application $application): Response
    {
        $application->load('documents');
        $this->grant($request, $application);

        return Inertia::render('Application/FollowUp', [
            // Dossier nominatif, ouvert par lien signé : jamais indexé.
            'seo' => Seo::make(title: 'Mon dossier')->noindex()->toArray(),

            'application' => $this->payload($application),
            ...$this->layout(),
        ]);
    }

    /**
     * Renvoi d'un dossier « à compléter ».
     *
     * La requête a déjà refusé tout ce qui n'était pas réclamé — le contrôleur
     * n'écrit donc que des champs et des pièces que l'administration a
     * elle-même rouverts. Le dossier repart ensuite en instruction, et la liste
     * des éléments réclamés est vidée : c'est ce qui ferme le formulaire, et ce
     * qui empêche le même document d'être renvoyé dix fois.
     */
    public function complete(CompleteApplicationRequest $request, Application $application): RedirectResponse
    {
        $this->authorizeAccess($request, $application);

        $fields = $application->requestedFieldNames();
        $values = collect($request->validated())->only($fields)->all();

        /* Changer de mention change aussi ce qui en est gardé au dossier : la
           clé étrangère pour joindre la table, le nom pour que la ligne reste
           lisible si la mention est plus tard renommée. Même règle qu'au dépôt. */
        if (array_key_exists('mention', $values)) {
            $department = Department::where('slug', $values['mention'])->first();

            $values['mention'] = $department?->slug;
            $values['mention_name'] = $department?->name;
            $values['department_id'] = $department?->id;
        }

        try {
            DB::transaction(function () use ($application, $request, $values) {
                $application->forceFill([
                    ...$values,
                    'status' => Application::STATUS_PROCESSING,
                    'completed_at' => now(),

                    /* Plus rien n'est réclamé : le parcours se referme de
                       lui-même, sans qu'aucun écran n'ait à s'en souvenir. */
                    'requested_documents' => null,
                    'requested_fields' => null,
                ])->save();

                ApplicationFiles::attachMany($application, $request->file('documents', []));
            });
        } catch (\Throwable $e) {
            Log::error('Complément de candidature en échec', [
                'reference' => $application->reference,
                'exception' => $e,
            ]);

            return back()->with('error', "Votre envoi n'a pas pu être enregistré. Réessayez dans quelques instants ; si le problème persiste, contactez le bureau de la scolarité.");
        }

        return redirect()
            ->to(static::followUpUrl($application))
            ->with('success', 'Votre dossier complété a bien été transmis au service de la scolarité.');
    }

    /**
     * Dépôt du bordereau des frais généraux.
     *
     * Trois conditions, vérifiées ici et pas seulement à l'écran : le dossier
     * existe, il est validé, et son type doit ce versement — une réinscription
     * l'a déjà réglé au dépôt. `fees_receipt_at` renseignée ferme ensuite le
     * formulaire : le même bordereau n'est pas envoyé deux fois.
     */
    public function fees(Request $request, Application $application): RedirectResponse
    {
        $this->authorizeAccess($request, $application);
        $application->load('documents');

        abort_unless($application->awaitsFeesReceipt(), 403);

        $type = $application->feesDocumentType();

        $request->validate([
            'document' => [
                'required',
                'file',
                'mimes:' . implode(',', Application::documentExtensions($type)),
                'max:' . Application::DOCUMENT_MAX_KB,
            ],
        ], [
            'document.required' => 'Choisissez le fichier de votre bordereau de versement.',
            'document.mimes' => 'Formats acceptés : '
                . strtoupper(implode(', ', Application::documentExtensions($type))) . '.',
            'document.max' => 'Le fichier dépasse la taille maximale de '
                . round(Application::DOCUMENT_MAX_KB / 1024) . ' Mo.',
        ], [
            'document' => 'bordereau de versement des frais généraux',
        ]);

        try {
            DB::transaction(function () use ($application, $request, $type) {
                ApplicationFiles::attach($application, $type, $request->file('document'));

                $application->forceFill([
                    'status' => Application::STATUS_FEES_SUBMITTED,
                    'fees_receipt_at' => now(),
                ])->save();
            });
        } catch (\Throwable $e) {
            Log::error('Bordereau des frais généraux en échec', [
                'reference' => $application->reference,
                'exception' => $e,
            ]);

            return back()->with('error', "Votre bordereau n'a pas pu être enregistré. Réessayez dans quelques instants ; si le problème persiste, contactez le bureau de la scolarité.");
        }

        return redirect()
            ->to(static::followUpUrl($application))
            ->with('success', 'Votre bordereau de versement a bien été transmis au service de la scolarité.');
    }

    /**
     * Lien de suivi, signé et daté.
     *
     * Publique et statique : l'accusé de réception l'insère lui aussi, pour que
     * le candidat retrouve son dossier sans avoir à ressaisir quoi que ce soit.
     */
    public static function followUpUrl(Application $application): string
    {
        return URL::temporarySignedRoute(
            'candidature.suivi.show',
            now()->addDays(self::LINK_DAYS),
            ['application' => $application->reference]
        );
    }

    /* --- Droit d'accès --------------------------------------------------- */

    /** Le dossier ouvert par un lien valide reste ouvert le temps de la session. */
    private function grant(Request $request, Application $application): void
    {
        $granted = (array) $request->session()->get(self::SESSION_KEY, []);

        if (! in_array($application->id, $granted, true)) {
            $granted[] = $application->id;
            $request->session()->put(self::SESSION_KEY, $granted);
        }
    }

    /**
     * Un envoi ne s'appuie jamais sur le seul numéro dans l'adresse : il exige
     * le droit obtenu par la recherche ou par le lien signé. Sans lui, poster
     * sur `/candidature/suivi/ASJA-2026-0001/bordereau` suffirait à joindre une
     * pièce au dossier d'un autre.
     */
    private function authorizeAccess(Request $request, Application $application): void
    {
        abort_unless(
            in_array($application->id, (array) $request->session()->get(self::SESSION_KEY, []), true),
            403,
            'Retrouvez d\'abord votre dossier avec votre numéro de demande et votre adresse e-mail.'
        );
    }

    /* --- Composition de la page ------------------------------------------ */

    /**
     * Ce que le candidat voit de son propre dossier.
     *
     * Rien de plus que ce qu'il a lui-même déclaré, plus l'état de son
     * instruction. La note interne de l'administration n'y figure pas : elle
     * est écrite pour la scolarité, `completion_message` est ce qui s'adresse
     * au candidat.
     */
    private function payload(Application $application): array
    {
        $action = $application->openAction();
        $feesType = $application->feesDocumentType();
        $requestedDocuments = $application->requestedDocumentTypes();

        return [
            'reference' => $application->reference,
            'display_name' => $application->display_name,
            'type' => $application->type,
            'type_label' => $application->type_label,
            'status' => $application->status,
            'status_label' => $application->status_label,
            'email' => $application->email,
            'level' => $application->level,
            'mention_name' => $application->mention_name,
            'student_number' => $application->student_number,
            'submitted_at' => $application->submitted_at?->toIso8601String(),
            'completed_at' => $application->completed_at?->toIso8601String(),
            'fees_receipt_at' => $application->fees_receipt_at?->toIso8601String(),

            'timeline' => $application->timeline(),

            /* L'action ouverte est décidée ici, pas à l'écran : le front s'y
               règle, mais le serveur revérifie à chaque envoi. */
            'action' => $action,
            'completion_message' => $application->completion_message,

            'requested_documents' => collect($requestedDocuments)
                ->map(fn (string $type) => [
                    'type' => $type,
                    'label' => Application::DOCUMENTS[$type]['label'],
                    'hint' => Application::DOCUMENTS[$type]['hint'],
                    'extensions' => Application::documentExtensions($type),
                ])
                ->all(),

            'requested_fields' => Application::fieldSpecsFor($application->requestedFieldNames()),

            /* Valeurs actuelles des seuls champs rouverts : le formulaire de
               correction part de ce qui est au dossier, et le reste n'a pas à
               repasser par le navigateur. */
            'values' => collect($application->requestedFieldNames())
                ->mapWithKeys(fn (string $field) => [
                    $field => $this->displayValue($application, $field),
                ])
                ->all(),

            'documents' => $application->documents
                ->map(fn ($document) => [
                    'type' => $document->type,
                    'label' => $document->label,
                    'original_name' => $document->original_name,
                    'received_at' => $document->created_at?->toIso8601String(),
                ])
                ->values()
                ->all(),

            /* Frais généraux : le montant et le compte, pour que le candidat
               n'ait pas à retourner chercher l'un ou l'autre ailleurs. */
            'fees' => $feesType === null ? null : [
                'document' => [
                    'type' => $feesType,
                    'label' => Application::DOCUMENTS[$feesType]['label'],
                    'hint' => Application::DOCUMENTS[$feesType]['hint'],
                    'extensions' => Application::documentExtensions($feesType),
                ],
                'amount' => Application::feeDue($application->type, Application::FEE_AFTER_VALIDATION),
                'account' => Application::BANK_ACCOUNT,
                'received' => $application->document($feesType) !== null,
            ],

            'maxFileSizeKb' => Application::DOCUMENT_MAX_KB,
        ];
    }

    /**
     * Valeur d'un champ telle qu'un formulaire la reprend : les dates au
     * format d'un champ `date`, tout le reste en chaîne. `null` deviendrait
     * une saisie non contrôlée côté React.
     */
    private function displayValue(Application $application, string $field): string
    {
        $value = $application->{$field};

        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        return $value === null ? '' : (string) $value;
    }

    /** Navigation et pied de page communs à tout le site public. */
    private function layout(): array
    {
        return [
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),
            'cms' => Cms::all(),
        ];
    }
}
