import { Img } from '@/Components/Img';

/* Une colonne sur téléphone, un tiers de la grille à partir de `md` : le
   navigateur n'a jamais besoin d'un palier plus large que la moitié de
   l'écran au-delà du point de bascule. */
const CAMPUS_SIZES = '(min-width: 768px) 33vw, 100vw';

export const CampusSection = () => {
    return (
        <section id="campus" className="band-light section-rhythm">
            <div className="section-shell">
                {/* Stats grid */}
                <div className="mb-12 grid grid-cols-2 gap-x-5 gap-y-9 sm:gap-8 md:mb-16 md:grid-cols-4">
                    <div>
                        <p className="font-display text-[clamp(38px,10vw,66px)] leading-none font-black tracking-[-0.04em]">
                            2000<span className="text-[#0c8042]">+</span>
                        </p>
                        <p className="mt-2 text-[13px] leading-snug font-semibold text-[#616161] sm:text-sm">
                            étudiants sur deux campus
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[clamp(38px,10vw,66px)] leading-none font-black tracking-[-0.04em]">
                            20<span className="text-[#0c8042]">+</span>
                        </p>
                        <p className="mt-2 text-[13px] leading-snug font-semibold text-[#616161] sm:text-sm">
                            années d'expérience
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[clamp(38px,10vw,66px)] leading-none font-black tracking-[-0.04em]">
                            3
                        </p>
                        <p className="mt-2 text-[13px] leading-snug font-semibold text-[#616161] sm:text-sm">
                            clubs de sport, un tournoi par an
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[clamp(38px,10vw,66px)] leading-none font-black tracking-[-0.04em]">
                            2
                        </p>
                        <p className="mt-2 text-[13px] leading-snug font-semibold text-[#616161] sm:text-sm">
                            cafétérias, du lundi au samedi
                        </p>
                    </div>
                </div>

                {/* Section title */}
                <h2 className="font-display mb-7 text-[clamp(34px,9vw,48px)] leading-none font-black tracking-[-0.04em] uppercase sm:mb-8">
                    La vie au sein de l’ASJA
                </h2>

                {/* Photo grid layout matching reference */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                    {/* Left: Amphitheater large card */}
                    <div className="aspect-[4/3] overflow-hidden rounded-[22px]">
                        <Img
                            source="Lieu_espace/amphitheatre"
                            alt="L'amphithéâtre de l'ASJA pendant un cours"
                            sizes={CAMPUS_SIZES}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Milieu : empilées en bureau, mais côte à côte sur
                        téléphone — la colonne y donnait deux bandeaux étirés
                        et rallongeait le défilement pour rien. */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:flex md:flex-col">
                        <div className="min-h-[130px] flex-1 overflow-hidden rounded-[22px] sm:min-h-[160px]">
                            <Img
                                source="Lieu_espace/terrain-basket"
                                alt="Le terrain de basket du campus"
                                sizes="(min-width: 768px) 33vw, 50vw"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="min-h-[130px] flex-1 overflow-hidden rounded-[22px] sm:min-h-[160px]">
                            <Img
                                source="Lieu_espace/Bibliotheque-quality"
                                alt="La bibliothèque universitaire et ses rayonnages"
                                sizes="(min-width: 768px) 33vw, 50vw"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right: Info green box */}
                    <div className="flex min-h-[240px] flex-col justify-between gap-8 rounded-[22px] bg-[#0c8042] p-6 text-white sm:min-h-[300px] sm:p-8">
                        <p className="font-display text-xl leading-[1.14] font-extrabold tracking-[-0.02em] sm:text-2xl">
                            Logement, cafétérias, clubs : le campus ne s'arrête
                            pas aux salles de cours.
                        </p>
                        <a
                            href="#campus"
                            className="tap-target inline-flex items-center text-[14.5px] font-bold text-white underline underline-offset-4 hover:opacity-90"
                        >
                            Visiter le campus →
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
