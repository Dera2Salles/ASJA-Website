<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le sommaire du contenu est remonté dans la barre latérale de
 * l'administration. La section ouverte vit donc dans l'URL, et la liste des
 * sections doit être partagée à toutes les pages d'administration.
 */
class CmsSectionNavTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'Admin']);
    }

    public function test_la_section_ouverte_vient_de_lurl(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/contenu?section=faq')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/ComponentData/Index')
                ->where('activeSection', 'faq'));
    }

    public function test_une_section_inconnue_retombe_sur_la_premiere(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/contenu?section=inexistante')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('activeSection', 'hero'));
    }

    public function test_le_sommaire_est_partage_une_fois_connecte(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/contenu')
            ->assertInertia(fn ($page) => $page
                ->where('cmsSections.faq', 'Foire aux questions')
                ->where('activeSection', 'hero'));
    }

    /**
     * La page d'accueil publie déjà une prop `cms` contenant tout le contenu
     * résolu : le sommaire doit vivre sous une clé distincte, sans la recouvrir.
     */
    public function test_le_sommaire_ne_recouvre_pas_le_contenu_public(): void
    {
        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('cmsSections', [])
            ->has('cms.hero'));
    }
}
