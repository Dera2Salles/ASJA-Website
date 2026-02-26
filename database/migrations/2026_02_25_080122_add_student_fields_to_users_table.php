<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_name')->nullable();
            $table->string('contact')->nullable();
            $table->string('role')->default('Student'); // Admin or Student
            $table->string('mention')->nullable();
            $table->string('level')->nullable();
            $table->string('branche')->nullable();
            $table->string('grade')->nullable();
            $table->boolean('Premier')->default(false);
            $table->boolean('Deuxieme')->default(false);
            $table->boolean('Troisieme')->default(false);
            $table->string('file_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_name',
                'contact',
                'role',
                'mention',
                'level',
                'branche',
                'grade',
                'Premier',
                'Deuxieme',
                'Troisieme',
                'file_name',
            ]);
        });
    }
};
