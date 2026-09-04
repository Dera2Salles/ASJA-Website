import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion';
import { useRef } from 'react';

/** Les deux aplats du site, repris tels quels de `.band-dark` / `.band-light`. */
const DARK = '14, 20, 17'; // #0e1411
const LIGHT = '#f2f5f3';

/**
 * Rampe d'opacité calquée sur une courbe en S plutôt que sur les deux arrêts
 * d'un dégradé simple : sans elle, l'œil accroche toujours une arête au milieu
 * du fondu. Les paliers pleins en tête (0 → 35 %) et transparents en queue
 * (65 → 100 %) laissent la place à la parallaxe sans jamais découvrir le bord.
 */
const RAMP: Array<[number, number]> = [
    [0, 1],
    [35, 1],
    [39, 0.975],
    [43, 0.925],
    [47, 0.845],
    [50, 0.755],
    [53, 0.645],
    [56, 0.52],
    [59, 0.385],
    [62, 0.24],
    [64, 0.13],
    [65, 0],
    [100, 0],
];

const rampCss = (reversed: boolean) => {
    const stops = RAMP.map(
        ([position, alpha]) =>
            `rgba(${DARK}, ${alpha}) ${reversed ? 100 - position : position}%`,
    );

    return `linear-gradient(180deg, ${reversed ? stops.reverse().join(', ') : stops.join(', ')})`;
};

const DARK_TO_LIGHT = rampCss(false);
const LIGHT_TO_DARK = rampCss(true);

export interface BandTransitionProps {
    /** Sens du fondu. `dark-to-light` par défaut : on ouvre en noir. */
    direction?: 'dark-to-light' | 'light-to-dark';
    className?: string;
}

/**
 * Passage progressif entre l'aplat sombre et l'aplat clair du site.
 *
 * Le fondu est un simple dégradé peint sur une couche plus haute que la bande,
 * translatée par le scroll : la couleur avance donc au rythme de la page, sans
 * jamais casser net comme le faisait la bordure entre deux sections. Le seul
 * effet animé est un `transform`, composité par le navigateur — aucune peinture
 * n'est refaite pendant le défilement.
 *
 * À poser entre deux sections dont les fonds s'opposent ; la section suivante
 * porte ensuite `band-light` (ou `band-dark`) comme d'habitude.
 */
export const BandTransition = ({
    direction = 'dark-to-light',
    className = '',
}: BandTransitionProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    // ±6 % de la hauteur de la couche : assez pour que le fondu « respire »
    // pendant le scroll, trop peu pour découvrir la fin de la rampe.
    const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

    const toLight = direction === 'dark-to-light';

    return (
        <div
            ref={ref}
            aria-hidden="true"
            role="presentation"
            className={`relative w-full overflow-hidden ${className}`}
            style={{
                height: 'clamp(120px, 20vh, 260px)',
                // L'aplat clair sert de fond ; la rampe sombre se pose dessus.
                background: LIGHT,
            }}
        >
            <motion.div
                className="absolute inset-x-0"
                style={{
                    top: '-30%',
                    bottom: '-30%',
                    background: toLight ? DARK_TO_LIGHT : LIGHT_TO_DARK,
                    y: reduceMotion ? 0 : y,
                    willChange: 'transform',
                }}
            />
        </div>
    );
};
