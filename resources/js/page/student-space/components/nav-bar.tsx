import Logo from '@/assets/Logo/asja-logo.png';
import { useTheme } from '@/page/theme/useTheme';
import { motion } from 'framer-motion';
import { LogOut, Moon, Sun } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useStudentPortalContext } from '../bloc/useStudentSpaceContext';
import { BottomBar } from './bottom-bar';

export const NavBar = ({
    callBack,
    index,
}: {
    callBack: Dispatch<SetStateAction<number>>;
    index: number;
}) => {
    const { toggleTheme, isDark } = useTheme();
    const { logOut } = useStudentPortalContext();
    const navigate = (path: string) => {
        window.location.href = path;
    };

    const handleLogout = () => {
        logOut(navigate);
    };

    return (
        <>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="fixed top-0 right-0 left-0 z-50 px-4 pt-4"
            >
                <div className="flex h-16 w-full items-center justify-between rounded-full bg-white px-4 shadow-md dark:bg-zinc-800">
                    <a href="/" className="flex items-center gap-3">
                        <img src={Logo} className="h-10 w-10" alt="ASJA Logo" />
                        <h1 className="hidden text-lg font-bold text-gray-800 md:block dark:text-white">
                            Université ASJA
                        </h1>
                    </a>
                    <div className="flex items-center gap-2">
                        <button
                            className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-700"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            className="rounded-full p-2 text-red-500 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="fixed right-0 bottom-4 left-0 z-50 md:hidden">
                <BottomBar callBack={callBack} index={index} />
            </div>
        </>
    );
};
