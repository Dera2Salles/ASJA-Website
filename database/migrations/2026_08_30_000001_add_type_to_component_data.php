<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('component_data', function (Blueprint $table) {
            // Le type provient du schéma config/cms.php. Il est stocké ici pour
            // que la lecture sache décoder le JSON des champs répétables sans
            // avoir à recharger le schéma.
            $table->string('type')->default('text')->after('key');
        });
    }

    public function down(): void
    {
        Schema::table('component_data', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
