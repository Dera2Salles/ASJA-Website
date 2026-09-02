import { Modal } from '@/components/ui/modal';
import type { UserDto } from '@/features/mention/user.dto';
import { useModalContext } from '../bloc/useModalContext';
import { CardInputUser } from '../components/card-user-input';
import { CardUpdateUser } from '../components/card-user-update';
import { DeleteModalConfirmation } from '../components/delete-modal-confirmantion';
import { StudentInformation } from '../components/student-information';
import { StudentTable } from '../components/student-table';
import { useScrollLock } from '../hooks/useScrollLock';

export const Studentlist = () => {
    const {
        isAddStudentCardVisible,
        isStudentInfoVisible,
        student,
        isDeleteConfirmationVisible,
        isUpdateUserVisible,
        deleteCallBack,
        cancelCallBack,
    } = useModalContext();

    useScrollLock(
        isAddStudentCardVisible ||
            isStudentInfoVisible ||
            isDeleteConfirmationVisible ||
            isUpdateUserVisible,
    );

    return (
        <>
            <StudentTable />

            {isAddStudentCardVisible && (
                <Modal>
                    <CardInputUser />
                </Modal>
            )}
            {isUpdateUserVisible && (
                <Modal>
                    <CardUpdateUser />
                </Modal>
            )}
            {isStudentInfoVisible && (
                <Modal>
                    <StudentInformation student={student as UserDto} />
                </Modal>
            )}
            {isDeleteConfirmationVisible && (
                <Modal>
                    <DeleteModalConfirmation
                        text="Cet étudiant et ses données seront définitivement supprimés."
                        cancel={cancelCallBack}
                        confirm={deleteCallBack}
                    />
                </Modal>
            )}
        </>
    );
};
