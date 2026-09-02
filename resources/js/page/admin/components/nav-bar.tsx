import { CommandSearchTrigger } from '@/components/admin/command-palette';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Bell, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAdminDashboardContext } from '../bloc/useAdminContext';

/** Bouton d'icône de la barre supérieure : neutre, carré, toujours nommé. */
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

export const NavBar = ({
    title,
    isDark,
    onToggleTheme,
    onOpenSearch,
}: {
    title: string;
    isDark: boolean;
    onToggleTheme: () => void;
    onOpenSearch: () => void;
}) => {
    const { adminData } = useAdminDashboardContext();

    const initials = adminData
        ? `${adminData.name?.[0] ?? ''}${adminData.lastName?.[0] ?? ''}`.toUpperCase()
        : 'AD';

    return (
        <header className="border-border bg-background sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
                orientation="vertical"
                className="mr-1 data-[orientation=vertical]:h-4"
            />

            <Breadcrumb>
                <BreadcrumbList className="text-sm">
                    <BreadcrumbItem className="hidden sm:block">
                        Administration
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden sm:block" />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="font-medium">
                            {title}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-1.5">
                <CommandSearchTrigger onClick={onOpenSearch} />

                <TopBarButton label="Notifications">
                    <Bell className="size-4" aria-hidden="true" />
                </TopBarButton>

                <TopBarButton
                    label={
                        isDark
                            ? 'Passer en thème clair'
                            : 'Passer en thème sombre'
                    }
                    onClick={onToggleTheme}
                >
                    {isDark ? (
                        <Sun className="size-4" aria-hidden="true" />
                    ) : (
                        <Moon className="size-4" aria-hidden="true" />
                    )}
                </TopBarButton>

                <Avatar className="ml-1 size-8">
                    <AvatarImage src={adminData?.imageUrl} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
};
