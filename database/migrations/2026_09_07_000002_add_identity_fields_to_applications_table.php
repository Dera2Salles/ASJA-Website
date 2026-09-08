<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Situation matrimoniale et carte d'identité nationale du candidat.
 *
 * Migration séparée plutôt que retouche de la précédente : celle-ci est déjà
 * passée en base, et des demandes y ont été déposées. Les colonnes arrivent
 * donc nullables, faute de quoi les lignes existantes n'auraient aucune valeur
 * à recevoir ; c'est la validation du formulaire, et non le schéma, qui les
 * rend obligatoires pour les dépôts à venir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            // celibataire | en_couple | marie
            $table->string('marital_status', 20)->nullable()->after('birth_place');

            /* Le numéro de CIN malgache compte douze chiffres. Stocké en
               chaîne : un entier perdrait les zéros de tête, et ce numéro ne
               sert jamais à calculer. */
            $table->string('cin_number', 12)->nullable()->after('marital_status');
            $table->string('cin_issued_place')->nullable()->after('cin_number');
            $table->date('cin_issued_at')->nullable()->after('cin_issued_place');

            // Un duplicata n'existe que s'il y en a eu un.
            $table->date('cin_duplicate_at')->nullable()->after('cin_issued_at');

            // Renseigné pour les seuls candidats mariés.
            $table->string('spouse_cin_number', 12)->nullable()->after('cin_duplicate_at');

            /* La religion devient un choix (catholique, musulman, autre) ; la
               colonne `religion` existante accueille désormais la clé, et
               celle-ci recueille la précision quand « autre » est retenu. Les
               valeurs libres déjà saisies restent en place. */
            $table->string('religion_other')->nullable()->after('religion');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'marital_status',
                'cin_number',
                'cin_issued_place',
                'cin_issued_at',
                'cin_duplicate_at',
                'spouse_cin_number',
                'religion_other',
            ]);
        });
    }
};
