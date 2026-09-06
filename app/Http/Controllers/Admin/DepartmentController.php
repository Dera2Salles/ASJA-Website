<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\DepartmentProgram;
use App\Support\Uploads;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    /** Champs image de la mention : colonne en base => dossier de destination. */
    private const IMAGE_FIELDS = [
        'logo'       => 'departments/logos',
        'hero_image' => 'departments/heroes',
        'card_image' => 'departments/cards',
    ];

    public function index(): Response
    {
        return Inertia::render('Admin/Departments/Index', [
            'departments' => Department::withCount('programs')->orderBy('sort_order')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Departments/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'slug'        => 'required|string|max:100|unique:departments',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo'        => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'hero_image'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'card_image'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'is_visible'  => 'boolean',
            'sort_order'  => 'integer',
        ]);

        Department::create($this->withImages($request, $validated));

        return redirect()->route('admin.departments.index')->with('success', 'Department created.');
    }

    public function edit(Department $department): Response
    {
        return Inertia::render('Admin/Departments/Edit', [
            'department' => $department->load('programs'),
        ]);
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo'        => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'hero_image'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'card_image'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'is_visible'  => 'boolean',
            'sort_order'  => 'integer',
        ]);

        $department->update($this->withImages($request, $validated, $department));

        return redirect()->route('admin.departments.index')->with('success', 'Department updated.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        foreach (array_keys(self::IMAGE_FIELDS) as $field) {
            Uploads::delete($department->{$field});
        }

        $department->delete();
        return redirect()->route('admin.departments.index')->with('success', 'Department deleted.');
    }

    /**
     * N'écrit une colonne image que si un fichier arrive vraiment.
     *
     * Le formulaire renvoie ses trois champs image à chaque enregistrement ;
     * ceux qu'on n'a pas rouverts valent `null`, qu'Inertia sérialise en chaîne
     * vide dans le `FormData`. Cette chaîne passe la règle `nullable`, se
     * retrouvait dans les données validées et écrasait en base le chemin de
     * l'image qu'on n'avait pas touchée : remplacer la bannière effaçait la
     * photo d'accueil, et inversement. On repart donc systématiquement des
     * valeurs déjà en base, et seul un vrai téléversement les remplace.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function withImages(Request $request, array $validated, ?Department $department = null): array
    {
        foreach (self::IMAGE_FIELDS as $field => $folder) {
            unset($validated[$field]);

            if (! $request->hasFile($field)) {
                continue;
            }

            Uploads::delete($department?->{$field});

            $validated[$field] = Uploads::store($request->file($field), $folder);
        }

        return $validated;
    }


    public function storeProgram(Request $request, Department $department): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'competences' => 'nullable|string',
            'debouches'   => 'nullable|string',
            'sort_order'  => 'integer',
        ]);
        $department->programs()->create($validated);
        return back()->with('success', 'Program added.');
    }

    public function updateProgram(Request $request, Department $department, DepartmentProgram $program): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'competences' => 'nullable|string',
            'debouches'   => 'nullable|string',
            'sort_order'  => 'integer',
        ]);
        $program->update($validated);
        return back()->with('success', 'Program updated.');
    }

    public function destroyProgram(Department $department, DepartmentProgram $program): RedirectResponse
    {
        $program->delete();
        return back()->with('success', 'Program deleted.');
    }
}
