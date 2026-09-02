import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Search } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useState,
    type ElementType,
    type ReactNode,
} from 'react';

export type CommandEntry = {
    id: string;
    label: string;
    icon?: ElementType;
    /** Section de la palette ; les entrées sont regroupées par ce libellé. */
    group: string;
    onSelect: () => void;
};

/**
 * Palette de commandes de l'administration.
 *
 * Elle est pilotée par une liste d'entrées plutôt que par le routeur, ce qui
 * lui permet de servir aussi bien l'administration Inertia (navigation par
 * URL) que celle à index de page.
 */
export const useCommandPalette = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setOpen((current) => !current);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    return { open, setOpen };
};

export const CommandPalette = ({
    open,
    onOpenChange,
    entries,
    placeholder = 'Rechercher une page, une action…',
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entries: CommandEntry[];
    placeholder?: string;
}) => {
    const groups = entries.reduce<Record<string, CommandEntry[]>>(
        (accumulator, entry) => {
            (accumulator[entry.group] ??= []).push(entry);
            return accumulator;
        },
        {},
    );

    const run = useCallback(
        (entry: CommandEntry) => {
            onOpenChange(false);
            entry.onSelect();
        },
        [onOpenChange],
    );

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Palette de commandes"
            description="Recherchez une page ou une action de l'administration."
        >
            <CommandInput placeholder={placeholder} />
            <CommandList>
                <CommandEmpty>Aucun résultat.</CommandEmpty>
                {Object.entries(groups).map(([group, items]) => (
                    <CommandGroup key={group} heading={group}>
                        {items.map((entry) => (
                            <CommandItem
                                key={entry.id}
                                value={`${group} ${entry.label}`}
                                onSelect={() => run(entry)}
                            >
                                {entry.icon && (
                                    <entry.icon
                                        className="text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                )}
                                {entry.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ))}
            </CommandList>
        </CommandDialog>
    );
};

/**
 * Champ de recherche de la barre supérieure. Il n'édite rien : il ouvre la
 * palette, et affiche le raccourci pour l'annoncer.
 */
export const CommandSearchTrigger = ({
    onClick,
    children = 'Rechercher…',
}: {
    onClick: () => void;
    children?: ReactNode;
}) => (
    <button
        type="button"
        onClick={onClick}
        className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground hidden h-9 w-full max-w-64 items-center gap-2 border px-3 text-sm md:inline-flex"
    >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate text-left">{children}</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-0.5 border px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">⌘</span>K
        </kbd>
    </button>
);
