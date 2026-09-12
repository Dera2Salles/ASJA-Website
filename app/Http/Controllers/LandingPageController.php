<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Post;
use App\Models\Testimony;
use App\Support\Cms;
use App\Support\Images;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function index(): Response
    {
        $postColumns = ['id', 'title', 'slug', 'type', 'excerpt', 'cover_image',
            'category', 'published_at', 'event_start_at', 'event_end_at', 'location'];

        // Contenu éditable, déjà fusionné avec les valeurs par défaut.
        $cms = Cms::all();

        return Inertia::render('LandingPage', [
            'cms' => $cms,

            /* L'accueil est la page d'entrée du site : c'est elle qui porte la
               fiche de l'établissement, bâtie sur les coordonnées saisies dans
               l'administration. */
            'seo' => Seo::make(
                description: (string) ($cms['hero']['subtitle'] ?? ''),
            )->schema(Seo::organization())->toArray(),

            /* Bannière : l'élément LCP du site. Rendue par React, elle
               n'apparaîtrait dans le document qu'après l'exécution du bundle ;
               préchargée ici, son téléchargement part avec la première ligne
               de HTML. */
            'preloadImage' => Images::preloadHero(
                $cms['hero']['background_image'] ?? null,
                config('seo.hero_image'),
            ),

            'testimonies' => Testimony::where('is_visible', true)->get(),
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo', 'card_image']),

            'posts' => Post::published()->ofType(Post::TYPE_ARTICLE)->take(6)->get($postColumns),
            // Le carrousel « Ça bouge » parcourt la totalité de la liste : le
            // plafond n'existe plus que pour borner le poids de la réponse.
            'events' => Post::published()->ofType(Post::TYPE_EVENEMENT)->take(24)->get($postColumns),
            'announcements' => Post::published()->ofType(Post::TYPE_ANNONCE)->take(3)->get($postColumns),
        ]);
    }
}
