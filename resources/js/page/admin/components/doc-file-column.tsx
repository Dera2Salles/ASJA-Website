import type { DocEntity } from '@/features/doc/doc.entity';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { DocRowActions } from './doc-row-actions';

export const columns: ColumnDef<DocEntity>[] = [
    {
        accessorKey: 'lessonTitle',
        header: () => <span>Nom du fichier</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                {/* Icône en gris : aucune icône colorée dans la charte. */}
                <FileText
                    className="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                />
                <span className="text-foreground truncate font-medium">
                    {row.getValue('lessonTitle')}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'author',
        header: () => <span>Auteur</span>,
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.getValue('author')}
            </span>
        ),
    },
    {
        accessorKey: 'fileSize',
        header: () => <span>Taille</span>,
        cell: ({ row }) => (
            <span className="admin-mono text-muted-foreground">
                {row.getValue('fileSize')} Mo
            </span>
        ),
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableHiding: false,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <DocRowActions doc={row.original} />
            </div>
        ),
    },
];
