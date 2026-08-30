<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Department;
use App\Models\Testimony;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with stats.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'posts' => Post::count(),
                'students' => \App\Models\User::where('role', 'Student')->count(),
                'testimonies' => Testimony::count(),
                'departments' => Department::count(),
            ],
            'recentPosts' => Post::latest()
                ->take(3)
                ->get(),
        ]);
    }
}
