import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { ElementType } from 'react';

export type RowAction = {
    label: string;
    icon?: ElementType;
    onSelect: () => void;
    /** Action irréversible : isolée en bas du menu, en rouge désaturé. */
    danger?: boolean;
};

/**
 * Menu « … » de fin de ligne. La charte veut un seul point d'entrée par
 * ligne plutôt qu'une série de boutons colorés dans la grille.
 */
export const RowActions = ({ actions }: { actions: RowAction[] }) => {
    const regular = actions.filter((action) => !action.danger);
    const dangerous = actions.filter((action) => action.danger);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Actions sur cette ligne"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent inline-flex size-8 items-center justify-center"
                >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
                {regular.map((action) => (
                    <DropdownMenuItem
                        key={action.label}
                        onSelect={action.onSelect}
                    >
                        {action.icon && <action.icon className="size-4" />}
                        {action.label}
                    </DropdownMenuItem>
                ))}

                {regular.length > 0 && dangerous.length > 0 && (
                    <DropdownMenuSeparator />
                )}

                {dangerous.map((action) => (
                    <DropdownMenuItem
                        key={action.label}
                        variant="destructive"
                        onSelect={action.onSelect}
                    >
                        {action.icon && <action.icon className="size-4" />}
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
