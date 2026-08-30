import missionImage from '@/assets/Image-evenement/event-diplome_master-quality.jpg';
import objectifImage from '@/assets/Lieu_espace/Bibliotheque-quality.jpg';
import { cmsImage, cmsList, useSection } from '@/lib/cms';
import { easeOut, motion } from 'framer-motion';
import { SectionHeading } from './section-heading';

type MissionItem = {
    title: string;
    description: string;
    image?: string;
};

/** Visuels livrés avec le site, utilisés tant que le CMS n'en fournit pas. */
const fallbackImages = [missionImage, objectifImage];

const MissionCard = ({
    item,
    index,
}: {
    item: MissionItem;
    index: number;
}) => (
    <motion.article
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ amount: 0.2, once: true }}
        transition={{ duration: 0.6, delay: index * 0.12, ease: easeOut }}
        className="border-border bg-card group overflow-hidden border hover:bg-primary"
    >
        <div className="relative aspect-[16/10] w-full overflow-hidden">
            <img
                src={cmsImage(
                    item.image,
                    fallbackImages[index % fallbackImages.length],
                )}
                alt=""
                className="h-full w-full object-cover grayscale group-hover:grayscale-0"
            />
        </div>
        <div className="p-7 md:p-8">
            <h3 className="text-primary group-hover:text-primary-foreground mb-3 text-xl font-bold md:text-2xl">
                {item.title}
            </h3>
            <p className="text-muted-foreground group-hover:text-primary-foreground leading-relaxed">
                {item.description}
            </p>
        </div>
    </motion.article>
);

export const MissionSection = () => {
    const mission = useSection('mission');
    const items = cmsList<MissionItem>(mission.items);

    return (
        <section id="mission" className="band-dark section border-border border-y">
            <div className="section-container">
                <SectionHeading
                    eyebrow={String(mission.eyebrow ?? '')}
                    title={String(mission.title ?? '')}
                    subtitle={String(mission.subtitle ?? '')}
                />

                <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
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
