<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Support\Cms;
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

            // La navigation et le pied de page sont communs à tout le site :
            // sans ces données, le menu « Filières » et les coordonnées de
            // contact s'affichaient vides sur les pages de mention.
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),
            'cms' => Cms::all(),
        ]);
    }
}
