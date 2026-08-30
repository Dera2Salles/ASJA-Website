import amphiteatre from '@/assets/Lieu_espace/amphitheatre.jpg';
import terrainBasket from '@/assets/Lieu_espace/terrain-basket.jpg';
import bibliotheque from '@/assets/Lieu_espace/Bibliotheque-quality.jpg';
import { motion } from 'framer-motion';

export const MissionSection = () => {
    return (
        <section id="campus" className="bg-[#f2f5f3] text-[#0e1411] py-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-16">
                    <div>
                        <p className="font-display text-[66px] font-black tracking-[-0.04em] leading-none">
                            2000<span className="text-[#0c8042]">+</span>
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-[#5b665f]">
                            étudiants sur deux campus
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[66px] font-black tracking-[-0.04em] leading-none">
                            20<span className="text-[#0c8042]">+</span>
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-[#5b665f]">
                            années d'expérience
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[66px] font-black tracking-[-0.04em] leading-none">
                            3
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-[#5b665f]">
                            clubs de sport, un tournoi par an
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-[66px] font-black tracking-[-0.04em] leading-none">
                            2
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-[#5b665f]">
                            cafétérias, du lundi au samedi
                        </p>
                    </div>
                </div>

                {/* Section title */}
                <h2 className="font-display text-5xl font-black uppercase tracking-[-0.04em] mb-8 leading-none">
                    La vie ici
                </h2>

                {/* Photo grid layout matching reference */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left: Amphitheater large card */}
                    <div className="aspect-[4/3] rounded-[22px] overflow-hidden">
                        <img 
                            src={amphiteatre} 
                            alt="Amphithéâtre" 
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Middle: Stacked cards */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 min-h-[160px] rounded-[22px] overflow-hidden">
                            <img 
                                src={terrainBasket} 
                                alt="Terrain de Basket" 
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-h-[160px] rounded-[22px] overflow-hidden">
                            <img 
                                src={bibliotheque} 
                                alt="Bibliothèque" 
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right: Info green box */}
                    <div className="bg-[#0c8042] text-white rounded-[22px] p-8 flex flex-col justify-between min-h-[300px]">
                        <p className="font-display text-2xl font-extrabold leading-[1.14] tracking-[-0.02em]">
                            Logement, cafétérias, clubs : le campus ne s'arrête pas aux salles de cours.
                        </p>
                        <a 
                            href="#campus" 
                            className="text-white text-[14.5px] font-bold underline underline-offset-4 hover:opacity-90"
                        >
                            Visiter le campus →
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
};
