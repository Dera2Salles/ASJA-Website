<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Post;
use App\Support\Cms;
use App\Support\Images;
use App\Support\Seo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Liste et détail publics des publications (articles, annonces, événements).
 */
class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'type' => ['nullable', Rule::in(Post::TYPES)],
        ]);

        $type = $request->query('type');

        $posts = Post::published()
            ->when($type, fn ($q) => $q->where('type', $type))
            ->with('author:id,name')
            ->paginate(12)
            ->withQueryString();

        /* Les pages filtrées et paginées disent la même chose que la
           première : elles pointent toutes vers `/actualites` pour que les
           moteurs n'y voient qu'une seule adresse. */
        return Inertia::render('Blog/Index', [
            'seo' => Seo::make(
                title: 'Actualités & événements',
                description: "Les actualités, annonces et événements de l'Université ASJA : vie du campus, remises de diplômes, conférences et sorties de terrain.",
                url: route('blog.index'),
            )->breadcrumb([
                'Accueil' => '/',
                'Actualités' => null,
            ])->toArray(),

            'posts' => $posts,
            'filters' => ['type' => $type],
            'counts' => [
                'all' => Post::published()->count(),
                'article' => Post::published()->ofType(Post::TYPE_ARTICLE)->count(),
                'annonce' => Post::published()->ofType(Post::TYPE_ANNONCE)->count(),
                'evenement' => Post::published()->ofType(Post::TYPE_EVENEMENT)->count(),
            ],
            ...$this->sharedLayoutData(),
        ]);
    }

    public function show(string $slug): Response
    {
        $post = Post::published()->where('slug', $slug)->with('author:id,name')->firstOrFail();

        $related = Post::published()
            ->where('type', $post->type)
            ->whereKeyNot($post->id)
            ->take(3)
            ->get(['id', 'title', 'slug', 'type', 'cover_image', 'excerpt', 'published_at',
                'event_start_at', 'event_end_at', 'location', 'category']);

        $seo = Seo::make(
            title: $post->title,
            description: (string) $post->excerpt,
            image: $post->cover_image,
            url: route('blog.show', $post->slug),
        )->article(
            $post->published_at?->toAtomString(),
            $post->updated_at?->toAtomString(),
        )->breadcrumb([
            'Accueil' => '/',
            'Actualités' => route('blog.index'),
            $post->title => null,
        ]);

        /* Un événement porte une date et un lieu : de quoi le décrire comme
           tel, et non comme un simple article. Les champs absents ne sont pas
           inventés — ils disparaissent du schéma. */
        if ($post->type === Post::TYPE_EVENEMENT && $post->event_start_at) {
            $seo->schema(array_filter([
                '@type' => 'Event',
                'name' => $post->title,
                'description' => (string) $post->excerpt,
                'startDate' => $post->event_start_at->toAtomString(),
                'endDate' => $post->event_end_at?->toAtomString(),
                'image' => Seo::absolute($post->cover_image),
                'location' => $post->location ? [
                    '@type' => 'Place',
                    'name' => $post->location,
                ] : null,
                'organizer' => [
                    '@type' => 'CollegeOrUniversity',
                    'name' => config('seo.legal_name'),
                    '@id' => url('/') . '#organisation',
                ],
            ]));
        }

        return Inertia::render('BlogPostPage', [
            'post' => $post,
            'related' => $related,

            'seo' => $seo->toArray(),

            // Photo de couverture : l'élément LCP de l'article.
            'preloadImage' => Images::preloadHero($post->cover_image, null),
            ...$this->sharedLayoutData(),
        ]);
    }

    /**
     * Données consommées par la navigation et le pied de page, communs à tout
     * le site : sans elles, le menu « Filières » et les coordonnées de contact
     * s'affichent vides.
     */
    private function sharedLayoutData(): array
    {
        return [
            'cms' => Cms::all(),
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),
        ];
    }
}
