import backgroundImage from '@/assets/Lieu_espace/Asja-devant-quality-2.jpg';
import { Button } from '@/components/ui/button';
import { useThemeContext } from '@/page/theme/useThemeContext';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

import asjaDark from '@/assets/Asja-dark-quality.jpg';

export const Description = () => {
    const scrollToFiliere = () => {
        const filiereSection = document.getElementById('filiere');
        if (filiereSection) {
            filiereSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
    const { isDark } = useThemeContext();

    return (
        <section
            id="description"
            className="relative flex h-screen w-full items-center justify-center text-white"
        >
            <div className="absolute inset-0 -z-20 h-full w-full">
                <img
                    src={isDark ? asjaDark : backgroundImage}
                    alt="Façade de l'entrée principale de l'université ASJA"
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="absolute inset-0 -z-10 bg-black/60 dark:bg-black/70"></div>

            <div className="container mx-auto px-4 text-center">
                <motion.h1
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-4xl font-extrabold text-white drop-shadow-lg md:text-6xl lg:text-7xl"
                >
                    Athénée Saint Joseph Antsirabe
                </motion.h1>
                <motion.p
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                    className="mx-auto mt-6 max-w-3xl text-lg text-gray-200 drop-shadow-md md:text-xl"
                >
                    Une université catholique ouverte à tous, offrant une
                    formation d'excellence pour un avenir brillant.
                </motion.p>
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                    className="mt-10"
                >
                    <Button
                        onClick={scrollToFiliere}
                        size="lg"
                        className="transform cursor-pointer rounded-full bg-green-700 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                        Découvrir nos formations
                        <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};
