<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Inscription en ligne et espace étudiant.
 *
 * La route `dashboard` — celle où Breeze renvoie après une connexion, une
 * inscription ou une vérification d'adresse — n'existait pas, et les deux
 * contrôleurs d'authentification visaient à la place `admin.dashboard`, fermé
 * par le filtre `admin`. S'inscrire finissait donc en `RouteNotFoundException`
 * et se connecter en 403 : aucun étudiant ne pouvait entrer.
 */
class StudentSpaceTest extends TestCase
{
    use RefreshDatabase;

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
    private function inscription(array $overrides = []): array
    {
        return [
            'name' => 'Rakoto',
            'last_name' => 'Hery',
            'contact' => '034 00 000 00',
            'mention' => 'informatique',
            'level' => 'L1',
            'email' => 'hery@example.com',
            'password' => 'motdepasse-solide',
            'password_confirmation' => 'motdepasse-solide',
            ...$overrides,
        ];
    }

    public function test_une_inscription_cree_un_compte_etudiant_avec_sa_fiche(): void
    {
        $this->mention();

        $this->post('/register', $this->inscription())
            ->assertRedirect('/espace-etudiant');

        $user = User::sole();

        $this->assertSame('Student', $user->role);
        $this->assertSame('informatique', $user->mention);
        $this->assertSame('L1', $user->level);
        $this->assertSame('034 00 000 00', $user->contact);
        $this->assertAuthenticatedAs($user);
    }

    /** Le rôle vient du serveur : on ne s'auto-promeut pas administrateur. */
    public function test_une_inscription_ne_choisit_pas_son_role(): void
    {
        $this->mention();

        $this->post('/register', $this->inscription(['role' => 'Admin']));

        $this->assertSame('Student', User::sole()->role);
    }

    /** Une mention inconnue est refusée : la liste vient de la base. */
    public function test_une_mention_inexistante_est_refusee(): void
    {
        $this->mention();

        $this->post('/register', $this->inscription(['mention' => 'astrologie']))
            ->assertSessionHasErrors('mention');

        $this->assertGuest();
    }

    public function test_un_etudiant_qui_se_connecte_arrive_sur_son_espace(): void
    {
        $student = User::factory()->create(['role' => 'Student']);

        $this->post('/login', [
            'email' => $student->email,
            'password' => 'password',
        ])->assertRedirect('/espace-etudiant');

        $this->get('/espace-etudiant')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Student/Space'));
    }

    public function test_un_administrateur_est_renvoye_vers_son_tableau_de_bord(): void
    {
        $admin = User::factory()->create(['role' => 'Admin']);

        $this->actingAs($admin)
            ->get('/espace-etudiant')
            ->assertRedirect('/admin');
    }

    public function test_la_reinscription_met_a_jour_la_fiche(): void
    {
        $this->mention();
        $student = User::factory()->create(['role' => 'Student', 'level' => 'L1']);

        $this->actingAs($student)
            ->patch('/espace-etudiant', [
                'name' => $student->name,
                'last_name' => 'Hery',
                'contact' => '033 11 111 11',
                'mention' => 'informatique',
                'level' => 'L2',
                'branche' => 'Génie logiciel',
            ])
            ->assertRedirect('/espace-etudiant');

        $student->refresh();

        $this->assertSame('L2', $student->level);
        $this->assertSame('informatique', $student->mention);
        $this->assertSame('Génie logiciel', $student->branche);
        // Le rôle n'est pas modifiable depuis la fiche.
        $this->assertSame('Student', $student->role);
    }

    public function test_lespace_etudiant_est_ferme_aux_visiteurs(): void
    {
        $this->get('/espace-etudiant')->assertRedirect('/login');
        $this->patch('/espace-etudiant', [])->assertRedirect('/login');
    }
}
