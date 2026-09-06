<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Photo de la mention dans la mosaïque de la page d'accueil.
 *
 * Elle était jusqu'ici écrite en dur côté front (un fichier importé par slug),
 * donc invisible pour l'administration : ajouter une mention ou changer sa
 * photo demandait de toucher au code. La bannière (`hero_image`) ne pouvait
 * pas jouer ce rôle — c'est un panoramique de page de mention, pas une vignette
 * de carte — d'où une colonne distincte.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->string('card_image')->nullable()->after('hero_image');
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn('card_image');
        });
    }
};
