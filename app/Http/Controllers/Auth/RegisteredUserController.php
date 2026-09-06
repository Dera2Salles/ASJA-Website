<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\StudentFile;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'mentions' => StudentFile::mentions(),
            'levels'   => StudentFile::LEVELS,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * L'inscription crée un compte étudiant complet — la fiche scolaire est
     * saisie ici, pas dans un second temps : le formulaire ne demandait que
     * nom, e-mail et mot de passe, si bien qu'aucun compte créé en ligne
     * n'était rattaché à une mention et l'administration ne pouvait pas
     * l'exploiter.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            ...StudentFile::rules(),
            'email'    => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            // Jamais depuis la requête : le rôle décide de l'accès au CMS.
            'role' => 'Student',
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
