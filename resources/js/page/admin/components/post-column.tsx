import type { ColumnDef } from '@tanstack/react-table';

import type { PostDto } from '@/features/post/post.dto';
import { PostRowActions } from './post-row-actions';

export const columns: ColumnDef<PostDto>[] = [
    {
        accessorKey: 'title',
        header: () => <span>Titre</span>,
        cell: ({ row }) => (
            <span className="text-foreground font-medium">
                {row.getValue('title')}
            </span>
        ),
    },
    {
        accessorKey: 'description',
        header: () => <span>Description</span>,
        cell: ({ row }) => {
            const description: string = row.getValue('description');
            return (
                <span className="text-muted-foreground line-clamp-2 max-w-md">
                    {description}
                </span>
            );
        },
    },
    {
        accessorKey: 'nothing',
        header: () => <span>Destinataires</span>,
        cell: ({ row }) => {
            const post: PostDto = row.original;
            const audience = ['L3', 'M1', 'M2'].includes(post.level)
                ? `${post.mention} ${post.level} ${post.branche}`
                : `${post.mention} ${post.level}`;
            return <span className="text-muted-foreground">{audience}</span>;
        },
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableHiding: false,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <PostRowActions post={row.original} />
            </div>
        ),
    },
];
