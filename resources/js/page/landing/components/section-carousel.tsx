import useEmblaCarousel, {
    type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from 'react';

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

export interface SectionCarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    getKey: (item: T, index: number) => string | number;
    /** Titre de section : rendu tel quel pour conserver la typo de chaque bloc. */
    heading: ReactNode;
    /** Lien secondaire optionnel, posé à gauche des flèches. */
    action?: ReactNode;
    /** Libellé du carrousel pour les lecteurs d'écran. */
    label: string;
    /** Terme employé dans les libellés de diapositive (« témoignage », « événement »). */
    itemLabel: string;
    /** Largeur des diapositives : 1 / 2 / 3 colonnes par défaut, comme les grilles. */
    slideClassName?: string;
}

/**
 * Carrousel de section partagé par « Ça bouge » et « Les voix du campus ».
 *
 * Il remplace les grilles tronquées à trois cartes : la totalité des éléments
 * reste consultable, à la flèche, à la pastille, au clavier ou au doigt (glisser
 * natif d'Embla). L'apparition des cartes reprend mot pour mot l'animation des
 * anciennes grilles — opacité 0 → 1, y 30 → 0, 0,55 s en easeOut, décalées de
 * 0,1 s — mais elle est pilotée depuis la section plutôt que depuis chaque
 * carte : les diapositives hors du cadre sont masquées par `overflow: hidden`,
 * un `whileInView` posé sur elles ne se déclencherait donc qu'au glissement, et
 * la remontée verticale trancherait avec le défilement horizontal.
 */
export function SectionCarousel<T>({
    items,
    renderItem,
    getKey,
    heading,
    action,
    label,
    itemLabel,
    slideClassName = 'basis-full sm:basis-1/2 lg:basis-1/3',
}: SectionCarouselProps<T>) {
    const reduceMotion = useReducedMotion();
    const trackId = useId();

    const sectionRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.15 });

    const [emblaRef, embla] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        loop: false,
        // Embla exprime sa durée en pas d'animation, pas en millisecondes :
        // 26 tombe sur la même sensation que les 0,55 s des sections voisines.
        duration: reduceMotion ? 0 : 26,
    });

    const [snaps, setSnaps] = useState<number[]>([]);
    const [selected, setSelected] = useState(0);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const onSelect = useCallback((api: EmblaApi) => {
        setSelected(api.selectedScrollSnap());
        setCanPrev(api.canScrollPrev());
        setCanNext(api.canScrollNext());
    }, []);

    const onReInit = useCallback(
        (api: EmblaApi) => {
            setSnaps(api.scrollSnapList());
            onSelect(api);
        },
        [onSelect],
    );

    useEffect(() => {
        if (!embla) return;

        onReInit(embla);
        embla.on('select', onSelect);
        embla.on('reInit', onReInit);

        return () => {
            embla.off('select', onSelect);
            embla.off('reInit', onReInit);
        };
    }, [embla, onSelect, onReInit]);

    const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
    const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                scrollPrev();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                scrollNext();
            }
        },
        [scrollPrev, scrollNext],
    );

    const arrowClass =
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-transparent text-foreground disabled:pointer-events-none disabled:opacity-30 hover:bg-primary hover:border-primary hover:text-primary-foreground';

    return (
        <div ref={sectionRef}>
            {/* En-tête : titre à gauche, lien puis flèches à droite — la même
                répartition que les en-têtes de section existants. */}
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
                {heading}

                <div className="flex shrink-0 items-center gap-5">
                    {action}

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={scrollPrev}
                            disabled={!canPrev}
                            aria-label={`Voir les ${itemLabel}s précédents`}
                            aria-controls={trackId}
                            className={arrowClass}
                        >
                            <ArrowLeft className="h-[18px] w-[18px]" />
                        </button>

                        <button
                            type="button"
                            onClick={scrollNext}
                            disabled={!canNext}
                            aria-label={`Voir les ${itemLabel}s suivants`}
                            aria-controls={trackId}
                            className={arrowClass}
                        >
                            <ArrowRight className="h-[18px] w-[18px]" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Piste : `overflow-hidden` est exigé par Embla, le glissement au
                doigt et à la souris est natif. */}
            <div
                ref={emblaRef}
                id={trackId}
                role="region"
                aria-roledescription="carrousel"
                aria-label={label}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                // Pas de `focus:outline-none` ici : la piste est focusable au
                // clavier, elle doit garder l'anneau de focus vert du site.
                className="overflow-hidden"
            >
                <div className="-ml-4 flex touch-pan-y">
                    {items.map((item, index) => (
                        <div
                            key={getKey(item, index)}
                            role="group"
                            aria-roledescription="diapositive"
                            aria-label={`${itemLabel} ${index + 1} sur ${items.length}`}
                            className={`min-w-0 shrink-0 grow-0 pl-4 ${slideClassName}`}
                        >
                            <motion.div
                                initial={
                                    reduceMotion ? false : { opacity: 0, y: 30 }
                                }
                                animate={
                                    inView ? { opacity: 1, y: 0 } : undefined
                                }
                                transition={{
                                    duration: 0.55,
                                    // Le décalage ne court que sur la première
                                    // rangée visible : au-delà, les cartes sont
                                    // déjà prêtes quand on atteint leur tour.
                                    delay: Math.min(index, 5) * 0.1,
                                    ease: 'easeOut',
                                }}
                                className="h-full"
                            >
                                {renderItem(item, index)}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pastilles de position — une par point d'arrêt, donc masquées
                quand tout tient déjà dans le cadre. */}
            {snaps.length > 1 ? (
                <div className="mt-9 flex flex-wrap items-center justify-center gap-2">
                    {snaps.map((_, index) => {
                        const isActive = index === selected;

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => embla?.scrollTo(index)}
                                aria-label={`Aller à la position ${index + 1}`}
                                aria-current={isActive ? 'true' : undefined}
                                className={`h-2 rounded-full ${
                                    isActive
                                        ? 'bg-primary'
                                        : 'bg-foreground/20 hover:bg-foreground/45'
                                }`}
                                // La feuille de base coupe les transitions sur
                                // les boutons ; on la rétablit ici seulement,
                                // pour que la pastille active s'étire au lieu
                                // de sauter d'une largeur à l'autre.
                                style={{
                                    width: isActive ? 30 : 8,
                                    transition: reduceMotion
                                        ? 'none'
                                        : 'width 340ms cubic-bezier(0.22, 1, 0.36, 1), background-color 240ms ease-out',
                                }}
                            />
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
