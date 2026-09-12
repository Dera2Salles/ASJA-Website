<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Support\Cms;
use App\Support\Images;
use App\Support\Seo;
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
        $cms = Cms::all();

        return Inertia::render('About', [
            'cms' => $cms,

            'seo' => Seo::make(
                title: (string) ($cms['about']['title'] ?? 'À propos'),
                description: (string) ($cms['about']['intro'] ?? ''),
            )->breadcrumb([
                'Accueil' => '/',
                (string) ($cms['about']['title'] ?? 'À propos') => null,
            ])->toArray(),

            'preloadImage' => Images::preloadHero(
                $cms['about']['hero_image'] ?? null,
                'Lieu_espace/Asja-devant-quality-2',
            ),

            // Navigation et pied de page communs à tout le site.
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),
        ]);
    }
}
