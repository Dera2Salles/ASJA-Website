<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Admin\ComponentDataController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController as AdminDepartmentController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\TestimonyController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentSpaceController;
use App\Support\Uploads;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Site public
|--------------------------------------------------------------------------
*/

Route::get('/', [LandingPageController::class, 'index'])->name('home');

Route::get('/actualites', [BlogController::class, 'index'])->name('blog.index');
Route::get('/actualites/{slug}', [BlogController::class, 'show'])->name('blog.show');

// Ancienne adresse conservée : les liens déjà partagés continuent de fonctionner.
Route::redirect('/blog', '/actualites');
Route::get('/blog/{slug}', fn (string $slug) => redirect()->route('blog.show', $slug));

Route::get('/mention/{slug}', [DepartmentController::class, 'show'])->name('department.show');

Route::get('/a-propos', [AboutController::class, 'index'])->name('about');

/*
 * Candidature : dépôt d'une demande d'inscription ou de réinscription.
 *
 * Volontairement hors du groupe `auth` — un candidat n'a pas encore de compte.
 * La confirmation passe par un lien signé : le numéro de demande ne suffit pas
 * à ouvrir le dossier d'un autre.
 */
Route::get('/candidature', [ApplicationController::class, 'create'])->name('candidature.create');
Route::post('/candidature', [ApplicationController::class, 'store'])->name('candidature.store');
Route::get('/candidature/confirmation/{application:reference}', [ApplicationController::class, 'confirmation'])
    ->middleware('signed')
    ->name('candidature.confirmation');

/*
 * Fichiers téléversés.
 *
 * En production la racine web est la racine du dépôt : Apache trouve le fichier
 * et n'atteint jamais cette route (`RewriteCond %{REQUEST_FILENAME} !-f`). En
 * développement la racine web est `public/`, où `uploads/` n'existe pas : la
 * route prend le relais pour que `/uploads/...` désigne le même fichier des
 * deux côtés. Elle sert aussi de filet si le `.htaccess` de production venait
 * à manquer.
 */
Route::get('/uploads/{path}', function (string $path) {
    abort_if(($file = Uploads::file('/uploads/' . $path)) === null, 404);

    return response()->file($file);
})->where('path', '.+')->name('uploads.show');

/*
|--------------------------------------------------------------------------
| Espace connecté
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    /* Point d'arrivée après connexion, inscription ou vérification d'adresse.
       Le contrôleur aiguille : l'administration part vers son tableau de bord,
       l'étudiant reste sur sa fiche. */
    Route::get('/espace-etudiant', [StudentSpaceController::class, 'index'])->name('dashboard');
    Route::patch('/espace-etudiant', [StudentSpaceController::class, 'update'])->name('student.file.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Administration — réservée aux comptes « Admin »
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Contenu du site
    Route::get('/contenu', [ComponentDataController::class, 'index'])->name('component-data.index');
    Route::post('/contenu', [ComponentDataController::class, 'update'])->name('component-data.update');
    Route::post('/contenu/image', [ComponentDataController::class, 'uploadImage'])->name('component-data.image');

    // Publications : articles, annonces, événements
    Route::get('/publications', [AdminPostController::class, 'index'])->name('posts.index');
    Route::get('/publications/nouveau', [AdminPostController::class, 'create'])->name('posts.create');
    Route::post('/publications', [AdminPostController::class, 'store'])->name('posts.store');
    Route::get('/publications/{post}/modifier', [AdminPostController::class, 'edit'])->name('posts.edit');
    Route::put('/publications/{post}', [AdminPostController::class, 'update'])->name('posts.update');
    Route::delete('/publications/{post}', [AdminPostController::class, 'destroy'])->name('posts.destroy');

    // Témoignages
    Route::get('/testimonies', [TestimonyController::class, 'index'])->name('testimonies.index');
    Route::post('/testimonies', [TestimonyController::class, 'store'])->name('testimonies.store');
    Route::put('/testimonies/{testimony}', [TestimonyController::class, 'update'])->name('testimonies.update');
    Route::delete('/testimonies/{testimony}', [TestimonyController::class, 'destroy'])->name('testimonies.destroy');

    // Étudiants
    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::put('/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

    // Candidatures : demandes d'inscription et de réinscription
    Route::get('/candidatures', [AdminApplicationController::class, 'index'])->name('applications.index');
    Route::get('/candidatures/{application}', [AdminApplicationController::class, 'show'])->name('applications.show');
    Route::put('/candidatures/{application}/statut', [AdminApplicationController::class, 'updateStatus'])->name('applications.status');
    Route::post('/candidatures/{application}/accuse-reception', [AdminApplicationController::class, 'resendReceipt'])->name('applications.receipt');
    Route::get('/candidatures/{application}/pieces/{document}', [AdminApplicationController::class, 'document'])->name('applications.document');
    Route::delete('/candidatures/{application}', [AdminApplicationController::class, 'destroy'])->name('applications.destroy');

    // Mentions
    Route::get('/departments', [AdminDepartmentController::class, 'index'])->name('departments.index');
    Route::get('/departments/create', [AdminDepartmentController::class, 'create'])->name('departments.create');
    Route::post('/departments', [AdminDepartmentController::class, 'store'])->name('departments.store');
    Route::get('/departments/{department}/edit', [AdminDepartmentController::class, 'edit'])->name('departments.edit');
    Route::put('/departments/{department}', [AdminDepartmentController::class, 'update'])->name('departments.update');
    Route::delete('/departments/{department}', [AdminDepartmentController::class, 'destroy'])->name('departments.destroy');

    Route::post('/departments/{department}/programs', [AdminDepartmentController::class, 'storeProgram'])->name('departments.programs.store');
    Route::put('/departments/{department}/programs/{program}', [AdminDepartmentController::class, 'updateProgram'])->name('departments.programs.update');
    Route::delete('/departments/{department}/programs/{program}', [AdminDepartmentController::class, 'destroyProgram'])->name('departments.programs.destroy');
});

require __DIR__ . '/auth.php';
