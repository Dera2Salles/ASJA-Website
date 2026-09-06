<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Support\Cms;
use App\Support\StudentFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Espace étudiant.
 *
 * Il porte le nom de route `dashboard`, l'adresse où Breeze renvoie après une
 * connexion, une inscription ou une vérification d'adresse. Cette route
 * n'existait pas : chacune de ces redirections levait une
 * `RouteNotFoundException`, et login comme inscription pointaient à la place
 * sur le tableau de bord de l'administration — que le filtre `admin` refuse à
 * tout compte étudiant. S'inscrire menait donc à une erreur, se connecter à un
 * 403.
 *
 * Un seul point d'arrivée pour tout le monde, qui aiguille selon le rôle :
 * l'administration garde ses liens, l'étudiant atterrit sur sa fiche.
 */
class StudentSpaceController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->role === 'Admin') {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Student/Space', [
            'mentions' => StudentFile::mentions(),
            'levels'   => StudentFile::LEVELS,

            // La page porte la navigation et le pied de page du site public :
            // sans ces données, le menu « Mention » et les coordonnées de
            // contact s'y afficheraient vides.
            'departments' => Department::where('is_visible', true)
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'name', 'logo']),
            'cms' => Cms::all(),
        ]);
    }

    /**
     * Mise à jour de la fiche — c'est aussi la réinscription : l'étudiant
     * déclare la mention et le niveau de sa nouvelle année.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->user()->update($request->validate(StudentFile::rules()));

        return redirect()->route('dashboard')->with('success', 'Fiche mise à jour.');
    }
}
