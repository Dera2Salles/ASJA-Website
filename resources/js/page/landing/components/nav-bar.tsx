import Logo from '@/assets/Logo/asja-logo.png';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useLangue } from '@/page/lang/useLang';
import { useThemeContext } from '@/page/theme/useThemeContext';
import { Link as InertiaLink, usePage } from '@inertiajs/react';
import { LogIn, MenuIcon, Moon, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link as ScrollTo } from 'react-scroll';
import { useScrollLock } from '../hooks/useScrollLock';
import { AnnonceSection } from './annonce-section';

const homeSections = [
    { to: 'description', key: 'sectionAccueilNavbar.description' },
    { to: 'mission', key: 'sectionAccueilNavbar.mission' },
    { to: 'filiere', key: 'sectionAccueilNavbar.filieres' },
    { to: 'events', key: 'sectionAccueilNavbar.events' },
    { to: 'systeme', key: 'sectionAccueilNavbar.systeme' },
    { to: 'temoignages', key: 'sectionAccueilNavbar.temoignages' },
    { to: 'FAQ', key: 'sectionAccueilNavbar.FAQ' },
];

type Department = { id: number; slug: string; name: string };

/**
 * Les mentions viennent de la base : les slugs sont donc toujours ceux qui
 * existent réellement. L'ancienne liste écrite en dur pointait vers deux
 * adresses inexistantes (404).
 */
function useDepartments(): Department[] {
    const { departments } = usePage().props as unknown as {
        departments?: Department[];
    };
    return departments ?? [];
}

const menuItemClass =
    'block w-full cursor-pointer px-4 py-2.5 text-left text-sm font-semibold text-foreground hover:text-primary hover:bg-accent rounded-lg';

const triggerClass =
    'bg-transparent text-sm font-semibold text-foreground hover:text-primary hover:bg-transparent rounded-full px-4 py-2';

/**
 * Navigation unique du site — style "C Vivant".
 *
 * Barre sticky translucide avec backdrop-blur, boutons pill, CTA vert.
 */
