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
import { SectionCarousel } from './section-carousel';

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

const TestimonyCard = ({ testimony }: { testimony: Testimony }) => {
    const avatar = cmsImage(testimony.avatar, fallbackAvatars[testimony.name]);

    return (
        <div className="relative flex h-full min-h-[360px] items-end overflow-hidden rounded-[22px] p-6 sm:min-h-[420px] sm:p-[30px]">
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
                        'linear-gradient(180deg, rgba(20,27,23,0) 0%, rgba(20,27,23,0.4) 40%, rgba(20,27,23,0.96) 100%)',
                }}
            />

            {/* Contenu */}
            <div className="relative z-10">
                <p className="m-0 text-[15.5px] leading-[1.55] font-medium text-white sm:text-[16.5px]">
                    «&nbsp;{testimony.content}&nbsp;»
                </p>
                <p className="m-0 mt-4 text-sm font-bold text-[#35cf7f]">
                    {testimony.name}
                    {testimony.role ? ` · ${testimony.role}` : ''}
                </p>
            </div>
        </div>
    );
};

export const TestimonySection = () => {
    const content = useSection('testimonials');
    const { testimonies } = usePage().props as unknown as {
        testimonies?: Testimony[];
    };

    const list = testimonies ?? [];

    if (list.length === 0) return null;

    return (
        <section id="voix" className="section-rhythm">
            <div className="section-shell">
                {/* Carrousel : la grille ne montrait que les trois premiers
                    témoignages, tous sont désormais atteignables. */}
                <SectionCarousel
                    items={list}
                    getKey={(testimony) => testimony.id}
                    label="Témoignages"
                    itemLabel="témoignage"
                    heading={
                        <h2
                            className="font-display text-foreground m-0 font-black uppercase"
                            style={{
                                fontSize: 'clamp(32px, 7.6vw, 56px)',
                                lineHeight: 1,
                                letterSpacing: '-0.04em',
                            }}
                        >
                            {String(content.title || 'Les voix du campus')}
                        </h2>
                    }
                    renderItem={(testimony) => (
                        <TestimonyCard testimony={testimony} />
                    )}
                />
            </div>
        </section>
    );
};
