<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $posts = BlogPost::published()
            ->with('author:id,name')
            ->paginate(12);

        return Inertia::render('Blog/Index', [
            'posts' => $posts,
        ]);
    }

    public function show(string $slug): Response
    {
        $post = BlogPost::where('slug', $slug)->where('is_published', true)->with('author:id,name')->firstOrFail();

        return Inertia::render('BlogPostPage', [
            'post' => $post,
        ]);
    }
}