export const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { toggleTheme, isDark } = useThemeContext();
    const { translate } = useLangue();

    useEffect(() => {
        const handleResize = () => {
            // 1024 px : le point exact où le tiroir cède la place à la
            // navigation bureau (`lg:hidden`). À 768, il se refermait alors
            // que le hamburger était encore le seul accès au menu.
            if (window.innerWidth >= 1024) setOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useScrollLock(open);

    return (
        <>
            <AnnonceSection />

            <nav
                className="border-border sticky top-0 z-50 border-b"
                style={{
                    background: 'rgba(20, 27, 23, 0.86)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                }}
            >
                <div className="section-shell flex items-center justify-between gap-4 py-3 sm:gap-9 sm:py-4">
                    {/* Logo */}
                    <InertiaLink
                        href="/"
                        className="flex shrink-0 items-center gap-3"
                        aria-label="Accueil ASJA"
                    >
                        <img
                            src={Logo}
                            alt=""
                            className="h-10 w-10 rounded-[10px] object-contain sm:h-[42px] sm:w-[42px]"
                        />
                        <span className="font-display text-foreground hidden text-[19px] font-black tracking-[-0.02em] uppercase sm:block">
                            Université ASJA
                        </span>
                    </InertiaLink>

                    {/* Liens desktop */}
                    <div className="hidden items-center gap-1 lg:flex">
                        <DesktopNav />
                    </div>

                    {/* Actions droite */}
                    <div className="flex shrink-0 items-center gap-2.5">
                        <InertiaLink
                            href="/login"
                            className="border-border text-foreground hover:border-primary hover:text-primary hidden items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold sm:inline-flex"
                        >
                            <LogIn size={14} />
                            Espace étudiant
                        </InertiaLink>

                        <InertiaLink
                            href="/login"
                            className="bg-primary text-primary-foreground hidden rounded-full px-5 py-2.5 text-[13.5px] font-bold hover:bg-white hover:text-black sm:inline-flex"
                        >
                            Je candidate
                        </InertiaLink>

                        <button
                            onClick={() => setOpen(true)}
                            className="border-border text-foreground hover:border-primary hover:text-primary flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border lg:hidden"
                            aria-label="Ouvrir le menu"
                        >
                            <MenuIcon size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <MobileNav open={open} setOpen={setOpen} />
        </>
    );
};

const ThemeToggle = ({
    isDark,
    onToggle,
}: {
    isDark: boolean;
    onToggle: () => void;
}) => (
    <button
        onClick={onToggle}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        className="border-border text-foreground hover:border-primary hover:text-primary cursor-pointer rounded-full border p-2.5"
    >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
);

const DesktopNav = () => {
    const { translate } = useLangue();
    const departments = useDepartments();
    const isHomePage = usePage().url.split('?')[0] === '/';

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavItem
                    trigger={translate('navBar.accueil')}
                    className={triggerClass}
                >
                    {homeSections.map((item) =>
                        isHomePage ? (
                            <ScrollLink key={item.to} to={item.to}>
                                {translate(item.key)}
                            </ScrollLink>
                        ) : (
                            <InertiaLink
                                key={item.to}
                                href={`/#${item.to}`}
                                className={menuItemClass}
                            >
                                {translate(item.key)}
                            </InertiaLink>
                        ),
                    )}
                </NavItem>

                <NavItem
                    trigger={translate('navBar.filieres')}
                    className={triggerClass}
                >
                    {departments.map((dept) => (
                        <InertiaLink
                            key={dept.id}
                            href={`/mention/${dept.slug}`}
                            className={menuItemClass}
                        >
                            {dept.name}
                        </InertiaLink>
                    ))}
                </NavItem>

                <NavigationMenuItem>
                    <InertiaLink
                        href="/actualites"
                        className={`inline-flex h-10 items-center ${triggerClass}`}
                    >
                        {translate('navBar.blog')}
                    </InertiaLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    {isHomePage ? (
                        <ScrollLink
                            to="contact"
                            className={`inline-flex h-10 cursor-pointer items-center ${triggerClass}`}
                        >
                            {translate('navBar.contact')}
                        </ScrollLink>
                    ) : (
                        <InertiaLink
                            href="/#contact"
                            className={`inline-flex h-10 items-center ${triggerClass}`}
                        >
                            {translate('navBar.contact')}
                        </InertiaLink>
                    )}
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

/**
 * Une entrée de navigation du tiroir.
 *
 * L'arborescence (`├`, `└`) est dessinée par deux pseudo-éléments portés par
 * l'entrée elle-même, et non par une bordure posée sur le conteneur : le rail
 * vertical fait toute la hauteur de l'entrée — la moitié seulement sur la
 * dernière, ce qui ferme la branche — et la petite barre horizontale se cale
 * sur son axe. Le trait suit donc les entrées qui passent sur deux lignes,
 * ce qu'une bordure de conteneur à hauteur fixe ne saurait pas faire.
 */
const drawerLinkClass =
    'text-muted-foreground hover:text-foreground relative flex min-h-[40px] cursor-pointer items-center pl-4 text-sm transition-colors' +
    // Le rail et les fourches sont tirés de `--foreground` et non de
    // `--border` : sur l'aplat sombre du tiroir, #23302a plafonne à 1,3:1 de
    // contraste, l'arborescence y était invisible. Les fourches sont un cran
    // plus claires que le rail pour qu'on lise la branche, pas une grille.
    ' before:absolute before:top-0 before:left-0 before:h-full before:w-px before:bg-[color-mix(in_srgb,var(--foreground)_15%,transparent)] before:content-[""]' +
    ' last:before:h-1/2' +
    ' after:absolute after:top-1/2 after:left-0 after:h-px after:w-2.5 after:bg-[color-mix(in_srgb,var(--foreground)_26%,transparent)] after:transition-colors after:content-[""] hover:after:bg-[var(--primary)]';

/** Lien de pied de tiroir : compact, mais 46 px de haut sous le pouce. */
/** Base des deux actions du pied : compactes, mais 44 px sous le pouce. */
const drawerCtaClass =
    'flex min-h-[44px] items-center justify-center gap-2 rounded-full text-[11px] font-bold tracking-[0.06em] whitespace-nowrap uppercase transition-colors';

const MobileNav = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const { translate } = useLangue();
    const departments = useDepartments();
    const isHomePage = usePage().url.split('?')[0] === '/';
    const close = () => setOpen(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Échap ferme le panneau, et le focus part sur la croix à l'ouverture :
    // sans ça, la tabulation continuait dans la page restée derrière.
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        window.addEventListener('keydown', onKeyDown);
        const id = window.setTimeout(() => closeButtonRef.current?.focus(), 60);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.clearTimeout(id);
        };
    }, [open, setOpen]);

    return (
        // Le panneau reste monté : c'est ce qui permet au `translate` de
        // s'animer. Auparavant, `hidden`/`block` basculait en même temps que
        // la transformation — l'ouverture était donc instantanée, sans
        // aucune animation visible.
        <div
            className={`fixed inset-0 z-[60] lg:hidden ${
                open ? 'visible' : 'invisible delay-300'
            }`}
            aria-hidden={!open}
        >
            {/* Voile : assez dense pour que la page ne concurrence plus le
                panneau, avec un flou léger qui garde le contexte lisible. */}
            <div
                onClick={close}
                className={`absolute inset-0 bg-black/70 backdrop-blur-[3px] transition-opacity duration-300 ease-out ${
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navigation"
                className={`border-border bg-background absolute top-0 right-0 flex h-full flex-col border-l transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
                // Le panneau s'ouvre par la droite, du côté du hamburger et du
                // pouce. Sa largeur suit l'écran mais s'arrête à 340 px : au
                // delà, un tiroir de navigation devient une colonne vide.
                style={{ width: 'clamp(260px, 80vw, 340px)' }}
            >
                {/* ── En-tête ── */}
                <div className="border-border flex shrink-0 items-center justify-between border-b py-3.5 pr-3 pl-5">
                    <span className="font-display text-foreground text-[13px] font-bold tracking-[0.14em] uppercase">
                        Menu
                    </span>
                    <button
                        ref={closeButtonRef}
                        onClick={close}
                        aria-label="Fermer le menu"
                        // L'icône reste à 18 px ; c'est le bouton qui offre
                        // les 44 px de cible tactile.
                        className="text-muted-foreground hover:text-primary flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Navigation ── */}
                <nav className="scrollbar-hairline min-h-0 flex-1 overflow-y-auto px-5 py-5">
                    <NavSection title={translate('navBar.accueil')}>
                        {homeSections.map((item) =>
                            isHomePage ? (
                                <ScrollTo
                                    key={item.to}
                                    to={item.to}
                                    spy
                                    smooth
                                    offset={-70}
                                    duration={500}
                                    onClick={close}
                                    activeClass="text-primary font-semibold"
                                    className={drawerLinkClass}
                                >
                                    {translate(item.key)}
                                </ScrollTo>
                            ) : (
                                <InertiaLink
                                    key={item.to}
                                    href={`/#${item.to}`}
                                    onClick={close}
                                    className={drawerLinkClass}
                                >
                                    {translate(item.key)}
                                </InertiaLink>
                            ),
                        )}
                    </NavSection>

                    <NavSection title={translate('navBar.filieres')} divided>
                        {departments.map((dept) => (
                            <InertiaLink
                                key={dept.id}
                                href={`/mention/${dept.slug}`}
                                onClick={close}
                                className={drawerLinkClass}
                            >
                                {dept.name}
                            </InertiaLink>
                        ))}
                    </NavSection>

                    {/* Blog et Contact ne sont pas des sous-rubriques : pas de
                        rail, et le poids typographique d'une tête de section. */}
                    <div className="border-border mt-5 border-t pt-4">
                        <InertiaLink
                            href="/actualites"
                            onClick={close}
                            className="text-foreground hover:text-primary flex min-h-[42px] items-center text-[13px] font-bold tracking-[0.08em] uppercase transition-colors"
                        >
                            {translate('navBar.blog')}
                        </InertiaLink>

                        <InertiaLink
                            href={isHomePage ? '#contact' : '/#contact'}
                            onClick={close}
                            className="text-foreground hover:text-primary flex min-h-[42px] items-center text-[13px] font-bold tracking-[0.08em] uppercase transition-colors"
                        >
                            {translate('navBar.contact')}
                        </InertiaLink>
                    </div>
                </nav>

                {/* ── Pied fixe ──
                    Le pied reste hors du défilement : les deux actions sont
                    toujours atteignables, où qu'en soit la liste. Elles
                    passaient chacune sur une ligne de 50 px dans 40 px de
                    marge, soit 152 px ; resserrées à 44 px dans 28 px de
                    marge, elles en occupent 124, et se rangent côte à côte
                    dès 480 px — en dessous, « Espace étudiant » se briserait
                    sur deux lignes. */}
                <div className="border-border flex shrink-0 flex-col gap-2 border-t p-3.5 min-[480px]:flex-row">
                    <InertiaLink
                        href="/login"
                        onClick={close}
                        // `flex-1` contre le `flex-none` de « Je candidate » :
                        // à parts égales, le libellé le plus long des deux se
                        // brisait sur deux lignes dans les 152 px qu'il
                        // recevait. Il prend maintenant ce que l'autre laisse.
                        className={`border-border text-foreground hover:border-primary hover:text-primary min-w-0 flex-1 border px-3 ${drawerCtaClass}`}
                    >
                        <LogIn size={14} className="shrink-0" />
                        Espace étudiant
                    </InertiaLink>
                    <InertiaLink
                        href="/login"
                        onClick={close}
                        className={`bg-primary text-primary-foreground shrink-0 px-5 hover:bg-white hover:text-black min-[480px]:flex-none ${drawerCtaClass}`}
                    >
                        Je candidate
                    </InertiaLink>
                </div>
            </div>
        </div>
    );
};

const NavItem = ({
    trigger,
    className,
    children,
}: {
    trigger: string;
    className: string;
    children: React.ReactNode;
}) => (
    <NavigationMenuItem>
        <NavigationMenuTrigger className={className}>
            {trigger}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
            <div className="border-border bg-popover w-64 rounded-xl border p-2">
                {children}
            </div>
        </NavigationMenuContent>
    </NavigationMenuItem>
);

const ScrollLink = ({
    to,
    children,
    className,
}: {
    to: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <ScrollTo
        to={to}
        spy
        smooth
        offset={-80}
        duration={500}
        activeClass={className ? '' : 'text-primary bg-accent'}
        className={className ?? menuItemClass}
    >
        {children}
    </ScrollTo>
);

const NavSection = ({
    title,
    children,
    divided = false,
}: {
    title: string;
    children: React.ReactNode;
    /** Filet et respiration au-dessus, pour détacher la rubrique de la
     *  précédente sans creuser le vide de 28 px d'origine. */
    divided?: boolean;
}) => (
    <div className={divided ? 'border-border mt-5 border-t pt-4' : undefined}>
        <h3 className="text-foreground mb-1.5 text-[11px] font-bold tracking-[0.16em] uppercase">
            {title}
        </h3>
        {/* Décalage d'un cran : le rail des entrées se pose sous le titre. */}
        <div className="ml-1">{children}</div>
    </div>
);
