<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::where('role', 'Student');

        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('contact', 'like', "%{$search}%")
                  ->orWhere('mention', 'like', "%{$search}%");
            });
        }

        if ($request->has('mention') && $request->input('mention')) {
            $query->where('mention', $request->input('mention'));
        }

        if ($request->has('level') && $request->input('level')) {
            $query->where('level', $request->input('level'));
        }

        $students = $query->orderBy('name')->paginate(20)->withQueryString();

        $mentions = User::where('role', 'Student')
            ->whereNotNull('mention')
            ->distinct()
            ->pluck('mention');

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'filters'  => $request->only(['search', 'mention', 'level']),
            'mentions' => $mentions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'contact'   => 'nullable|string|max:50',
            'email'     => 'nullable|email|unique:users,email',
            'password'  => 'required|string|min:6',
            'mention'   => 'nullable|string',
            'level'     => 'nullable|string',
            'branche'   => 'nullable|string',
            'Premier'   => 'boolean',
            'Deuxieme'  => 'boolean',
            'Troisieme' => 'boolean',
        ]);

        User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'role'     => 'Student',
        ]);

        return redirect()->route('admin.students.index')->with('success', 'Étudiant ajouté.');
    }

    public function update(Request $request, User $student): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'contact'   => 'nullable|string|max:50',
            'email'     => 'nullable|email|unique:users,email,' . $student->id,
            'mention'   => 'nullable|string',
            'level'     => 'nullable|string',
            'branche'   => 'nullable|string',
            'grade'     => 'nullable|string',
            'Premier'   => 'boolean',
            'Deuxieme'  => 'boolean',
            'Troisieme' => 'boolean',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:6']);
            $validated['password'] = Hash::make($request->input('password'));
        }

        $student->update($validated);

        return redirect()->route('admin.students.index')->with('success', 'Étudiant mis à jour.');
    }

    public function destroy(User $student): RedirectResponse
    {
        $student->delete();
        return redirect()->route('admin.students.index')->with('success', 'Étudiant supprimé.');
    }
}
