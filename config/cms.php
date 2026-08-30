<?php

/*
|--------------------------------------------------------------------------
| Schéma du CMS
|--------------------------------------------------------------------------
|
| Source de vérité unique du contenu éditable du site. Ce fichier est lu :
|   · par l'admin  → pour générer automatiquement le formulaire d'édition
|   · par le front → pour fournir la valeur par défaut quand la base est vide
|   · par le seeder → pour peupler la table `component_data`
|
| Ajouter un champ ici suffit : il apparaît dans l'admin et devient lisible
| côté React, sans écrire de code supplémentaire.
|
| Types de champ disponibles :
|   text | textarea | html | image | number | url | list
|
| Un champ `list` contient des éléments répétables décrits par sa clé
| `fields`, et son `default` est un tableau d'éléments.
|
*/

return [

    'hero' => [
        'label' => 'Accueil — bannière',
        'description' => "La première chose que voit un visiteur.",
        'fields' => [
            'title' => [
                'label' => 'Titre principal',
                'type' => 'text',
                'default' => 'Athénée Saint Joseph Antsirabe',
            ],
            'subtitle' => [
                'label' => 'Sous-titre',
                'type' => 'textarea',
                'default' => "Une université catholique ouverte à tous, offrant une formation d'excellence pour un avenir brillant.",
            ],
            'cta_label' => [
                'label' => 'Texte du bouton',
                'type' => 'text',
                'default' => 'Découvrir nos formations',
            ],
            'background_image' => [
                'label' => 'Image de fond (mode clair)',
                'type' => 'image',
                'help' => "Laisser vide pour conserver l'image par défaut du site.",
                'default' => '',
            ],
            'background_image_dark' => [
                'label' => 'Image de fond (mode sombre)',
                'type' => 'image',
                'help' => "Laisser vide pour conserver l'image par défaut du site.",
                'default' => '',
            ],
        ],
    ],

    'mission' => [
        'label' => 'Mission & Objectifs',
        'description' => "L'engagement éducatif de l'université.",
        'fields' => [
            'eyebrow' => [
                'label' => 'Sur-titre',
                'type' => 'text',
                'default' => 'Notre raison d’être',
            ],
            'title' => [
                'label' => 'Titre de section',
                'type' => 'text',
                'default' => 'Notre Engagement Éducatif',
            ],
            'subtitle' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'Former des esprits brillants et des citoyens responsables, prêts à relever les défis de demain.',
            ],
            'items' => [
                'label' => 'Piliers',
                'type' => 'list',
                'item_label' => 'Pilier',
                'fields' => [
                    'title' => ['label' => 'Titre', 'type' => 'text'],
                    'description' => ['label' => 'Description', 'type' => 'textarea'],
                    'image' => ['label' => 'Image', 'type' => 'image'],
                ],
                'default' => [
                    [
                        'title' => 'Notre Mission',
                        'description' => "L'Athénée Saint Joseph Antsirabe (ASJA) fonde son projet éducatif sur l'excellence académique, la discipline, la foi et l'engagement social. Sa mission est d'offrir une formation complète (savoir, savoir-faire, savoir-être) en alliant rigueur, solidarité et créativité.",
                        'image' => '',
                    ],
                    [
                        'title' => 'Notre Objectif',
                        'description' => "Notre vision pour une université moderne et ancrée nationalement repose sur six piliers : assurer une formation de haut niveau adaptée au marché du travail et à la mondialisation ; encourager la recherche scientifique et l'innovation au service du développement ; développer les compétences des étudiants via des stages et des projets concrets.",
                        'image' => '',
                    ],
                ],
            ],
        ],
    ],

    'programs' => [
        'label' => 'Mentions',
        'description' => "En-tête de la section. Les mentions elles-mêmes se gèrent dans « Mentions ».",
        'fields' => [
            'eyebrow' => ['label' => 'Sur-titre', 'type' => 'text', 'default' => 'Formations'],
            'title' => ['label' => 'Titre de section', 'type' => 'text', 'default' => 'Nos Mentions'],
            'subtitle' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'Choisissez votre avenir parmi nos formations reconnues par le MESupReS.',
            ],
        ],
    ],

    'events' => [
        'label' => 'Événements — en-tête',
        'description' => "En-tête de la section. Les événements se gèrent dans « Publications ».",
        'fields' => [
            'eyebrow' => ['label' => 'Sur-titre', 'type' => 'text', 'default' => 'Vie du campus'],
            'title' => ['label' => 'Titre de section', 'type' => 'text', 'default' => 'Nos Événements'],
            'subtitle' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'Découvrez les moments forts qui animent la vie de notre campus.',
            ],
        ],
    ],

    'pedagogy' => [
        'label' => 'Système pédagogique',
        'description' => 'La répartition de la formation, en pourcentages.',
        'fields' => [
            'eyebrow' => ['label' => 'Sur-titre', 'type' => 'text', 'default' => 'Notre méthode'],
            'title' => ['label' => 'Titre de section', 'type' => 'text', 'default' => 'Système Pédagogique'],
            'subtitle' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => "Une formation équilibrée entre théorie, pratique et développement personnel.",
            ],
            'items' => [
                'label' => 'Composantes',
                'type' => 'list',
                'item_label' => 'Composante',
                'fields' => [
                    'percentage' => ['label' => 'Pourcentage', 'type' => 'number'],
                    'title' => ['label' => 'Titre', 'type' => 'text'],
                    'description' => ['label' => 'Description', 'type' => 'textarea'],
                ],
                'default' => [
                    ['percentage' => 45, 'title' => 'Cours théoriques', 'description' => 'Acquisition des bases scientifiques et conceptuelles solides de chaque filière.'],
                    ['percentage' => 10, 'title' => 'Travaux pratiques', 'description' => 'Mise en application concrète des notions vues en cours.'],
                    ['percentage' => 15, 'title' => 'Stages et projets', 'description' => "Immersion dans le monde du travail, projets de terrain et étude de cas réels."],
                    ['percentage' => 10, 'title' => 'Évaluation continue', 'description' => 'Devoirs, présentations, mini-projets et contrôles réguliers.'],
                    ['percentage' => 15, 'title' => 'Ouverture et recherche', 'description' => 'Activités de recherche, innovations, conférences et collaborations externes.'],
                    ['percentage' => 5, 'title' => 'Développement personnel', 'description' => 'Formation humaine, éthique et sociale selon les valeurs Déhoniennes.'],
                ],
            ],
        ],
    ],

    'testimonials' => [
        'label' => 'Témoignages — en-tête',
        'description' => "En-tête de la section. Les témoignages se gèrent dans « Témoignages ».",
        'fields' => [
            'eyebrow' => ['label' => 'Sur-titre', 'type' => 'text', 'default' => 'Ils en parlent'],
            'title' => ['label' => 'Titre de section', 'type' => 'text', 'default' => 'Témoignages'],
            'subtitle' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => "Ce que nos étudiants et anciens disent de leur passage à l'ASJA.",
            ],
        ],
    ],

    'blog' => [
        'label' => 'Actualités — en-tête',
        'description' => "En-tête de la section. Les articles se gèrent dans « Publications ».",
        'fields' => [
            'eyebrow' => ['label' => 'Sur-titre', 'type' => 'text', 'default' => 'Actualités'],
            'title' => ['label' => 'Titre de section', 'type' => 'text', 'default' => 'Actualités & Annonces'],
            'subtitle' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => "Restez informé de la vie de l'ASJA.",
            ],
            'cta_label' => ['label' => 'Texte du bouton', 'type' => 'text', 'default' => 'Voir toutes les publications'],
        ],
    ],

    'faq' => [
        'label' => 'Foire aux questions',
        'description' => 'Questions fréquentes, groupées par catégorie.',
        'fields' => [
            'eyebrow' => ['label' => 'Sur-titre', 'type' => 'text', 'default' => 'Besoin d’aide ?'],
            'title' => ['label' => 'Titre de section', 'type' => 'text', 'default' => 'Foire Aux Questions'],
            'subtitle' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'Les réponses aux questions que l’on nous pose le plus souvent.',
            ],
            'categories' => [
                'label' => 'Catégories',
                'type' => 'list',
                'item_label' => 'Catégorie',
                'help' => 'L’ordre défini ici est celui affiché sur le site.',
                'fields' => [
                    'name' => ['label' => 'Nom', 'type' => 'text'],
                ],
                'default' => [
                    ['name' => 'Générale'],
                    ['name' => 'Enseignement'],
                    ['name' => 'Inscription'],
                    ['name' => 'Autres'],
                ],
            ],
            'items' => [
                'label' => 'Questions',
                'type' => 'list',
                'item_label' => 'Question',
                'fields' => [
                    'question' => ['label' => 'Question', 'type' => 'text'],
                    'answer' => ['label' => 'Réponse', 'type' => 'textarea'],
                    'category' => ['label' => 'Catégorie', 'type' => 'text'],
                ],
                'default' => [
                    ['question' => 'Où se trouve l’ASJA ?', 'answer' => 'Il existe des universités ASJA à Antsirabe et Antsohihy.', 'category' => 'Générale'],
                    ['question' => 'Combien coûtent les frais de scolarité à l’ASJA ?', 'answer' => 'Les coûts varient selon le niveau d’études (L1, L2, L3, M1, M2).', 'category' => 'Générale'],
                    ['question' => 'Les diplômes de l’ASJA sont-ils reconnus ?', 'answer' => 'Oui, les diplômes délivrés par l’ASJA sont reconnus par le MESupReS de Madagascar.', 'category' => 'Générale'],
                    ['question' => 'Quels sont les horaires d’ouverture du service des Étudiants ?', 'answer' => 'Le service des Étudiants est ouvert de 8h à 12h et de 13h30 à 15h.', 'category' => 'Générale'],
                    ['question' => 'Qu’est-ce que le système LMD ?', 'answer' => 'Licence-Master-Doctorat est un modèle universitaire international fondé sur 3 niveaux de formation : Licence (3 ans), Master (2 ans), Doctorat (3 ans). Chaque année d’étude correspond à 60 crédits ECTS, permettant une validation progressive des acquis.', 'category' => 'Enseignement'],
                    ['question' => 'Pourquoi l’ASJA suit ce système ?', 'answer' => 'Ce système rend les diplômes reconnus à l’international et favorise la mobilité des étudiants.', 'category' => 'Enseignement'],
                    ['question' => 'Comment s’inscrire à l’ASJA ?', 'answer' => 'Vous pouvez vous inscrire en vous rendant au bureau du service de scolarité à l’ASJA.', 'category' => 'Inscription'],
                    ['question' => 'Quels sont les documents à fournir pour l’inscription ?', 'answer' => '1 photocopie légalisée du bulletin de notes de Terminale, 1 photocopie légalisée du relevé de notes du BACC, 1 bulletin de naissance, 2 photos d’identité + 1 numérique, 1 photo buste, 1 enveloppe timbrée avec l’adresse exacte des parents, 1 lettre de motivation, 1 enveloppe A4, 1 photocopie de la CIN.', 'category' => 'Inscription'],
                    ['question' => 'Y a-t-il une cantine ?', 'answer' => 'Oui, l’ASJA dispose de 2 cafétérias ouvertes du lundi au samedi pour les besoins alimentaires des étudiants.', 'category' => 'Autres'],
                    ['question' => 'Y a-t-il des activités sportives ?', 'answer' => 'Oui, l’ASJA comprend divers clubs de sport (volleyball, football et basketball), organise chaque année un tournoi inter-filières et participe également aux tournois interuniversitaires.', 'category' => 'Autres'],
                    ['question' => 'Y a-t-il un logement ?', 'answer' => 'Oui, l’ASJA dispose de logements pour les étudiants, offrant un cadre de vie propice à l’étude et à l’épanouissement personnel.', 'category' => 'Autres'],
                ],
            ],
        ],
    ],

    'contact' => [
        'label' => 'Contact & pied de page',
        'description' => 'Coordonnées affichées dans le pied de page de tout le site.',
        'fields' => [
            'tagline' => [
                'label' => 'Baseline',
                'type' => 'textarea',
                'default' => "Université catholique d'Antsirabe — Excellence, Foi & Engagement.",
            ],
            'phone' => ['label' => 'Téléphone', 'type' => 'text', 'default' => '034 49 483 19'],
            'email' => ['label' => 'E-mail', 'type' => 'text', 'default' => 'asja@moov.mg'],
            'address' => ['label' => 'Adresse', 'type' => 'text', 'default' => 'Antsaha, Antsirabe, Madagascar'],
            'facebook' => ['label' => 'Page Facebook', 'type' => 'url', 'default' => 'https://www.facebook.com/UniversiteASJA'],
            'latitude' => ['label' => 'Latitude (carte)', 'type' => 'text', 'default' => '-19.814068'],
            'longitude' => ['label' => 'Longitude (carte)', 'type' => 'text', 'default' => '47.070135'],
        ],
    ],

    'stats' => [
        'label' => 'Chiffres clés',
        'fields' => [
            'items' => [
                'label' => 'Chiffres',
                'type' => 'list',
                'item_label' => 'Chiffre',
                'fields' => [
                    'value' => ['label' => 'Valeur', 'type' => 'text'],
                    'label' => ['label' => 'Libellé', 'type' => 'text'],
                ],
                'default' => [
                    ['value' => '2000+', 'label' => 'Étudiants'],
                    ['value' => '6', 'label' => 'Mentions'],
                    ['value' => '20+', 'label' => 'Années d’expérience'],
                    ['value' => '2', 'label' => 'Campus'],
                ],
            ],
        ],
    ],

];
