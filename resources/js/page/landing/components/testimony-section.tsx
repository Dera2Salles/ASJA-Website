import ainaImage from '@/assets/Aina-Arthur-quality.jpg';
import michouImage from '@/assets/Bouchet_Michou_Diana.jpeg';
import raoulImage from '@/assets/DADARE-Raoul.jpg';
import faliheryImage from '@/assets/Falihery.jpg';
import miarotianaImage from '@/assets/Mandimbiharison_Miarotiana.jpeg';
import steffyJachiaImage from '@/assets/RAJEMISON-Steffy-Jachia.jpg';
import jenciaImage from '@/assets/RANDRIAMANAPAKA-Manantena-Jencia.jpg';
import suziahImage from '@/assets/Rajemson-suziah-jaida.jpg';
import safidyImage from '@/assets/Safidy-pic.jpg';
import sitrakaImage from '@/assets/Sitraka.jpg';
import { cmsImage, useSection } from '@/lib/cms';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface Testimony {
    id: number;
    name: string;
    role: string | null;
    content: string;
    avatar: string | null;
}

/** Photos livrées avec le site, retrouvées par le nom du témoin. */
const fallbackAvatars: Record<string, string> = {
    'Raharijesy Safidy': safidyImage,
    'Randiambolasoa Andriatsilavo Falihery': faliheryImage,
    'Randriamanapaka Manantena Toditsara Jencia': jenciaImage,
    'Bouchet Michou Diana': michouImage,
    'Dadare Raoul': raoulImage,
    'Razanato Nambinintsoa Sitraka': sitrakaImage,
    'Aina Arthur': ainaImage,
    'Mandimbiharison Miarotiana': miarotianaImage,
    'RAJEMISON Steffy Jachia': steffyJachiaImage,
    'RAJEMISON Suziah Jaida': suziahImage,
};

const TestimonyCard = ({
    testimony,
    index,
}: {
    testimony: Testimony;
    index: number;
}) => {
    const avatar = cmsImage(testimony.avatar, fallbackAvatars[testimony.name]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
            className="relative flex min-h-[420px] items-end overflow-hidden rounded-[22px] p-[30px]"
        >
            {/* Photo de fond */}
            {avatar ? (
                <img
                    src={avatar}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-[#1a241f]" />
            )}

            {/* Gradient overlay noir pour assombrir le bas de la photo */}
            <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(14,20,17,0) 0%, rgba(14,20,17,0.4) 40%, rgba(14,20,17,0.96) 100%)',
                }}
            />

            {/* Contenu */}
            <div className="relative z-10">
                <p className="m-0 text-[16.5px] leading-[1.56] font-medium text-white">
                    «&nbsp;{testimony.content}&nbsp;»
                </p>
                <p className="m-0 mt-4 text-sm font-bold text-[#35cf7f]">
                    {testimony.name}
                    {testimony.role ? ` · ${testimony.role}` : ''}
                </p>
            </div>
        </motion.div>
    );
};

export const TestimonySection = () => {
    const content = useSection('testimonials');
    const { testimonies } = usePage().props as unknown as {
        testimonies?: Testimony[];
    };

    const list = testimonies ?? [];

    if (list.length === 0) return null;

    // On affiche jusqu'à 3 témoignages (grille 3 colonnes du design)
    const displayed = list.slice(0, 3);

    return (
        <section id="voix" className="py-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                {/* Titre en noir (couleur text-foreground car le fond de cette section est blanc) */}
                <h2
                    className="font-display text-foreground m-0 mb-10 font-black text-black uppercase"
                    style={{
                        fontSize: '56px',
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                    }}
                >
                    {String(content.title || 'Les voix du campus')}ssd
                </h2>

                {/* Grille 3 colonnes */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {displayed.map((testimony, index) => (
                        <TestimonyCard
                            key={testimony.id}
                            testimony={testimony}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
