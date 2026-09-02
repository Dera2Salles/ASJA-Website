import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Coquille des formulaires en calque : en-tête titré avec fermeture, corps
 * défilant, pied d'actions aligné à droite. Aucun liseré coloré, aucun titre
 * géant — l'échelle typographique de la charte suffit.
 */
export const FormCard = ({
    title,
    description,
    onClose,
    footer,
    children,
}: {
    title: string;
    description?: string;
    onClose: () => void;
    footer: ReactNode;
    children: ReactNode;
}) => (
    <Card
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 p-0"
    >
        <header className="border-border flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4">
            <div className="min-w-0">
                <p className="admin-section-title truncate">{title}</p>
                {description && (
                    <p className="admin-meta mt-0.5">{description}</p>
                )}
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center"
            >
                <X className="size-4" aria-hidden="true" />
            </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {children}
        </div>

        <footer className="border-border flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4">
            {footer}
        </footer>
    </Card>
);

/** Champ de formulaire : libellé `text-sm` au-dessus, aide en `text-xs`. */
export const Field = ({
    label,
    htmlFor,
    hint,
    className,
    children,
}: {
    label: string;
    htmlFor?: string;
    hint?: string;
    className?: string;
    children: ReactNode;
}) => (
    <div className={className}>
        <Label htmlFor={htmlFor} className="mb-1.5 text-sm font-medium">
            {label}
        </Label>
        {children}
        {hint && <p className="admin-meta mt-1">{hint}</p>}
    </div>
);

/** Trois sélecteurs d'affectation alignés : mention, niveau, branche. */
export const FieldGrid = ({ children }: { children: ReactNode }) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>
);
