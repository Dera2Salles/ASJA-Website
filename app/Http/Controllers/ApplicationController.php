<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationRequest;
use App\Mail\ApplicationReceived;
use App\Models\Application;
use App\Models\Department;
use App\Support\Cms;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Dépôt en ligne d'une demande d'inscription ou de réinscription.
 *
 * Le parcours est public : un candidat n'a par définition pas encore de compte.
 * Tout se joue en une soumission — le formulaire garde ses étapes et ses
 * fichiers dans le navigateur, et n'envoie qu'à la fin. Rien n'est donc écrit
 * en base ni sur le disque tant que le dossier n'est pas complet, et aucune
 * pièce orpheline ne s'accumule pour les formulaires abandonnés.
 */
class ApplicationController extends Controller
{
    /** Durée de validité du lien de confirmation envoyé après le dépôt. */
    private const CONFIRMATION_DAYS = 7;

    public function create(Request $request): Response
    {
        return Inertia::render('Application/Create', [
            'options' => Application::formOptions(),

            /* Mention pré-choisie quand le candidat arrive depuis la page
               d'une mention (`/candidature?mention=informatique`). Elle est
               confrontée aux mentions réellement visibles : un slug inventé
               dans l'adresse ne doit pas préremplir un champ contraint, ni
               laisser croire à un choix qui sera refusé à l'envoi. */
            'prefill' => [
                'mention' => Department::where('slug', $request->query('mention'))
                    ->where('is_visible', true)
                    ->value('slug'),
            ],

            // Navigation et pied de page communs à tout le site public.
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),
            'cms' => Cms::all(),
        ]);
    }

    public function store(StoreApplicationRequest $request): RedirectResponse
    {
        /* Rejeu du même formulaire — double clic, bouton « précédent » du
           navigateur, connexion coupée en cours d'envoi. Le dossier existe
           déjà : on renvoie sa confirmation plutôt que d'en créer un second. */
        $existing = Application::where('idempotency_key', $request->input('idempotency_key'))->first();

        if ($existing) {
            return redirect()->to($this->confirmationUrl($existing));
        }

        /* La mention n'est demandée qu'en première inscription : une
           réinscription reprend celle déjà au dossier de l'étudiant, que son
           matricule désigne. */
        $department = $request->filled('mention')
            ? Department::where('slug', $request->input('mention'))->firstOrFail()
            : null;

        try {
            $application = DB::transaction(function () use ($request, $department) {
                $application = Application::createWithReference([
                    ...$request->safe()->except(['documents', 'mention']),

                    'mention' => $department?->slug,
                    'mention_name' => $department?->name,
                    'department_id' => $department?->id,

                    // Jamais depuis la requête : le statut appartient à l'établissement.
                    'status' => Application::STATUS_PENDING,
                    'submitted_at' => now(),

                    // Rattache la demande au compte quand elle est déposée connecté.
                    'user_id' => $request->user()?->id,
                ]);

                $this->storeDocuments($application, $request->file('documents', []));

                return $application;
            });
        } catch (\Throwable $e) {
            /* Deux envois partis en même temps avec le même jeton : le premier
               a écrit, le second a buté sur l'index unique. La demande existe,
               le candidat doit voir sa confirmation, pas une erreur. */
            $concurrent = Application::where('idempotency_key', $request->input('idempotency_key'))->first();

            if ($concurrent) {
                return redirect()->to($this->confirmationUrl($concurrent));
            }

            /* La trace part au journal, jamais à l'écran : le candidat reçoit
               une phrase qu'il peut comprendre et agir dessus. */
            Log::error('Dépôt de candidature en échec', ['exception' => $e]);

            return back()
                ->withInput()
                ->with('error', "Votre demande n'a pas pu être enregistrée. Réessayez dans quelques instants ; si le problème persiste, contactez le bureau de la scolarité.");
        }

        $this->sendReceipt($application);

        return redirect()->to($this->confirmationUrl($application));
    }

    /**
     * Page de confirmation, atteinte par un lien signé.
     *
     * Le numéro de demande suffirait à ouvrir le dossier de n'importe qui si
     * l'adresse était devinable : la signature ferme l'énumération, et le lien
     * expire. Il reste partageable par le candidat depuis son historique le
     * temps de la démarche.
     */
    public function confirmation(Application $application): Response
    {
        return Inertia::render('Application/Confirmation', [
            'application' => [
                'reference' => $application->reference,
                // Le nom pour une première inscription, le matricule pour une
                // réinscription : elle ne redéclare pas d'état civil.
                'display_name' => $application->display_name,
                'type_label' => $application->type_label,
                'level' => $application->level,
                'mention_name' => $application->mention_name,
                'student_number' => $application->student_number,
                'email' => $application->email,
                'status_label' => $application->status_label,
                'receipt_sent' => $application->receipt_sent_at !== null,
                'documents' => $application->documents->map(fn ($document) => [
                    'label' => $document->label,
                    'original_name' => $document->original_name,
                ])->all(),
            ],

            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),
            'cms' => Cms::all(),
        ]);
    }

    /**
     * Écrit les pièces sur le disque privé.
     *
     * Le nom fourni par le client n'est jamais réutilisé sur le disque : il est
     * remplacé par un identifiant engendré, ce qui ferme d'un coup la
     * traversée de chemin, la collision de noms et le fichier à double
     * extension. Le nom d'origine est conservé en base, pour l'affichage seul.
     *
     * @param  array<string, UploadedFile>  $files
     */
    private function storeDocuments(Application $application, array $files): void
    {
        foreach ($files as $type => $file) {
            if (! isset(Application::DOCUMENTS[$type]) || ! $file instanceof UploadedFile) {
                continue;
            }

            $extension = strtolower($file->extension() ?: $file->getClientOriginalExtension());

            $path = Storage::disk(Application::DISK)->putFileAs(
                'applications/' . $application->reference,
                $file,
                $type . '-' . Str::uuid() . ($extension ? '.' . $extension : '')
            );

            $application->documents()->create([
                'type' => $type,
                'path' => $path,
                // Nettoyé : il n'est qu'affiché, mais il vient du client.
                'original_name' => Str::limit(basename($file->getClientOriginalName()), 180, ''),
                'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                'size' => $file->getSize() ?: 0,
            ]);
        }
    }

    /**
     * Envoie l'accusé de réception.
     *
     * L'échec du courrier ne fait jamais perdre la demande : elle est déjà en
     * base, le candidat voit sa confirmation, et `receipt_sent_at` resté nul
     * signale à l'administration l'accusé à renvoyer.
     */
    public static function sendReceipt(Application $application): bool
    {
        try {
            Mail::send(new ApplicationReceived($application));

            $application->forceFill(['receipt_sent_at' => now()])->save();

            return true;
        } catch (\Throwable $e) {
            Log::error('Accusé de réception non envoyé', [
                'reference' => $application->reference,
                'exception' => $e,
            ]);

            return false;
        }
    }

    private function confirmationUrl(Application $application): string
    {
        return URL::temporarySignedRoute(
            'candidature.confirmation',
            now()->addDays(self::CONFIRMATION_DAYS),
            ['application' => $application->reference]
        );
    }
}
