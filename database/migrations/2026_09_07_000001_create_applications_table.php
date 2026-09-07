<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Demandes d'inscription et de réinscription déposées en ligne.
 *
 * La table est distincte de `users` : une demande n'est pas un compte. Elle est
 * déposée par un candidat qui n'en a le plus souvent pas encore, elle porte des
 * informations qui n'ont pas leur place sur un compte (baccalauréat, parents,
 * pièces justificatives) et elle a son propre cycle de vie — elle est instruite
 * puis close, alors que le compte, lui, survit d'une année à l'autre.
 *
 * Les colonnes de fiche scolaire de `users` (mention, level, branche) restent
 * donc ce qu'elles sont : l'état courant de l'étudiant admis.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            /* Numéro communiqué au candidat, seule référence du dossier au
               guichet de la scolarité : « ASJA-2026-0001 ». */
            $table->string('reference', 40)->unique();

            /* Jeton d'idempotence engendré par le formulaire. Un double clic,
               un rechargement ou un renvoi du navigateur portent le même
               jeton : la contrainte d'unicité ferme la porte au doublon même
               si deux requêtes arrivent en parallèle. */
            $table->string('idempotency_key', 64)->nullable()->unique();

            $table->string('type', 30);                     // premiere_inscription | reinscription
            $table->string('status', 20)->default('pending');

            /* Rattachement facultatif : une demande déposée depuis un compte
               connecté reste liée à lui, sans que la suppression du compte
               n'emporte le dossier. */
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // — Informations personnelles —
            $table->string('last_name');
            $table->string('first_name');
            $table->string('gender', 1);                    // M | F
            $table->string('nationality');
            $table->date('birth_date');
            $table->string('birth_place');
            $table->string('phone', 50);
            $table->string('email');
            $table->string('religion')->nullable();

            // — Baccalauréat —
            $table->unsignedSmallInteger('bac_year');
            $table->string('bac_series', 10);
            $table->string('bac_number', 100);
            $table->string('bac_mention', 30);

            // — Inscription demandée —
            $table->string('level', 10);

            /* La mention est gardée deux fois : la clé étrangère pour joindre
               la table, le slug et le nom pour que le dossier reste lisible si
               la mention est plus tard renommée ou retirée du site. */
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('mention');
            $table->string('mention_name');

            // Propres à la réinscription.
            $table->string('student_number', 60)->nullable();
            $table->string('previous_level', 10)->nullable();

            // — Parents —
            $table->string('parent1_name')->nullable();
            $table->string('parent1_phone', 50)->nullable();
            $table->string('parent2_name')->nullable();
            $table->string('parent2_phone', 50)->nullable();

            // — Instruction du dossier —
            $table->text('admin_note')->nullable();
            $table->timestamp('submitted_at')->nullable();

            /* Date d'envoi de l'accusé de réception. Nulle, elle signale à
               l'administration un envoi qui n'est pas parti — l'échec du
               courrier ne doit jamais faire perdre la demande. */
            $table->timestamp('receipt_sent_at')->nullable();

            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('email');
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();

            $table->string('type', 40);        // bac_transcript | cin | payment_receipt

            /* Chemin sur le disque privé (`storage/app/private`), jamais sous
               `uploads/` : ces pièces portent des données personnelles et ne
               doivent pas être servies par Apache. Elles ne sortent que par la
               route d'administration, derrière l'authentification. */
            $table->string('path');
            $table->string('original_name');
            $table->string('mime_type', 120);
            $table->unsignedInteger('size');

            $table->timestamps();

            // Une seule pièce par nature : remplacer, ce n'est pas empiler.
            $table->unique(['application_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('applications');
    }
};
