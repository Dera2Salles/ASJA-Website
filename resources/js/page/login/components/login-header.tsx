import Logo from '@/assets/Logo/asja-logo.png';
import { useLangue } from '@/page/lang/useLang';
import { useTheme } from '@/page/theme/useTheme';
import { Moon, Sun } from 'lucide-react';

export const LoginHeader = () => {
    const { toggleTheme, isDark } = useTheme();
    const { translate, toggleLang, isEn } = useLangue();
    return (
        <div className="fixed top-3 z-20 flex w-full justify-between px-2 md:px-5">
            <a
                className="cursor-pointer"
                onClick={() => (window.location.href = '/')}
            >
                <div className="m-2 flex items-center rounded-full">
                    <img src={Logo} className="h-12 w-12" />
                    <h1 className="ml-4 text-lg font-bold text-white drop-shadow-md">
                        {translate('universite')}
                    </h1>
                </div>
            </a>
            <div className="flex items-center">
                <button
                    className="cursor-pointer font-semibold text-white drop-shadow-md md:px-5"
                    onClick={toggleLang}
                >
                    {isEn ? 'FR' : 'EN'}
                </button>
                <button
                    className="cursor-pointer px-5 text-white drop-shadow-md"
                    onClick={toggleTheme}
                >
                    {isDark ? <Sun /> : <Moon />}
                </button>
            </div>
        </div>
    );
};
