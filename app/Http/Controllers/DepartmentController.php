<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Support\Cms;
use App\Support\Images;
use App\Support\Seo;
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

            'seo' => Seo::make(
                title: $department->name,
                description: (string) $department->description,
                image: $department->hero_image,
            )->breadcrumb([
                'Accueil' => '/',
                'Mentions' => '/#filiere',
                $department->name => null,
            ])->schema([
                '@type' => 'EducationalOccupationalProgram',
                'name' => $department->name,
                'description' => (string) $department->description,
                'url' => route('department.show', $department->slug),
                'provider' => [
                    '@type' => 'CollegeOrUniversity',
                    'name' => config('seo.legal_name'),
                    '@id' => url('/') . '#organisation',
                ],
            ])->toArray(),

            'preloadImage' => Images::preloadHero($department->hero_image, null),

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
