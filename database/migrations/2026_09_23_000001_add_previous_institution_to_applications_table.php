<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * L'établissement d'où vient un transfert.
 *
 * Le transfert est le troisième type de demande : un étudiant qui n'a jamais
 * été inscrit ici, mais qui a commencé son cursus ailleurs et entre en cours
 * de route. Ses relevés de notes et son diplôme ne veulent rien dire sans
 * l'établissement qui les a délivrés — c'est la seule colonne que son dossier
 * ait de plus que celui d'une première inscription.
 *
 * La colonne est nullable : les deux autres types ne la déclarent pas, et la
 * validation refuse qu'ils la renseignent (`Application::FIELDS`).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->string('previous_institution')->nullable()->after('previous_level');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn('previous_institution');
        });
    }
};
