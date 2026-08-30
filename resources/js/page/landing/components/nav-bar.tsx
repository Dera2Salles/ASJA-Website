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
import {
    CalendarDays,
    ClipboardList,
    FileText,
    MenuIcon,
    Moon,
    Newspaper,
    Sun,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

/**
 * Accès rapide étudiant : les trois premières fonctionnalités attendent
 * encore leur module dédié côté backend, elles renvoient donc vers la
 * connexion (comme le reste de l'espace étudiant protégé).
 */
const quickLinks = [
    { label: 'Emploi du temps', href: '/login', icon: CalendarDays },
    { label: 'Notes', href: '/login', icon: FileText },
    { label: 'Inscriptions', href: '/login', icon: ClipboardList },
    { label: 'Actualités', href: '/actualites', icon: Newspaper },
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
    'block w-full cursor-pointer border-b border-transparent px-4 py-2 text-left text-sm text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground';

export const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { toggleTheme, isDark } = useThemeContext();
    const { translate } = useLangue();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useScrollLock(open);

    return (
        <header className="fixed top-0 left-0 z-50 w-full">
            <AnnonceSection />
            <QuickAccessBar />
            <nav className="bg-background border-border border-b">
                <div className="section-container flex items-center justify-between py-3">
                    <InertiaLink
                        href="/"
                        className="flex items-center gap-3"
                        aria-label="Accueil ASJA"
                    >
                        <img
                            className="h-11 w-11 object-contain"
                            src={Logo}
                            alt=""
                        />
                        <span className="font-display text-foreground hidden text-base font-bold tracking-tight sm:block">
                            {translate('universite')}
                        </span>
                    </InertiaLink>

                    <div className="hidden items-center gap-1 md:flex">
                        <DesktopNav />
                        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                    </div>

                    <button
                        onClick={() => setOpen(true)}
                        className="text-foreground border-border border p-2 md:hidden"
                        aria-label="Ouvrir le menu"
                    >
                        <MenuIcon size={24} />
                    </button>
                </div>
            </nav>
            <MobileNav open={open} setOpen={setOpen} />
        </header>
    );
};

/**
 * Barre d'accès direct : la fonctionnalité que l'étudiant vient chercher en
 * premier ne doit jamais être à plus d'un clic, quelle que soit la page.
 */
const QuickAccessBar = () => (
    <div className="bg-foreground text-background hidden md:block">
        <div className="section-container flex items-stretch divide-x-2 divide-background/0">
            {quickLinks.map(({ label, href, icon: Icon }) => (
                <InertiaLink
                    key={label}
                    href={href}
                    className="border-background flex flex-1 items-center justify-center gap-2 border-r py-2 font-mono text-xs font-bold tracking-widest uppercase last:border-r-0 hover:bg-primary hover:text-primary-foreground"
                >
                    <Icon size={14} />
                    {label}
                </InertiaLink>
            ))}
        </div>
    </div>
);

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
        className="text-foreground border-border ml-2 cursor-pointer border p-2 hover:bg-accent hover:text-accent-foreground"
    >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
);

const DesktopNav = () => {
    const { translate } = useLangue();
    const departments = useDepartments();
    const isHomePage = usePage().url.split('?')[0] === '/';

    const triggerClass =
        'bg-transparent text-sm font-bold uppercase tracking-wide text-foreground hover:bg-accent hover:text-accent-foreground';

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
                        className={`inline-flex h-10 items-center px-4 py-2 ${triggerClass}`}
                    >
                        {translate('navBar.blog')}
                    </InertiaLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    {isHomePage ? (
                        <ScrollLink
                            to="contact"
                            className={`inline-flex h-10 cursor-pointer items-center px-4 py-2 ${triggerClass}`}
                        >
                            {translate('navBar.contact')}
                        </ScrollLink>
                    ) : (
                        <InertiaLink
                            href="/#contact"
                            className={`inline-flex h-10 items-center px-4 py-2 ${triggerClass}`}
                        >
                            {translate('navBar.contact')}
                        </InertiaLink>
                    )}
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

const MobileNav = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const { translate } = useLangue();
    const { toggleTheme, isDark } = useThemeContext();
    const departments = useDepartments();
    const isHomePage = usePage().url.split('?')[0] === '/';
    const close = () => setOpen(false);

    return (
        <div
            className={`fixed inset-0 z-50 md:hidden ${open ? 'block' : 'hidden'}`}
        >
            <div className="fixed inset-0 bg-black" onClick={close} />
            <div
                className="bg-background border-border fixed top-0 left-0 flex h-full w-80 max-w-[85vw] flex-col border-r"
                style={{
                    transform: open ? 'translateX(0)' : 'translateX(-100%)',
                }}
            >
                <div className="border-border flex items-center justify-between border-b p-4">
                    <span className="font-display text-foreground text-base font-bold">
                        Menu
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            aria-label={
                                isDark
                                    ? 'Passer en mode clair'
                                    : 'Passer en mode sombre'
                            }
                            className="text-foreground border-border border p-2"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={close}
                            aria-label="Fermer le menu"
                            className="text-foreground border-border border p-2"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="border-border grid grid-cols-2 border-b">
                    {quickLinks.map(({ label, href, icon: Icon }) => (
                        <InertiaLink
                            key={label}
                            href={href}
                            onClick={close}
                            className="border-border text-foreground flex flex-col items-center gap-1.5 border-r border-b p-3 text-center font-mono text-[11px] font-bold tracking-wide uppercase odd:border-r even:border-r-0 hover:bg-primary hover:text-primary-foreground"
                        >
                            <Icon size={18} />
                            {label}
                        </InertiaLink>
                    ))}
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-4">
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
                                    activeClass="text-primary font-bold"
                                    className="text-foreground hover:text-primary block cursor-pointer py-2 text-sm"
                                >
                                    {translate(item.key)}
                                </ScrollTo>
                            ) : (
                                <InertiaLink
                                    key={item.to}
                                    href={`/#${item.to}`}
                                    onClick={close}
                                    className="text-foreground hover:text-primary block py-2 text-sm"
                                >
                                    {translate(item.key)}
                                </InertiaLink>
                            ),
                        )}
                    </NavSection>

                    <NavSection title={translate('navBar.filieres')}>
                        {departments.map((dept) => (
                            <InertiaLink
                                key={dept.id}
                                href={`/mention/${dept.slug}`}
                                onClick={close}
                                className="text-foreground hover:text-primary block py-2 text-sm"
                            >
                                {dept.name}
                            </InertiaLink>
                        ))}
                    </NavSection>

                    <InertiaLink
                        href="/actualites"
                        onClick={close}
                        className="text-foreground block py-2 text-sm font-bold"
                    >
                        {translate('navBar.blog')}
                    </InertiaLink>

                    <InertiaLink
                        href={isHomePage ? '#contact' : '/#contact'}
                        onClick={close}
                        className="text-foreground block py-2 text-sm font-bold"
                    >
                        {translate('navBar.contact')}
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
            <div className="bg-popover border-border w-64 space-y-0.5 border p-2">
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
        activeClass={
            className ? '' : 'bg-primary text-primary-foreground'
        }
        className={className ?? menuItemClass}
    >
        {children}
    </ScrollTo>
);

const NavSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div>
        <h3 className="text-primary mb-1 font-mono text-xs font-bold tracking-wider uppercase">
            {title}
        </h3>
        <div className="border-border ml-1 space-y-0.5 border-l pl-3">
            {children}
        </div>
    </div>
);
