<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\BacSeries;
use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * Le référentiel des séries du baccalauréat, administrable depuis la section
 * « Candidature ».
 *
 * Ce qui se joue ici n'est pas le formulaire d'administration mais son effet :
 * une série ajoutée doit être proposée *et* acceptée le jour même, une série
 * désactivée doit disparaître des deux côtés, et aucune des deux opérations ne
 * doit abîmer les dossiers déjà déposés.
 */
class BacSeriesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake(Application::DISK);
        Mail::fake();
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'Admin']);
    }

    /* --- Accès --------------------------------------------------------- */

    public function test_un_etudiant_ne_peut_pas_ouvrir_les_series(): void
    {
        $student = User::factory()->create(['role' => 'Student']);

        $this->actingAs($student)
            ->get(route('admin.bac-series.index'))
            ->assertForbidden();
    }

    public function test_un_etudiant_ne_peut_pas_ajouter_de_serie(): void
    {
        $student = User::factory()->create(['role' => 'Student']);

        $this->actingAs($student)
            ->post(route('admin.bac-series.store'), ['code' => 'PIRATE'])
            ->assertForbidden();

        $this->assertDatabaseMissing('bac_series', ['code' => 'PIRATE']);
    }

    /* --- Liste --------------------------------------------------------- */

    public function test_la_liste_montre_les_series_et_leur_usage(): void
    {
        $this->application(['bac_series' => 'D']);

        $this->actingAs($this->admin())
            ->get(route('admin.bac-series.index'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('Admin/BacSeries/Index')
                    // Les sept séries reprises de la liste historique.
                    ->has('series', 7)
                    ->where('series.3.code', 'D')
                    ->where('series.3.applications_count', 1)
                    ->where('series.0.applications_count', 0)
            );
    }

    /* --- Ajout --------------------------------------------------------- */

    public function test_une_serie_ajoutee_est_proposee_et_acceptee(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.bac-series.store'), [
                'code' => 'TI',
                'label' => 'Technologies industrielles',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('bac_series', ['code' => 'TI', 'is_active' => true]);

        // Proposée : le formulaire public la reçoit, intitulé compris.
        $this->get(route('candidature.create'))
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('options.bacSeries', 8)
                    ->where('options.bacSeries.7', [
                        'value' => 'TI',
                        'label' => 'TI — Technologies industrielles',
                    ])
            );

        // Acceptée : la validation lit la même table.
        $this->assertTrue(in_array('TI', BacSeries::activeCodes(), true));
    }

    public function test_une_serie_sans_intitule_saffiche_par_son_code(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.bac-series.store'), ['code' => 'F4', 'is_active' => true])
            ->assertRedirect();

        $series = BacSeries::where('code', 'F4')->firstOrFail();

        $this->assertNull($series->label);
        $this->assertSame('F4', $series->optionLabel());
    }

    public function test_un_code_deja_pris_est_refuse(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.bac-series.store'), ['code' => 'D'])
            ->assertSessionHasErrors('code');

        $this->assertSame(1, BacSeries::where('code', 'D')->count());
    }

    public function test_un_code_en_toutes_lettres_est_refuse(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.bac-series.store'), ['code' => 'série d'])
            ->assertSessionHasErrors('code');
    }

    public function test_une_serie_ajoutee_se_range_a_la_suite(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.bac-series.store'), ['code' => 'TI'])
            ->assertRedirect();

        $this->assertSame(7, BacSeries::where('code', 'TI')->value('sort_order'));
    }

    /* --- Modification -------------------------------------------------- */

    public function test_modifier_un_code_suit_sur_les_dossiers_deposes(): void
    {
        $application = $this->application(['bac_series' => 'OSE']);
        $series = BacSeries::where('code', 'OSE')->firstOrFail();

        $this->actingAs($this->admin())
            ->put(route('admin.bac-series.update', $series), [
                'code' => 'OSE1',
                'label' => 'Option sciences économiques',
                'is_active' => true,
                'sort_order' => 6,
            ])
            ->assertRedirect();

        $this->assertSame('OSE1', $application->fresh()->bac_series);
    }

    public function test_une_serie_desactivee_quitte_le_formulaire_et_la_validation(): void
    {
        $series = BacSeries::where('code', 'L')->firstOrFail();

        $this->actingAs($this->admin())
            ->put(route('admin.bac-series.update', $series), [
                'code' => 'L',
                'is_active' => false,
                'sort_order' => $series->sort_order,
            ])
            ->assertRedirect();

        $this->assertFalse(in_array('L', BacSeries::activeCodes(), true));

        $this->get(route('candidature.create'))
            ->assertInertia(fn (AssertableInertia $page) => $page->has('options.bacSeries', 6));
    }

    public function test_une_serie_desactivee_reste_lisible_sur_un_dossier(): void
    {
        $application = $this->application(['bac_series' => 'L']);
        $series = BacSeries::where('code', 'L')->firstOrFail();

        $this->actingAs($this->admin())
            ->put(route('admin.bac-series.update', $series), [
                'code' => 'L',
                'is_active' => false,
                'sort_order' => $series->sort_order,
            ]);

        $this->assertSame('L', $application->fresh()->bac_series);

        $this->actingAs($this->admin())
            ->get(route('admin.applications.show', $application))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('application.bac_series', 'L'));
    }

    /* --- Suppression --------------------------------------------------- */

    public function test_une_serie_inutilisee_se_supprime(): void
    {
        $series = BacSeries::where('code', 'S')->firstOrFail();

        $this->actingAs($this->admin())
            ->delete(route('admin.bac-series.destroy', $series))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('bac_series', ['code' => 'S']);
    }

    public function test_une_serie_declaree_sur_un_dossier_ne_se_supprime_pas(): void
    {
        $this->application(['bac_series' => 'D']);
        $series = BacSeries::where('code', 'D')->firstOrFail();

        $this->actingAs($this->admin())
            ->delete(route('admin.bac-series.destroy', $series))
            ->assertSessionHasErrors('code');

        $this->assertDatabaseHas('bac_series', ['code' => 'D']);
    }

    /* --- Effet sur le dépôt -------------------------------------------- */

    public function test_le_depot_refuse_une_serie_desactivee(): void
    {
        $series = BacSeries::where('code', 'D')->firstOrFail();
        $series->update(['is_active' => false]);

        $this->post(route('candidature.store'), $this->payload(['bac_series' => 'D']))
            ->assertSessionHasErrors('bac_series');
    }

    public function test_le_depot_accepte_une_serie_creee_par_ladministration(): void
    {
        BacSeries::create(['code' => 'TI', 'is_active' => true, 'sort_order' => 7]);

        $this->post(route('candidature.store'), $this->payload(['bac_series' => 'TI']))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('applications', ['bac_series' => 'TI']);
    }

    /* --- Fixtures ------------------------------------------------------ */

    private function application(array $attributes = []): Application
    {
        return Application::createWithReference(array_merge([
            'type' => Application::TYPE_PREMIERE,
            'status' => Application::STATUS_PENDING,
            'last_name' => 'Rakoto',
            'first_name' => 'Hery',
            'email' => 'hery@example.com',
            'bac_series' => 'D',
        ], $attributes));
    }

    /**
     * Un dépôt complet de première inscription, dont seule la série varie.
     *
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        Department::create([
            'slug' => 'informatique',
            'name' => 'Informatique',
            'is_visible' => true,
            'sort_order' => 0,
        ]);

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
                'cin' => UploadedFile::fake()->create('cin.jpg', 80, 'image/jpeg'),
                'payment_receipt' => UploadedFile::fake()->create('bordereau.pdf', 90, 'application/pdf'),
            ],

            ...$overrides,
        ];
    }
}
