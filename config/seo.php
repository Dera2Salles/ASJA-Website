<?php

/*
|--------------------------------------------------------------------------
| Référencement et partage
|--------------------------------------------------------------------------
|
| Valeurs de repli des métadonnées du site. Une page qui ne dit rien hérite
| d'ici ; celles qui ont mieux à dire (un article, une mention) le passent
| dans leur prop `seo` — voir App\Support\Seo.
|
| Les coordonnées ne sont PAS ici : elles vivent dans le CMS
| (config/cms.php, section « contact »), éditables depuis l'administration,
| et c'est de là que Seo les tire pour les données structurées. Les recopier
| ferait deux vérités pour une seule adresse.
|
*/

return [

    /* Langue du document. Le site est rédigé en français ; `APP_LOCALE` pilote
       les traductions du serveur, pas la langue des pages publiques. */
    'lang' => 'fr',
    'og_locale' => 'fr_FR',

    'site_name' => 'Université ASJA',

    /* Nom officiel, utilisé par les données structurées et le nom de marque
       des résultats de recherche. */
    'legal_name' => 'Athénée Saint Joseph Antsirabe',

    'description' => "L'Athénée Saint Joseph Antsirabe (ASJA) est une université catholique malgache. Six mentions, deux campus, plus de 2000 étudiants : informatique, droit, économie, agronomie, sciences de la Terre et langues étrangères appliquées.",

    /* Vignette de partage par défaut (Facebook, WhatsApp, X). 1200 × 630,
       le format qu'attendent les aperçus. */
    'image' => '/og-image.jpg',
    'image_width' => 1200,
    'image_height' => 630,

    /* Visuel de bannière de l'accueil, tant qu'aucune photo n'a été
       téléversée. C'est l'élément LCP du site : la vue racine le précharge.
       Le même nom est déclaré côté React dans `lib/images.ts` (`HERO_IMAGE`). */
    'hero_image' => 'Lieu_espace/Devant_asja',

    /* Compte X de l'établissement, s'il en ouvre un : il apparaît alors dans
       la carte de partage. Laissé vide, la carte s'affiche sans attribution. */
    'twitter_site' => null,

];
