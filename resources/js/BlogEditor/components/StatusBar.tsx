import { HelpCircle, Minus, Plus } from 'lucide-react';

interface StatusBarProps {
    lineHeight: string;
    fontSize: string;
    onDecreaseFont: () => void;
    onIncreaseFont: () => void;
    canDecrease: boolean;
    canIncrease: boolean;
}

export function StatusBar({
    lineHeight,
    fontSize,
    onDecreaseFont,
    onIncreaseFont,
    canDecrease,
    canIncrease,
}: StatusBarProps) {
    const currentSize = parseInt(fontSize.replace('px', ''));

    return (
        <div className="flex flex-wrap items-center justify-between border-t bg-green-50/30 p-2 text-xs text-zinc-500 dark:border-green-900/30 dark:bg-zinc-900/40 dark:text-zinc-400">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Astuce: Utilisez Ctrl+Entrée pour un saut de ligne
                </span>
                <span>•</span>
                <span>Interligne: {lineHeight}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onDecreaseFont}
                    disabled={canDecrease}
                    className="rounded p-1 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700"
                >
                    <Minus className="h-3 w-3" />
                </button>
                <span className="font-mono">{currentSize}px</span>
                <button
                    onClick={onIncreaseFont}
                    disabled={canIncrease}
                    className="rounded p-1 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
