<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Les pages publiques répondent.
 *
 * `RefreshDatabase` n'est pas décoratif ici : la page d'accueil et la page
 * « À propos » lisent leur contenu dans `component_data`, et le test échouait
 * sur une base sans tables.
 */
class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_returns_a_successful_response(): void
    {
        $this->get('/')->assertStatus(200);
    }

    public function test_la_page_a_propos_repond(): void
    {
        $this->get('/a-propos')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('About'));
    }
}
