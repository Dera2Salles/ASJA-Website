<?php

namespace Database\Seeders;

use App\Models\ComponentData;
use Illuminate\Database\Seeder;

class ComponentDataSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'hero' => [
                'title'    => "Bienvenue à l'ASJA",
                'subtitle' => "Université Catholique d'Antsirabe et Antsohihy — Excellence, Foi & Engagement",
                'cta_text' => "S'inscrire maintenant",
            ],
            'about' => [
                'title'       => "A propos de l'ASJA",
                'description' => "L'Athenee Saint Joseph Antsirabe (ASJA) est une universite catholique situee a Antsirabe et Antsohihy, Madagascar. Elle a pour mission l'excellence academique, la discipline, la foi et l'engagement social.",
                'mission'     => "Former des professionnels competents, engages et responsables pour Madagascar et le monde.",
            ],
            'stats' => [
                'students'    => '2000+',
                'programs'    => '6',
                'years'       => '20+',
                'cities'      => '2',
            ],
            'contact' => [
                'phone'   => '034 49 483 19',
                'email'   => 'example@gmail.com',
                'address' => 'Antsaha, Antsirabe, Madagascar',
                'facebook'=> 'https://www.facebook.com/UniversiteASJA',
            ],
            'programs' => [
                'title'    => 'Nos Mentions',
                'subtitle' => 'Choisissez votre avenir parmi nos formations reconnues par le MESupReS.',
            ],
            'gallery' => [
                'title'    => 'Notre Campus',
                'subtitle' => "Decouvrez notre environnement d'apprentissage stimulant.",
            ],
            'blog' => [
                'title'    => 'Actualites & Evenements',
                'subtitle' => "Restez informe de la vie de l'ASJA.",
            ],
        ];

        foreach ($defaults as $section => $keys) {
            foreach ($keys as $key => $value) {
                ComponentData::setValue($section, $key, $value);
            }
        }
    }
}
