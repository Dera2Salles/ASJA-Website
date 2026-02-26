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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { debounce } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { MdPerson, MdSearch } from 'react-icons/md';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';
import { useStudentTable } from '../hooks/useStudentTable';

export const StudentTable = () => {
    const { observerRef, table, columns, globalFilter, setGlobalFilter } =
        useStudentTable();
    const { openAddUser, openStudentInfo, setStudent } = useModalContext();
    const isMounted = useRef(false);

    const { searchMentionStudent, setQuery } = useAdminDashboardContext();

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        if (table.getRowModel().rows.length == 0 || globalFilter.length == 0) {
            searchDebounce();
        }

        return () => searchDebounce.cancel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalFilter]);

    const searchDebounce = useMemo(
        () =>
            debounce(() => {
                setQuery(globalFilter);
                const callSearch = async () => {
                    await searchMentionStudent(table.getRowModel().rows.length);
                };
                callSearch();
            }, 400),
        [globalFilter, searchMentionStudent, setQuery, table],
    );

    return (
        <div className="w-full border p-4 transition-all duration-500 dark:bg-zinc-900">
            <div className="flex w-full items-center justify-between px-4 py-6">
                <section className="flex flex-col">
                    <p className="text-2xl font-bold">Liste des étudiants</p>
                    <p className="text-gray-500 dark:text-zinc-300">
                        Gérer vos étudiants de maniere rapide
                    </p>
                </section>
                <div className="relative">
                    <MdSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-xl text-gray-400" />
                    <Input
                        value={globalFilter ?? ''}
                        onChange={(event) => {
                            setGlobalFilter(event.target.value);
                            setQuery(event.target.value);
                        }}
                        className="bg-gray-100 pr-3 pl-10"
                        placeholder="Recherche par nom ou prénom..."
                    />
                </div>

                <Button
                    onClick={openAddUser}
                    className="flex cursor-pointer bg-green-700 p-6 text-lg text-white hover:bg-green-900"
                >
                    <MdPerson /> <p>Ajouter</p>
                </Button>
            </div>
            <ScrollArea className="h-screen">
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
                                                    if (index < 8) {
                                                        setStudent(
                                                            row.original,
                                                        );
                                                        openStudentInfo();
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
