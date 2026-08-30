<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Post;
use App\Support\Cms;
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

        return Inertia::render('Blog/Index', [
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

        return Inertia::render('BlogPostPage', [
            'post' => $post,
            'related' => $related,
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
