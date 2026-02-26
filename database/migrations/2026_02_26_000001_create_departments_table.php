<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g. 'informatique', 'droit'
            $table->string('name');           // e.g. 'INFORMATIQUE'
            $table->text('description')->nullable();
            $table->string('logo')->nullable();          // stored path
            $table->string('hero_image')->nullable();    // stored path
            $table->string('color')->nullable();         // e.g. '#1d4ed8'
            $table->boolean('is_visible')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('parcours')->nullable();        // array of parcours objects
            $table->json('events')->nullable();          // array of event objects
            $table->json('stats')->nullable();           // array of stat objects
            $table->timestamps();
        });

        Schema::create('department_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('competences')->nullable();
            $table->text('debouches')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('department_programs');
        Schema::dropIfExists('departments');
    }
};
