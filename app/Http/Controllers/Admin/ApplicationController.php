<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApplicationController as PublicApplicationController;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Support\StudentFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Instruction des demandes d'inscription et de réinscription.
 *
 * L'écran rejoint le tableau de bord existant — même barre latérale, mêmes
 * briques : il n'y a pas de seconde administration. Le groupe de routes porte
 * déjà `auth` et `admin`, ce qui vaut aussi pour le téléchargement des pièces :
 * c'est le seul chemin par lequel un document sort du disque privé.
 */
class ApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $applications = Application::query()
            ->status($request->input('status'))
            ->when($request->input('type'), fn ($query, $type) => $query->where('type', $type))
            ->when($request->input('mention'), fn ($query, $mention) => $query->where('mention', $mention))
            ->when($request->input('level'), fn ($query, $level) => $query->where('level', $level))
            ->when($request->input('search'), function ($query, string $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->withCount('documents')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Applications/Index', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'status', 'type', 'mention', 'level']),
            'options' => [
                'statuses' => $this->labelled(Application::STATUSES),
                'types' => $this->labelled(Application::TYPES),
                'levels' => StudentFile::LEVELS,
                'mentions' => StudentFile::mentions(),
            ],
            'counts' => Application::selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
        ]);
    }

    public function show(Application $application): Response
    {
        $application->load('documents', 'department:id,slug,name');

        return Inertia::render('Admin/Applications/Show', [
            'application' => [
                ...$application->toArray(),
                // Pièces obligatoires encore absentes : c'est ce qui distingue
                // un dossier « à compléter » d'un dossier complet.
                'missing_documents' => array_map(
                    fn (string $type) => Application::DOCUMENTS[$type]['label'],
                    $application->missingDocuments()
                ),

                /* Le bordereau des frais généraux n'est pas une pièce du dépôt :
                   il arrive après validation, par le parcours de suivi. L'écran
                   d'instruction dit donc s'il est attendu, et non s'il manque. */
                'awaits_fees_receipt' => $application->awaitsFeesReceipt(),
                'fees_receipt_type' => $application->feesDocumentType(),
            ],
            'options' => [
                'statuses' => $this->labelled(Application::STATUSES),

                /* Ce qu'un dossier « à compléter » peut rouvrir : les pièces du
                   dépôt et les champs déclarés, tous filtrés par le type de
                   demande. Une réinscription n'a ni CIN ni baccalauréat à
                   corriger — les proposer serait promettre au candidat un
                   formulaire que le serveur refuserait. */
                'requestableDocuments' => collect(Application::documentSpecs())
                    ->filter(fn (array $document) => in_array($application->type, $document['appliesTo'], true))
                    ->map(fn (array $document) => [
                        'value' => $document['type'],
                        'label' => $document['label'],
                    ])
                    ->values()
                    ->all(),

                'requestableFields' => collect(Application::fieldSpecsFor(
                    Application::FIELDS[$application->type] ?? []
                ))
                    ->map(fn (array $field) => [
                        'value' => $field['name'],
                        'label' => $field['label'],
                    ])
                    ->all(),

                'incompleteStatus' => Application::STATUS_INCOMPLETE,
            ],
        ]);
    }

    /**
     * Changement de statut, et ce que le candidat en verra.
     *
     * Le statut ne fait pas que classer : il ouvre ou ferme le parcours de
     * suivi. « À compléter » rouvre au candidat les seules pièces et les seuls
     * champs désignés ici — tout autre statut referme le formulaire en vidant
     * ces listes, faute de quoi un dossier repassé en instruction resterait
     * indéfiniment modifiable par son candidat.
     */
    public function updateStatus(Request $request, Application $application): RedirectResponse
    {
        $documents = collect(Application::documentSpecs())
            ->filter(fn (array $document) => in_array($application->type, $document['appliesTo'], true))
            ->pluck('type')
            ->all();

        $fields = Application::FIELDS[$application->type] ?? [];

        $validated = $request->validate([
            'status' => ['required', Rule::in(array_keys(Application::STATUSES))],
            'admin_note' => ['nullable', 'string', 'max:2000'],

            /* Message adressé au candidat, à ne pas confondre avec la note
               interne : c'est la seule chose qui lui dise quoi corriger. */
            'completion_message' => ['nullable', 'string', 'max:2000'],

            'requested_documents' => ['array'],
            'requested_documents.*' => [Rule::in($documents)],
            'requested_fields' => ['array'],
            'requested_fields.*' => [Rule::in($fields)],
        ], [
            'requested_documents.*.in' => 'Cette pièce n\'est pas demandée pour ce type de demande.',
            'requested_fields.*.in' => 'Ce champ n\'est pas déclaré pour ce type de demande.',
        ]);

        $incomplete = $validated['status'] === Application::STATUS_INCOMPLETE;

        $requestedDocuments = $validated['requested_documents'] ?? [];
        $requestedFields = $validated['requested_fields'] ?? [];

        /* Un dossier déclaré « à compléter » sans rien à compléter laisserait le
           candidat devant un écran qui lui demande d'agir sans dire sur quoi. */
        if ($incomplete && ! $requestedDocuments && ! $requestedFields && ! trim((string) ($validated['completion_message'] ?? ''))) {
            return back()->withErrors([
                'requested_documents' => 'Indiquez au moins une pièce, un champ à corriger, ou un message expliquant ce qui manque.',
            ]);
        }

        $before = $application->status;

        $application->forceFill([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? null,
            'completion_message' => $incomplete ? ($validated['completion_message'] ?? null) : $application->completion_message,

            // Les listes n'ont cours que le temps où le dossier est à compléter.
            'requested_documents' => $incomplete ? $requestedDocuments : null,
            'requested_fields' => $incomplete ? $requestedFields : null,
            'completion_requested_at' => $incomplete ? now() : $application->completion_requested_at,
        ])->save();

        /* Le candidat n'a aucun moyen de savoir qu'on l'attend : les deux
           statuts qui lui demandent d'agir lui sont donc annoncés. L'échec du
           courrier ne défait pas le changement de statut — il est journalisé,
           et l'écran le dit. */
        $notified = $before !== $application->status
            && in_array($application->status, [Application::STATUS_INCOMPLETE, Application::STATUS_ACCEPTED], true)
            ? PublicApplicationController::sendStatusUpdate($application)
            : null;

        if ($notified === false) {
            return back()->with('error', 'Statut mis à jour, mais le candidat n\'a pas pu être prévenu par e-mail.');
        }

        return back()->with('success', $notified
            ? 'Statut mis à jour, et le candidat a été prévenu par e-mail.'
            : 'Statut mis à jour.');
    }

    /**
     * Sert une pièce justificative depuis le disque privé.
     *
     * `Content-Disposition: inline` avec le nom d'origine : la pièce s'ouvre
     * dans l'onglet sans quitter l'écran d'instruction.
     */
    public function document(Application $application, ApplicationDocument $document): StreamedResponse
    {
        // Un identifiant de pièce ne doit pas ouvrir le dossier d'un autre.
        abort_unless($document->application_id === $application->id, 404);

        abort_unless(
            Storage::disk(Application::DISK)->exists($document->path),
            404
        );

        return Storage::disk(Application::DISK)->response(
            $document->path,
            $document->original_name,
            ['Content-Type' => $document->mime_type]
        );
    }

    /** Renvoi de l'accusé de réception, quand le premier envoi a échoué. */
    public function resendReceipt(Application $application): RedirectResponse
    {
        return PublicApplicationController::sendReceipt($application)
            ? back()->with('success', 'Accusé de réception renvoyé à ' . $application->email . '.')
            : back()->with('error', "L'accusé de réception n'a pas pu être envoyé. Vérifiez la configuration du courrier.");
    }

    /** La suppression emporte les pièces du disque (voir le modèle). */
    public function destroy(Application $application): RedirectResponse
    {
        $application->delete();

        return redirect()->route('admin.applications.index')->with('success', 'Demande supprimée.');
    }

    /** @return array<int, array{value: string, label: string}> */
    private function labelled(array $map): array
    {
        return collect($map)
            ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }
}
