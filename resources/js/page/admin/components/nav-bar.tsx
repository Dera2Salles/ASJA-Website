import { SidebarTrigger } from '@/components/ui/sidebar';

import { useTheme } from '@/page/theme/useTheme';
import { Moon, Sun } from 'lucide-react';
import { useAdminDashboardContext } from '../bloc/useAdminContext';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DropButton = ({ name }: { name: string }) => {
    return (
        <div className="flex w-full items-center justify-between gap-2 rounded-2xl py-2">
            {' '}
            <Avatar className="size-11">
                <AvatarFallback className="dark:bg-zinc-600 dark:text-white">
                    <AvatarImage src={name} />
                </AvatarFallback>
            </Avatar>
        </div>
    );
};

export const NavBar = () => {
    const { adminData } = useAdminDashboardContext();
    const { toggleTheme, isDark } = useTheme();
    return (
        <header className="flex h-15 shrink-0 items-center gap-2 border-b transition-all duration-500 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 dark:bg-zinc-800">
            <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
                <section className="flex items-center gap-5">
                    {' '}
                    <SidebarTrigger className="-ml-1 text-green-700 hover:text-green-700" />
                    <p className="hidden font-semibold md:flex">
                        Administrateur : {adminData?.name}
                    </p>
                </section>

                <div className="mr-5 flex items-center justify-end">
                    <div className="flex">
                        <button
                            className="cursor-pointer px-5 text-green-700"
                            onClick={toggleTheme}
                        >
                            {isDark ? <Sun /> : <Moon />}
                        </button>
                    </div>
                    <DropButton name={adminData?.name as string} />
                </div>
            </div>
        </header>
    );
};
