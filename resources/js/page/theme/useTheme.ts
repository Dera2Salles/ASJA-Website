import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

export const useTheme = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Toujours en mode sombre par défaut
        setIsDark(true);
        document.documentElement.classList.add('dark');
    }, []);

    const toggleTheme = () => {
        // Le site est uniquement sombre, pas de bascule possible
    };

    return { isDark: true, toggleTheme };
};
