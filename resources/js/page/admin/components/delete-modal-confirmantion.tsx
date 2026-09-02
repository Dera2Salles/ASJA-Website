import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

/**
 * Confirmation de suppression. Le rouge ne porte que sur l'icône, le titre et
 * le bouton d'action : jamais en aplat sur la carte.
 */
export const DeleteModalConfirmation = ({
    text,
    cancel,
    confirm,
}: {
    text: string;
    cancel: () => void;
    confirm: () => Promise<void>;
}) => (
    <Card
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-md gap-0 p-6"
    >
        <div className="flex gap-4">
            <span className="border-border text-destructive flex size-9 shrink-0 items-center justify-center border">
                <AlertTriangle className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
                <p className="text-foreground text-sm font-medium">
                    Confirmer la suppression
                </p>
                <p className="text-muted-foreground text-sm">{text}</p>
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={cancel}>
                Annuler
            </Button>
            <Button variant="destructive" size="sm" onClick={confirm}>
                Supprimer
            </Button>
        </div>
    </Card>
);
