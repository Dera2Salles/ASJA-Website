<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Les séries du baccalauréat passent d'une constante à une table.
 *
 * Elles étaient écrites en dur dans `Application::BAC_SERIES` : ajouter une
 * série demandait un déploiement, alors que c'est une décision de scolarité,
 * pas de développeur. La liste rejoint donc les mentions, déjà administrées.
 *
 * Le code reste la valeur stockée dans `applications.bac_series` — les
 * dossiers déjà déposés n'ont rien à migrer — et la table part garnie de la
 * liste historique, sans quoi le formulaire n'offrirait plus aucun choix au
 * lendemain de la migration.
 */
return new class extends Migration
{
    /** Liste historique, reprise telle quelle pour ne rien perdre. */
    private const LEGACY = ['A1', 'A2', 'C', 'D', 'S', 'L', 'OSE'];

    public function up(): void
    {
        Schema::create('bac_series', function (Blueprint $table) {
            $table->id();

            /* La colonne `applications.bac_series` fait 10 caractères : le code
               ne peut pas être plus long que la case où il finit. */
            $table->string('code', 10)->unique();

            /* Intitulé facultatif : « C » se suffit à lui-même sur le
               formulaire, mais la scolarité doit pouvoir expliciter une série
               moins connue sans toucher au code déjà stocké en base. */
            $table->string('label', 255)->nullable();

            /* Désactiver plutôt que supprimer : une série retirée du
               formulaire reste lisible sur les dossiers qui la portent. */
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        $now = now();

        DB::table('bac_series')->insert(
            collect(self::LEGACY)
                ->map(fn (string $code, int $index) => [
                    'code' => $code,
                    'label' => null,
                    'is_active' => true,
                    'sort_order' => $index,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
                ->all()
        );

        /* Une série absente de la liste historique mais présente sur un
           dossier existant serait invalidée sans retour : on la reprend, à la
           suite et inactive, pour que l'administration la retrouve. */
        $extras = DB::table('applications')
            ->whereNotNull('bac_series')
            ->whereNotIn('bac_series', self::LEGACY)
            ->distinct()
            ->pluck('bac_series');

        if ($extras->isNotEmpty()) {
            DB::table('bac_series')->insert(
                $extras
                    ->values()
                    ->map(fn (string $code, int $index) => [
                        'code' => $code,
                        'label' => null,
                        'is_active' => false,
                        'sort_order' => count(self::LEGACY) + $index,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ])
                    ->all()
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('bac_series');
    }
};
