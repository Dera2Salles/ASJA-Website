import Logo from '@/assets/Logo/asja-logo.png';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Building2,
    ChevronsUpDown,
    ExternalLink,
    FileText,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    PanelsTopLeft,
    User,
    Users,
} from 'lucide-react';

export const MENU_GROUPS = [
    {
        label: 'Pilotage',
        items: [
            {
                title: 'Tableau de bord',
                icon: LayoutDashboard,
                route: 'admin.dashboard',
            },
            {
                title: 'Publications',
                icon: FileText,
                route: 'admin.posts.index',
            },
        ],
    },
    {
        label: 'Contenu du site',
        items: [
            {
                title: 'Pages & sections',
                icon: PanelsTopLeft,
                route: 'admin.component-data.index',
            },
            {
                title: 'Mentions',
                icon: Building2,
                route: 'admin.departments.index',
            },
            {
                title: 'Témoignages',
                icon: MessageSquare,
                route: 'admin.testimonies.index',
            },
        ],
    },
    {
        label: 'Communauté',
        items: [
            { title: 'Étudiants', icon: Users, route: 'admin.students.index' },
        ],
    },
];

/** Une entrée est active sur sa propre page comme sur ses sous-pages. */
export function isRouteActive(name: string, url: string): boolean {
    try {
        if (route().current(name)) return true;
        const base = new URL(route(name)).pathname;
        return base !== '/admin' && url.startsWith(base);
    } catch {
        return false;
    }
}

export function AdminSidebar() {
    const { props, url } = usePage<PageProps>();
    const user = props.auth.user;

    const initials = (user?.name ?? '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('admin.dashboard')}>
                                <div className="bg-sidebar-accent flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <img
                                        src={Logo}
                                        alt=""
                                        className="size-6 object-contain"
                                    />
                                </div>
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate font-semibold">
                                        ASJA
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        Administration
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {MENU_GROUPS.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.route}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isRouteActive(
                                                item.route,
                                                url,
                                            )}
                                        >
                                            <Link href={route(item.route)}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent"
                                >
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg text-xs font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left leading-tight">
                                        <span className="truncate font-semibold">
                                            {user?.name}
                                        </span>
                                        <span className="text-muted-foreground truncate text-xs">
                                            {user?.email}
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
                                    <p className="text-sm font-semibold">
                                        {user?.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        Administrateur
                                    </p>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')}>
                                        <User className="size-4" />
                                        Mon profil
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <a
                                        href={route('home')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="size-4" />
                                        Voir le site
                                    </a>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() =>
                                        router.post(route('logout'))
                                    }
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
}
