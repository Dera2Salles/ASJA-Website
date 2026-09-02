import { History } from 'lucide-react';
import { useLogTable } from '../hooks/useLogTable';
import { DataTable } from './data-table';

export const LogTable = () => {
    const { observerRef, table, columns } = useLogTable();

    return (
        <DataTable
            table={table}
            columnCount={columns.length}
            title="Historique"
            description="Suivez les actions effectuées dans l'administration"
            emptyIcon={History}
            emptyTitle="Aucune activité"
            emptyDescription="Les actions réalisées dans l'administration apparaîtront ici."
            observerRef={observerRef}
        />
    );
};
