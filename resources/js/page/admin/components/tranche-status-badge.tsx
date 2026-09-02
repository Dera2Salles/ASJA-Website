import { StatusBadge } from '@/components/admin/primitives';
import { useState } from 'react';

import type { Tranche } from '@/core/types';
import type { UserDto } from '@/features/mention/user.dto';
import { useAdminDashboardContext } from '../bloc/useAdminContext';

/**
 * Statut de paiement d'une tranche. Le badge reste en contour neutre : seule
 * la pastille de 6px porte la couleur, comme le prévoit la charte pour les
 * colonnes de statut.
 */
export const TrancheBadge = ({
    studentData,
    tranche,
    trancheId,
}: {
    studentData: UserDto;
    tranche: keyof UserDto;
    trancheId: string;
}) => {
    const value = studentData[tranche] as boolean;
    const [isPaid, setIsPaid] = useState<boolean>(value);

    const { updateTranche } = useAdminDashboardContext();

    const toggle = async () => {
        const newValue = !isPaid;
        setIsPaid(newValue);

        await updateTranche({
            id: trancheId,
            tranche: tranche as Tranche,
            value: newValue,
        });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={`Marquer la tranche comme ${isPaid ? 'non payée' : 'payée'}`}
        >
            <StatusBadge tone={isPaid ? 'success' : 'danger'}>
                {isPaid ? 'Payé' : 'Non payé'}
            </StatusBadge>
        </button>
    );
};
