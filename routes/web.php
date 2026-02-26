<?php

use App\Http\Controllers\Admin\BlogPostController as AdminBlogPostController;
use App\Http\Controllers\Admin\ComponentDataController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController as AdminDepartmentController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\TestimonyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;


Route::get('/', [LandingPageController::class, 'index'])->name('home');
Route::get('/blog', [LandingPageController::class, 'blog'])->name('blog.index');
Route::get('/blog/{slug}', [LandingPageController::class, 'blogPost'])->name('blog.show');

Route::get('/mention/{slug}', [DepartmentController::class, 'show'])->name('department.show');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/testimonies', [TestimonyController::class, 'index'])->name('testimonies.index');
    Route::post('/testimonies', [TestimonyController::class, 'store'])->name('testimonies.store');
    Route::put('/testimonies/{testimony}', [TestimonyController::class, 'update'])->name('testimonies.update');
    Route::delete('/testimonies/{testimony}', [TestimonyController::class, 'destroy'])->name('testimonies.destroy');

    Route::get('/component-data', [ComponentDataController::class, 'index'])->name('component-data.index');
    Route::post('/component-data', [ComponentDataController::class, 'update'])->name('component-data.update');

    Route::get('/blog', [AdminBlogPostController::class, 'index'])->name('blog.index');
    Route::get('/blog/create', [AdminBlogPostController::class, 'create'])->name('blog.create');
    Route::post('/blog', [AdminBlogPostController::class, 'store'])->name('blog.store');
    Route::get('/blog/{blog}/edit', [AdminBlogPostController::class, 'edit'])->name('blog.edit');
    Route::put('/blog/{blog}', [AdminBlogPostController::class, 'update'])->name('blog.update');
    Route::delete('/blog/{blog}', [AdminBlogPostController::class, 'destroy'])->name('blog.destroy');

    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::put('/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

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
