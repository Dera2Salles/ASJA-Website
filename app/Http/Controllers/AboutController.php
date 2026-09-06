<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Support\Cms;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Page « À propos ».
 *
 * Tout son contenu — textes, images, valeurs, galerie — vient de la section
 * `about` du schéma CMS : la page n'écrit rien en dur, et l'administration la
 * remplit depuis « Contenu » sans qu'on retouche au code.
 */
class AboutController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('About', [
            'cms' => Cms::all(),

            // Navigation et pied de page communs à tout le site.
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),
        ]);
    }
}
