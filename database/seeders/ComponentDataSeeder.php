<?php

namespace Database\Seeders;

use App\Support\Cms;
use Illuminate\Database\Seeder;

/**
 * Peuple `component_data` avec les valeurs par défaut du schéma.
 *
 * Optionnel : le site s'affiche correctement même sans ce seeder, puisque
 * Cms::section() retombe déjà sur les défauts. Il sert surtout à pré-remplir
 * les champs de l'admin pour que l'administrateur parte du contenu existant.
 */
class ComponentDataSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Cms::schema() as $section => $definition) {
            $values = [];

            foreach ($definition['fields'] as $key => $field) {
                if (! array_key_exists('default', $field)) {
                    continue;
                }
                $values[$key] = $field['default'];
            }

            if ($values !== []) {
                Cms::put($section, $values);
            }
        }
    }
}
