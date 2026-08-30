<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\DepartmentProgram;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
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
            'is_visible'  => 'boolean',
            'sort_order'  => 'integer',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('departments/logos', 'public');
        }
        if ($request->hasFile('hero_image')) {
            $validated['hero_image'] = $request->file('hero_image')->store('departments/heroes', 'public');
        }

        Department::create($validated);

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
            'is_visible'  => 'boolean',
            'sort_order'  => 'integer',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('departments/logos', 'public');
        }
        if ($request->hasFile('hero_image')) {
            $validated['hero_image'] = $request->file('hero_image')->store('departments/heroes', 'public');
        }

        $department->update($validated);

        return redirect()->route('admin.departments.index')->with('success', 'Department updated.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $department->delete();
        return redirect()->route('admin.departments.index')->with('success', 'Department deleted.');
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
