import { motion } from 'framer-motion';

export const AppelCandidaterSection = () => {
    return (
        <section className="band-dark pb-16 sm:pb-20 lg:pb-[104px]">
            <div className="section-shell">
                <div className="rounded-[28px] bg-[#35cf7f] px-6 py-12 text-center text-[#000000] sm:px-10 sm:py-16 lg:px-[56px] lg:py-[72px]">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="font-display m-0 text-[clamp(34px,9vw,72px)] leading-[0.98] font-black tracking-[-0.045em] uppercase"
                    >
                        Nous vous attendons avec plaisir.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mx-auto mt-4 max-w-[620px] text-base leading-[1.58] font-medium text-[#000000]/90 sm:mt-5 sm:text-lg"
                    >
                        Le service de scolarité est ouvert de 8h à 12h et de
                        13h30 à 15h, à Antsaha. Présentez votre dossier auprès
                        de notre service, nous nous occupons du reste.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        // Un seul appel à l'action depuis que « Poser une
                        // question » — qui ne menait nulle part — a été retiré.
                        className="mx-auto mt-8 flex w-full max-w-[420px] flex-col gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3.5"
                    >
                        {/* Le lien ne menait nulle part (`#`) : il ouvre
                            maintenant le dépôt de dossier en ligne, où les
                            pièces attendues sont énumérées avec leurs formats
                            et leur taille maximale. */}
                        <a
                            href="/candidature"
                            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#000000] px-8 text-[15px] font-bold text-white transition-colors hover:bg-white hover:text-[#000000] sm:w-auto sm:px-[34px]"
                        >
                            Déposer ma demande en ligne
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
