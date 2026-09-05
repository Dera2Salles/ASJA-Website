import {
    CommandPalette,
    CommandSearchTrigger,
    useCommandPalette,
    type CommandEntry,
} from '@/components/admin/command-palette';
import { useAdminTheme } from '@/components/admin/use-admin-theme';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, ExternalLink, Moon, PanelsTopLeft, Sun } from 'lucide-react';
import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AdminSidebar, MENU_GROUPS } from './Partials/AdminSidebar';

export interface Crumb {
    label: string;
    href?: string;
}

interface Props {
    /** Fil d'Ariane de la page ; le premier niveau est ajouté automatiquement. */
    breadcrumbs?: Crumb[];
    /** Actions propres à la page, alignées à droite de la barre supérieure. */
    actions?: ReactNode;
}

/** Bouton d'icône de la barre supérieure : neutre, carré, avec son libellé. */
const TopBarButton = ({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick?: () => void;
    children: ReactNode;
}) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <button
                type="button"
                onClick={onClick}
                aria-label={label}
                className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 items-center justify-center"
            >
                {children}
            </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
);

function AdminShell({
    breadcrumbs = [],
    actions,
    children,
}: PropsWithChildren<Props>) {
    const { open, setOpen } = useCommandPalette();
    const { isDark, toggleTheme } = useAdminTheme();

    /* La palette reprend l'arborescence de la barre latérale : une seule
       source pour la navigation, quel que soit le point d'entrée. */
    const entries: CommandEntry[] = MENU_GROUPS.flatMap((group) =>
        group.items.map((item) => ({
            id: item.route,
            label: item.title,
            icon: item.icon,
            group: group.label,
            onSelect: () => router.visit(route(item.route)),
        })),
    );

    /* Les sections du contenu rejoignent la palette au même titre que les
       pages : « Foire aux questions » se rejoint en trois frappes depuis
       n'importe où, sans passer par l'écran de contenu. */
    const { props } = usePage<PageProps>();

    Object.entries(props.cmsSections ?? {}).forEach(([key, label]) => {
        entries.push({
            id: `cms-${key}`,
            label,
            icon: PanelsTopLeft,
            group: 'Contenu du site',
            onSelect: () =>
                router.visit(
                    route('admin.component-data.index', { section: key }),
                ),
        });
    });

    return (
        <div className={cn('admin-shell app-shell', isDark && 'dark')}>
            <Toaster position="top-right" />

            {/* La largeur réelle est déclarée dans `app.css`, sur
                `--admin-sidebar-width` : elle peut ainsi varier au point de
                rupture tablette, ce qu'une valeur inline ne permettrait pas.
                Voir la note qui accompagne la règle. */}
            <SidebarProvider
                style={
                    {
                        '--sidebar-width': 'var(--admin-sidebar-width)',
                    } as CSSProperties
                }
            >
                <AdminSidebar isDark={isDark} onToggleTheme={toggleTheme} />

                <SidebarInset>
                    {/* Barre supérieure collante de 56px : repère de
                        navigation à gauche, outils transverses à droite. */}
                    <header className="border-border bg-background sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 md:px-6">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-1 data-[orientation=vertical]:h-4"
                        />

                        <Breadcrumb>
                            <BreadcrumbList className="text-sm">
                                <BreadcrumbItem className="hidden sm:block">
                                    {breadcrumbs.length === 0 ? (
                                        <BreadcrumbPage className="font-medium">
                                            Administration
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link
                                                href={route('admin.dashboard')}
                                            >
                                                Administration
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>

                                {breadcrumbs.map((crumb, i) => (
                                    <span
                                        key={`${crumb.label}-${i}`}
                                        className="contents"
                                    >
                                        <BreadcrumbSeparator className="hidden sm:block" />
                                        <BreadcrumbItem>
                                            {crumb.href &&
                                            i < breadcrumbs.length - 1 ? (
                                                <BreadcrumbLink asChild>
                                                    <Link href={crumb.href}>
                                                        {crumb.label}
                                                    </Link>
                                                </BreadcrumbLink>
                                            ) : (
                                                <BreadcrumbPage className="font-medium">
                                                    {crumb.label}
                                                </BreadcrumbPage>
                                            )}
                                        </BreadcrumbItem>
                                    </span>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className="ml-auto flex items-center gap-1.5">
                            <CommandSearchTrigger
                                onClick={() => setOpen(true)}
                            />

                            {actions}

                            <TopBarButton label="Notifications">
                                <Bell className="size-4" aria-hidden="true" />
                            </TopBarButton>

                            <TopBarButton
                                label={
                                    isDark
                                        ? 'Passer en thème clair'
                                        : 'Passer en thème sombre'
                                }
                                onClick={toggleTheme}
                            >
                                {isDark ? (
                                    <Sun
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Moon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                )}
                            </TopBarButton>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a
                                        href={route('home')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Voir le site public"
                                        className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 items-center justify-center"
                                    >
                                        <ExternalLink
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Voir le site public
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </header>

                    {/* Zone principale : rythme de 24px, largeur fluide. */}
                    <div className="flex w-full flex-1 flex-col space-y-6 p-4 md:p-6">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>

            <CommandPalette
                open={open}
                onOpenChange={setOpen}
                entries={entries}
            />
        </div>
    );
}

export default function AdminLayout(props: PropsWithChildren<Props>) {
    return <AdminShell {...props} />;
}
