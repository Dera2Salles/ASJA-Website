import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'asja.admin.theme';

export type AdminTheme = 'light' | 'dark';

/**
 * Thème propre à l'administration.
 *
 * Le site public est verrouillé en sombre par `page/theme/useTheme`, qui pose
 * `dark` sur `<html>`. L'outil de gestion a besoin des deux modes sans toucher
 * à ce réglage : la classe est donc portée par la racine `.admin-shell`
 * elle-même, que la feuille de style cible via `.admin-shell.dark`.
 */
export const useAdminTheme = () => {
    const [theme, setTheme] = useState<AdminTheme>('light');

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored === 'light' || stored === 'dark') {
                setTheme(stored);
                return;
            }
            setTheme(
                window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light',
            );
        } catch {
            /* Stockage indisponible (navigation privée) : on reste en clair. */
        }
    }, []);

    /* Les calques shadcn (tooltip, dialogue, menu) sont rendus en portail,
       donc hors de `.admin-shell`. L'attribut est posé sur `<body>` pour que
       la palette monochrome les atteigne aussi ; il disparaît en quittant
       l'administration, ce qui laisse le site public intact. */
    useEffect(() => {
        document.body.dataset.adminTheme = theme;
        return () => {
            delete document.body.dataset.adminTheme;
        };
    }, [theme]);

    /* Les tokens ci-dessus ne suffisent pas : la variante Tailwind `dark:`
       s'accroche à un ancêtre portant la classe `dark`, pas à la valeur des
       tokens. Or le site public pose `dark` sur `<html>` et ne l'enlève jamais
       (`page/theme/useTheme`) ; en navigation SPA, une page publique visitée
       avant l'administration laissait donc toutes les classes `dark:` actives
       à l'intérieur — l'éditeur d'articles et le profil restaient sombres quel
       que soit le réglage d'ici.

       Tant que l'administration est montée, c'est elle qui décide. L'état
       trouvé à l'arrivée est restitué en partant, pour rendre au site public
       le sombre qu'il impose. */
    useEffect(() => {
        const root = document.documentElement;
        const previous = root.classList.contains('dark');
        return () => {
            root.classList.toggle('dark', previous);
        };
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((current) => {
            const next = current === 'dark' ? 'light' : 'dark';
            try {
                window.localStorage.setItem(STORAGE_KEY, next);
            } catch {
                /* Sans persistance, la bascule vaut pour la session. */
            }
            return next;
        });
    }, []);

    return { theme, isDark: theme === 'dark', toggleTheme };
};
