import { EmptyState, TableSkeleton } from '@/components/admin/primitives';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { flexRender, type Table as TanstackTable } from '@tanstack/react-table';
import { Inbox, Search } from 'lucide-react';
import type { ElementType, ReactNode, Ref } from 'react';
import { Panel } from './panel';

/**
 * Coquille commune aux quatre tableaux de l'administration.
 *
 * Elle porte l'en-tête, la recherche globale, l'état vide, le chargement et
 * la sentinelle de défilement infini — et, sous 768px, remplace la grille par
 * des cartes empilées, comme le prévoit la charte.
 */
export function DataTable<TData>({
    table,
    columnCount,
    title,
    description,
    actions,
    search,
    emptyIcon = Inbox,
    emptyTitle = 'Aucun résultat',
    emptyDescription,
    emptyAction,
    isLoading = false,
    observerRef,
    onRowClick,
}: {
    table: TanstackTable<TData>;
    columnCount: number;
    title: string;
    description?: string;
    /** Actions de la page, alignées à droite du titre. */
    actions?: ReactNode;
    /** Recherche globale ; omise, le champ n'apparaît pas. */
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
    emptyIcon?: ElementType;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;
    isLoading?: boolean;
    /** Sentinelle du défilement infini, posée en fin de liste. */
    observerRef?: Ref<HTMLSpanElement>;
    onRowClick?: (row: TData) => void;
}) {
    const rows = table.getRowModel().rows;
    const hasRows = rows.length > 0;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="admin-title">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground mt-1 text-sm">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex shrink-0 items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            <Panel>
                {search && (
                    <div className="border-border border-b p-3">
                        <div className="relative max-w-sm">
                            <Search
                                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                                aria-hidden="true"
                            />
                            <Input
                                value={search.value}
                                onChange={(event) =>
                                    search.onChange(event.target.value)
                                }
                                placeholder={
                                    search.placeholder ?? 'Rechercher…'
                                }
                                aria-label={search.placeholder ?? 'Rechercher'}
                                className="h-9 pl-9"
                            />
                        </div>
                    </div>
                )}

                {isLoading && !hasRows ? (
                    <TableSkeleton columns={Math.min(columnCount, 6)} />
                ) : !hasRows ? (
                    <EmptyState
                        icon={emptyIcon}
                        title={emptyTitle}
                        description={emptyDescription}
                        action={emptyAction}
                    />
                ) : (
                    <>
                        {/* Grille classique à partir de 768px. */}
                        <div className="hidden overflow-x-auto md:block">
                            <Table>
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow
                                                key={headerGroup.id}
                                                className="hover:bg-transparent"
                                            >
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <TableHead
                                                            key={header.id}
                                                            className="bg-card text-muted-foreground sticky top-0 z-10 text-xs font-medium"
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                      header
                                                                          .column
                                                                          .columnDef
                                                                          .header,
                                                                      header.getContext(),
                                                                  )}
                                                        </TableHead>
                                                    ),
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>

                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() &&
                                                'selected'
                                            }
                                            className={
                                                onRowClick
                                                    ? 'cursor-pointer'
                                                    : undefined
                                            }
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        onClick={() => {
                                                            /* Les colonnes de
                                                               contrôle gardent
                                                               leur propre
                                                               interaction. */
                                                            if (
                                                                onRowClick &&
                                                                cell.column
                                                                    .id !==
                                                                    'select' &&
                                                                cell.column
                                                                    .id !==
                                                                    'actions'
                                                            ) {
                                                                onRowClick(
                                                                    row.original,
                                                                );
                                                            }
                                                        }}
                                                        className="text-sm"
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Sous 768px, chaque ligne devient une carte : le
                            libellé de colonne passe à gauche, la valeur à
                            droite. */}
                        <ul className="divide-border divide-y md:hidden">
                            {rows.map((row) => (
                                <li
                                    key={row.id}
                                    className="space-y-2 p-4"
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row
                                        .getVisibleCells()
                                        .filter(
                                            (cell) =>
                                                cell.column.id !== 'select',
                                        )
                                        .map((cell) => {
                                            const header =
                                                cell.column.columnDef.header;
                                            return (
                                                <div
                                                    key={cell.id}
                                                    className="flex items-start justify-between gap-3"
                                                >
                                                    <span className="admin-label shrink-0">
                                                        {typeof header ===
                                                        'string'
                                                            ? header
                                                            : cell.column.id}
                                                    </span>
                                                    <span className="min-w-0 text-right text-sm">
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {observerRef && <span ref={observerRef} className="block" />}
            </Panel>
        </div>
    );
}
