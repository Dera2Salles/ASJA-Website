import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import type { ComponentProps, ElementType, ReactNode } from 'react';

/**
 * Briques communes aux deux administrations. Elles fixent l'échelle
 * typographique et les états décrits par `resources/design.md`, pour que
 * chaque page n'ait plus à réinventer un titre ou un état vide.
 */

/* --- Typographie ------------------------------------------------------- */

export const PageTitle = ({
    title,
    description,
    actions,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** Actions de la page, alignées à droite du titre. */
    actions?: ReactNode;
    className?: string;
}) => (
    <div
        className={cn(
            'flex flex-wrap items-start justify-between gap-3',
            className,
        )}
    >
        <div className="min-w-0">
            <h1 className="admin-title">{title}</h1>
            {description && (
                <p className="text-muted-foreground mt-1 text-sm">
                    {description}
                </p>
            )}
        </div>
        {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
    </div>
);

export const SectionTitle = ({
    title,
    description,
    actions,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) => (
    <div className={cn('flex items-start justify-between gap-3', className)}>
        <div className="min-w-0">
            <h2 className="admin-section-title truncate">{title}</h2>
            {description && (
                <p className="admin-meta mt-0.5 truncate">{description}</p>
            )}
        </div>
        {actions && (
            <div className="flex shrink-0 items-center gap-1">{actions}</div>
        )}
    </div>
);

/* --- Indicateur clé ---------------------------------------------------- */

export type KpiDelta = {
    /** Variation en pourcentage ; le signe décide de la flèche. */
    value: number;
    /** Période de comparaison, affichée en gris à côté de la variation. */
    label?: string;
};

/**
 * Carte KPI : libellé discret, valeur en gros, variation en `text-xs`.
 * La couleur n'apparaît que sur le texte de la variation — jamais sur le
 * fond, jamais sur l'icône.
 */
export const KpiCard = ({
    label,
    value,
    delta,
    icon: Icon,
    className,
}: {
    label: string;
    value: ReactNode;
    delta?: KpiDelta;
    icon?: ElementType;
    className?: string;
}) => {
    const isUp = (delta?.value ?? 0) >= 0;
    const Arrow = isUp ? ArrowUp : ArrowDown;

    return (
        <Card className={cn('gap-0 py-0', className)}>
            <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="admin-label truncate">{label}</span>
                    {Icon && (
                        <Icon
                            className="text-muted-foreground size-4 shrink-0"
                            aria-hidden="true"
                        />
                    )}
                </div>

                <span className="admin-figure">{value}</span>

                {delta && (
                    <p className="flex items-center gap-1 text-xs">
                        <span
                            className={cn(
                                'inline-flex items-center gap-0.5 font-medium',
                                isUp ? 'admin-delta-up' : 'admin-delta-down',
                            )}
                        >
                            <Arrow className="size-3" aria-hidden="true" />
                            {isUp ? '+' : ''}
                            {delta.value}%
                        </span>
                        {delta.label && (
                            <span className="text-muted-foreground">
                                {delta.label}
                            </span>
                        )}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

/** Grille de KPI : 1 colonne en mobile, 2 en tablette, 4 au-delà de 1280px. */
export const KpiRow = ({ className, ...props }: ComponentProps<'div'>) => (
    <div
        className={cn(
            'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4',
            className,
        )}
        {...props}
    />
);

/* --- Statut ------------------------------------------------------------ */

export type StatusTone = 'neutral' | 'success' | 'danger' | 'warning';

const DOT_TONE: Record<StatusTone, string> = {
    neutral: '',
    success: 'admin-dot-success',
    danger: 'admin-dot-danger',
    warning: 'admin-dot-warning',
};

/**
 * Badge de statut : contour neutre, le seul indice de couleur étant une
 * pastille de 6px. C'est la seule couleur tolérée dans un tableau.
 */
export const StatusBadge = ({
    tone = 'neutral',
    children,
    className,
}: {
    tone?: StatusTone;
    children: ReactNode;
    className?: string;
}) => (
    <Badge variant="outline" className={cn('gap-1.5 font-normal', className)}>
        <span className={cn('admin-dot', DOT_TONE[tone])} aria-hidden="true" />
        {children}
    </Badge>
);

/* --- Formulaires ------------------------------------------------------- */

/**
 * Message d'erreur d'un champ : rouge désaturé, en `text-xs`, annoncé aux
 * lecteurs d'écran. La couleur ne porte que sur le texte.
 */
export const FieldError = ({ children }: { children?: ReactNode }) =>
    children ? (
        <p role="alert" className="text-destructive text-xs">
            {children}
        </p>
    ) : null;

/* --- États ------------------------------------------------------------- */

/** État vide : icône outline, titre, explication, action. */
export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon: ElementType;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) => (
    <div
        className={cn(
            'flex flex-col items-center justify-center px-6 py-16 text-center',
            className,
        )}
    >
        <Icon
            className="text-muted-foreground size-8"
            strokeWidth={1.5}
            aria-hidden="true"
        />
        <p className="text-foreground mt-4 text-sm font-medium">{title}</p>
        {description && (
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                {description}
            </p>
        )}
        {action && <div className="mt-4">{action}</div>}
    </div>
);

/** État d'erreur : alerte destructive et bouton « Réessayer ». */
export const ErrorState = ({
    title = 'Une erreur est survenue',
    description,
    onRetry,
    className,
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}) => (
    <Alert variant="destructive" className={className}>
        <AlertTriangle aria-hidden="true" />
        <AlertTitle>{title}</AlertTitle>
        {description && <AlertDescription>{description}</AlertDescription>}
        {onRetry && (
            <div className="col-start-2 mt-3">
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Réessayer
                </Button>
            </div>
        )}
    </Alert>
);

/**
 * Squelette de tableau : il reprend exactement la grille finale plutôt que
 * d'afficher un indicateur de chargement plein écran.
 */
export const TableSkeleton = ({
    rows = 6,
    columns = 5,
}: {
    rows?: number;
    columns?: number;
}) => (
    <div className="divide-border divide-y">
        {Array.from({ length: rows }).map((_, row) => (
            <div
                key={row}
                className="grid items-center gap-4 px-4 py-3"
                style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: columns }).map((__, column) => (
                    <Skeleton key={column} className="h-4 w-full max-w-32" />
                ))}
            </div>
        ))}
    </div>
);

/** Squelette d'une ligne de KPI, au format exact de `KpiRow`. */
export const KpiRowSkeleton = () => (
    <KpiRow>
        {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="gap-0 py-0">
                <CardContent className="flex flex-col gap-2 p-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-28" />
                </CardContent>
            </Card>
        ))}
    </KpiRow>
);
