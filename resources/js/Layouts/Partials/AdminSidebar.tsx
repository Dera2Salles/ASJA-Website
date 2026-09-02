import Logo from '@/assets/Logo/asja-logo.png';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Building2,
    ChevronRight,
    ChevronsUpDown,
    ExternalLink,
    FileText,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Moon,
    PanelsTopLeft,
    Sun,
    User,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export interface MenuItem {
    title: string;
    icon: LucideIcon;
    route: string;
    /** Déroule le sommaire du contenu du site sous l'entrée. */
    sections?: boolean;
}

export interface MenuGroup {
    label: string;
    items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
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
                /* Le sommaire du contenu (Accueil, Mission, Mentions…) se
                   déroule sous cette entrée : la barre latérale devient le
                   seul point de navigation, la page n'a plus son propre
                   sommaire en doublon. */
                sections: true,
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

/** Pli du sommaire du contenu, retenu d'une visite à l'autre. */
const SECTIONS_STORAGE_KEY = 'asja.admin.sidebar.sections';

/** Section du contenu actuellement ouverte, lue dans l'URL. */
function activeCmsSection(url: string, fallback: string | undefined) {
    const query = url.split('?')[1];
    const section = new URLSearchParams(query ?? '').get('section');
    return section || fallback;
}

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

export function AdminSidebar({
    isDark,
    onToggleTheme,
}: {
    isDark: boolean;
    onToggleTheme: () => void;
}) {
    const { props, url } = usePage<PageProps>();
    const user = props.auth.user;

    /* Le sommaire arrive par les props partagées : il est donc disponible
       depuis n'importe quelle page de l'administration, pas seulement depuis
       l'écran de contenu. */
    const cmsSections = Object.entries(props.cmsSections ?? {});
    const onCmsPage = isRouteActive('admin.component-data.index', url);
    const currentSection = activeCmsSection(url, cmsSections[0]?.[0]);

    /* Le sommaire est repliable. Il s'ouvre d'office en arrivant sur l'écran de
       contenu ; ailleurs, c'est le dernier choix de l'utilisateur qui décide.
       La lecture du stockage se fait après le montage, pour que le rendu initial ne
       dépende jamais d'une API absente en navigation privée. */
    const [sectionsOpen, setSectionsOpen] = useState(onCmsPage);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(SECTIONS_STORAGE_KEY);
            if (stored !== null) setSectionsOpen(stored === '1');
        } catch {
            /* Stockage indisponible : le pli vaut pour la session. */
        }
    }, []);

    useEffect(() => {
        if (onCmsPage) setSectionsOpen(true);
    }, [onCmsPage]);

    const toggleSections = (open: boolean) => {
        setSectionsOpen(open);
        try {
            window.localStorage.setItem(SECTIONS_STORAGE_KEY, open ? '1' : '0');
        } catch {
            /* Sans persistance, le pli vaut pour la session. */
        }
    };

    const initials = (user?.name ?? '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

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
                            <Link href={route('admin.dashboard')}>
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
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {MENU_GROUPS.map((group) => (
                    <SidebarGroup key={group.label} className="px-3">
                        <SidebarGroupLabel className="px-3">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const button = (
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className="h-9 text-sm"
                                            isActive={isRouteActive(
                                                item.route,
                                                url,
                                            )}
                                        >
                                            <Link href={route(item.route)}>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    );

                                    /* Entrée simple : un lien, rien de plus. */
                                    if (
                                        !item.sections ||
                                        cmsSections.length === 0
                                    ) {
                                        return (
                                            <SidebarMenuItem key={item.route}>
                                                {button}
                                            </SidebarMenuItem>
                                        );
                                    }

                                    /* Entrée à sommaire : le libellé reste un
                                       lien vers la page, seul le chevron plie
                                       et déplie la liste des sections. Les deux
                                       gestes restent ainsi distincts. */
                                    return (
                                        <Collapsible
                                            key={item.route}
                                            asChild
                                            open={sectionsOpen}
                                            onOpenChange={toggleSections}
                                        >
                                            <SidebarMenuItem>
                                                {button}

                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuAction
                                                        aria-label={
                                                            sectionsOpen
                                                                ? 'Replier les sections'
                                                                : 'Déplier les sections'
                                                        }
                                                        className="top-2 data-[state=open]:rotate-90"
                                                    >
                                                        <ChevronRight />
                                                    </SidebarMenuAction>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {cmsSections.map(
                                                            ([key, label]) => (
                                                                <SidebarMenuSubItem
                                                                    key={key}
                                                                >
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={
                                                                            onCmsPage &&
                                                                            key ===
                                                                                currentSection
                                                                        }
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                'admin.component-data.index',
                                                                                {
                                                                                    section:
                                                                                        key,
                                                                                },
                                                                            )}
                                                                            preserveScroll
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    label
                                                                                }
                                                                            </span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ),
                                                        )}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                })}
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
                                    className="hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent h-12"
                                >
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left leading-tight">
                                        <span className="text-sidebar-foreground truncate text-sm font-medium">
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
