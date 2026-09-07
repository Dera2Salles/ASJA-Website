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
            ],
            'options' => [
                'statuses' => $this->labelled(Application::STATUSES),
            ],
        ]);
    }

    /** Changement de statut, avec la note d'instruction qui l'accompagne. */
    public function updateStatus(Request $request, Application $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(array_keys(Application::STATUSES))],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $application->update($validated);

        return back()->with('success', 'Statut mis à jour.');
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
