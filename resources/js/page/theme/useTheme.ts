import { useEffect } from 'react';

/**
 * Thème unique full light : le site n'a plus de mode sombre, ce hook
 * garantit seulement que la classe `dark` ne traîne jamais sur `<html>`.
 * `toggleTheme` est conservé comme no-op pour ne pas casser les appelants.
 */
export const useTheme = () => {
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
    }, []);

    const toggleTheme = () => {
        document.documentElement.classList.remove('dark');
    };

    return { isDark: false as const, toggleTheme };
};
