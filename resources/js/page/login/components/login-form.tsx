import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useLangue } from '@/page/lang/useLang';
import { easeInOut, motion } from 'framer-motion';
import { ArrowRight, LoaderCircle, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: easeInOut,
        },
    }),
};

export const LoginForm = () => {
    const {
        logIn,
        setMatricule,
        setPassword,
        isAdmin,
        toggleIsAdmin,
        isLoading,
    } = useAuth();
    const { translate } = useLangue();
    const navigate = (path: string) => {
        window.location.href = path;
    };

    const handleLogin = () => {
        if (!isLoading) {
            logIn(navigate);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <motion.h2
                custom={0}
                initial="hidden"
                animate="visible"
                variants={formVariants}
                className="text-center text-3xl font-bold text-white drop-shadow-lg"
            >
                {translate('loginPage.seConnecter')}
            </motion.h2>
            <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={formVariants}
                className="relative"
            >
                <User className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-300" />
                <input
                    className="w-full rounded-full border border-transparent bg-white/20 py-3 pr-4 pl-12 text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-black/20"
                    type="number"
                    placeholder={'matricule'}
                    onChange={(e) => setMatricule(parseInt(e.target.value))}
                />
            </motion.div>
            <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={formVariants}
                className="relative"
            >
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-300" />
                <input
                    className="w-full rounded-full border border-transparent bg-white/20 py-3 pr-4 pl-12 text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-black/20"
                    type="password"
                    placeholder={translate('loginPage.mdp')}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </motion.div>
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={formVariants}
                className="flex items-center gap-3"
            >
                <Checkbox
                    id="isAdmin"
                    className="cursor-pointer border-gray-300"
                    checked={isAdmin}
                    onCheckedChange={toggleIsAdmin}
                />
                <label
                    htmlFor="isAdmin"
                    className="cursor-pointer text-gray-200 select-none"
                >
                    Administrateur
                </label>
            </motion.div>

            <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={formVariants}
            >
                <Button
                    onClick={handleLogin}
                    size="lg"
                    disabled={isLoading}
                    className="flex w-full transform items-center justify-center rounded-full bg-green-700 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700"
                >
                    {isLoading ? (
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            {translate('loginPage.seConnecter')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </motion.div>

            <motion.div
                custom={5}
                initial="hidden"
                animate="visible"
                variants={formVariants}
                className="text-center text-sm text-gray-300"
            >
                {translate('loginPage.question')}{' '}
                <a
                    href="#"
                    className="font-bold text-green-400 hover:underline"
                >
                    {translate('loginPage.inscription')}
                </a>
            </motion.div>
        </div>
    );
};
