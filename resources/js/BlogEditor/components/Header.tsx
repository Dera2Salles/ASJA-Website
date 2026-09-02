import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import { Eye, EyeOff, Maximize2, Minimize2, Save } from 'lucide-react';

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
    return (
 <div className="flex flex-col items-start justify-between border-b p-3 sm:flex-row sm:items-center">
            <div className="mb-2 flex items-center gap-4 sm:mb-0">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
 className="font-mono"
                    >
                        {wordCount} mots
                    </Badge>
                    <Badge
                        variant="outline"
 className="font-mono"
                    >
                        {charCount} caractères
                    </Badge>
                    {lastSave && (
                        <Badge
                            variant="secondary"
 className="bg-muted text-xs text-foreground"
                        >
                            Sauvegardé: {lastSave}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
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
