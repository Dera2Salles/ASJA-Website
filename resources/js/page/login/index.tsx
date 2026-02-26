import asjaDark from '@/assets/Asja-dark-quality.jpg';
import backgroundImage from '@/assets/Lieu_espace/Asja-devant-quality-2.jpg';
import { motion } from 'framer-motion';
import { useLangue } from '../lang/useLang';
import { useThemeContext } from '../theme/useThemeContext';
import { ThemeProvider } from '../theme/useThemeProvider';
import { LoginForm } from './components/login-form';
import { LoginHeader } from './components/login-header';

const LoginContent = () => {
    const { translate } = useLangue();
    const { isDark } = useThemeContext();

    return (
        <section className="relative flex h-screen w-full items-center justify-center text-white">
            <div className="absolute inset-0 -z-20 h-full w-full">
                <img
                    src={isDark ? asjaDark : backgroundImage}
                    alt="Façade de l'entrée principale de l'université ASJA"
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="absolute inset-0 -z-10 bg-black/60 dark:bg-black/70"></div>
            <LoginHeader />
            <div className="container mx-auto grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div className="text-center lg:text-left">
                    <motion.h1
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-4xl font-extrabold text-white drop-shadow-lg md:text-5xl"
                    >
                        {translate('loginPage.espaceTitle')}
                    </motion.h1>
                    <motion.p
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: 'easeOut',
                        }}
                        className="mx-auto mt-4 max-w-lg text-lg text-gray-200 drop-shadow-md lg:mx-0"
                    >
                        {translate('loginPage.description')}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="mx-auto w-full max-w-md"
                >
                    <div className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg dark:bg-black/20">
                        <LoginForm />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export const LogInSection = () => {
    return (
        <ThemeProvider>
            <LoginContent />
        </ThemeProvider>
    );
};
