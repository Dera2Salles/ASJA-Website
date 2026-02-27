<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\ComponentData;
use App\Models\Department;
use App\Models\Testimony;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function index(): Response
    {
        $sections = ['hero', 'about', 'contact', 'stats', 'programs', 'gallery', 'blog'];

        $componentData = [];
        foreach ($sections as $section) {
            $componentData[$section] = ComponentData::forSection($section);
        }

        return Inertia::render('LandingPage', [
            'componentData' => $componentData,
            'testimonies'   => Testimony::where('is_visible', true)->get(),
            'blogPosts'     => BlogPost::published()->take(6)->get(['id', 'title', 'slug', 'cover_image', 'category', 'published_at']),
            'departments'   => Department::where('is_visible', true)->orderBy('sort_order')->get(['id', 'slug', 'name', 'logo', 'color']),
        ]);
    }
}
