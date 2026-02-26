'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import Logo from '@/assets/Logo/asja-logo.png';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import type { Dispatch, SetStateAction } from 'react';
import {
    MdBarChart,
    MdExitToApp,
    MdFileOpen,
    MdNewspaper,
    MdPeople,
    MdSyncLock,
} from 'react-icons/md';

import { useAdminDashboardContext } from '../bloc/useAdminContext';

export const AppSidebar = ({
    changePage,
}: {
    changePage: Dispatch<SetStateAction<number>>;
}) => {
    const data = {
        navMain: [
            {
                title: 'Statistique des étudiants',
                url: '#',
                icon: MdBarChart,
                click: changePage,
            },

            {
                title: 'Liste des étudiants',
                url: '#',
                icon: MdPeople,
                click: changePage,
            },
            {
                title: 'Liste des document',
                url: '#',
                icon: MdFileOpen,
                click: changePage,
            },

            {
                title: 'Annonce',
                url: '#',
                icon: MdNewspaper,
                click: changePage,
            },
            {
                title: 'Historique',
                url: '#',
                icon: MdSyncLock,
                click: changePage,
            },
        ],
    };
    const { logOut } = useAdminDashboardContext();

    const handleLogout = () => {
        logOut();
    };

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="h-15 hover:bg-transparent"
                        >
                            <a
                                className="flex cursor-pointer"
                                onClick={() => (window.location.href = '/')}
                            >
                                <img className="h-14 w-14" src={Logo} />
                                <h1 className="mt-1 py-5 font-semibold text-gray-900 dark:text-white">
                                    Université ASJA
                                </h1>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent className="flex flex-col gap-2">
                        <SidebarMenu>
                            {data.navMain.map((item, index) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer bg-transparent p-6 hover:bg-transparent"
                >
                    <p className="flex items-center gap-1 text-xl text-red-600">
                        {' '}
                        <MdExitToApp /> Se deconnecter
                    </p>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
};
