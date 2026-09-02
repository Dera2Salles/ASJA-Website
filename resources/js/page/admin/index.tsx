import {
    CommandPalette,
    useCommandPalette,
    type CommandEntry,
} from '@/components/admin/command-palette';
import { useAdminTheme } from '@/components/admin/use-admin-theme';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { AppSidebar } from '@/page/admin/components/app-sidebar';
import { useState, type JSX } from 'react';
import { AdminDashBoardProvider } from './bloc/useAdminDasboardPortalProvider';
import { Modalprovider } from './bloc/useModalProvider';
import { NavBar } from './components/nav-bar';
import { ADMIN_NAV_GROUPS, ADMIN_PAGE_TITLES } from './nav-config';
import { Dashboard } from './page/dashboard';
import { Doclist } from './page/doc-list';
import { Loglist } from './page/log-list';
import { Postlist } from './page/post-list';
import { Studentlist } from './page/student-list';

export { ADMIN_PAGE_TITLES };

export const AdminDashboardPage = () => {
    const [index, setIndex] = useState<number>(0);
    const { isDark, toggleTheme } = useAdminTheme();
    const { open, setOpen } = useCommandPalette();

    const page: JSX.Element[] = [
        <Dashboard />,
        <Studentlist />,
        <Doclist />,
        <Postlist />,
        <Loglist />,
    ];

    const entries: CommandEntry[] = ADMIN_NAV_GROUPS.flatMap((group) =>
        group.items.map((item) => ({
            id: `${group.label}-${item.page}`,
            label: item.title,
            icon: item.icon,
            group: group.label,
            onSelect: () => setIndex(item.page),
        })),
    );

    return (
        <AdminDashBoardProvider>
            <Modalprovider>
                {/* `admin-shell` porte la palette monochrome de design.md ;
                    `app-shell` ne sert plus qu'à lever les remises à zéro
                    brutalistes du site public dont dépendent les composants
                    shadcn. */}
                <div className={cn('admin-shell app-shell', isDark && 'dark')}>
                    <SidebarProvider>
                        <AppSidebar
                            activeIndex={index}
                            changePage={setIndex}
                            isDark={isDark}
                            onToggleTheme={toggleTheme}
                        />

                        <SidebarInset className="overflow-hidden">
                            <NavBar
                                title={ADMIN_PAGE_TITLES[index]}
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                                onOpenSearch={() => setOpen(true)}
                            />
                            <div className="flex-1 overflow-y-auto">
                                {page[index]}
                            </div>
                        </SidebarInset>
                    </SidebarProvider>

                    <CommandPalette
                        open={open}
                        onOpenChange={setOpen}
                        entries={entries}
                    />
                </div>
            </Modalprovider>
        </AdminDashBoardProvider>
    );
};
