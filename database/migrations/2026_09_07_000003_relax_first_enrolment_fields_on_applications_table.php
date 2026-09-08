<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Une réinscription ne redéclare plus l'état civil.
 *
 * Le dossier d'un étudiant déjà inscrit est au bureau de la scolarité : lui
 * faire ressaisir son nom, sa CIN, son baccalauréat et ses parents chaque
 * année n'apprend rien à l'établissement et décourage la démarche. La
 * réinscription se réduit donc au matricule, à l'adresse e-mail et aux trois
 * pièces de l'année — bulletin, bordereau de versement, photo en buste.
 *
 * Les colonnes que la première inscription est seule à remplir deviennent
 * donc nullables. Le schéma cesse ici d'exiger ce que seul un type de demande
 * réclame : c'est `StoreApplicationRequest`, qui connaît le type, qui exige
 * champ par champ — et qui refuse ceux qui n'ont pas été demandés.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $this->columns($table, true);
        });
    }

    /**
     * Le retour arrière n'est possible que si aucune réinscription du nouveau
     * modèle n'a été déposée : ces lignes n'ont, par construction, pas de nom
     * ni de niveau à donner aux colonnes redevenues obligatoires.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $this->columns($table, false);
        });
    }

    private function columns(Blueprint $table, bool $nullable): void
    {
        $table->string('last_name')->nullable($nullable)->change();
        $table->string('first_name')->nullable($nullable)->change();
        $table->string('gender', 1)->nullable($nullable)->change();
        $table->string('nationality')->nullable($nullable)->change();
        $table->date('birth_date')->nullable($nullable)->change();
        $table->string('birth_place')->nullable($nullable)->change();
        $table->string('phone', 50)->nullable($nullable)->change();

        $table->unsignedSmallInteger('bac_year')->nullable($nullable)->change();
        $table->string('bac_series', 10)->nullable($nullable)->change();
        $table->string('bac_number', 100)->nullable($nullable)->change();
        $table->string('bac_mention', 30)->nullable($nullable)->change();

        $table->string('level', 10)->nullable($nullable)->change();
        $table->string('mention')->nullable($nullable)->change();
        $table->string('mention_name')->nullable($nullable)->change();
    }
};
