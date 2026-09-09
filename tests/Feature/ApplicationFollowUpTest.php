<?php

namespace Tests\Feature;

use App\Mail\ApplicationStatusUpdated;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Suivi d'un dossier déposé : complément réclamé, bordereau des frais généraux.
 *
 * Ces parcours rouvrent un dossier déjà enregistré, ce qui en fait la partie la
 * plus sensible de la candidature : les tests portent donc autant sur ce qui
 * est permis que sur ce qui ne l'est pas — un numéro de demande seul n'ouvre
 * rien, une pièce non réclamée n'est pas acceptée, et un bordereau ne part pas
 * deux fois.
 */
class ApplicationFollowUpTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake(Application::DISK);
        Mail::fake();
    }

    private function mention(): Department
    {
        return Department::create([
            'slug' => 'informatique',
            'name' => 'Informatique',
            'is_visible' => true,
            'sort_order' => 0,
        ]);
    }

    /** Un dossier déjà déposé, dans l'état voulu. */
    private function application(array $overrides = []): Application
    {
        return Application::createWithReference([
            'idempotency_key' => (string) Str::uuid(),
            'type' => Application::TYPE_PREMIERE,
            'status' => Application::STATUS_PENDING,
            'last_name' => 'Rakoto',
            'first_name' => 'Hery',
            'gender' => 'M',
            'nationality' => 'Malagasy',
            'birth_date' => '2005-04-12',
            'birth_place' => 'Antananarivo',
            'phone' => '034 00 000 00',
            'email' => 'hery@example.com',
            'marital_status' => 'celibataire',
            'religion' => 'catholique',
            'cin_number' => '101234567890',
            'cin_issued_place' => 'Antananarivo',
            'cin_issued_at' => '2023-06-14',
            'bac_year' => 2023,
            'bac_series' => 'D',
            'bac_number' => '2023044710',
            'bac_mention' => 'assez_bien',
            'level' => 'L1',
            'mention' => 'informatique',
            'mention_name' => 'Informatique',
            'parent1_name' => 'Rakoto Jean',
            'parent1_phone' => '033 11 111 11',
            'submitted_at' => now(),
            ...$overrides,
        ]);
    }

    /** Ouvre le dossier comme le ferait le candidat : le droit passe en session. */
    private function open(Application $application): void
    {
        $this->get(URL::temporarySignedRoute(
            'candidature.suivi.show',
            now()->addDays(7),
            ['application' => $application->reference]
        ))->assertOk();
    }

    /* --- Recherche du dossier -------------------------------------------- */

    public function test_la_page_de_recherche_est_ouverte_sans_compte(): void
    {
        $this->mention();

        $this->get('/candidature/suivi')->assertOk();
    }

    public function test_le_numero_de_demande_seul_nouvre_aucun_dossier(): void
    {
        $this->mention();
        $application = $this->application();

        $this->post('/candidature/suivi', [
            'reference' => $application->reference,
            'email' => 'quelquun@autre.com',
        ])->assertSessionHasErrors('reference');

        // Aucun droit n'a été accordé : l'envoi qui suivrait est refusé.
        $this->post('/candidature/suivi/' . $application->reference . '/bordereau')
            ->assertForbidden();
    }

    public function test_lechec_ne_dit_pas_si_le_numero_existe(): void
    {
        $this->mention();
        $application = $this->application();

        $inconnu = $this->post('/candidature/suivi', [
            'reference' => 'ASJA-2026-9999',
            'email' => 'hery@example.com',
        ]);

        $mauvaiseAdresse = $this->post('/candidature/suivi', [
            'reference' => $application->reference,
            'email' => 'quelquun@autre.com',
        ]);

        $this->assertSame(
            $inconnu->getSession()->get('errors')->first('reference'),
            $mauvaiseAdresse->getSession()->get('errors')->first('reference'),
        );
    }

    public function test_le_bon_couple_numero_adresse_ouvre_le_dossier(): void
    {
        $this->mention();
        $application = $this->application();

        $this->post('/candidature/suivi', [
            'reference' => $application->reference,
            // La casse ne doit pas fermer la porte : l'adresse est normalisée.
            'email' => 'HERY@example.com',
        ])->assertRedirect();
    }

    /* --- Complément d'un dossier « à compléter » -------------------------- */

    public function test_un_dossier_qui_nattend_rien_refuse_tout_complement(): void
    {
        $this->mention();
        $application = $this->application(['status' => Application::STATUS_PROCESSING]);

        $this->open($application);

        $this->post('/candidature/suivi/' . $application->reference . '/completer', [
            'documents' => ['cin' => UploadedFile::fake()->create('cin.jpg', 40, 'image/jpeg')],
        ])->assertForbidden();
    }

    public function test_seules_les_pieces_reclamees_sont_acceptees(): void
    {
        $this->mention();
        $application = $this->application([
            'status' => Application::STATUS_INCOMPLETE,
            'requested_documents' => ['cin'],
        ]);

        $this->open($application);

        $this->post('/candidature/suivi/' . $application->reference . '/completer', [
            'documents' => [
                'cin' => UploadedFile::fake()->create('cin.jpg', 40, 'image/jpeg'),
                // Jamais réclamée : elle ne doit pas remplacer une pièce vérifiée.
                'bac_transcript' => UploadedFile::fake()->create('releve.pdf', 40, 'application/pdf'),
            ],
        ])->assertSessionHasErrors('documents.bac_transcript');

        $this->assertSame(0, $application->documents()->count());
    }

    public function test_seuls_les_champs_reclames_sont_modifiables(): void
    {
        $this->mention();
        $application = $this->application([
            'status' => Application::STATUS_INCOMPLETE,
            'requested_fields' => ['phone'],
        ]);

        $this->open($application);

        $this->post('/candidature/suivi/' . $application->reference . '/completer', [
            'phone' => '034 99 999 99',
            // Hors de ce qui est rouvert : refusé, pas ignoré.
            'last_name' => 'Usurpateur',
        ])->assertSessionHasErrors('last_name');

        $this->assertSame('Rakoto', $application->fresh()->last_name);
    }

    public function test_le_complement_met_a_jour_le_dossier_et_referme_le_parcours(): void
    {
        $this->mention();
        $application = $this->application([
            'status' => Application::STATUS_INCOMPLETE,
            'requested_documents' => ['cin'],
            'requested_fields' => ['phone'],
            'completion_message' => 'Photocopie illisible.',
        ]);

        $this->open($application);

        $this->post('/candidature/suivi/' . $application->reference . '/completer', [
            'phone' => '034 99 999 99',
            'documents' => ['cin' => UploadedFile::fake()->create('cin.jpg', 40, 'image/jpeg')],
        ])->assertRedirect();

        $application->refresh();

        $this->assertSame('034 99 999 99', $application->phone);
        $this->assertSame(Application::STATUS_PROCESSING, $application->status);
        $this->assertNotNull($application->completed_at);

        // Les listes vidées sont ce qui ferme le formulaire.
        $this->assertSame([], $application->requestedDocumentTypes());
        $this->assertSame([], $application->requestedFieldNames());
        $this->assertNull($application->openAction());

        $document = $application->documents()->where('type', 'cin')->sole();
        Storage::disk(Application::DISK)->assertExists($document->path);

        // Le même envoi rejoué ne passe plus : le dossier n'attend plus rien.
        $this->post('/candidature/suivi/' . $application->reference . '/completer', [
            'phone' => '034 00 000 00',
            'documents' => ['cin' => UploadedFile::fake()->create('cin.jpg', 40, 'image/jpeg')],
        ])->assertForbidden();
    }

    public function test_un_complement_remplace_la_piece_et_son_fichier(): void
    {
        $this->mention();
        $application = $this->application([
            'status' => Application::STATUS_INCOMPLETE,
            'requested_documents' => ['cin'],
        ]);

        $ancien = ApplicationDocument::create([
            'application_id' => $application->id,
            'type' => 'cin',
            'path' => Storage::disk(Application::DISK)->putFileAs(
                'applications/' . $application->reference,
                UploadedFile::fake()->create('ancien.jpg', 20, 'image/jpeg'),
                'cin-ancien.jpg'
            ),
            'original_name' => 'ancien.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 20,
        ]);

        $this->open($application);

        $this->post('/candidature/suivi/' . $application->reference . '/completer', [
            'documents' => ['cin' => UploadedFile::fake()->create('nouveau.jpg', 40, 'image/jpeg')],
        ])->assertRedirect();

        // Une seule pièce de cette nature, et l'ancien fichier a disparu.
        $this->assertSame(1, $application->documents()->where('type', 'cin')->count());
        $this->assertSame('nouveau.jpg', $application->fresh()->document('cin')->original_name);
        Storage::disk(Application::DISK)->assertMissing($ancien->path);
    }

    /* --- Bordereau des frais généraux ------------------------------------ */

    public function test_le_bordereau_est_refuse_avant_la_validation_du_dossier(): void
    {
        $this->mention();
        $application = $this->application(['status' => Application::STATUS_PENDING]);

        $this->open($application);

        $this->post('/candidature/suivi/' . $application->reference . '/bordereau', [
            'document' => UploadedFile::fake()->create('bordereau.pdf', 40, 'application/pdf'),
        ])->assertForbidden();
    }

    public function test_une_reinscription_nattend_jamais_de_frais_generaux(): void
    {
        $this->mention();
        $application = $this->application([
            'type' => Application::TYPE_REINSCRIPTION,
            'status' => Application::STATUS_ACCEPTED,
            'student_number' => 'ETU-2022-0455',
        ]);

        $this->assertNull($application->feesDocumentType());

        $this->open($application);

        $this->post('/candidature/suivi/' . $application->reference . '/bordereau', [
            'document' => UploadedFile::fake()->create('bordereau.pdf', 40, 'application/pdf'),
        ])->assertForbidden();
    }

    public function test_le_bordereau_est_recu_une_fois_le_dossier_valide_et_une_seule(): void
    {
        $this->mention();
        $application = $this->application(['status' => Application::STATUS_ACCEPTED]);

        $this->open($application);

        $this->post('/candidature/suivi/' . $application->reference . '/bordereau', [
            'document' => UploadedFile::fake()->create('bordereau.pdf', 40, 'application/pdf'),
        ])->assertRedirect();

        $application->refresh();

        $this->assertSame(Application::STATUS_FEES_SUBMITTED, $application->status);
        $this->assertNotNull($application->fees_receipt_at);

        $document = $application->documents()->where('type', 'general_fees_receipt')->sole();
        Storage::disk(Application::DISK)->assertExists($document->path);

        // Second envoi : le dossier n'est plus à cette étape.
        $this->post('/candidature/suivi/' . $application->reference . '/bordereau', [
            'document' => UploadedFile::fake()->create('encore.pdf', 40, 'application/pdf'),
        ])->assertForbidden();
    }

    public function test_un_envoi_sans_droit_dacces_est_refuse(): void
    {
        $this->mention();
        $application = $this->application(['status' => Application::STATUS_ACCEPTED]);

        // Le numéro est connu, mais aucun dossier n'a été ouvert dans cette session.
        $this->post('/candidature/suivi/' . $application->reference . '/bordereau', [
            'document' => UploadedFile::fake()->create('bordereau.pdf', 40, 'application/pdf'),
        ])->assertForbidden();

        $this->assertSame(0, $application->documents()->count());
    }

    public function test_le_lien_de_suivi_non_signe_est_refuse(): void
    {
        $this->mention();
        $application = $this->application();

        $this->get('/candidature/suivi/' . $application->reference)->assertForbidden();
    }

    /* --- Dépôt initial : l'étape ferme la pièce des frais généraux -------- */

    public function test_le_bordereau_des_frais_generaux_est_refuse_au_depot(): void
    {
        $this->mention();

        $this->post('/candidature', [
            'idempotency_key' => (string) Str::uuid(),
            'type' => Application::TYPE_PREMIERE,
            'last_name' => 'Rakoto',
            'first_name' => 'Hery',
            'gender' => 'M',
            'nationality' => 'Malagasy',
            'birth_date' => '2005-04-12',
            'birth_place' => 'Antananarivo',
            'phone' => '034 00 000 00',
            'email' => 'hery@example.com',
            'marital_status' => 'celibataire',
            'religion' => 'catholique',
            'cin_number' => '101234567890',
            'cin_issued_place' => 'Antananarivo',
            'cin_issued_at' => '2023-06-14',
            'bac_year' => 2023,
            'bac_series' => 'D',
            'bac_number' => '2023044710',
            'bac_mention' => 'assez_bien',
            'level' => 'L1',
            'mention' => 'informatique',
            'parent1_name' => 'Rakoto Jean',
            'parent1_phone' => '033 11 111 11',
            'documents' => [
                'bac_transcript' => UploadedFile::fake()->create('releve.pdf', 40, 'application/pdf'),
                'cin' => UploadedFile::fake()->create('cin.jpg', 40, 'image/jpeg'),
                'payment_receipt' => UploadedFile::fake()->create('bordereau.pdf', 40, 'application/pdf'),
                // Dû seulement après validation : refusé ici.
                'general_fees_receipt' => UploadedFile::fake()->create('generaux.pdf', 40, 'application/pdf'),
            ],
        ])->assertSessionHasErrors('documents.general_fees_receipt');

        $this->assertSame(0, Application::count());
    }

    /* --- Côté administration --------------------------------------------- */

    public function test_ladministration_reclame_des_pieces_et_previent_le_candidat(): void
    {
        $this->mention();
        $application = $this->application();
        $admin = User::factory()->create(['role' => 'Admin']);

        $this->actingAs($admin)
            ->put('/admin/candidatures/' . $application->id . '/statut', [
                'status' => Application::STATUS_INCOMPLETE,
                'completion_message' => 'Photocopie illisible.',
                'requested_documents' => ['cin'],
                'requested_fields' => ['phone'],
            ])->assertRedirect();

        $application->refresh();

        $this->assertSame(['cin'], $application->requestedDocumentTypes());
        $this->assertSame(['phone'], $application->requestedFieldNames());
        $this->assertNotNull($application->completion_requested_at);
        $this->assertSame('complete', $application->openAction());

        Mail::assertSent(ApplicationStatusUpdated::class);
    }

    public function test_ladministration_ne_reclame_que_ce_que_le_type_declare(): void
    {
        $this->mention();
        $application = $this->application([
            'type' => Application::TYPE_REINSCRIPTION,
            'student_number' => 'ETU-2022-0455',
        ]);
        $admin = User::factory()->create(['role' => 'Admin']);

        $this->actingAs($admin)
            ->put('/admin/candidatures/' . $application->id . '/statut', [
                'status' => Application::STATUS_INCOMPLETE,
                // Une réinscription ne dépose ni CIN ni baccalauréat.
                'requested_documents' => ['cin'],
            ])->assertSessionHasErrors('requested_documents.0');
    }

    public function test_quitter_le_statut_a_completer_referme_le_parcours(): void
    {
        $this->mention();
        $application = $this->application([
            'status' => Application::STATUS_INCOMPLETE,
            'requested_documents' => ['cin'],
        ]);
        $admin = User::factory()->create(['role' => 'Admin']);

        $this->actingAs($admin)
            ->put('/admin/candidatures/' . $application->id . '/statut', [
                'status' => Application::STATUS_PROCESSING,
            ])->assertRedirect();

        $application->refresh();

        $this->assertSame([], $application->requestedDocumentTypes());
        $this->assertNull($application->openAction());
    }

    public function test_un_dossier_a_completer_sans_rien_a_completer_est_refuse(): void
    {
        $this->mention();
        $application = $this->application();
        $admin = User::factory()->create(['role' => 'Admin']);

        $this->actingAs($admin)
            ->put('/admin/candidatures/' . $application->id . '/statut', [
                'status' => Application::STATUS_INCOMPLETE,
            ])->assertSessionHasErrors('requested_documents');

        $this->assertSame(Application::STATUS_PENDING, $application->fresh()->status);
    }
}
