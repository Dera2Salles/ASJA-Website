<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Post;
use App\Models\Testimony;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'posts' => Post::count(),
                'published' => Post::published()->count(),
                'drafts' => Post::where('is_published', false)->count(),
                'scheduled' => Post::where('is_published', true)
                    ->where('published_at', '>', now())
                    ->count(),
                'students' => User::where('role', 'Student')->count(),
                'testimonies' => Testimony::count(),
                'departments' => Department::count(),
                'upcomingEvents' => Post::published()->upcoming()->count(),
            ],

            'byType' => [
                ['type' => 'Articles', 'total' => Post::where('type', Post::TYPE_ARTICLE)->count()],
                ['type' => 'Annonces', 'total' => Post::where('type', Post::TYPE_ANNONCE)->count()],
                ['type' => 'Événements', 'total' => Post::where('type', Post::TYPE_EVENEMENT)->count()],
            ],

            'activity' => $this->monthlyActivity(),

            'recentPosts' => Post::with('author:id,name')
                ->latest()
                ->take(6)
                ->get(['id', 'user_id', 'type', 'title', 'slug', 'cover_image',
                    'is_published', 'is_pinned', 'published_at', 'created_at']),

            'upcomingEvents' => Post::published()->upcoming()->take(4)
                ->get(['id', 'title', 'slug', 'type', 'event_start_at', 'event_end_at', 'location']),
        ]);
    }

    /**
     * Publications créées sur les six derniers mois, mois vides compris, pour
     * que la courbe reste lisible même quand il ne se passe rien.
     */
    private function monthlyActivity(): array
    {
        $start = now()->startOfMonth()->subMonths(5);

        $counts = Post::where('created_at', '>=', $start)
            ->get(['created_at'])
            ->groupBy(fn ($post) => $post->created_at->format('Y-m'))
            ->map->count();

        return collect(range(0, 5))
            ->map(function (int $offset) use ($start, $counts) {
                $month = $start->copy()->addMonths($offset);

                return [
                    'month' => ucfirst($month->locale('fr')->isoFormat('MMM')),
                    'total' => $counts[$month->format('Y-m')] ?? 0,
                ];
            })
            ->all();
    }
}
