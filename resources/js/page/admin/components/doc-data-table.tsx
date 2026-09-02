import { Button } from '@/components/ui/button';
import { FolderOpen, Plus } from 'lucide-react';
import { useModalContext } from '../bloc/useModalContext';
import { useDocTable } from '../hooks/useDocFileTable';
import { DataTable } from './data-table';

export const DocDataTable = () => {
    const { observerRef, table, columns } = useDocTable();
    const { openAddDoc } = useModalContext();

    return (
        <DataTable
            table={table}
            columnCount={columns.length}
            title="Documents"
            description="Partagez les supports de cours avec les étudiants"
            actions={
                <Button onClick={openAddDoc} size="sm">
                    <Plus className="size-4" />
                    Ajouter un document
                </Button>
            }
            emptyIcon={FolderOpen}
            emptyTitle="Aucun document"
            emptyDescription="Déposez un premier document pour le rendre disponible aux étudiants."
            emptyAction={
                <Button onClick={openAddDoc} size="sm" variant="outline">
                    <Plus className="size-4" />
                    Ajouter un document
                </Button>
            }
            observerRef={observerRef}
        />
    );
};
