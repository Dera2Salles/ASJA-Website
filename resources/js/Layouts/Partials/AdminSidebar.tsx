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

/* ── Vocabulaire visuel de la barre latérale ──────────────────────────────────
   `admin-nav-item`, `admin-nav-sub` et `admin-nav-group-label` sont définies
   dans `app.css`. Elles ne peuvent pas être écrites en utilitaires ici :
   `SidebarMenuButton` fait passer sa `className` par `twMerge`, qui n'apparie
   pas les variantes `data-[active=true]:` et supprimait donc les surcharges
   d'état avant le rendu. Voir la note qui accompagne les règles. */

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
            {/* Le filet sous l'en-tête détache l'identité de la navigation :
                les trois zones (identité, navigation, compte) se lisent alors
                comme trois blocs et non comme une seule colonne continue. */}
            <SidebarHeader className="border-sidebar-border border-b p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-sidebar-accent/50 h-13 gap-3"
                        >
                            <Link href={route('admin.dashboard')}>
                                <div className="border-sidebar-border bg-card flex aspect-square size-9 shrink-0 items-center justify-center border">
                                    <img
                                        src={Logo}
                                        alt=""
                                        className="size-6 object-contain"
                                    />
                                </div>
                                <div className="grid flex-1 gap-0.5 text-left">
                                    <span className="font-display text-sidebar-foreground truncate text-[15px] leading-none font-bold tracking-tight">
                                        ASJA
                                    </span>
                                    <span className="text-sidebar-foreground/45 truncate text-[10px] leading-none font-semibold tracking-[0.14em] uppercase">
                                        Administration
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* `scrollbar-hairline` : la navigation défile indépendamment de
                l'en-tête et du pied, sans la large barre native. */}
            <SidebarContent className="scrollbar-hairline gap-0 py-2">
                {MENU_GROUPS.map((group) => (
                    <SidebarGroup
                        key={group.label}
                        className="px-3 py-0 first:mt-0 [&+&]:mt-4"
                    >
                        <SidebarGroupLabel className="admin-nav-group-label px-3">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-0.5">
                                {group.items.map((item) => {
                                    const button = (
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className="admin-nav-item"
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
                                                        className="text-sidebar-foreground/45 hover:text-sidebar-foreground top-2 transition-transform duration-200 data-[state=open]:rotate-90"
                                                    >
                                                        <ChevronRight />
                                                    </SidebarMenuAction>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    {/* Rail aligné sur l'axe
                                                        des icônes parentes,
                                                        pour que la filiation
                                                        se lise sans ambiguïté. */}
                                                    <SidebarMenuSub className="admin-nav-rail mx-0 mt-1 ml-[1.4rem] gap-0.5 py-0 pr-0 pl-3">
                                                        {cmsSections.map(
                                                            ([key, label]) => (
                                                                <SidebarMenuSubItem
                                                                    key={key}
                                                                >
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        className="admin-nav-sub"
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
                                                                            /* Filet de sécurité : si un
                                                                               libellé venait malgré tout
                                                                               à dépasser, son intitulé
                                                                               complet reste lisible au
                                                                               survol. */
                                                                            title={String(
                                                                                label,
                                                                            )}
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

            {/* Le pied ne défile pas avec la navigation : le compte reste
                atteignable quelle que soit la position dans la liste. */}
            <SidebarFooter className="border-sidebar-border border-t p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent/60 h-13 gap-3"
                                >
                                    <Avatar className="size-9">
                                        <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 gap-0.5 text-left">
                                        <span className="text-sidebar-foreground truncate text-[13.5px] leading-none font-semibold">
                                            {user?.name}
                                        </span>
                                        <span className="text-sidebar-foreground/50 truncate text-[11.5px] leading-none">
                                            {user?.email}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="text-sidebar-foreground/40 ml-auto size-4 shrink-0" />
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
