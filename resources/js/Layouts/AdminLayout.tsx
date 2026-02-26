import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Building2, FileText, Home, LayoutDashboard, LogOut, MessageSquare, Settings, Users } from 'lucide-react';
import { PropsWithChildren } from 'react';

const navItems = [
    { label: 'Témoignages', route: 'admin.testimonies.index', icon: MessageSquare },
    { label: 'Contenu du site', route: 'admin.component-data.index', icon: Settings },
    { label: 'Blog / Actualités', route: 'admin.blog.index', icon: FileText },
    { label: 'Étudiants', route: 'admin.students.index', icon: Users },
    { label: 'Départements', route: 'admin.departments.index', icon: Building2 },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gray-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">ASJA Admin</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = url.startsWith(
                            route(item.route).replace(window.location.origin, '')
                        );
                        return (
                            <Link
                                key={item.route}
                                href={route(item.route)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-800 space-y-1">
                    <Link
                        href={route('home')}
                        className="flex items-center gap-3 text-sm text-gray-500 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                        <Home className="w-4 h-4" />
                        Voir le site
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-3 w-full text-sm text-gray-500 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
