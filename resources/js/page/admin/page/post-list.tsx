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
        <section className="flex h-full flex-col dark:bg-zinc-900">
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
                        text=" Voulez-vous vraiment supprimer cette annonce?"
                        cancel={cancelCallBack}
                        confirm={deleteCallBack}
                    />
                </Modal>
            )}
        </section>
    );
};
