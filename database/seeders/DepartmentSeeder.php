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

        // ── INFORMATIQUE ────────────────────────────────────────────────────
        $info = Department::where('slug', 'informatique')->first();
        if ($info && $info->programs()->count() === 0) {
            $info->programs()->createMany([
                [
                    'title'       => 'Génie Logiciel',
                    'description' => 'Formation axée sur le développement logiciel, les architectures web et mobiles, et la gestion de projets informatiques. Les étudiants apprennent à concevoir, développer et maintenir des logiciels de qualité.',
                    'competences' => "Développement d'applications web et mobiles\nGestion et modélisation de bases de données\nProgrammation orientée objet et design patterns\nGestion de projets Agile/Scrum\nIntégration continue et DevOps",
                    'debouches'   => "Développeur Full Stack\nIngénieur logiciel\nChef de projet informatique\nData scientist\nArchitecte logiciel",
                    'sort_order'  => 1,
                ],
                [
                    'title'       => 'Télécommunication',
                    'description' => 'Formation sur les réseaux informatiques, les systèmes de télécommunication et la cybersécurité. Les étudiants acquièrent les compétences nécessaires pour concevoir et administrer des infrastructures réseau modernes.',
                    'competences' => "Administration de réseaux LAN/WAN\nSécurité des systèmes d'information\nProtocoles de communication (TCP/IP, VoIP)\nInfrastructure cloud et virtualisation\nFibres optiques et radiocommunications",
                    'debouches'   => "Administrateur réseau\nIngénieur télécoms\nExpert en cybersécurité\nConsultant en infrastructure IT\nResponsable systèmes et réseaux",
                    'sort_order'  => 2,
                ],
                [
                    'title'       => 'Génie Industriel',
                    'description' => 'Parcours à la croisée de l\'informatique et de l\'industrie. Les étudiants apprennent à optimiser les processus industriels grâce aux outils numériques, à l\'automatisation et à l\'intelligence artificielle.',
                    'competences' => "Automatisation et robotique industrielle\nIntelligence artificielle appliquée\nOptimisation des processus de production\nSystèmes embarqués\nIoT et industrie 4.0",
                    'debouches'   => "Ingénieur en automatisation\nResponsable production numérique\nConsultant industrie 4.0\nIngénieur systèmes embarqués\nData engineer industriel",
                    'sort_order'  => 3,
                ],
            ]);
        }

        // ── DROIT ────────────────────────────────────────────────────────────
        $droit = Department::where('slug', 'droit')->first();
        if ($droit && $droit->programs()->count() === 0) {
            $droit->programs()->createMany([
                [
                    'title'       => 'Droit des Affaires',
                    'description' => 'Former des juristes d\'entreprise maîtrisant le droit commercial, fiscal et des sociétés. Ce parcours prépare à exercer des fonctions de conseil et de représentation dans le monde économique.',
                    'competences' => "Gestion juridique des sociétés et entreprises\nAnalyse des risques et conformité réglementaire\nNégociation et rédaction de contrats commerciaux\nDroit fiscal et comptabilité juridique\nDroit international des affaires",
                    'debouches'   => "Juriste d'entreprise\nAvocat d'affaires\nConsultant en fiscalité\nDirecteur juridique\nNotaire",
                    'sort_order'  => 1,
                ],
                [
                    'title'       => 'Droit Processuel',
                    'description' => 'Formation approfondie sur les procédures judiciaires civiles, pénales et administratives. Les étudiants apprennent à maîtriser les mécanismes du système judiciaire malgache et international.',
                    'competences' => "Procédures civiles, pénales et administratives\nRédaction d'actes et de mémoires juridiques\nDroit constitutionnel et institutions judiciaires\nDroit pénal et criminologie\nProcédures d'arbitrage et de médiation",
                    'debouches'   => "Magistrat\nAvocat au barreau\nGreffier\nFonctionnaire international\nConseiller juridique dans les ONG",
                    'sort_order'  => 2,
                ],
            ]);
        }

        // ── ÉCONOMIE ET COMMERCE ─────────────────────────────────────────────
        $eco = Department::where('slug', 'economie')->first();
        if ($eco && $eco->programs()->count() === 0) {
            $eco->programs()->createMany([
                [
                    'title'       => 'Économie et Développement',
                    'description' => 'Parcours orienté vers l\'analyse économique et les politiques de développement. Les étudiants apprennent à diagnostiquer et à proposer des solutions aux problèmes économiques nationaux et internationaux.',
                    'competences' => "Analyse macroéconomique et microéconomique\nÉvaluation de projets de développement\nStatistiques et économétrie\nPolitiques économiques et sociales\nÉconomie internationale et mondialisation",
                    'debouches'   => "Économiste dans un organisme public\nConsultant en développement\nAnalyste financier\nChargé de projet dans les ONG\nEnseignant-chercheur en économie",
                    'sort_order'  => 1,
                ],
                [
                    'title'       => 'Gestion et Commerce Internationaux',
                    'description' => 'Formation axée sur la gestion d\'entreprise et les échanges commerciaux à l\'international. Les étudiants acquièrent les outils nécessaires pour évoluer dans un environnement économique mondialisé.',
                    'competences' => "Gestion financière et comptabilité\nMarketing et stratégies commerciales\nImport-export et logistique internationale\nManagement des ressources humaines\nNégociation interculturelle",
                    'debouches'   => "Responsable commercial export\nDirecteur marketing\nLogisticien international\nGestionnaire de PME\nConsultant en stratégie d'entreprise",
                    'sort_order'  => 2,
                ],
            ]);
        }

        // ── SCIENCES AGRONOMIQUES ─────────────────────────────────────────────
        $agro = Department::where('slug', 'agronomie')->first();
        if ($agro && $agro->programs()->count() === 0) {
            $agro->programs()->createMany([
                [
                    'title'       => 'Production Animale',
                    'description' => 'Parcours dédié à l\'élevage et à la gestion des ressources animales. Les étudiants apprennent à optimiser la production animale tout en respectant les normes sanitaires et environnementales.',
                    'competences' => "Gestion des élevages bovins, porcins et avicoles\nSanté animale et médecine vétérinaire préventive\nNutrition et alimentation animale\nGénétique et reproduction animale\nGestion durable des ressources pastorales",
                    'debouches'   => "Ingénieur zootechnicien\nResponsable d'exploitation agricole\nConsultant en développement rural\nAgent dans les coopératives agricoles\nChargé de projet agro-pastoral",
                    'sort_order'  => 1,
                ],
                [
                    'title'       => 'Production Végétale',
                    'description' => 'Formation axée sur la culture des plantes, l\'amélioration variétale et la gestion durable des terres agricoles à Madagascar et dans la région.',
                    'competences' => "Agronomie générale et amélioration des plantes\nGestion de la fertilité des sols\nProtection des cultures (phytopathologie, entomologie)\nIrrigation et gestion de l'eau agricole\nAgriculture biologique et agroécologie",
                    'debouches'   => "Ingénieur agronome\nConseiller agricole\nAgent de développement rural\nResponsable qualité agroalimentaire\nChef de projet en agriculture durable",
                    'sort_order'  => 2,
                ],
                [
                    'title'       => 'Agroalimentaire',
                    'description' => 'Parcours à la croisée de l\'agronomie et de l\'industrie alimentaire. Les étudiants apprennent à transformer les produits agricoles bruts en produits finis de haute qualité.',
                    'competences' => "Technologies de transformation alimentaire\nContrôle qualité et normes HACCP\nConservation et conditionnement des aliments\nGestion d'une unité de production agroalimentaire\nNutrition et sécurité alimentaire",
                    'debouches'   => "Ingénieur agroalimentaire\nResponsable qualité et hygiène\nDirecteur d'unité de production\nConsultant en sécurité alimentaire\nChef de projet agro-industriel",
                    'sort_order'  => 3,
                ],
            ]);
        }

        // ── SCIENCES DE LA TERRE ─────────────────────────────────────────────
        $geo = Department::where('slug', 'sciences-de-la-terre')->first();
        if ($geo && $geo->programs()->count() === 0) {
            $geo->programs()->createMany([
                [
                    'title'       => 'Hydrogéologie',
                    'description' => 'Parcours spécialisé dans l\'étude des eaux souterraines et des ressources en eau. Les étudiants apprennent à localiser, exploiter et préserver les nappes phréatiques.',
                    'competences' => "Hydrogéologie et gestion des eaux souterraines\nCartographie et SIG (systèmes d'information géographique)\nForage et exploitation de puits\nQualité et traitement de l'eau\nGestion durable des ressources hydriques",
                    'debouches'   => "Hydrogéologue\nIngénieur en ressources en eau\nChargé d'études en environnement\nAgent dans les ministères de l'eau\nConsultant pour les ONG humanitaires",
                    'sort_order'  => 1,
                ],
                [
                    'title'       => 'Géologie Minière',
                    'description' => 'Formation orientée vers l\'exploration et l\'exploitation des ressources minérales. Madagascar étant riche en minéraux, ce parcours ouvre de nombreuses portes dans le secteur minier national et international.',
                    'competences' => "Prospection et exploration minière\nMinéralogie et pétrographie\nTechniques de forage et d'exploitation\nEnvironnement minier et réhabilitation de sites\nGéophysique appliquée",
                    'debouches'   => "Géologue minier\nIngénieur des mines\nExpert en valorisation minérale\nAgent au Bureau des Mines (BCMM)\nConsultant en environnement minier",
                    'sort_order'  => 2,
                ],
            ]);
        }

        // ── LANGUES ÉTRANGÈRES APPLIQUÉES ─────────────────────────────────────
        $lea = Department::where('slug', 'langues-etrangeres-appliquees')->first();
        if ($lea && $lea->programs()->count() === 0) {
            $lea->programs()->createMany([
                [
                    'title'       => 'Traduction et Interprétation',
                    'description' => 'Parcours axé sur la maîtrise des techniques de traduction écrite et d\'interprétation orale. Les étudiants développent une expertise linguistique de haut niveau dans plusieurs langues étrangères.',
                    'competences' => "Traduction spécialisée (juridique, technique, littéraire)\nInterprétation consécutive et simultanée\nLinguistique contrastive et terminologie\nTraduction assistée par ordinateur (TAO)\nRédaction professionnelle multilingue",
                    'debouches'   => "Traducteur-interprète\nInterprète de conférence\nRédacteur multilingue\nTerminologue\nAssistant dans les organisations internationales",
                    'sort_order'  => 1,
                ],
                [
                    'title'       => 'Communication Interculturelle',
                    'description' => 'Formation centrée sur les relations internationales et la communication entre cultures. Les étudiants apprennent à naviguer dans des environnements multiculturels et à gérer les échanges diplomatiques et commerciaux.',
                    'competences' => "Communication interculturelle et diplomatie\nRelations internationales et coopération\nLangues étrangères appliquées aux affaires\nGestion de projets internationaux\nMédiation et résolution de conflits culturels",
                    'debouches'   => "Attaché culturel ou commercial\nChargé de coopération internationale\nResponsable des relations publiques\nTraducteur en entreprise multinationale\nFormateur en langues professionnelles",
                    'sort_order'  => 2,
                ],
            ]);
        }
    }
}
