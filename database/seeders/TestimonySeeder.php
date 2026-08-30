<?php

namespace Database\Seeders;

use App\Models\Testimony;
use Illuminate\Database\Seeder;

/**
 * Reprend les témoignages qui étaient écrits en dur dans le front, afin
 * qu'ils deviennent modifiables depuis l'administration.
 *
 * Les photos restent celles livrées avec le site : le composant les retrouve
 * par le nom tant qu'aucun avatar n'a été téléversé.
 */
class TestimonySeeder extends Seeder
{
    public function run(): void
    {
        $testimonies = [
            ['Raharijesy Safidy', 'UI/UX Designer', "Mon parcours, de la formation en informatique à la spécialisation en UI/UX Design, m'a doté de l'expertise technique et de la vision créative nécessaires pour aujourd'hui, en tant qu'entrepreneur, aider les marques à s'exprimer pleinement."],
            ['Randiambolasoa Andriatsilavo Falihery', 'Étudiant en Génie Industriel', 'La formation en Génie Industriel à l’ASJA a profondément transformé ma manière d’aborder les systèmes techniques et organisationnels. Grâce aux cours orientés vers la pratique, j’ai appris à analyser, optimiser et améliorer des processus industriels réels.'],
            ['Randriamanapaka Manantena Toditsara Jencia', 'Étudiante en Droit', 'Étudiante en Master 1 de Droit à l’ASJA et Présidente de la Mention Droit, j’ai pu renforcer mon leadership et mon dynamisme grâce aux opportunités offertes par l’université, notamment un stage au Ministère des affaires étrangères et au ministère de la fonction publique dès ma 2ᵉ année.'],
            ['Bouchet Michou Diana', 'Étudiante en Science de la Terre', "Mes études à l'ASJA m'ont permis d'explorer ma passion pour les sciences de la terre. Les cours pratiques et les sorties sur le terrain ont enrichi ma compréhension des enjeux environnementaux et géologiques."],
            ['Dadare Raoul', 'Étudiant en Langue Étrangère Appliquée', "Ma formation en Langue Étrangère Appliquée à l'ASJA m'a ouvert les portes du monde professionnel international. J'ai développé des compétences linguistiques et interculturelles essentielles pour préparer ma carrière."],
            ['Razanato Nambinintsoa Sitraka', 'Ingénieure Agronome', "Mes études à l'ASJA ont confirmé que l'Agronomie ne se limite pas juste à cultiver, mais englobe aussi le commerce, la gestion, le marketing, la qualité et l'environnement."],
            ['Aina Arthur', 'Sortant en Droit Processuel', "L'ASJA m'a aidé à trouver mon parcours professionnel. Les cours de droit ont été particulièrement pertinents et m'ont permis de me perfectionner et de prendre confiance en mes capacités."],
            ['Mandimbiharison Miarotiana', 'Étudiant en Économie', 'Mon parcours en Économie au sein de l’ASJA a été une expérience déterminante. En Master 2, j’ai pu approfondir des compétences essentielles comme l’analyse des politiques économiques, la gestion des ressources et l’étude des dynamiques de marché.'],
            ['RAJEMISON Steffy Jachia', 'Étudiante en Économie', 'L’ASJA m’a offert un cadre stimulant qui a renforcé mon ambition. Je suis prête à relever les défis du monde des affaires.'],
            ['RAJEMISON Suziah Jaida', 'Étudiante en Économie', "Mes études en économie à l'ASJA m'ont permis d'acquérir une compréhension approfondie des principes économiques et des marchés, me préparant ainsi à une carrière réussie dans la finance ou la gestion."],
        ];

        foreach ($testimonies as [$name, $role, $content]) {
            Testimony::updateOrCreate(
                ['name' => $name],
                ['role' => $role, 'content' => $content, 'is_visible' => true]
            );
        }
    }
}
