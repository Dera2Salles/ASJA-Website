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

/* La couche peinte déborde de 30 % en haut et en bas : elle mesure donc 160 %
   de la bande, et la fenêtre réellement visible court de 18,75 % à 81,25 % de
   sa hauteur. Tout le reste est de la marge de manœuvre pour la parallaxe. */
const OVERSCAN = 0.3;

/* Bornes du fondu, exprimées sur la couche. Ramenées à la bande, elles laissent
   ~15 % d'aplat plein en haut et ~12 % en bas — davantage que la course de la
   parallaxe, donc le bord de la rampe ne se découvre jamais. */
const FADE_START = 28;
const FADE_END = 74;

/** Course de la parallaxe, en pourcentage de la couche. */
const PARALLAX = 6;

/**
 * Rampe en S plutôt que les deux arrêts d'un dégradé linéaire : sur un fondu
 * aussi long, l'œil accroche immanquablement les deux arêtes d'une rampe
 * droite. La dérivée nulle aux extrémités les efface.
 */
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

const STEPS = 14;

const RAMP: Array<[number, number]> = [
    [0, 1],
    ...Array.from({ length: STEPS + 1 }, (_, i): [number, number] => {
        const t = i / STEPS;

        return [
            FADE_START + (FADE_END - FADE_START) * t,
            Number((1 - smootherstep(t)).toFixed(4)),
        ];
    }),
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
 * Le fondu est un dégradé peint sur une couche plus haute que la bande et
 * translatée par le scroll : la couleur avance donc au rythme de la page, sans
 * jamais casser net comme le faisait la bordure entre deux sections. Le seul
 * effet animé est un `transform`, composité par le navigateur — aucune peinture
 * n'est refaite pendant le défilement, et `prefers-reduced-motion` fige la
 * couche sans rien retirer du dégradé.
 *
 * La bande ne contient jamais de texte : chaque titre reste posé sur un aplat
 * plein, jamais sur le dégradé, ce qui rend impossible le blanc sur blanc.
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

    const y = useTransform(
        scrollYProgress,
        [0, 1],
        [`${-PARALLAX}%`, `${PARALLAX}%`],
    );

    const toLight = direction === 'dark-to-light';

    return (
        <div
            ref={ref}
            aria-hidden="true"
            role="presentation"
            className={`relative w-full overflow-hidden ${className}`}
            style={{
                // Assez haut pour que le fondu occupe une vraie course de
                // scroll : en deçà, il se lit comme une tache, pas comme une
                // transition.
                height: 'clamp(180px, 30vh, 340px)',
                // L'aplat clair sert de fond ; la rampe sombre se pose dessus.
                background: LIGHT,
            }}
        >
            <motion.div
                className="absolute inset-x-0"
                style={{
                    top: `${-OVERSCAN * 100}%`,
                    bottom: `${-OVERSCAN * 100}%`,
                    background: toLight ? DARK_TO_LIGHT : LIGHT_TO_DARK,
                    y: reduceMotion ? 0 : y,
                    willChange: 'transform',
                }}
            />
        </div>
    );
};
