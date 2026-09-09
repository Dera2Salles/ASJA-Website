<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Suivi du dossier après le dépôt.
 *
 * Jusqu'ici une demande n'avait qu'un statut et une note interne : elle
 * entrait, elle était instruite, et tout le reste se réglait au guichet. Deux
 * moments demandent pourtant que le candidat revienne en ligne — le dossier
 * déclaré « à compléter », et le bordereau des frais généraux dû une fois le
 * dossier validé. Les colonnes ajoutées ici disent, pour chacun, ce qui est
 * réclamé et ce qui a déjà été reçu : sans elles, le parcours de complétion
 * rouvrirait le dossier entier plutôt que les seuls points en défaut.
 *
 * Toutes nullables : les demandes déjà déposées n'ont rien à y mettre, et leur
 * absence se lit exactement comme « rien n'est réclamé ».
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            /* Ce que l'administration réclame quand elle déclare le dossier
               « à compléter » : des pièces à redéposer, des champs à corriger.
               Le parcours de complétion n'ouvre que ceux-là — un dossier
               incomplet n'est pas un dossier réouvert. */
            $table->json('requested_documents')->nullable()->after('admin_note');
            $table->json('requested_fields')->nullable()->after('requested_documents');

            /* Message adressé au candidat, à ne pas confondre avec
               `admin_note` qui reste interne : celui-ci lui est montré, et
               c'est la seule chose qui lui dise quoi corriger. */
            $table->text('completion_message')->nullable()->after('requested_fields');

            $table->timestamp('completion_requested_at')->nullable()->after('completion_message');

            /* Date du dernier renvoi par le candidat. Elle ferme le parcours :
               une fois renvoyé, le dossier repart en instruction et n'accepte
               plus de dépôt tant que l'administration n'en redemande pas. */
            $table->timestamp('completed_at')->nullable()->after('completion_requested_at');

            /* Bordereau des frais généraux, dû après validation du dossier.
               Renseignée, la colonne dit que le versement a été transmis : le
               formulaire se ferme, et le second envoi n'a plus lieu d'être. */
            $table->timestamp('fees_receipt_at')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'requested_documents',
                'requested_fields',
                'completion_message',
                'completion_requested_at',
                'completed_at',
                'fees_receipt_at',
            ]);
        });
    }
};
