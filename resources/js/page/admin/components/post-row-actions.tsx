import { RowActions } from '@/components/admin/row-actions';
import type { PostDto } from '@/features/post/post.dto';
import { Eye, Trash2 } from 'lucide-react';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';

/** Consulter ou supprimer une annonce depuis le menu de la ligne. */
export const PostRowActions = ({ post }: { post: PostDto }) => {
    const { deletePost } = useAdminDashboardContext();
    const {
        openPostInformation,
        setPost,
        openDeleteConfirmation,
        closeDeleteConfirmation,
        setDeleteCallBack,
        setCancelCallBack,
    } = useModalContext();

    const openInfo = () => {
        setPost(post);
        openPostInformation();
    };

    const confirmDelete = () => {
        setDeleteCallBack(() => async () => {
            await deletePost(post.id, post.fileName as string);
            closeDeleteConfirmation();
        });
        setCancelCallBack(() => closeDeleteConfirmation);
        openDeleteConfirmation();
    };

    return (
        <RowActions
            actions={[
                { label: "Voir l'annonce", icon: Eye, onSelect: openInfo },
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
