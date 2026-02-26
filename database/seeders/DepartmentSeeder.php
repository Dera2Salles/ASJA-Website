<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'slug'        => 'informatique',
                'name'        => 'INFORMATIQUE',
                'description' => 'La filière Informatique prépare les étudiants à maîtriser les outils et technologies de l\'ère numérique. Elle couvre des domaines essentiels tels que la programmation, le développement web et mobile, les bases de données, les réseaux, la cybersécurité, l\'intelligence artificielle et la gestion de projets logiciels.',
                'color'       => '#1d4ed8',
                'is_visible'  => true,
                'sort_order'  => 1,
            ],
            [
                'slug'        => 'droit',
                'name'        => 'DROIT',
                'description' => 'La filière Droit offre une formation complète en droit civil, pénal, constitutionnel, administratif et commercial. Elle vise à développer une solide culture juridique et un esprit critique, indispensables à la compréhension des institutions.',
                'color'       => '#7c3aed',
                'is_visible'  => true,
                'sort_order'  => 2,
            ],
            [
                'slug'        => 'economie',
                'name'        => 'ÉCONOMIE ET COMMERCE',
                'description' => 'La filière Économie et Commerce forme des experts capables d\'analyser les marchés, gérer des entreprises et développer des stratégies commerciales dans un contexte économique global.',
                'color'       => '#059669',
                'is_visible'  => true,
                'sort_order'  => 3,
            ],
            [
                'slug'        => 'agronomie',
                'name'        => 'SCIENCES AGRONOMIQUES',
                'description' => 'La filière Sciences Agronomiques forme des ingénieurs capables de répondre aux défis agricoles et environnementaux de Madagascar. Les étudiants acquièrent des compétences sur la transformation alimentaire, la production animale et végétale.',
                'color'       => '#65a30d',
                'is_visible'  => true,
                'sort_order'  => 4,
            ],
            [
                'slug'        => 'sciences-de-la-terre',
                'name'        => 'SCIENCES DE LA TERRE',
                'description' => 'La filière Sciences de la Terre explore la géologie, la minéralogie, l\'hydrologie et les sciences de l\'environnement. Les étudiants apprennent à analyser les ressources naturelles et à comprendre les processus géologiques.',
                'color'       => '#b45309',
                'is_visible'  => true,
                'sort_order'  => 5,
            ],
            [
                'slug'        => 'langues-etrangeres-appliquees',
                'name'        => 'LANGUES ÉTRANGÈRES APPLIQUÉES',
                'description' => 'La filière LEA forme des spécialistes de la communication interculturelle et des langues étrangères (anglais, français, etc.), orientés vers la traduction, l\'interprétation et les relations internationales.',
                'color'       => '#db2777',
                'is_visible'  => true,
                'sort_order'  => 6,
            ],
        ];

        foreach ($departments as $dept) {
            $department = Department::updateOrCreate(['slug' => $dept['slug']], $dept);
        }

        // Seed sample programs for Informatique
        $info = Department::where('slug', 'informatique')->first();
        if ($info && $info->programs()->count() === 0) {
            $info->programs()->createMany([
                ['title' => 'Génie Logiciel', 'description' => 'Formation axée sur le développement logiciel, les architectures web et mobiles.', 'competences' => "Développement d'applications web\nGestion de bases de données\nProgrammation orientée objet et UML", 'debouches' => "Data scientist\nDéveloppeur Full Stack\nDesigner web et d'applications", 'sort_order' => 1],
                ['title' => 'Télécommunication', 'description' => 'Formation sur les réseaux informatiques et les systèmes de télécommunication.', 'competences' => "Réseaux et protocoles\nSécurité des systèmes\nAdministration de systèmes", 'debouches' => "Administrateur réseau\nIngénieur télécoms\nExpert cybersécurité", 'sort_order' => 2],
            ]);
        }

        // Seed sample programs for Droit
        $droit = Department::where('slug', 'droit')->first();
        if ($droit && $droit->programs()->count() === 0) {
            $droit->programs()->createMany([
                ['title' => 'Droit des Affaires', 'description' => 'Former des juristes d\'entreprise maîtrisant le droit commercial, fiscal et des sociétés.', 'competences' => "Gestion juridique des sociétés\nAnalyse des risques et conformités\nNégociations et rédactions de contrats", 'debouches' => "Juriste d'entreprise\nAvocat d'affaires\nConsultant en fiscalité", 'sort_order' => 1],
                ['title' => 'Droit Processuel', 'description' => 'Formation sur les procédures judiciaires, civiles et pénales.', 'competences' => "Procédures civiles et pénales\nRédaction d'actes juridiques\nDroit constitutionnel", 'debouches' => "Magistrat\nAvocat\nFonctionnaire international", 'sort_order' => 2],
            ]);
        }
    }
}
