import { Button } from '@/components/ui/button';
import { debounce } from 'lodash';
import { Plus, Users } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';
import { useStudentTable } from '../hooks/useStudentTable';
import { DataTable } from './data-table';

export const StudentTable = () => {
    const { observerRef, table, columns, globalFilter, setGlobalFilter } =
        useStudentTable();
    const { openAddUser, openStudentInfo, setStudent } = useModalContext();
    const isMounted = useRef(false);

    const { searchMentionStudent, setQuery } = useAdminDashboardContext();

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

    return (
        <DataTable
            table={table}
            columnCount={columns.length}
            title="Étudiants"
            description="Gérez les inscriptions, les niveaux et les tranches"
            actions={
                <Button onClick={openAddUser} size="sm">
                    <Plus className="size-4" />
                    Ajouter un étudiant
                </Button>
            }
            search={{
                value: globalFilter ?? '',
                onChange: (value) => {
                    setGlobalFilter(value);
                    setQuery(value);
                },
                placeholder: 'Rechercher par nom ou prénom…',
            }}
            emptyIcon={Users}
            emptyTitle="Aucun étudiant"
            emptyDescription="Aucun étudiant ne correspond à cette recherche. Ajustez les filtres ou inscrivez un nouvel étudiant."
            emptyAction={
                <Button onClick={openAddUser} size="sm" variant="outline">
                    <Plus className="size-4" />
                    Ajouter un étudiant
                </Button>
            }
            observerRef={observerRef}
            onRowClick={(student) => {
                setStudent(student);
                openStudentInfo();
            }}
        />
    );
};
