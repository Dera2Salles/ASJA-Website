import { Button } from '@/components/ui/button';
import { Megaphone, Plus } from 'lucide-react';
import { useModalContext } from '../bloc/useModalContext';
import { usePostTable } from '../hooks/usePostTable';
import { DataTable } from './data-table';

export const PostTable = () => {
    const { observerRef, table, columns } = usePostTable();
    const { openPostInformation, setPost, openAddPost } = useModalContext();

    return (
        <DataTable
            table={table}
            columnCount={columns.length}
            title="Annonces"
            description="Tenez les étudiants informés"
            actions={
                <Button onClick={openAddPost} size="sm">
                    <Plus className="size-4" />
                    Nouvelle annonce
                </Button>
            }
            emptyIcon={Megaphone}
            emptyTitle="Aucune annonce"
            emptyDescription="Publiez une première annonce pour informer les étudiants."
            emptyAction={
                <Button onClick={openAddPost} size="sm" variant="outline">
                    <Plus className="size-4" />
                    Nouvelle annonce
                </Button>
            }
            observerRef={observerRef}
            onRowClick={(post) => {
                setPost(post);
                openPostInformation();
            }}
        />
    );
};
