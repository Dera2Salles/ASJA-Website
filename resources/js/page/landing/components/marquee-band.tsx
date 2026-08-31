/**
 * Bande défilante verte — ticker marquee horizontal.
 * Inspiré du design "C Vivant" : bande pleine bg-primary, texte bold uppercase,
 * animation CSS infinie.
 */
export const MarqueeBand = () => (
    <div className="overflow-hidden bg-primary py-3.5 text-primary-foreground select-none">
        <div className="flex w-[200%] marquee-track">
            {/* Premier exemplaire */}
            <div
                className="flex shrink-0 items-center justify-around font-display text-sm font-extrabold uppercase tracking-[0.04em] whitespace-nowrap"
                style={{ width: '50%' }}
            >
                <span>Diplômes reconnus MESupReS</span>
                <span>·</span>
                <span>Wifi Starlink</span>
                <span>·</span>
                <span>2 cafétérias</span>
                <span>·</span>
                <span>Volley · Foot · Basket</span>
                <span>·</span>
                <span>Logement étudiant</span>
                <span>·</span>
                <span>Stages dès la 2ᵉ année</span>
                <span>·</span>
                <span>Système LMD</span>
                <span>·</span>
            </div>
            {/* Doublon pour le défilement continu */}
            <div
                aria-hidden="true"
                className="flex shrink-0 items-center justify-around font-display text-sm font-extrabold uppercase tracking-[0.04em] whitespace-nowrap"
                style={{ width: '50%' }}
            >
                <span>Diplômes reconnus MESupReS</span>
                <span>·</span>
                <span>Wifi Starlink</span>
                <span>·</span>
                <span>2 cafétérias</span>
                <span>·</span>
                <span>Volley · Foot · Basket</span>
                <span>·</span>
                <span>Logement étudiant</span>
                <span>·</span>
                <span>Stages dès la 2ᵉ année</span>
                <span>·</span>
                <span>Système LMD</span>
                <span>·</span>
            </div>
        </div>
    </div>
);
