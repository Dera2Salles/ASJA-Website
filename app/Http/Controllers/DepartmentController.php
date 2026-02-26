<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function show(string $slug): Response
    {
        $department = Department::where('slug', $slug)
            ->where('is_visible', true)
            ->with('programs')
            ->firstOrFail();

        return Inertia::render('Departments/Show', [
            'department' => $department,
        ]);
    }
}
