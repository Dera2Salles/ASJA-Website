<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * L'administration pilote l'intégralité du contenu public : l'accès doit être
 * réservé au rôle « Admin ». Auparavant, le groupe de routes n'était protégé
 * que par `auth`, donc n'importe quel étudiant connecté pouvait y entrer.
 */
class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_visiteur_est_redirige_vers_la_connexion(): void
    {
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_un_etudiant_connecte_ne_peut_pas_ouvrir_ladministration(): void
    {
        $student = User::factory()->create(['role' => 'Student']);

        $this->actingAs($student)->get('/admin')->assertForbidden();
    }

    public function test_un_administrateur_accede_au_tableau_de_bord(): void
    {
        $admin = User::factory()->create(['role' => 'Admin']);

        $this->actingAs($admin)->get('/admin')->assertOk();
    }

    public function test_un_etudiant_ne_peut_pas_modifier_le_contenu_du_site(): void
    {
        $student = User::factory()->create(['role' => 'Student']);

        $this->actingAs($student)
            ->post('/admin/contenu', ['section' => 'hero', 'data' => ['title' => 'Piraté']])
            ->assertForbidden();
    }
}
