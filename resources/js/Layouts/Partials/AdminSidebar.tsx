import Logo from '@/assets/Logo/asja-logo.png';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Building2,
    ChevronRight,
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
                title: 'Blog / Actualités',
                icon: FileText,
                href: 'admin.blog.index',
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
                title: 'Départements',
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
                'relative sticky top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-500 ease-in-out dark:border-zinc-800 dark:bg-zinc-950',
                isCollapsed ? 'w-24' : 'w-80',
            )}
        >
            {}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-12 -right-3 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all hover:text-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:text-green-400"
            >
                {isCollapsed ? (
                    <PanelLeftOpen size={14} />
                ) : (
                    <PanelLeftClose size={14} />
                )}
            </button>

            {}
            <div
                className={cn(
                    'flex h-24 items-center px-6 transition-all duration-500',
                    isCollapsed ? 'justify-center' : 'justify-start gap-3',
                )}
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 p-2 shadow-inner dark:bg-green-900/20">
                    <img
                        src={Logo}
                        alt="ASJA Logo"
                        className="h-full w-full object-contain"
                    />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col overflow-hidden"
                    >
                        <span className="text-lg leading-tight font-black tracking-tight text-gray-900 dark:text-white">
                            ASJA
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-green-600 uppercase dark:text-green-400">
                            Administration
                        </span>
                    </motion.div>
                )}
            </div>

            {}
            <nav className="scrollbar-none flex-1 space-y-8 overflow-x-hidden overflow-y-auto px-4 py-4">
                {MENU_ITEMS.map((group, idx) => (
                    <div key={idx} className="space-y-2">
                        {!isCollapsed && (
                            <p className="px-4 text-[10px] font-black tracking-[2px] text-gray-400 uppercase dark:text-zinc-600">
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
                                            'group relative flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300',
                                            isActive
                                                ? 'bg-green-50 text-green-700 shadow-sm shadow-green-900/5 dark:bg-green-900/10 dark:text-green-400'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-500 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200',
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
                                                isActive
                                                    ? 'text-green-600 dark:text-green-500'
                                                    : 'group-hover:text-green-500',
                                            )}
                                        />

                                        {!isCollapsed && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="ml-4 flex flex-1 items-center justify-between"
                                            >
                                                <span className="text-sm font-bold tracking-tight">
                                                    {item.title}
                                                </span>
                                                {isActive && (
                                                    <ChevronRight
                                                        size={14}
                                                        className="text-green-600/50"
                                                    />
                                                )}
                                            </motion.div>
                                        )}

                                        {}
                                        {isCollapsed && (
                                            <div className="absolute left-full z-50 ml-4 hidden rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold whitespace-nowrap text-white shadow-xl group-hover:block">
                                                {item.title}
                                            </div>
                                        )}

                                        {}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-nav-indicator"
                                                className="absolute left-0 h-8 w-1.5 rounded-r-full bg-green-600 shadow-[0_0_10px_rgba(22,163,74,0.4)] dark:bg-green-500"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {}
            <div className="border-t border-gray-100 p-4 dark:border-zinc-900">
                <div
                    className={cn(
                        'flex flex-col gap-2 rounded-3xl border border-gray-100 bg-gray-50/50 p-2 transition-all dark:border-zinc-800/50 dark:bg-zinc-900/30',
                        isCollapsed ? 'items-center' : 'items-stretch',
                    )}
                >
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 p-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white text-green-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-green-400">
                                <User size={22} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="mb-1 truncate text-sm leading-none font-black text-gray-900 dark:text-white">
                                    {user?.name}
                                </p>
                                <p className="truncate text-[10px] font-bold tracking-tighter text-gray-400 uppercase">
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
                                'flex h-11 items-center justify-center rounded-2xl border border-transparent text-gray-500 transition-all hover:border-gray-100 hover:bg-white hover:text-green-600 hover:shadow-sm dark:hover:border-zinc-700 dark:hover:bg-zinc-800',
                                isCollapsed ? 'w-11' : 'flex-1',
                            )}
                            title="Voir le site"
                        >
                            <Home size={18} />
                        </Link>

                        <button
                            onClick={() => router.post(route('logout'))}
                            className={cn(
                                'flex h-11 items-center justify-center rounded-2xl border border-transparent bg-white/50 text-gray-500 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-transparent dark:hover:border-rose-900/30 dark:hover:bg-rose-950/20',
                                isCollapsed ? 'w-11' : 'flex-1 gap-2',
                            )}
                        >
                            <LogOut size={18} />
                            {!isCollapsed && (
                                <span className="text-xs font-black tracking-wider uppercase">
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
