import { motion } from 'framer-motion';

export const AppelCandidaterSection = () => {
    return (
        <section className="band-dark pb-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                <div className="bg-[#35cf7f] text-[#0e1411] rounded-[28px] padding py-[72px] px-[56px] text-center">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="font-display font-black uppercase text-[clamp(48px,6vw,72px)] leading-[0.98] tracking-[-0.045em] m-0"
                    >
                        On t'attend
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-5 mx-auto max-w-[620px] text-lg leading-[1.58] font-medium text-[#0e1411]/90"
                    >
                        Service de scolarité ouvert de 8h à 12h et de 13h30 à 15h, à Antsaha. Apporte ton dossier — on s'occupe du reste.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-9 flex justify-center gap-3.5 flex-wrap"
                    >
                        <a 
                            href="#" 
                            className="px-[34px] py-[17px] rounded-full bg-[#0e1411] text-white text-[15px] font-bold transition-colors hover:bg-white hover:text-[#0e1411]"
                        >
                            Voir les pièces à fournir
                        </a>
                        <a 
                            href="#" 
                            className="px-[32px] py-[17px] rounded-full border border-[#0e1411]/35 text-[#0e1411] text-[15px] font-semibold hover:bg-[#0e1411]/10"
                        >
                            Poser une question
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
