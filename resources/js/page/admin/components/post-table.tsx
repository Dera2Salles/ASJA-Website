import { flexRender } from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MdNewspaper } from 'react-icons/md';
import { useModalContext } from '../bloc/useModalContext';
import { usePostTable } from '../hooks/usePostTable';

export const PostTable = () => {
    const { observerRef, table, columns } = usePostTable();
    const { openPostInformation, setPost, openAddPost } = useModalContext();

    return (
        <div className="w-full border p-4 transition-all duration-500 dark:bg-zinc-900">
            <div className="flex w-full items-center justify-between px-4 py-6">
                <section className="flex flex-col">
                    <p className="text-2xl font-bold">Annonce</p>
                    <p className="text-gray-500 dark:text-zinc-300">
                        Gardez vos etudiants informer
                    </p>
                </section>
                <Button
                    onClick={openAddPost}
                    className="flex cursor-pointer bg-green-700 p-6 text-lg text-white hover:bg-green-900"
                >
                    <MdNewspaper /> <p>Ajouter</p>
                </Button>
            </div>
            <ScrollArea className="h-[640px]">
                <Table className="w-full">
                    <TableHeader className="z-10 bg-transparent transition-all duration-500 dark:bg-zinc-900">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="hover:bg-transparent"
                            >
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            className="sticky top-0"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    className="cursor-pointer"
                                >
                                    {row
                                        .getVisibleCells()
                                        .map((cell, index) => (
                                            <TableCell
                                                onClick={() => {
                                                    if (index < 3) {
                                                        setPost(row.original);
                                                        openPostInformation();
                                                    }
                                                }}
                                                key={cell.id}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                <span ref={observerRef}></span>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
};
