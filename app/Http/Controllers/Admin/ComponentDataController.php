<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Cms;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
    public function index(): Response
    {
        return Inertia::render('Admin/ComponentData/Index', [
            'schema' => Cms::schema(),
            'content' => Cms::all(),
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
     * Upload d'une image de contenu. Passe par le disque `public` de Laravel
     * avec un nom généré, pour ne jamais réutiliser le nom de fichier fourni
     * par le client.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,avif', 'max:5120'],
        ]);

        $file = $request->file('image');
        $name = Str::uuid() . '.' . $file->extension();
        $path = $file->storeAs('cms', $name, 'public');

        return response()->json([
            'path' => Storage::url($path),
        ]);
    }
}
