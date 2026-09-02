import { Modal } from '@/components/ui/modal';
import { useModalContext } from '../bloc/useModalContext';
import { CardAddDoc } from '../components/card-document-input';
import { DeleteModalConfirmation } from '../components/delete-modal-confirmantion';
import { DocDataTable } from '../components/doc-data-table';
import { useScrollLock } from '../hooks/useScrollLock';

export const Doclist = () => {
    const {
        isAddDocVisible,
        deleteCallBack,
        cancelCallBack,
        isDeleteConfirmationVisible,
    } = useModalContext();

    useScrollLock(isAddDocVisible || isDeleteConfirmationVisible);

    return (
        <>
            <DocDataTable />

            {isAddDocVisible && (
                <Modal>
                    <CardAddDoc />
                </Modal>
            )}
            {isDeleteConfirmationVisible && (
                <Modal>
                    <DeleteModalConfirmation
                        text="Ce document sera définitivement supprimé."
                        confirm={deleteCallBack}
                        cancel={cancelCallBack}
                    />
                </Modal>
            )}
        </>
    );
};
