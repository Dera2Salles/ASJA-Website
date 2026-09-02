import type { ColumnDef } from '@tanstack/react-table';

import type { LogEntity } from '@/features/log/log.entity';

export const columns: ColumnDef<LogEntity>[] = [
    {
        accessorKey: 'action',
        header: () => <span>Action</span>,
        cell: ({ row }) => (
            <span className="text-foreground font-medium">
                {row.getValue('action')}
            </span>
        ),
    },
    {
        accessorKey: 'description',
        header: () => <span>Description</span>,
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.getValue('description')}
            </span>
        ),
    },
    {
        accessorKey: 'date',
        header: () => <span>Date</span>,
        cell: ({ row }) => (
            <span className="admin-mono text-muted-foreground">
                {row.getValue('date')}
            </span>
        ),
    },
];
