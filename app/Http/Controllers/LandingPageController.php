<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Post;
use App\Models\Testimony;
use App\Support\Cms;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function index(): Response
    {
        $postColumns = ['id', 'title', 'slug', 'type', 'excerpt', 'cover_image',
            'category', 'published_at', 'event_start_at', 'event_end_at', 'location'];

        return Inertia::render('LandingPage', [
            // Contenu éditable, déjà fusionné avec les valeurs par défaut.
            'cms' => Cms::all(),

            'testimonies' => Testimony::where('is_visible', true)->get(),
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),

            'posts' => Post::published()->ofType(Post::TYPE_ARTICLE)->take(6)->get($postColumns),
            'events' => Post::published()->ofType(Post::TYPE_EVENEMENT)->take(4)->get($postColumns),
            'announcements' => Post::published()->ofType(Post::TYPE_ANNONCE)->take(3)->get($postColumns),
        ]);
    }
}
