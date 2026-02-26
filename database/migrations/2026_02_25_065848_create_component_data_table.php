<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('component_data', function (Blueprint $table) {
            $table->id();
            $table->string('section')->index(); // e.g. 'hero', 'about', 'contact'
            $table->string('key');              // e.g. 'title', 'subtitle', 'description'
            $table->longText('value')->nullable();
            $table->timestamps();

            $table->unique(['section', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('component_data');
    }
};
