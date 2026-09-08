import { createContext, useContext } from 'react';
import type { useTheme } from './useTheme';

export const ThemeContext = createContext<ReturnType<typeof useTheme> | null>(
    null,
);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error('useThemeContext must be used within ThemeProvider');
    return context;
};
