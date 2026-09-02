import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Motif structurant du CMS : une surface détourée d'un filet de 1px, coiffée
 * d'un en-tête « titre à gauche, actions à droite ». Aucune ombre, aucun
 * aplat coloré — la hiérarchie tient au contraste et à l'espacement.
 */

export const Panel = ({ className, ...props }: ComponentProps<'section'>) => (
    <section className={cn('app-panel', className)} {...props} />
);

export const PanelHead = ({
    title,
    description,
    actions,
    flush,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** Groupe d'actions aligné à droite — typiquement des `IconButton`. */
    actions?: ReactNode;
    /** Sans séparateur, quand le panneau n'a pas de corps distinct. */
    flush?: boolean;
    className?: string;
}) => (
    <header
        className={cn(
            'app-panel-head',
            flush && 'app-panel-head-flush',
            className,
        )}
    >
        <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">
                {title}
            </p>
            {description && (
                <p className="admin-meta mt-0.5 truncate">{description}</p>
            )}
        </div>
        {actions && (
            <div className="flex shrink-0 items-center gap-1">{actions}</div>
        )}
    </header>
);

export const PanelBody = ({ className, ...props }: ComponentProps<'div'>) => (
    <div className={cn('app-panel-body', className)} {...props} />
);

export const IconButton = ({
    className,
    danger,
    ...props
}: ComponentProps<'button'> & { danger?: boolean }) => (
    <button
        type="button"
        className={cn(
            'app-icon-btn',
            danger && 'app-icon-btn-danger',
            className,
        )}
        {...props}
    />
);

/** En-tête de page : titre, sous-titre, actions. */
export const PageHeader = ({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children?: ReactNode;
}) => (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
            <h1 className="admin-title">{title}</h1>
            {description && (
                <p className="text-muted-foreground mt-1 text-sm">
                    {description}
                </p>
            )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
);
