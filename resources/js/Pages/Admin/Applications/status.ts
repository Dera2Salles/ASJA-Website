import type { StatusTone } from '@/components/admin/primitives';

/**
 * Teinte de la pastille de statut d'une demande.
 *
 * Dans un module à part plutôt que sur l'un des deux écrans : la liste et le
 * dossier l'utilisent tous les deux, et faire importer une page par l'autre
 * aurait attiré tout le module de la liste dans le paquet du dossier.
 */
export const STATUS_TONE: Record<string, StatusTone> = {
    pending: 'warning',
    processing: 'neutral',
    incomplete: 'warning',
    accepted: 'success',
    rejected: 'danger',
    finalized: 'success',
};
