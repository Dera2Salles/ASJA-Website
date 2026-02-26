<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
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
                'posts' => BlogPost::count(),
                'students' => \App\Models\User::where('role', 'Student')->count(),
                'testimonies' => Testimony::count(),
                'departments' => Department::count(),
            ],
            'recentPosts' => BlogPost::latest()
                ->take(3)
                ->get(),
        ]);
    }
}
