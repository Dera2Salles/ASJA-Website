<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Post;
use Illuminate\Http\Response;

/**
 * Plan du site, pour les moteurs de recherche.
 *
 * Engendré à la demande plutôt que déposé en fichier : les mentions et les
 * publications sont en base, et un fichier statique aurait vieilli dès la
 * publication suivante. La réponse est mise en cache par le navigateur du
 * robot pendant une heure — le rythme des parutions ne justifie pas mieux.
 */
class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = [
            ['loc' => route('home'), 'priority' => '1.0', 'changefreq' => 'weekly'],
            ['loc' => route('about'), 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => route('blog.index'), 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['loc' => route('candidature.create'), 'priority' => '0.9', 'changefreq' => 'monthly'],
        ];

        foreach (Department::where('is_visible', true)->orderBy('sort_order')->get() as $department) {
            $urls[] = [
                'loc' => route('department.show', $department->slug),
                'lastmod' => $department->updated_at?->toAtomString(),
                'priority' => '0.8',
                'changefreq' => 'monthly',
            ];
        }

        foreach (Post::published()->get(['slug', 'updated_at']) as $post) {
            $urls[] = [
                'loc' => route('blog.show', $post->slug),
                'lastmod' => $post->updated_at?->toAtomString(),
                'priority' => '0.6',
                'changefreq' => 'yearly',
            ];
        }

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
