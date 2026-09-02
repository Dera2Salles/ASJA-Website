import { Modal } from '@/components/ui/modal';
import { useModalContext } from '../bloc/useModalContext';
import { CardAddPost } from '../components/card-add-post';
import { DeleteModalConfirmation } from '../components/delete-modal-confirmantion';
import { PostInformation } from '../components/post-information';
import { PostTable } from '../components/post-table';
import { useScrollLock } from '../hooks/useScrollLock';

export const Postlist = () => {
    const {
        isPostInformationVisible,
        isAddPost,
        isDeleteConfirmationVisible,
        cancelCallBack,
        deleteCallBack,
    } = useModalContext();

    useScrollLock(
        isPostInformationVisible || isAddPost || isDeleteConfirmationVisible,
    );

    return (
        <>
            <PostTable />

            {isPostInformationVisible && (
                <Modal>
                    <PostInformation />
                </Modal>
            )}
            {isAddPost && (
                <Modal>
                    <CardAddPost />
                </Modal>
            )}
            {isDeleteConfirmationVisible && (
                <Modal>
                    <DeleteModalConfirmation
                        text="Cette annonce sera définitivement supprimée."
                        cancel={cancelCallBack}
                        confirm={deleteCallBack}
                    />
                </Modal>
            )}
        </>
    );
};
