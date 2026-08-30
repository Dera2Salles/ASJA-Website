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
import { useThemeContext } from '@/page/theme/useThemeContext';
import { ThemeProvider } from '@/page/theme/useThemeProvider';
import { Link } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { PropsWithChildren, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AdminSidebar } from './Partials/AdminSidebar';

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

const ThemeToggle = () => {
    const { toggleTheme, isDark } = useThemeContext();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-md"
        >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
    );
};

function AdminShell({
    breadcrumbs = [],
    actions,
    children,
}: PropsWithChildren<Props>) {
    return (
        <SidebarProvider>
            <AdminSidebar />

            <SidebarInset>
                {/* Barre supérieure collante : le repère de navigation et les
                    actions de la page restent atteignables au défilement. */}
                <header className="bg-background/80 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-sm">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-1 data-[orientation=vertical]:h-4"
                    />

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden sm:block">
                                {breadcrumbs.length === 0 ? (
                                    <BreadcrumbPage>
                                        Administration
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={route('admin.dashboard')}>
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
                                            <BreadcrumbPage>
                                                {crumb.label}
                                            </BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                </span>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="ml-auto flex items-center gap-2">
                        {actions}
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function AdminLayout(props: PropsWithChildren<Props>) {
    return (
        // `app-shell` lève, pour l'administration uniquement, les remises à
        // zéro brutalistes du site public (angles droits, absence d'ombre et
        // de transition) dont dépendent les composants shadcn.
        <ThemeProvider>
            <div className="app-shell">
                <Toaster position="top-right" />
                <AdminShell {...props} />
            </div>
        </ThemeProvider>
    );
}
