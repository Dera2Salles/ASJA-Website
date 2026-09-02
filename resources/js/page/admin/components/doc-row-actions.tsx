import { RowActions } from '@/components/admin/row-actions';
import type { DocEntity } from '@/features/doc/doc.entity';
import { Trash2 } from 'lucide-react';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';

/** Supprimer un document depuis le menu de la ligne. */
export const DocRowActions = ({ doc }: { doc: DocEntity }) => {
    const { deleteDoc } = useAdminDashboardContext();
    const {
        openDeleteConfirmation,
        closeDeleteConfirmation,
        setDeleteCallBack,
        setCancelCallBack,
    } = useModalContext();

    const confirmDelete = () => {
        setDeleteCallBack(() => async () => {
            await deleteDoc(doc.id as string, doc.fileName as string);
            closeDeleteConfirmation();
        });
        setCancelCallBack(() => closeDeleteConfirmation);
        openDeleteConfirmation();
    };

    return (
        <RowActions
            actions={[
                {
                    label: 'Supprimer',
                    icon: Trash2,
                    onSelect: confirmDelete,
                    danger: true,
                },
            ]}
        />
    );
};
