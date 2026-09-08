import { cmsImage, useSection } from '@/lib/cms';
import { Link, usePage } from '@inertiajs/react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

// Imports des images réelles pour les fonds de chaque filière
import agroImg from '@/assets/Mentions/AgronomieImage/Agro.jpg';
import droitImg from '@/assets/Mentions/Droit/student-droit-1.jpg';
import ecoImg from '@/assets/Mentions/Economie/Eco-event-quality-5.jpg';
import infoImg from '@/assets/Mentions/InformatiqueImage/Victoir_Hackathon2025-quality.jpg';
import leaImg from '@/assets/Mentions/LEA/Visite_Culinaire_française-quality.jpg';
import stImg from '@/assets/Mentions/SienceDeLaTerre/ST-VisiteSurTerain-quality.jpg';

type Department = {
    id: number;
    slug: string;
    name: string;
    card_image: string | null;
};

const departmentImages: Record<string, string> = {
    informatique: infoImg,
    droit: droitImg,
    economie: ecoImg,
    agronomie: agroImg,
    'sciences-de-la-terre': stImg,
    'langues-etrangeres-appliquees': leaImg,
};

const departmentSubtitles: Record<string, string> = {
    informatique: 'Génie logiciel · Télécom · Génie industriel',
    droit: 'Affaires · Processuel',
    economie: 'Développement · Commerce international',
    agronomie: 'Animale · Végétale · Agroalimentaire',
    'sciences-de-la-terre': 'Hydrogéologie · Géologie minière',
    'langues-etrangeres-appliquees':
        'Traduction · Interprétation · Communication interculturelle',
};

function cardImage(department: Department): string | undefined {
    return cmsImage(department.card_image, departmentImages[department.slug]);
}

function cardVariant(index: number): 'photo-first' | 'dark' | 'photo-last' {
    const patterns = [
        'photo-first',
        'dark',
        'dark',
        'dark',
        'dark',
        'photo-last',
    ] as const;
    return patterns[index % patterns.length];
}

