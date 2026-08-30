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
}) => {
    const isEven = index % 2 === 0;

    return (
        <motion.article
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2, once: true }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: easeOut }}
            className={`border-border bg-card group overflow-hidden border flex flex-col hover:bg-primary transition-colors duration-200 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
        >
            <div className="relative aspect-[16/10] w-full md:aspect-auto md:w-2/5 shrink-0 overflow-hidden">
                <img
                    src={cmsImage(
                        item.image,
                        fallbackImages[index % fallbackImages.length],
                    )}
                    alt=""
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="flex-1 p-7 md:p-10 flex flex-col justify-center">
                <h3 className="text-primary group-hover:text-primary-foreground mb-4 text-xl font-bold md:text-2xl font-display">
                    {item.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-primary-foreground leading-relaxed text-sm md:text-base">
                    {item.description}
                </p>
            </div>
        </motion.article>
    );
};

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

                <div className="flex flex-col gap-8">
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
