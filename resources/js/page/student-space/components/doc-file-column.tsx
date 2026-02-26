import type { DocEntity } from '@/features/doc/doc.entity';
import type { ColumnDef } from '@tanstack/react-table';
import { DownloadIcon, Files } from 'lucide-react';

export const columns: ColumnDef<DocEntity>[] = [
    {
        accessorKey: 'lessonTitle',
        header: () => {
            return (
                <p className="pl-10 text-gray-500 dark:text-white">
                    Nom du fichier
                </p>
            );
        },
        cell: ({ row }) => (
            <div className="flex gap-2 pl-2">
                <Files className="text-green-600" />
                <p className="font-semibold dark:text-white">
                    {row.getValue('lessonTitle')}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'author',
        header: () => {
            return (
                <p className="hidden text-gray-500 md:flex dark:text-white">
                    Nom de l'auteur
                </p>
            );
        },
        cell: ({ row }) => (
            <p className="hidden py-2 pr-15 text-gray-500 md:flex dark:text-white">
                {row.getValue('author')}
            </p>
        ),
    },

    {
        accessorKey: 'fileUrl',
        header: () => {},
        enableHiding: false,
        cell: ({ row }) => (
            <div className="flex gap-2 pr-5">
                <a
                    className="font-semibold"
                    href={row.getValue('fileUrl')}
                    download="doc.pdf"
                >
                    <DownloadIcon className="text-green-600 transition-all duration-200 hover:scale-120" />
                </a>
            </div>
        ),
    },
];
