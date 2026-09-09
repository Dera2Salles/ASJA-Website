<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le code d'une série du baccalauréat cesse d'être court.
 *
 * Dix caractères suffisaient à « A1 » ou « OSE », mais pas aux séries dont
 * l'intitulé officiel *est* le code — une série technique se nomme en toutes
 * lettres. La limite était un pari sur des données qui ne nous appartiennent
 * pas ; elle disparaît.
 *
 * Les deux colonnes bougent ensemble : `bac_series.code` est recopié tel quel
 * dans `applications.bac_series`, et élargir la première sans la seconde
 * laisserait un code accepté au référentiel mais tronqué sur le dossier.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bac_series', function (Blueprint $table) {
            $table->string('code')->change();
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->string('bac_series')->nullable()->change();
        });
    }

    /**
     * Le retour arrière tronquerait les codes plus longs que dix caractères :
     * il n'est possible que tant qu'aucun n'a été saisi.
     */
    public function down(): void
    {
        Schema::table('bac_series', function (Blueprint $table) {
            $table->string('code', 10)->change();
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->string('bac_series', 10)->nullable()->change();
        });
    }
};
