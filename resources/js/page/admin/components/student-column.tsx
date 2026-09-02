import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { classes, mentions } from '@/core/types';
import type { UserDto } from '@/features/mention/user.dto';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, User } from 'lucide-react';
import { StudentRowActions } from './student-row-actions';
import { TrancheBadge } from './tranche-status-badge';

/** En-tête triable : le sens du tri se lit à la flèche, jamais à la couleur. */
const SortableHeader = <T,>({
    column,
    label,
}: {
    column: Column<T, unknown>;
    label: string;
}) => {
    const sorted = column.getIsSorted();
    const Icon =
        sorted === 'asc'
            ? ArrowUp
            : sorted === 'desc'
              ? ArrowDown
              : ChevronsUpDown;

    return (
        <button
            type="button"
            onClick={() => column.toggleSorting(sorted === 'asc')}
            className="text-muted-foreground hover:text-foreground -ml-1 inline-flex items-center gap-1 px-1 py-1 text-xs font-medium"
        >
            {label}
            <Icon className="size-3.5" aria-hidden="true" />
        </button>
    );
};

/** Filtre de colonne : un `Select` discret posé dans la ligne d'en-tête. */
const FilterHeader = <T,>({
    column,
    placeholder,
    options,
    disabled,
}: {
    column: Column<T, unknown>;
    placeholder: string;
    options: string[];
    disabled?: boolean;
}) => (
    <Select
        disabled={disabled}
        value={(column.getFilterValue() as string)?.replace(/ /g, '_') ?? ''}
        onValueChange={(value) =>
            column.setFilterValue(
                value === 'Tout' ? undefined : value.replace(/_/g, ' '),
            )
        }
    >
        <SelectTrigger size="sm" className="h-8 w-full min-w-28 text-xs">
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="Tout">Tout</SelectItem>
            {options.map((option) => (
                <SelectItem key={option} value={option}>
                    {option.replace(/_/g, ' ')}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

export const columns: ColumnDef<UserDto>[] = [
    {
        id: 'select',
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Tout sélectionner"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Sélectionner la ligne"
                onClick={(event) => event.stopPropagation()}
            />
        ),
    },
    {
        accessorKey: 'imageUrl',
        enableSorting: false,
        header: () => <span className="sr-only">Photo</span>,
        cell: ({ row }) => (
            <Avatar className="size-8">
                <AvatarImage src={row.getValue('imageUrl')} alt="" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="size-4" aria-hidden="true" />
                </AvatarFallback>
            </Avatar>
        ),
    },
    {
        accessorKey: 'identifier',
        header: ({ column }) => (
            <SortableHeader column={column} label="Matricule" />
        ),
        cell: ({ row }) => (
            <span className="admin-mono text-muted-foreground">
                {row.getValue('identifier')}
            </span>
        ),
    },
    {
        accessorKey: 'name',
        enableSorting: true,
        enableColumnFilter: true,
        header: ({ column }) => <SortableHeader column={column} label="Nom" />,
        cell: ({ row }) => (
            <span className="text-foreground font-medium">
                {row.getValue('name')}
            </span>
        ),
    },
    {
        accessorKey: 'lastName',
        enableColumnFilter: true,
        header: ({ column }) => (
            <SortableHeader column={column} label="Prénom" />
        ),
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.getValue('lastName')}
            </span>
        ),
    },
    {
        accessorKey: 'contact',
        enableSorting: false,
        header: () => <span>Contact</span>,
        cell: ({ row }) => (
            <span className="admin-mono text-muted-foreground">
                {row.getValue('contact')}
            </span>
        ),
    },
    {
        accessorKey: 'mention',
        enableColumnFilter: true,
        header: ({ column }) => (
            <FilterHeader
                column={column}
                placeholder="Mention"
                options={Object.keys(mentions)}
            />
        ),
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.getValue('mention')}
            </span>
        ),
    },
    {
        accessorKey: 'level',
        enableSorting: true,
        header: ({ column }) => (
            <FilterHeader
                column={column}
                placeholder="Niveau"
                options={[...classes]}
            />
        ),
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.getValue('level')}
            </span>
        ),
    },
    {
        accessorKey: 'branche',
        header: ({ column, table }) => {
            const mention = table.getColumn('mention')?.getFilterValue() as
                | string
                | undefined;
            const level = table.getColumn('level')?.getFilterValue() as string;
            const options =
                mention && mentions[mention]?.[level]
                    ? mentions[mention][level]
                    : [];

            return (
                <FilterHeader
                    column={column}
                    placeholder="Branche"
                    options={options}
                    disabled={!mention}
                />
            );
        },
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.getValue('branche')}
            </span>
        ),
    },
    {
        accessorKey: 'Premier',
        enableSorting: false,
        header: () => <span>1re tranche</span>,
        cell: ({ row }) => (
            <TrancheBadge
                studentData={row.original}
                tranche="Premier"
                trancheId={row.original.trancheId}
            />
        ),
    },
    {
        accessorKey: 'Deuxieme',
        enableSorting: false,
        header: () => <span>2e tranche</span>,
        cell: ({ row }) => (
            <TrancheBadge
                studentData={row.original}
                tranche="Deuxieme"
                trancheId={row.original.trancheId}
            />
        ),
    },
    {
        accessorKey: 'Troisieme',
        enableSorting: false,
        header: () => <span>3e tranche</span>,
        cell: ({ row }) => (
            <TrancheBadge
                studentData={row.original}
                tranche="Troisieme"
                trancheId={row.original.trancheId}
            />
        ),
    },
    {
        id: 'actions',
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <StudentRowActions user={row.original} />
            </div>
        ),
    },
];

/** Re-export : le squelette de chargement doit connaître le nombre de colonnes. */
export const STUDENT_COLUMN_COUNT = columns.length;
