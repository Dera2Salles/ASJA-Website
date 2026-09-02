'use client';

import Logo from '@/assets/Logo/asja-logo.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { ChevronsUpDown, ExternalLink, LogOut, Moon, Sun } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { ADMIN_NAV_GROUPS } from '../nav-config';

export const AppSidebar = ({
    changePage,
    activeIndex,
    isDark,
    onToggleTheme,
}: {
    changePage: Dispatch<SetStateAction<number>>;
    activeIndex: number;
    isDark: boolean;
    onToggleTheme: () => void;
}) => {
    const { logOut, adminData } = useAdminDashboardContext();

    const fullName = adminData
        ? `${adminData.name} ${adminData.lastName ?? ''}`.trim()
        : 'Administrateur';

    const initials = fullName.slice(0, 2).toUpperCase();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-sidebar-accent h-14"
                        >
                            <a href="/">
                                <div className="border-border bg-card flex aspect-square size-8 items-center justify-center border">
                                    <img
                                        src={Logo}
                                        alt=""
                                        className="size-5 object-contain"
                                    />
                                </div>
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="text-sidebar-foreground truncate text-sm font-semibold">
                                        ASJA
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        Administration
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {ADMIN_NAV_GROUPS.map((group) => (
                    <SidebarGroup key={group.label} className="px-3">
                        <SidebarGroupLabel className="px-3">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={activeIndex === item.page}
                                            onClick={() =>
                                                changePage(item.page)
                                            }
                                            className="h-9 cursor-pointer text-sm"
                                        >
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent h-12 cursor-pointer"
                                >
                                    <Avatar className="size-8">
                                        <AvatarImage
                                            src={adminData?.imageUrl}
                                        />
                                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left leading-tight">
                                        <span className="text-sidebar-foreground truncate text-sm font-medium">
                                            {fullName}
                                        </span>
                                        <span className="text-muted-foreground truncate text-xs">
                                            Administrateur
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="right"
                                align="end"
                                className="w-56"
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <p className="text-sm font-medium">
                                        {fullName}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        Administrateur
                                    </p>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <a
                                        href="/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="size-4" />
                                        Voir le site
                                    </a>
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={onToggleTheme}>
                                    {isDark ? (
                                        <Sun className="size-4" />
                                    ) : (
                                        <Moon className="size-4" />
                                    )}
                                    {isDark ? 'Thème clair' : 'Thème sombre'}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={logOut}
                                >
                                    <LogOut className="size-4" />
                                    Se déconnecter
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
};
