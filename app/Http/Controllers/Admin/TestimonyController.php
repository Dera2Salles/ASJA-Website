<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimony;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TestimonyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Testimonies/Index', [
            'testimonies' => Testimony::latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'role'       => 'nullable|string|max:255',
            'content'    => 'required|string',
            'avatar'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_visible' => 'boolean',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('testimonies', 'public');
        }

        Testimony::create($validated);

        return redirect()->route('admin.testimonies.index')->with('success', 'Testimony added.');
    }

    public function update(Request $request, Testimony $testimony): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'role'       => 'nullable|string|max:255',
            'content'    => 'required|string',
            'avatar'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_visible' => 'boolean',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('testimonies', 'public');
        }

        $testimony->update($validated);

        return redirect()->route('admin.testimonies.index')->with('success', 'Testimony updated.');
    }

    public function destroy(Testimony $testimony): RedirectResponse
    {
        $testimony->delete();
        return redirect()->route('admin.testimonies.index')->with('success', 'Testimony deleted.');
    }
}
