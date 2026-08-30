import asjaDark from '@/assets/Asja-dark-quality.jpg';
import backgroundImage from '@/assets/Lieu_espace/Asja-devant-quality-2.jpg';
import { cmsImage, useSection } from '@/lib/cms';
import { useThemeContext } from '@/page/theme/useThemeContext';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export const Description = () => {
    const { isDark } = useThemeContext();
    const hero = useSection('hero');

    const scrollToFiliere = () => {
        document
            .getElementById('filiere')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    const background = isDark
        ? cmsImage(hero.background_image_dark, asjaDark)
        : cmsImage(hero.background_image, backgroundImage);

    return (
        <section
            id="description"
            className="relative flex min-h-[calc(100svh-4.25rem)] w-full items-center justify-center overflow-hidden"
        >
            <img
                src={background}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-20 h-full w-full object-cover"
            />

            <div
                className="absolute inset-0 -z-10 bg-black/70"
                aria-hidden="true"
            />

            <div className="section-container relative py-32 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 text-xs font-semibold tracking-[0.22em] text-white/70 uppercase"
                >
                    Antsirabe · Antsohihy · Madagascar
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    className="mx-auto max-w-4xl text-4xl font-extrabold text-white md:text-6xl lg:text-7xl"
                >
                    {String(hero.title ?? '')}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.75,
                        delay: 0.15,
                        ease: 'easeOut',
                    }}
                    className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl"
                >
                    {String(hero.subtitle ?? '')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.3, ease: 'easeOut' }}
                    className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <button
                        onClick={scrollToFiliere}
                        className="bg-primary text-primary-foreground hover:bg-background hover:text-primary inline-flex cursor-pointer items-center gap-2 px-8 py-3.5 text-sm font-bold tracking-wide uppercase"
                    >
                        {String(hero.cta_label ?? '')}
                        <ArrowDown className="h-4 w-4" />
                    </button>

                    <a
                        href="/actualites"
                        className="inline-flex items-center gap-2 border border-white px-8 py-3.5 text-sm font-bold tracking-wide text-white uppercase hover:bg-white hover:text-black"
                    >
                        Actualités & événements
                    </a>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                aria-hidden="true"
            >
                <ArrowDown className="h-5 w-5 animate-bounce text-white/50" />
            </motion.div>
        </section>
    );
};
