<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Cms;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Édition du contenu du site. Entièrement piloté par config/cms.php :
 * l'écran d'admin se génère à partir du schéma, et la validation s'appuie
 * sur ce même schéma. Ajouter un champ au schéma suffit.
 */
class ComponentDataController extends Controller
{
    /**
     * La section affichée vit dans l'URL (`?section=faq`) : le sommaire est
     * remonté dans la barre latérale de l'administration, et une section
     * précise redevient donc adressable, partageable et navigable au retour
     * arrière du navigateur.
     */
    public function index(Request $request): Response
    {
        $sections = array_keys(Cms::schema());
        $requested = $request->query('section');

        $active = in_array($requested, $sections, true)
            ? $requested
            : Cms::defaultSection();

        return Inertia::render('Admin/ComponentData/Index', [
            'schema' => Cms::schema(),
            'content' => Cms::all(),
            'activeSection' => $active,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'section' => ['required', 'string', Rule::in(array_keys(Cms::schema()))],
            'data' => ['required', 'array'],
        ]);

        Cms::put($validated['section'], $validated['data']);

        $label = Cms::sectionSchema($validated['section'])['label'] ?? $validated['section'];

        return back()->with('success', "Section « {$label} » mise à jour.");
    }

    /**
     * Upload d'une image de contenu, dans `public/uploads/cms` sous un nom
     * généré pour ne jamais réutiliser le nom de fichier fourni par le client.
     * Le chemin renvoyé est déjà celui servi par le serveur web : c'est lui qui
     * est enregistré tel quel dans la section.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,avif', 'max:5120'],
        ]);

        return response()->json([
            'path' => Uploads::store($request->file('image'), 'cms'),
        ]);
    }
}
