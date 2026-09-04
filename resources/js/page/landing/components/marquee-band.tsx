/**
 * Bande défilante verte — ticker marquee horizontal.
 * Inspiré du design "C Vivant" : bande pleine bg-primary, texte bold uppercase,
 * animation CSS infinie.
 *
 * Les mentions sont espacées par un `gap` fixe, jamais par `justify-around` :
 * celui-ci répartit l'espace *libre*, or il n'y en a pas — le texte est plus
 * large que l'écran. L'espace devenait négatif sur téléphone et les mentions
 * se chevauchaient. Le `pr` de fin fournit l'écart qui manquerait entre la
 * dernière mention d'un exemplaire et la première du suivant.
 */
export const MarqueeBand = () => (
    <div className="bg-primary text-primary-foreground overflow-hidden py-3 select-none sm:py-3.5">
        <div className="marquee-track">
            {/* Premier exemplaire */}
            <div className="font-display flex shrink-0 items-center gap-6 pr-6 text-[13px] font-extrabold tracking-[0.04em] whitespace-nowrap uppercase sm:gap-8 sm:pr-8 sm:text-sm">
                <span>Diplômes reconnus MESupReS</span>
                <span aria-hidden="true">·</span>
                <span>Wifi Starlink</span>
                <span aria-hidden="true">·</span>
                <span>2 cafétérias</span>
                <span aria-hidden="true">·</span>
                <span>Volley · Foot · Basket</span>
                <span aria-hidden="true">·</span>
                <span>Logement étudiant</span>
                <span aria-hidden="true">·</span>
                <span>Stages dès la 2ᵉ année</span>
                <span aria-hidden="true">·</span>
                <span>Système LMD</span>
            </div>
            {/* Doublon pour le défilement continu */}
            <div
                aria-hidden="true"
                className="font-display flex shrink-0 items-center gap-6 pr-6 text-[13px] font-extrabold tracking-[0.04em] whitespace-nowrap uppercase sm:gap-8 sm:pr-8 sm:text-sm"
            >
                <span>Diplômes reconnus MESupReS</span>
                <span aria-hidden="true">·</span>
                <span>Wifi Starlink</span>
                <span aria-hidden="true">·</span>
                <span>2 cafétérias</span>
                <span aria-hidden="true">·</span>
                <span>Volley · Foot · Basket</span>
                <span aria-hidden="true">·</span>
                <span>Logement étudiant</span>
                <span aria-hidden="true">·</span>
                <span>Stages dès la 2ᵉ année</span>
                <span aria-hidden="true">·</span>
                <span>Système LMD</span>
            </div>
        </div>
    </div>
);
