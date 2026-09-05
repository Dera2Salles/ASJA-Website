import missionImage from '@/assets/Image-evenement/event-diplome_master-quality.jpg';
import objectifImage from '@/assets/Labo.jpg';
import { cmsImage, cmsList, useSection } from '@/lib/cms';
import { motion } from 'framer-motion';

type MissionItem = {
    title: string;
    description: string;
    image?: string;
};

/** Visuels livrés avec le site, utilisés tant que le CMS n'en fournit pas. */
const fallbackImages = [missionImage, objectifImage];

/* Repli affiché si `config/cms.php` ne renvoie rien pour la section : la
   section reste visible avec le texte de référence plutôt que de se réduire
   à un en-tête suivi du vide. Ce sont les mêmes valeurs que les `default`
   du champ « Piliers », que l'admin peut réécrire. */
const fallbackItems: MissionItem[] = [
    {
        title: 'Notre Mission',
        description:
            "L'Athénée Saint Joseph Antsirabe (ASJA) fonde son projet éducatif sur l'excellence académique, la discipline, la foi et l'engagement social. Sa mission est d'offrir une formation complète (savoir, savoir-faire, savoir-être) en alliant rigueur, solidarité et créativité.",
    },
    {
        title: 'Notre Objectif',
        description:
            "Notre vision pour une université moderne et ancrée nationalement repose sur six piliers : assurer une formation de haut niveau adaptée au marché du travail et à la mondialisation ; encourager la recherche scientifique et l'innovation au service du développement ; développer les compétences des étudiants via des stages et des projets concrets.",
    },
];

/* Les cartes alternent le côté de la photo. L'inversion n'existe qu'à partir
   de `md` : empilées sur téléphone, image puis texte, l'ordre reste le même
   d'une carte à l'autre — l'alternance y produirait un rythme illisible. */
const MissionCard = ({ item, index }: { item: MissionItem; index: number }) => (
    <motion.article
        initial={{ y: 32, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
        className={`bg-card flex flex-col overflow-hidden rounded-[22px] md:flex-row ${
            index % 2 === 0 ? '' : 'md:flex-row-reverse'
        }`}
    >
        <div className="aspect-[16/10] w-full shrink-0 overflow-hidden md:aspect-auto md:min-h-[300px] md:w-2/5">
            <img
                src={cmsImage(
                    item.image,
                    fallbackImages[index % fallbackImages.length],
                )}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
            />
        </div>

        <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
            <h3 className="font-display text-foreground mb-3 text-xl leading-tight font-extrabold tracking-[-0.02em] uppercase sm:text-2xl">
                {item.title}
            </h3>
            <p className="text-muted-foreground text-[15px] leading-relaxed sm:text-base">
                {item.description}
            </p>
        </div>
    </motion.article>
);

/**
 * Mission & objectifs — l'engagement éducatif de l'université.
 *
 * Le contenu vient de la section `mission` de `config/cms.php` (sur-titre,
 * titre, introduction et liste « Piliers »), éditable depuis l'admin.
 */
export const MissionSection = () => {
    const mission = useSection('mission');
    const cmsItems = cmsList<MissionItem>(mission.items);
    const items = cmsItems.length > 0 ? cmsItems : fallbackItems;

    return (
        <section id="mission" className="band-dark section-rhythm">
            <div className="section-shell">
                {/* En-tête split, identique à celui des autres bandes sombres :
                    titre à gauche, chapô à droite, et empilés tant que la
                    rangée ne peut pas accueillir les deux sans les écraser. */}
                <div className="mb-9 flex flex-col gap-4 sm:mb-11 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
                    <div className="max-w-[640px]">
                        {mission.eyebrow ? (
                            <p className="eyebrow mb-3">
                                {String(mission.eyebrow)}
                            </p>
                        ) : null}
                        <h2 className="font-display text-foreground text-[clamp(30px,7.4vw,64px)] leading-[0.98] font-black tracking-tight uppercase">
                            {String(
                                mission.title ?? 'Notre Engagement Éducatif',
                            )}
                        </h2>
                    </div>

                    {mission.subtitle ? (
                        <p className="text-muted-foreground max-w-sm text-[15px] leading-relaxed sm:text-base">
                            {String(mission.subtitle)}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                    {items.map((item, index) => (
                        <MissionCard
                            key={`${item.title}-${index}`}
                            item={item}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
