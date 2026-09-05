<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Support\Uploads;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des publications : articles, annonces et événements.
 * Un seul écran, filtrable par type.
 */
class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->query('type');

        $posts = Post::with('author:id,name')
            ->when(in_array($type, Post::TYPES, true), fn ($q) => $q->where('type', $type))
            ->latest()
            ->get();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
            'filters' => ['type' => $type],
            'counts' => [
                'all' => Post::count(),
                'article' => Post::where('type', Post::TYPE_ARTICLE)->count(),
                'annonce' => Post::where('type', Post::TYPE_ANNONCE)->count(),
                'evenement' => Post::where('type', Post::TYPE_EVENEMENT)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Posts/Create', [
            'types' => Post::TYPES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $validated['user_id'] = $request->user()->id;
        $validated['slug'] = Post::uniqueSlug($validated['title']);
        $validated = $this->withCoverImage($request, $validated);
        $validated = $this->withPublicationDate($validated, null);

        Post::create($validated);

        return redirect()->route('admin.posts.index')
            ->with('success', 'Publication créée.');
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('Admin/Posts/Edit', [
            'post' => $post,
            'types' => Post::TYPES,
        ]);
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        $validated = $this->validated($request);

        $validated = $this->withCoverImage($request, $validated, $post);
        $validated = $this->withPublicationDate($validated, $post);

        $post->update($validated);

        return redirect()->route('admin.posts.index')
            ->with('success', 'Publication mise à jour.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        Uploads::delete($post->cover_image);

        $post->delete();

        return redirect()->route('admin.posts.index')
            ->with('success', 'Publication supprimée.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'type' => ['required', Rule::in(Post::TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,avif', 'max:5120'],
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'is_published' => ['boolean'],
            'is_pinned' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'event_start_at' => ['nullable', 'date', 'required_if:type,' . Post::TYPE_EVENEMENT],
            'event_end_at' => ['nullable', 'date', 'after_or_equal:event_start_at'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);
    }

    /**
     * Stocke l'image dans `public/uploads/posts` sous un nom généré : le nom de
     * fichier fourni par le client n'est jamais réutilisé tel quel. L'ancienne
     * image est supprimée, elle n'est plus référencée nulle part.
     */
    private function withCoverImage(Request $request, array $validated, ?Post $post = null): array
    {
        if (! $request->hasFile('cover_image')) {
            unset($validated['cover_image']);

            return $validated;
        }

        Uploads::delete($post?->cover_image);

        $validated['cover_image'] = Uploads::store($request->file('cover_image'), 'posts');

        return $validated;
    }

    /**
     * Une publication mise en ligne sans date explicite est datée de maintenant ;
     * une date future vaut programmation (le scope `published` la masque
     * jusqu'à l'échéance).
     */
    private function withPublicationDate(array $validated, ?Post $post): array
    {
        $isPublished = $validated['is_published'] ?? false;

        if (! $isPublished) {
            return $validated;
        }

        if (empty($validated['published_at']) && ! $post?->published_at) {
            $validated['published_at'] = now();
        }

        return $validated;
    }
}
