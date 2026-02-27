<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Blog/Index', [
            'posts' => BlogPost::with('author:id,name')->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Blog/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'cover_image'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'category'     => 'nullable|string|max:100',
            'tags'         => 'nullable|array',
            'is_published' => 'boolean',
        ]);

        if ($request->hasFile('cover_image')) {
            $file = $request->file('cover_image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/blog'), $fileName);
            $validated['cover_image'] = 'blog/' . $fileName;
        }

        $validated['user_id']      = auth()->id();
        $validated['slug']         = Str::slug($validated['title']);
        $validated['published_at'] = $validated['is_published'] ? now() : null;

        BlogPost::create($validated);

        return redirect()->route('admin.blog.index')->with('success', 'Blog post created.');
    }

    public function edit(BlogPost $blog): Response
    {
        return Inertia::render('Admin/Blog/Edit', [
            'post' => $blog,
        ]);
    }

    public function update(Request $request, BlogPost $blog): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'cover_image'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'category'     => 'nullable|string|max:100',
            'tags'         => 'nullable|array',
            'is_published' => 'boolean',
        ]);

        if ($request->hasFile('cover_image')) {
            $file = $request->file('cover_image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/blog'), $fileName);
            $validated['cover_image'] = 'blog/' . $fileName;
        }

        if ($validated['is_published'] && ! $blog->is_published) {
            $validated['published_at'] = now();
        }

        $blog->update($validated);

        return redirect()->route('admin.blog.index')->with('success', 'Blog post updated.');
    }

    public function destroy(BlogPost $blog): RedirectResponse
    {
        $blog->delete();
        return redirect()->route('admin.blog.index')->with('success', 'Blog post deleted.');
    }
}
