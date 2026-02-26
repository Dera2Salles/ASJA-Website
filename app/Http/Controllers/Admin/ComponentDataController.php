<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComponentData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ComponentDataController extends Controller
{
    protected array $editableSections = [
        'hero',
        'about',
        'contact',
        'stats',
        'programs',
        'gallery',
        'blog',
    ];

    public function index(): Response
    {
        $data = [];
        foreach ($this->editableSections as $section) {
            $data[$section] = ComponentData::forSection($section);
        }

        return Inertia::render('Admin/ComponentData/Index', [
            'sections'         => $this->editableSections,
            'componentData'    => $data,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'section' => 'required|string|in:' . implode(',', $this->editableSections),
            'data'    => 'required|array',
        ]);

        foreach ($validated['data'] as $key => $value) {
            ComponentData::setValue($validated['section'], $key, $value);
        }

        return redirect()->route('admin.component-data.index')
            ->with('success', 'Section "' . $validated['section'] . '" updated.');
    }
}
