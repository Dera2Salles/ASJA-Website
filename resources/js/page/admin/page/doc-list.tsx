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
        <section className="flex h-full flex-col dark:bg-zinc-900">
            <DocDataTable />
            {isAddDocVisible && (
                <Modal>
                    <CardAddDoc />
                </Modal>
            )}
            {isDeleteConfirmationVisible && (
                <Modal>
                    <DeleteModalConfirmation
                        text=" Voulez-vous vraiment supprimer ce document?"
                        confirm={deleteCallBack}
                        cancel={cancelCallBack}
                    />
                </Modal>
            )}
        </section>
    );
};
