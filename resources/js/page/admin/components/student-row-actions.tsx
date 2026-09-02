import { RowActions } from '@/components/admin/row-actions';
import type { UserDto } from '@/features/mention/user.dto';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';

/** Consulter, modifier, supprimer un étudiant depuis le menu de la ligne. */
export const StudentRowActions = ({ user }: { user: UserDto }) => {
    const {
        setMention,
        setLevel,
        setBranche,
        setName,
        setLastName,
        setContact,
        setImage,
        setUserMatricule,
        deleteStudent,
    } = useAdminDashboardContext();

    const {
        openUpdateUser,
        openStudentInfo,
        setStudent,
        openDeleteConfirmation,
        closeDeleteConfirmation,
        setDeleteCallBack,
        setCancelCallBack,
    } = useModalContext();

    const openInfo = () => {
        setStudent(user);
        openStudentInfo();
    };

    const openUpdate = () => {
        setUserMatricule(user.identifier);
        setName(user.name);
        setLastName(user.lastName);
        setContact(user.contact);
        setMention(user.mention);
        setBranche(
            user.level == 'L3' && user.mention == 'LANGUE ET CULTURE'
                ? ''
                : user.branche,
        );
        setLevel(user.level);
        setImage(user.imageUrl);
        openUpdateUser();
    };

    const confirmDelete = () => {
        setDeleteCallBack(() => async () => {
            await deleteStudent(user.mentionId, user.fileName as string);
            closeDeleteConfirmation();
        });
        setCancelCallBack(() => closeDeleteConfirmation);
        openDeleteConfirmation();
    };

    return (
        <RowActions
            actions={[
                { label: 'Voir la fiche', icon: Eye, onSelect: openInfo },
                { label: 'Modifier', icon: Pencil, onSelect: openUpdate },
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
