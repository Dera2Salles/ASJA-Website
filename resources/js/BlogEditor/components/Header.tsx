import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    Eye,
    EyeOff,
    Maximize2,
    Minimize2,
    Moon,
    Save,
    Sun,
} from 'lucide-react';

import { useTheme } from './ThemeContext';

interface HeaderProps {
    wordCount: number;
    charCount: number;
    lastSave: string | null;
    showFormatting: boolean;
    isFullscreen: boolean;
    onToggleFormatting: () => void;
    onSave: () => void;
    onToggleFullscreen: () => void;
}

export function Header({
    wordCount,
    charCount,
    lastSave,
    showFormatting,
    isFullscreen,
    onToggleFormatting,
    onSave,
    onToggleFullscreen,
}: HeaderProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex flex-col items-start justify-between border-b bg-gradient-to-r from-green-50/50 to-white p-3 sm:flex-row sm:items-center dark:border-green-900/30 dark:from-zinc-900/40 dark:to-zinc-950/40">
            <div className="mb-2 flex items-center gap-4 sm:mb-0">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="font-mono dark:border-green-900/50 dark:text-green-400"
                    >
                        {wordCount} mots
                    </Badge>
                    <Badge
                        variant="outline"
                        className="font-mono dark:border-green-900/50 dark:text-green-400"
                    >
                        {charCount} caractères
                    </Badge>
                    {lastSave && (
                        <Badge
                            variant="secondary"
                            className="bg-green-100/50 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        >
                            Sauvegardé: {lastSave}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className="h-8"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            size="sm"
                            pressed={showFormatting}
                            onPressedChange={onToggleFormatting}
                            className="h-8 w-8"
                        >
                            {showFormatting ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4" />
                            )}
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                        {showFormatting
                            ? 'Masquer le formatage'
                            : 'Afficher le formatage'}
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSave}
                            className="h-8"
                        >
                            <Save className="mr-1 h-4 w-4" />
                            Sauvegarder
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Sauvegarder (Ctrl+S)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleFullscreen}
                            className="h-8"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4" />
                            ) : (
                                <Maximize2 className="h-4 w-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {isFullscreen
                            ? 'Quitter le plein écran'
                            : 'Plein écran (F11)'}
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
