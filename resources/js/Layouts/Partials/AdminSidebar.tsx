import Logo from '@/assets/Logo/asja-logo.png';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Building2,
    FileText,
    Home,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const MENU_ITEMS = [
    {
        group: 'Principal',
        items: [
            {
                title: 'Tableau de bord',
                icon: LayoutDashboard,
                href: 'admin.dashboard',
            },
            {
                title: 'Publications',
                icon: FileText,
                href: 'admin.posts.index',
            },
        ],
    },
    {
        group: 'Gestion',
        items: [
            {
                title: 'Témoignages',
                icon: MessageSquare,
                href: 'admin.testimonies.index',
            },
            {
                title: 'Étudiants',
                icon: Users,
                href: 'admin.students.index',
            },
            {
                title: 'Mentions',
                icon: Building2,
                href: 'admin.departments.index',
            },
        ],
    },
    {
        group: 'Contenu',
        items: [
            {
                title: 'Contenu du site',
                icon: Home,
                href: 'admin.component-data.index',
            },
        ],
    },
    {
        group: 'Personnel',
        items: [
            {
                title: 'Mon Profil',
                icon: User,
                href: 'profile.edit',
            },
        ],
    },
];

export function AdminSidebar() {
    const { props, url } = usePage<PageProps>();
    const user = props.auth.user;
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isRouteActive = (href: string) => {
        try {
            return (
                route().current(href) ||
                url.startsWith(route(href).replace(window.location.origin, ''))
            );
        } catch (e) {
            return false;
        }
    };

    return (
        <aside
            className={cn(
                'band-dark border-border relative sticky top-0 z-40 flex h-screen flex-col border-r',
                isCollapsed ? 'w-24' : 'w-80',
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground absolute top-12 -right-3 z-50 flex h-8 w-8 items-center justify-center border"
            >
                {isCollapsed ? (
                    <PanelLeftOpen size={14} />
                ) : (
                    <PanelLeftClose size={14} />
                )}
            </button>

            <div
                className={cn(
                    'border-border flex h-20 items-center border-b px-6',
                    isCollapsed ? 'justify-center' : 'justify-start gap-3',
                )}
            >
                <div className="border-border bg-primary flex h-10 w-10 shrink-0 items-center justify-center border p-1">
                    <img
                        src={Logo}
                        alt="ASJA Logo"
                        className="h-full w-full object-contain"
                    />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-foreground text-base leading-tight font-bold tracking-tight">
                            ASJA
                        </span>
                        <span className="text-primary font-mono text-[10px] font-bold tracking-wider uppercase">
                            Administration
                        </span>
                    </div>
                )}
            </div>

            <nav className="scrollbar-none flex-1 space-y-8 overflow-x-hidden overflow-y-auto px-4 py-4">
                {MENU_ITEMS.map((group, idx) => (
                    <div key={idx} className="space-y-2">
                        {!isCollapsed && (
                            <p className="text-muted-foreground px-4 font-mono text-[10px] font-bold tracking-wider uppercase">
                                {group.group}
                            </p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = isRouteActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={route(item.href)}
                                        className={cn(
                                            'group border-border relative flex items-center border px-4 py-3',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border-transparent text-foreground hover:border-border hover:bg-accent hover:text-accent-foreground',
                                        )}
                                    >
                                        <item.icon className="h-5 w-5 shrink-0" />

                                        {!isCollapsed && (
                                            <span className="ml-4 flex-1 text-sm font-bold tracking-tight">
                                                {item.title}
                                            </span>
                                        )}

                                        {isCollapsed && (
                                            <div className="border-border bg-background text-foreground absolute left-full z-50 ml-2 hidden border px-3 py-2 text-xs font-bold whitespace-nowrap group-hover:block">
                                                {item.title}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-border border-t p-4">
                <div
                    className={cn(
                        'border-border flex flex-col gap-2 border p-2',
                        isCollapsed ? 'items-center' : 'items-stretch',
                    )}
                >
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 p-3">
                            <div className="border-border text-primary flex h-10 w-10 shrink-0 items-center justify-center border">
                                <User size={20} strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-foreground mb-1 truncate text-sm leading-none font-bold">
                                    {user?.name}
                                </p>
                                <p className="text-muted-foreground truncate font-mono text-[10px] font-bold tracking-tight uppercase">
                                    Administrateur
                                </p>
                            </div>
                        </div>
                    )}

                    <div
                        className={cn(
                            'flex gap-1',
                            isCollapsed ? 'flex-col' : 'flex-row',
                        )}
                    >
                        <Link
                            href={route('home')}
                            className={cn(
                                'border-border text-foreground hover:bg-primary hover:text-primary-foreground flex h-10 items-center justify-center border',
                                isCollapsed ? 'w-10' : 'flex-1',
                            )}
                            title="Voir le site"
                        >
                            <Home size={18} />
                        </Link>

                        <button
                            onClick={() => router.post(route('logout'))}
                            className={cn(
                                'border-border text-foreground hover:bg-destructive hover:text-destructive-foreground flex h-10 items-center justify-center border',
                                isCollapsed ? 'w-10' : 'flex-1 gap-2',
                            )}
                        >
                            <LogOut size={18} />
                            {!isCollapsed && (
                                <span className="font-mono text-xs font-bold tracking-wide uppercase">
                                    Sortir
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
