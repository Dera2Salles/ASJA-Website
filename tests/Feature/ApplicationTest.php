<?php

namespace Tests\Feature;

use App\Mail\ApplicationReceived;
use App\Models\Application;
use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * Dépôt en ligne d'une demande d'inscription ou de réinscription.
 *
 * Le parcours va du formulaire public jusqu'à l'accusé de réception, en
 * passant par les pièces justificatives et l'écran d'instruction. Les tests
 * suivent ce chemin dans l'ordre.
 */
class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Les pièces n'ont rien à faire sur le disque réel pendant les tests.
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

    /** @return array<string, mixed> */
    private function dossier(array $overrides = []): array
    {
        return [
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
                'bac_transcript' => UploadedFile::fake()->create('releve.pdf', 120, 'application/pdf'),
                // `->image()` réclamerait l'extension GD, absente de bien des
                // environnements : un faux fichier au bon type MIME suffit,
                // c'est lui que la règle `mimes` interroge.
                'cin' => UploadedFile::fake()->create('cin.jpg', 80, 'image/jpeg'),
                'payment_receipt' => UploadedFile::fake()->create('bordereau.pdf', 90, 'application/pdf'),
            ],

            ...$overrides,
        ];
    }

    /**
     * Dossier de réinscription.
     *
     * Il ne reprend rien de la première inscription : l'étudiant est déjà au
     * dossier, son matricule l'y retrouve, son adresse dit où lui répondre. Ne
     * restent que les trois pièces de l'année — bulletin, photo en buste,
     * bordereau de versement.
     *
     * @return array<string, mixed>
     */
    private function reinscription(array $overrides = []): array
    {
        return [
            'idempotency_key' => (string) Str::uuid(),
            'type' => Application::TYPE_REINSCRIPTION,

            'student_number' => 'ETU-2022-0455',
            'email' => 'tojo@example.com',

            'documents' => [
                'report_card' => UploadedFile::fake()->create('bulletin.pdf', 110, 'application/pdf'),
                'photo' => UploadedFile::fake()->create('buste.jpg', 60, 'image/jpeg'),
                'payment_receipt' => UploadedFile::fake()->create('bordereau.pdf', 90, 'application/pdf'),
            ],

            ...$overrides,
        ];
    }

    /* --- Formulaire public --------------------------------------------- */

    public function test_le_formulaire_est_ouvert_sans_compte(): void
    {
        $this->mention();

        $this->get('/candidature')->assertOk();
    }

    public function test_un_depot_complet_enregistre_la_demande_ses_pieces_et_son_numero(): void
    {
        $department = $this->mention();

        $response = $this->post('/candidature', $this->dossier());

        $application = Application::sole();

        $response->assertRedirect();
        $this->assertStringContainsString(
            '/candidature/confirmation/' . $application->reference,
            $response->headers->get('Location')
        );

        $this->assertMatchesRegularExpression('/^ASJA-\d{4}-0001$/', $application->reference);
        $this->assertSame(Application::STATUS_PENDING, $application->status);
        $this->assertNotNull($application->submitted_at);
        $this->assertSame($department->id, $application->department_id);
        $this->assertSame('Informatique', $application->mention_name);
        $this->assertSame('Hery Rakoto', $application->full_name);

        // Les trois pièces sont sur le disque privé, sous un nom engendré.
        $this->assertCount(3, $application->documents);

        foreach ($application->documents as $document) {
            Storage::disk(Application::DISK)->assertExists($document->path);
            $this->assertStringStartsWith('applications/' . $application->reference, $document->path);
            $this->assertStringNotContainsString($document->original_name, $document->path);
        }
    }

    public function test_le_numero_de_demande_est_sequentiel(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier());
        $this->post('/candidature', $this->dossier(['email' => 'autre@example.com']));

        $this->assertSame(
            ['0001', '0002'],
            Application::orderBy('id')->pluck('reference')
                ->map(fn (string $reference) => substr($reference, -4))
                ->all()
        );
    }

    public function test_laccuse_de_reception_part_a_ladresse_indiquee(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier());

        $application = Application::sole();

        Mail::assertSent(
            ApplicationReceived::class,
            fn (ApplicationReceived $mail) => $mail->hasTo('hery@example.com')
                && $mail->application->is($application)
        );

        $this->assertNotNull($application->receipt_sent_at);
    }

    /* --- Validation ------------------------------------------------------ */

    public function test_un_dossier_incomplet_est_refuse(): void
    {
        $this->mention();

        $this->post('/candidature', [
            'idempotency_key' => (string) Str::uuid(),
            'type' => Application::TYPE_PREMIERE,
        ])->assertSessionHasErrors([
            'last_name', 'first_name', 'gender', 'nationality', 'birth_date',
            'birth_place', 'phone', 'email', 'marital_status', 'religion',
            'cin_number', 'cin_issued_place', 'cin_issued_at',
            'bac_year', 'bac_series',
            'bac_number', 'bac_mention', 'level', 'mention',
            'documents.bac_transcript', 'documents.cin', 'documents.payment_receipt',
        ]);

        $this->assertSame(0, Application::count());
    }

    public function test_une_adresse_email_invalide_est_refusee(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier(['email' => 'pas-une-adresse']))
            ->assertSessionHasErrors('email');
    }

    /**
     * Un nom n'est fait que de lettres : ni chiffre, ni ponctuation, ni
     * symbole. Le trait d'union et l'apostrophe restent admis — ils séparent
     * deux mots d'un même nom.
     */
    public function test_un_nom_avec_chiffre_ou_caractere_special_est_refuse(): void
    {
        $this->mention();

        foreach (['Rakoto2', 'Rakoto@', 'R4koto', '123', 'Rakoto_Jean', '.Rakoto'] as $invalide) {
            $this->post('/candidature', $this->dossier(['last_name' => $invalide]))
                ->assertSessionHasErrors('last_name');

            $this->post('/candidature', $this->dossier(['first_name' => $invalide]))
                ->assertSessionHasErrors('first_name');

            $this->post('/candidature', $this->dossier(['parent1_name' => $invalide]))
                ->assertSessionHasErrors('parent1_name');

            $this->post('/candidature', $this->dossier(['parent2_name' => $invalide]))
                ->assertSessionHasErrors('parent2_name');
        }

        $this->assertSame(0, Application::count());
    }

    public function test_un_nom_compose_ou_accentue_reste_accepte(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier([
            'last_name' => 'Randrianasolo Ravão',
            'first_name' => 'Jean-Pierre',
            'parent1_name' => "N'Diaye Marie",
        ]))->assertSessionHasNoErrors();

        $this->assertSame(1, Application::count());
    }

    public function test_un_numero_de_baccalaureat_non_numerique_est_refuse(): void
    {
        $this->mention();

        foreach (['BAC-2023-4471', '2023 044 710', '12A45', 'abc'] as $invalide) {
            $this->post('/candidature', $this->dossier(['bac_number' => $invalide]))
                ->assertSessionHasErrors('bac_number');
        }

        $this->assertSame(0, Application::count());
    }

    public function test_un_numero_de_baccalaureat_garde_ses_zeros_de_tete(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier(['bac_number' => '0042001337']))
            ->assertSessionHasNoErrors();

        $this->assertSame('0042001337', Application::sole()->bac_number);
    }

    public function test_une_mention_inconnue_est_refusee(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier(['mention' => 'mention-fantome']))
            ->assertSessionHasErrors('mention');
    }

    public function test_un_fichier_trop_volumineux_est_refuse(): void
    {
        $this->mention();

        $dossier = $this->dossier();
        $dossier['documents']['cin'] = UploadedFile::fake()
            ->create('cin.pdf', Application::DOCUMENT_MAX_KB + 1, 'application/pdf');

        $this->post('/candidature', $dossier)
            ->assertSessionHasErrors('documents.cin');

        $this->assertSame(0, Application::count());
    }

    public function test_un_format_de_fichier_non_accepte_est_refuse(): void
    {
        $this->mention();

        $dossier = $this->dossier();
        $dossier['documents']['cin'] = UploadedFile::fake()
            ->create('malveillant.php', 10, 'application/x-httpd-php');

        $this->post('/candidature', $dossier)
            ->assertSessionHasErrors('documents.cin');

        $this->assertSame(0, Application::count());
    }

    /* --- Situation matrimoniale, religion, CIN ---------------------------- */

    public function test_un_numero_de_cin_doit_faire_douze_chiffres(): void
    {
        $this->mention();

        foreach (['12345678901', '1234567890123', '10123456789A', '101 234 567 890'] as $invalide) {
            $this->post('/candidature', $this->dossier(['cin_number' => $invalide]))
                ->assertSessionHasErrors('cin_number');
        }

        $this->assertSame(0, Application::count());
    }

    public function test_un_candidat_marie_doit_donner_la_cin_de_son_conjoint(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier(['marital_status' => 'marie']))
            ->assertSessionHasErrors('spouse_cin_number');

        $this->post('/candidature', $this->dossier([
            'marital_status' => 'marie',
            'spouse_cin_number' => '20987654321',
        ]))->assertSessionHasErrors('spouse_cin_number');

        $this->post('/candidature', $this->dossier([
            'marital_status' => 'marie',
            'spouse_cin_number' => '209876543210',
        ]))->assertSessionHasNoErrors();

        $application = Application::sole();

        $this->assertTrue($application->isMarried());
        $this->assertSame('209876543210', $application->spouse_cin_number);
        $this->assertSame('Marié(e)', $application->marital_status_label);
    }

    /**
     * La CIN d'un conjoint n'a de sens que pour un candidat marié : la laisser
     * passer pour un célibataire enregistrerait une donnée personnelle de
     * quelqu'un que le dossier ne concerne pas.
     */
    public function test_la_cin_du_conjoint_est_refusee_hors_mariage(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier([
            'marital_status' => 'celibataire',
            'spouse_cin_number' => '209876543210',
        ]))->assertSessionHasErrors('spouse_cin_number');

        $this->assertSame(0, Application::count());
    }

    public function test_une_situation_matrimoniale_inconnue_est_refusee(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier(['marital_status' => 'fiance']))
            ->assertSessionHasErrors('marital_status');
    }

    public function test_le_duplicata_ne_peut_pas_preceder_la_delivrance(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier([
            'cin_issued_at' => '2023-06-14',
            'cin_duplicate_at' => '2022-01-05',
        ]))->assertSessionHasErrors('cin_duplicate_at');

        $this->post('/candidature', $this->dossier([
            'cin_issued_at' => '2023-06-14',
            'cin_duplicate_at' => '2024-03-02',
        ]))->assertSessionHasNoErrors();

        $this->assertSame('2024-03-02', Application::sole()->cin_duplicate_at->toDateString());
    }

    public function test_la_religion_est_choisie_dans_la_liste(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier(['religion' => 'Bouddhiste']))
            ->assertSessionHasErrors('religion');

        // « Autre » sans précision n'apprend rien : la précision est exigée.
        $this->post('/candidature', $this->dossier(['religion' => 'autre']))
            ->assertSessionHasErrors('religion_other');

        $this->post('/candidature', $this->dossier([
            'religion' => 'autre',
            'religion_other' => 'Protestante',
        ]))->assertSessionHasNoErrors();

        $this->assertSame('Protestante', Application::sole()->religion_label);
    }

    /* --- Réinscription --------------------------------------------------- */

    public function test_une_reinscription_exige_le_matricule(): void
    {
        $this->mention();

        $dossier = $this->reinscription();
        unset($dossier['student_number']);

        $this->post('/candidature', $dossier)
            ->assertSessionHasErrors('student_number');

        $this->assertSame(0, Application::count());
    }

    public function test_une_reinscription_ne_declare_que_son_matricule_et_son_adresse(): void
    {
        $this->mention();

        $this->post('/candidature', $this->reinscription())->assertRedirect();

        $application = Application::sole();

        $this->assertSame(Application::TYPE_REINSCRIPTION, $application->type);
        $this->assertSame('ETU-2022-0455', $application->student_number);
        $this->assertSame('tojo@example.com', $application->email);

        /* Rien d'autre n'est enregistré : l'état civil, la CIN, le
           baccalauréat et la mention restent ceux du dossier de première
           inscription, que la réinscription ne rouvre pas. */
        $this->assertNull($application->last_name);
        $this->assertNull($application->first_name);
        $this->assertNull($application->cin_number);
        $this->assertNull($application->bac_year);
        $this->assertNull($application->level);
        $this->assertNull($application->mention);
        $this->assertNull($application->department_id);
        $this->assertNull($application->parent1_name);

        // La demande reste identifiable sans état civil.
        $this->assertSame('Matricule ETU-2022-0455', $application->display_name);
    }

    /**
     * Les champs de la première inscription sont refusés, pas rangés en
     * silence : le formulaire ne les propose plus, et une requête forgée ne
     * doit pas réécrire l'état civil d'un étudiant déjà admis.
     */
    public function test_une_reinscription_refuse_les_champs_de_premiere_inscription(): void
    {
        $this->mention();

        $champs = [
            'last_name' => 'Rakoto',
            'birth_date' => '2005-04-12',
            'cin_number' => '101234567890',
            'bac_year' => 2023,
            'level' => 'L3',
            'mention' => 'informatique',
            'parent1_name' => 'Rakoto Jean',
        ];

        foreach ($champs as $champ => $valeur) {
            $this->post('/candidature', $this->reinscription([$champ => $valeur]))
                ->assertSessionHasErrors($champ);
        }

        $this->assertSame(0, Application::count());
    }

    /** Une réinscription sans matricule ni adresse ne dit pas qui l'a déposée. */
    public function test_une_reinscription_vide_est_refusee(): void
    {
        $this->mention();

        $this->post('/candidature', [
            'idempotency_key' => (string) Str::uuid(),
            'type' => Application::TYPE_REINSCRIPTION,
        ])->assertSessionHasErrors([
            'student_number', 'email',
            'documents.report_card', 'documents.photo', 'documents.payment_receipt',
        ]);

        $this->assertSame(0, Application::count());
    }

    public function test_une_reinscription_depose_bulletin_photo_et_bordereau(): void
    {
        $this->mention();

        $this->post('/candidature', $this->reinscription())->assertRedirect();

        $application = Application::sole();

        $this->assertSame('ETU-2022-0455', $application->student_number);
        $this->assertSame([], $application->missingDocuments());

        $this->assertEqualsCanonicalizing(
            ['report_card', 'photo', 'payment_receipt'],
            $application->documents->pluck('type')->all()
        );
    }

    public function test_une_reinscription_sans_bulletin_ni_photo_est_refusee(): void
    {
        $this->mention();

        $dossier = $this->reinscription();
        unset($dossier['documents']['report_card'], $dossier['documents']['photo']);

        $this->post('/candidature', $dossier)
            ->assertSessionHasErrors(['documents.report_card', 'documents.photo']);

        $this->assertSame(0, Application::count());
    }

    /**
     * Une pièce hors sujet est refusée, pas rangée en silence : le formulaire
     * ne la propose pas, et une requête forgée ne doit pas la contourner.
     */
    public function test_une_piece_hors_sujet_est_refusee(): void
    {
        $this->mention();

        $reinscription = $this->reinscription();
        $reinscription['documents']['bac_transcript'] =
            UploadedFile::fake()->create('releve.pdf', 100, 'application/pdf');

        $this->post('/candidature', $reinscription)
            ->assertSessionHasErrors('documents.bac_transcript');

        $premiere = $this->dossier();
        $premiere['documents']['photo'] = UploadedFile::fake()->create('buste.jpg', 60, 'image/jpeg');

        $this->post('/candidature', $premiere)
            ->assertSessionHasErrors('documents.photo');

        $this->assertSame(0, Application::count());
    }

    /** Une photo d'identité est une image : le PDF n'y a pas sa place. */
    public function test_la_photo_de_buste_refuse_un_pdf(): void
    {
        $this->mention();

        $this->post('/candidature', $this->reinscription([
            'documents' => [
                'report_card' => UploadedFile::fake()->create('bulletin.pdf', 110, 'application/pdf'),
                'photo' => UploadedFile::fake()->create('buste.pdf', 60, 'application/pdf'),
                'payment_receipt' => UploadedFile::fake()->create('bordereau.pdf', 90, 'application/pdf'),
            ],
        ]))->assertSessionHasErrors('documents.photo');

        $this->assertSame(0, Application::count());
    }

    public function test_laccuse_de_reception_part_aussi_pour_une_reinscription(): void
    {
        $this->mention();

        $this->post('/candidature', $this->reinscription(['email' => 'tojo@example.com']));

        $application = Application::sole();

        Mail::assertSent(
            ApplicationReceived::class,
            fn (ApplicationReceived $mail) => $mail->hasTo('tojo@example.com')
        );

        $this->assertNotNull($application->receipt_sent_at);
        $this->assertSame('Réinscription', $application->type_label);
    }

    /* --- Doubles soumissions --------------------------------------------- */

    public function test_le_meme_jeton_ne_cree_pas_de_seconde_demande(): void
    {
        $this->mention();

        $dossier = $this->dossier();

        $this->post('/candidature', $dossier);

        // Le double clic renvoie les mêmes données, jeton compris. Les
        // fichiers, eux, sont consommés : on en refait de neufs.
        $rejoue = $this->dossier(['idempotency_key' => $dossier['idempotency_key']]);

        $this->post('/candidature', $rejoue)->assertRedirect();

        $this->assertSame(1, Application::count());
    }

    public function test_un_second_depot_du_meme_candidat_est_signale(): void
    {
        $this->mention();

        $this->post('/candidature', $this->dossier());

        $this->post('/candidature', $this->dossier())
            ->assertSessionHasErrors('email');

        $this->assertSame(1, Application::count());
    }

    /* --- Confirmation ---------------------------------------------------- */

    public function test_la_confirmation_exige_un_lien_signe(): void
    {
        $this->mention();
        $this->post('/candidature', $this->dossier());

        $application = Application::sole();

        // Sans signature : le numéro seul n'ouvre le dossier de personne.
        $this->get('/candidature/confirmation/' . $application->reference)
            ->assertForbidden();

        $this->get(URL::temporarySignedRoute(
            'candidature.confirmation',
            now()->addDay(),
            ['application' => $application->reference]
        ))->assertOk();
    }

    /* --- Confidentialité des pièces -------------------------------------- */

    public function test_les_pieces_ne_sont_pas_servies_publiquement(): void
    {
        $this->mention();
        $this->post('/candidature', $this->dossier());

        $application = Application::sole();
        $document = $application->documents->first();

        // Aucune pièce n'atterrit dans le dossier public `uploads/`.
        $this->assertStringNotContainsString('uploads', $document->path);

        $this->get(route('admin.applications.document', [$application, $document]))
            ->assertRedirect('/login');

        $this->actingAs(User::factory()->create(['role' => 'Student']))
            ->get(route('admin.applications.document', [$application, $document]))
            ->assertForbidden();
    }

    public function test_une_piece_ne_souvre_pas_depuis_le_dossier_dun_autre(): void
    {
        $this->mention();
        $this->post('/candidature', $this->dossier());
        $this->post('/candidature', $this->dossier(['email' => 'autre@example.com']));

        [$premiere, $seconde] = Application::orderBy('id')->get()->all();
        $admin = User::factory()->create(['role' => 'Admin']);

        $this->actingAs($admin)
            ->get(route('admin.applications.document', [$seconde, $premiere->documents->first()]))
            ->assertNotFound();
    }

    /* --- Administration --------------------------------------------------- */

    public function test_ladministration_liste_et_ouvre_une_demande(): void
    {
        $this->mention();
        $this->post('/candidature', $this->dossier());

        $admin = User::factory()->create(['role' => 'Admin']);
        $application = Application::sole();

        /* Les props sont contrôlées une à une : les écrans React les lisent
           telles quelles, et un renommage côté serveur y passerait sinon
           inaperçu jusqu'à l'écran blanc. */
        $this->actingAs($admin)
            ->get(route('admin.applications.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Applications/Index')
                ->has('applications.data', 1)
                ->where('applications.data.0.reference', $application->reference)
                ->where('applications.data.0.status_label', 'En attente')
                ->where('applications.data.0.documents_count', 3)
                ->has('options.statuses', count(Application::STATUSES))
                ->has('options.types', count(Application::TYPES))
                ->has('options.mentions', 1)
                ->where('counts.pending', 1)
            );

        $this->actingAs($admin)
            ->get(route('admin.applications.show', $application))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Applications/Show')
                ->where('application.reference', $application->reference)
                ->where('application.full_name', 'Hery Rakoto')
                ->where('application.mention_name', 'Informatique')
                ->where('application.bac_series', 'D')
                ->where('application.bac_number', '2023044710')
                ->where('application.parent1_name', 'Rakoto Jean')
                ->where('application.cin_number', '101234567890')
                ->where('application.marital_status_label', 'Célibataire')
                ->where('application.religion_label', 'Catholique')
                ->has('application.documents', 3)
                ->where('application.missing_documents', [])
            );
    }

    public function test_le_formulaire_recoit_ses_listes_de_choix_du_serveur(): void
    {
        $this->mention();

        $this->get('/candidature')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Application/Create')
                ->has('options.types', 2)
                ->has('options.levels', 5)
                ->has('options.documents', 5)
                ->has('options.maritalStatuses', 3)

                /* Les frais sont annoncés avant le dépôt, avec le moment où
                   chacun est dû : le candidat sait quel bordereau joindre, et
                   ce qui n'est à verser qu'ensuite. Les montants viennent du
                   serveur, jamais du front. */
                ->has('options.fees', 2)
                ->has('options.fees.' . Application::TYPE_PREMIERE . '.lines', 2)
                ->where('options.fees.' . Application::TYPE_PREMIERE . '.lines.0.amount', 20000)
                ->where('options.fees.' . Application::TYPE_PREMIERE . '.lines.0.when', Application::FEE_AT_SUBMISSION)
                ->where('options.fees.' . Application::TYPE_PREMIERE . '.lines.1.amount', 210000)
                ->where('options.fees.' . Application::TYPE_PREMIERE . '.lines.1.when', Application::FEE_AFTER_VALIDATION)
                ->where('options.fees.' . Application::TYPE_PREMIERE . '.dueAtSubmission', Application::money(20000))
                ->where('options.fees.' . Application::TYPE_PREMIERE . '.dueAfterValidation', Application::money(210000))

                // Une réinscription verse tout au dépôt : rien n'attend.
                ->has('options.fees.' . Application::TYPE_REINSCRIPTION . '.lines', 1)
                ->where('options.fees.' . Application::TYPE_REINSCRIPTION . '.lines.0.amount', 210000)
                ->where('options.fees.' . Application::TYPE_REINSCRIPTION . '.lines.0.when', Application::FEE_AT_SUBMISSION)
                ->where('options.fees.' . Application::TYPE_REINSCRIPTION . '.dueAtSubmission', Application::money(210000))
                ->where('options.fees.' . Application::TYPE_REINSCRIPTION . '.dueAfterValidation', null)

                // Le compte de versement, sans lequel les montants ne servent à rien.
                ->where('options.bankAccount.number', '141 374 400 17')
                ->where('options.bankAccount.bank', 'BOA')
                ->has('options.religions', 3)
                ->where('options.cinLength', Application::CIN_LENGTH)
                // La liste vient de la table des mentions, pas du code du front.
                ->where('options.mentions.0.slug', 'informatique')
                ->where('options.maxFileSizeKb', Application::DOCUMENT_MAX_KB)
            );
    }

    public function test_la_mention_de_larriere_page_prerempli_le_formulaire(): void
    {
        $this->mention();

        $this->get('/candidature?mention=informatique')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('prefill.mention', 'informatique')
            );
    }

    /**
     * Un slug inventé dans l'adresse ne doit pas préremplir un champ contraint :
     * le candidat croirait avoir choisi, et se ferait refuser à l'envoi.
     */
    public function test_une_mention_inventee_dans_ladresse_ne_prerempli_rien(): void
    {
        $this->mention();

        $this->get('/candidature?mention=mention-fantome')
            ->assertInertia(fn (AssertableInertia $page) => $page->where('prefill.mention', null));

        Department::create([
            'slug' => 'mention-cachee',
            'name' => 'Mention cachée',
            'is_visible' => false,
            'sort_order' => 2,
        ]);

        $this->get('/candidature?mention=mention-cachee')
            ->assertInertia(fn (AssertableInertia $page) => $page->where('prefill.mention', null));
    }

    public function test_une_mention_masquee_ne_figure_pas_dans_le_formulaire(): void
    {
        $this->mention();

        Department::create([
            'slug' => 'mention-retiree',
            'name' => 'Mention retirée',
            'is_visible' => false,
            'sort_order' => 1,
        ]);

        $this->get('/candidature')
            ->assertInertia(fn (AssertableInertia $page) => $page->has('options.mentions', 1));

        $this->post('/candidature', $this->dossier(['mention' => 'mention-retiree']))
            ->assertSessionHasErrors('mention');
    }

    public function test_ladministration_change_le_statut_dune_demande(): void
    {
        $this->mention();
        $this->post('/candidature', $this->dossier());

        $admin = User::factory()->create(['role' => 'Admin']);
        $application = Application::sole();

        $this->actingAs($admin)
            ->put(route('admin.applications.status', $application), [
                'status' => Application::STATUS_ACCEPTED,
                'admin_note' => 'Dossier conforme.',
            ])
            ->assertRedirect();

        $application->refresh();

        $this->assertSame(Application::STATUS_ACCEPTED, $application->status);
        $this->assertSame('Dossier conforme.', $application->admin_note);
    }

    public function test_un_statut_inconnu_est_refuse(): void
    {
        $this->mention();
        $this->post('/candidature', $this->dossier());

        $admin = User::factory()->create(['role' => 'Admin']);

        $this->actingAs($admin)
            ->put(route('admin.applications.status', Application::sole()), ['status' => 'admise-directement'])
            ->assertSessionHasErrors('status');
    }

    /**
     * L'écran d'instruction reçoit de quoi désigner une réinscription : sans
     * état civil, c'est le matricule qui nomme le dossier.
     */
    public function test_ladministration_ouvre_une_reinscription_sans_etat_civil(): void
    {
        $this->mention();
        $this->post('/candidature', $this->reinscription());

        $admin = User::factory()->create(['role' => 'Admin']);
        $application = Application::sole();

        $this->actingAs($admin)
            ->get(route('admin.applications.show', $application))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Applications/Show')
                ->where('application.type', Application::TYPE_REINSCRIPTION)
                ->where('application.display_name', 'Matricule ETU-2022-0455')
                ->where('application.student_number', 'ETU-2022-0455')
                ->where('application.last_name', null)
                ->where('application.level', null)
                ->has('application.documents', 3)
                ->where('application.missing_documents', [])
            );
    }

    /* --- Accusé de réception ---------------------------------------------- */

    /**
     * L'accusé d'une réinscription ne peut pas saluer un nom qu'il n'a pas :
     * il nomme le matricule, et n'affiche ni niveau ni mention à blanc.
     */
    public function test_laccuse_dune_reinscription_nomme_le_matricule_et_les_frais(): void
    {
        $this->mention();
        $this->post('/candidature', $this->reinscription());

        $html = (new ApplicationReceived(Application::sole()))->render();

        $this->assertStringContainsString('Bonjour,', $html);
        $this->assertStringContainsString('ETU-2022-0455', $html);

        // Une réinscription verse les frais généraux au dépôt, en une fois.
        $this->assertStringContainsString('Frais généraux', $html);
        $this->assertStringContainsString(Application::money(210000), $html);
        $this->assertStringContainsString('141 374 400 17', $html);

        // Rien n'attend la validation : la mise en garde ne s'affiche pas.
        $this->assertStringNotContainsString('une fois votre dossier validé', $html);

        // Ni niveau ni mention : la réinscription n'en déclare pas.
        $this->assertStringNotContainsString('Niveau demandé', $html);
    }

    /**
     * Une première inscription verse en deux temps : les frais de dossier
     * accompagnent la demande, les frais généraux attendent qu'elle soit
     * retenue. L'accusé doit le dire, sans quoi un candidat verserait
     * 210 000 Ar pour une candidature encore susceptible d'être refusée.
     */
    public function test_laccuse_dune_premiere_inscription_annonce_les_deux_temps(): void
    {
        $this->mention();
        $this->post('/candidature', $this->dossier());

        $html = (new ApplicationReceived(Application::sole()))->render();

        $this->assertStringContainsString('Bonjour Hery Rakoto,', $html);

        $this->assertStringContainsString('Frais de dossier', $html);
        $this->assertStringContainsString(Application::money(20000), $html);
        $this->assertStringContainsString('Au dépôt du dossier', $html);

        $this->assertStringContainsString('Frais généraux', $html);
        $this->assertStringContainsString(Application::money(210000), $html);
        $this->assertStringContainsString('Après validation du dossier', $html);
        $this->assertStringContainsString('une fois votre dossier validé', $html);

        $this->assertStringContainsString('BOA ASJA — 141 374 400 17', $html);
    }

    /** Le versement se fait sur un compte, pas dans le vide. */
    public function test_le_compte_de_versement_est_celui_de_letablissement(): void
    {
        $this->assertSame('141 374 400 17', Application::BANK_ACCOUNT['number']);
        $this->assertSame('BOA', Application::BANK_ACCOUNT['bank']);
    }

    public function test_supprimer_une_demande_efface_ses_pieces_du_disque(): void
    {
        $this->mention();
        $this->post('/candidature', $this->dossier());

        $application = Application::sole();
        $paths = $application->documents->pluck('path')->all();

        $this->actingAs(User::factory()->create(['role' => 'Admin']))
            ->delete(route('admin.applications.destroy', $application))
            ->assertRedirect(route('admin.applications.index'));

        $this->assertSame(0, Application::count());

        foreach ($paths as $path) {
            Storage::disk(Application::DISK)->assertMissing($path);
        }
    }
}
