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
            'religion' => 'Catholique',

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
            'birth_place', 'phone', 'email', 'bac_year', 'bac_series',
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

    /* --- Réinscription --------------------------------------------------- */

    public function test_une_reinscription_exige_le_matricule(): void
    {
        $this->mention();

        $dossier = $this->dossier(['type' => Application::TYPE_REINSCRIPTION]);
        unset($dossier['documents']['bac_transcript'], $dossier['documents']['cin']);

        $this->post('/candidature', $dossier)
            ->assertSessionHasErrors('student_number');
    }

    public function test_une_reinscription_nexige_que_le_bordereau(): void
    {
        $this->mention();

        $dossier = $this->dossier([
            'type' => Application::TYPE_REINSCRIPTION,
            'student_number' => 'ETU-2024-0912',
            'level' => 'L2',
        ]);
        unset($dossier['documents']['bac_transcript'], $dossier['documents']['cin']);

        $this->post('/candidature', $dossier)->assertRedirect();

        $application = Application::sole();

        $this->assertSame('ETU-2024-0912', $application->student_number);
        $this->assertCount(1, $application->documents);
        $this->assertSame([], $application->missingDocuments());
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
                ->has('options.documents', 3)
                // La liste vient de la table des mentions, pas du code du front.
                ->where('options.mentions.0.slug', 'informatique')
                ->where('options.maxFileSizeKb', Application::DOCUMENT_MAX_KB)
            );
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
