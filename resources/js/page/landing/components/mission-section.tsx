import amphiteatre from '@/assets/Lieu_espace/amphitheatre.jpg';
import bibliotheque from '@/assets/Lieu_espace/Bibliotheque-quality.jpg';
import terrainBasket from '@/assets/Lieu_espace/terrain-basket.jpg';

export const MissionSection = () => {
    return (
        <section id="campus" className="band-light py-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                {/* Stats grid */}
                <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div>
                        <p className="font-display text-[66px] leading-none font-black tracking-[-0.04em]">
                            2000<span className="text-[#0c8042]">+</span>
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-[#5b665f]">
                            étudiants sur deux campus
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[66px] leading-none font-black tracking-[-0.04em]">
                            20<span className="text-[#0c8042]">+</span>
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-[#5b665f]">
                            années d'expérience
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[66px] leading-none font-black tracking-[-0.04em]">
                            3
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-[#5b665f]">
                            clubs de sport, un tournoi par an
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[66px] leading-none font-black tracking-[-0.04em]">
                            2
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-[#5b665f]">
                            cafétérias, du lundi au samedi
                        </p>
                    </div>
                </div>

                {/* Section title */}
                <h2 className="font-display mb-8 text-5xl leading-none font-black tracking-[-0.04em] uppercase">
                    La vie ici
                </h2>

                {/* Photo grid layout matching reference */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Left: Amphitheater large card */}
                    <div className="aspect-[4/3] overflow-hidden rounded-[22px]">
                        <img
                            src={amphiteatre}
                            alt="Amphithéâtre"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Middle: Stacked cards */}
                    <div className="flex flex-col gap-4">
                        <div className="min-h-[160px] flex-1 overflow-hidden rounded-[22px]">
                            <img
                                src={terrainBasket}
                                alt="Terrain de Basket"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="min-h-[160px] flex-1 overflow-hidden rounded-[22px]">
                            <img
                                src={bibliotheque}
                                alt="Bibliothèque"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right: Info green box */}
                    <div className="flex min-h-[300px] flex-col justify-between rounded-[22px] bg-[#0c8042] p-8 text-white">
                        <p className="font-display text-2xl leading-[1.14] font-extrabold tracking-[-0.02em]">
                            Logement, cafétérias, clubs : le campus ne s'arrête
                            pas aux salles de cours.
                        </p>
                        <a
                            href="#campus"
                            className="text-[14.5px] font-bold text-white underline underline-offset-4 hover:opacity-90"
                        >
                            Visiter le campus →
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