/* ─── Photo background card ─────────────────────────────────── */
const PhotoCard = ({
    department,
    index,
}: {
    department: Department;
    index: number;
}) => {
    const bgImage = cardImage(department);
    const sub = departmentSubtitles[department.slug] || '';

    return (
        <motion.div
            className="h-full sm:col-span-2"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
        >
            <Link
                href={`/mention/${department.slug}`}
                className="relative flex h-full min-h-[260px] flex-col justify-end overflow-hidden rounded-[22px] sm:min-h-[280px] lg:min-h-[300px]"
            >
                {bgImage && (
                    <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.88))',
                    }}
                />
                <div className="relative z-10 p-6 sm:p-7 lg:p-8">
                    <h3 className="font-display text-2xl leading-tight font-extrabold text-white uppercase sm:text-3xl">
                        {department.name}
                    </h3>
                    {sub && (
                        <p className="mt-2 text-[13.5px] leading-snug font-medium text-[#cccccc] sm:text-[14.5px]">
                            {sub}
                        </p>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};

/* ─── Dark card ─────────────────────────────────────────────── */
const DarkCard = ({
    department,
    index,
}: {
    department: Department;
    index: number;
}) => {
    const bgImage = cardImage(department);
    const sub = departmentSubtitles[department.slug] || '';

    return (
        <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
        >
            <Link
                href={`/mention/${department.slug}`}
                className="bg-card relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-[22px] p-6 sm:min-h-[280px] sm:p-7 lg:min-h-[300px] lg:p-8"
            >
                {bgImage && (
                    <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.85))',
                    }}
                />
                <div className="relative z-10 flex h-full min-h-[184px] flex-col justify-end sm:min-h-[210px] lg:min-h-[236px]">
                    <div className="mt-auto">
                        <h3 className="font-display text-[22px] leading-tight font-extrabold text-white uppercase sm:text-[26px]">
                            {department.name}
                        </h3>
                        {sub && (
                            <p className="mt-2 text-[13.5px] leading-snug font-medium text-[#a3a3a3] sm:text-sm">
                                {sub}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export const FiliereSection = () => {
    const programs = useSection('programs');
    const { departments } = usePage().props as unknown as {
        departments?: Department[];
    };

    const list = departments ?? [];
    const reduceMotion = useReducedMotion();
    const trackId = useId();
    const sectionRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.15 });

    const [emblaRef, embla] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        loop: false,
        duration: reduceMotion ? 0 : 26,
    });

    const [snaps, setSnaps] = useState<number[]>([]);
    const [selected, setSelected] = useState(0);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const onSelect = useCallback(() => {
        if (!embla) return;
        setSelected(embla.selectedScrollSnap());
        setCanPrev(embla.canScrollPrev());
        setCanNext(embla.canScrollNext());
    }, [embla]);

    const onReInit = useCallback(() => {
        if (!embla) return;
        setSnaps(embla.scrollSnapList());
        onSelect();
    }, [embla, onSelect]);

    useEffect(() => {
        if (!embla) return;

        onReInit();
        embla.on('select', onSelect);
        embla.on('reInit', onReInit);

        return () => {
            embla.off('select', onSelect);
            embla.off('reInit', onReInit);
        };
    }, [embla, onSelect, onReInit]);

    const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
    const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

    if (list.length === 0) return null;

    const arrowClass =
        'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-transparent text-foreground sm:h-11 sm:w-11 disabled:pointer-events-none disabled:opacity-30 hover:bg-primary hover:border-primary hover:text-primary-foreground';

    return (
        <section id="filiere" className="band-light section-rhythm">
            <div className="section-shell" ref={sectionRef}>
                {/* ── Header ── */}
                <div className="mb-9 flex flex-col gap-4 sm:mb-11 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
                    <h2 className="font-display text-foreground max-w-[640px] text-[clamp(30px,7.4vw,64px)] leading-[0.98] font-black tracking-tight uppercase">
                        {String(
                            programs.title ??
                                'Six mentions. Un seul niveau\u00a0: haut.',
                        )}
                    </h2>

                    <div className="flex shrink-0 items-center justify-between gap-5 sm:flex-col sm:items-end sm:justify-end">
                        {programs.subtitle ? (
                            <p className="text-muted-foreground max-w-sm text-[15px] leading-relaxed sm:text-base">
                                {String(programs.subtitle)}
                            </p>
                        ) : null}

                        {/* Flèches de navigation visibles sur mobile */}
                        <div className="flex items-center gap-2.5 sm:hidden">
                            <button
                                type="button"
                                onClick={scrollPrev}
                                disabled={!canPrev}
                                aria-label="Voir les mentions précédentes"
                                aria-controls={trackId}
                                className={arrowClass}
                            >
                                <ArrowLeft className="h-[18px] w-[18px]" />
                            </button>
                            <button
                                type="button"
                                onClick={scrollNext}
                                disabled={!canNext}
                                aria-label="Voir les mentions suivantes"
                                aria-controls={trackId}
                                className={arrowClass}
                            >
                                <ArrowRight className="h-[18px] w-[18px]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile Carousel (< sm) ── */}
                <div className="sm:hidden">
                    <div
                        ref={emblaRef}
                        id={trackId}
                        role="region"
                        aria-roledescription="carrousel"
                        aria-label="Mentions et filières"
                        className="overflow-hidden"
                    >
                        <div className="-ml-3 flex touch-pan-y">
                            {list.map((department, index) => (
                                <div
                                    key={department.id}
                                    role="group"
                                    aria-roledescription="diapositive"
                                    aria-label={`Mention ${index + 1} sur ${list.length}`}
                                    className="min-w-0 shrink-0 grow-0 basis-[82%] pl-3"
                                >
                                    <DarkCard
                                        department={department}
                                        index={index}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {snaps.length > 1 ? (
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-0.5">
                            {snaps.map((_, index) => {
                                const isActive = index === selected;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => embla?.scrollTo(index)}
                                        aria-label={`Aller à la mention ${index + 1}`}
                                        aria-current={isActive ? 'true' : undefined}
                                        className="flex h-9 min-w-[26px] items-center justify-center px-1"
                                    >
                                        <span
                                            className={`block h-2 rounded-full ${
                                                isActive
                                                    ? 'bg-primary'
                                                    : 'bg-foreground/20'
                                            }`}
                                            style={{
                                                width: isActive ? 30 : 8,
                                                transition: reduceMotion
                                                    ? 'none'
                                                    : 'width 340ms cubic-bezier(0.22, 1, 0.36, 1), background-color 240ms ease-out',
                                            }}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                {/* ── Desktop & Tablet Mosaic (>= sm) ── */}
                <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    {list.map((department, index) => {
                        const variant = cardVariant(index);

                        if (
                            variant === 'photo-first' ||
                            variant === 'photo-last'
                        ) {
                            return (
                                <PhotoCard
                                    key={department.id}
                                    department={department}
                                    index={index}
                                />
                            );
                        }

                        return (
                            <DarkCard
                                key={department.id}
                                department={department}
                                index={index}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

