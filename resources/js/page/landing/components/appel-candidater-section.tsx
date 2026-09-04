import { motion } from 'framer-motion';

export const AppelCandidaterSection = () => {
    return (
        <section className="band-dark pb-16 sm:pb-20 lg:pb-[104px]">
            <div className="section-shell">
                <div className="rounded-[28px] bg-[#35cf7f] px-6 py-12 text-center text-[#0e1411] sm:px-10 sm:py-16 lg:px-[56px] lg:py-[72px]">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="font-display m-0 text-[clamp(34px,9vw,72px)] leading-[0.98] font-black tracking-[-0.045em] uppercase"
                    >
                        On t'attend
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mx-auto mt-4 max-w-[620px] text-base leading-[1.58] font-medium text-[#0e1411]/90 sm:mt-5 sm:text-lg"
                    >
                        Service de scolarité ouvert de 8h à 12h et de 13h30 à
                        15h, à Antsaha. Apporte ton dossier — on s'occupe du
                        reste.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        // Les deux libellés se brisaient sur deux lignes dans
                        // des pastilles collées l'une à l'autre : pleine
                        // largeur et bien séparés au doigt, alignés dès qu'ils
                        // tiennent côte à côte.
                        className="mx-auto mt-8 flex w-full max-w-[420px] flex-col gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3.5"
                    >
                        <a
                            href="#"
                            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0e1411] px-8 text-[15px] font-bold text-white transition-colors hover:bg-white hover:text-[#0e1411] sm:w-auto sm:px-[34px]"
                        >
                            Voir les pièces à fournir
                        </a>
                        <a
                            href="#"
                            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-[#0e1411]/35 px-8 text-[15px] font-semibold text-[#0e1411] hover:bg-[#0e1411]/10 sm:w-auto sm:px-[32px]"
                        >
                            Poser une question
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
