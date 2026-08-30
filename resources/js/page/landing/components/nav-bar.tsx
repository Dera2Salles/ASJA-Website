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

const triggerClass =
    'bg-transparent text-sm font-bold uppercase tracking-wide text-foreground hover:bg-accent hover:text-accent-foreground';

/**
 * Navigation unique du site.
 *
 * Elle remplace les deux barres superposées précédentes : une bande « accès
 * rapide » coiffait la navigation principale, alors que trois de ses quatre
 * entrées (emploi du temps, notes, inscriptions) menaient toutes à la page de
 * connexion faute de module dédié, et que la quatrième (actualités) figurait
 * déjà dans le menu. Ces trois entrées sont regroupées sous « Espace
 * étudiant » : aucune destination n'est perdue.
 *
 * La barre est `sticky` et non `fixed` : elle ne recouvre plus le haut des
 * pages, ce qui rend inutiles les décalages manuels qu'elles portaient.
 */
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
        <>
            <AnnonceSection />

            <nav className="bg-background border-border sticky top-0 z-50 border-b">
                <div className="section-container flex items-center justify-between gap-4 py-3">
                    <InertiaLink
                        href="/"
                        className="flex shrink-0 items-center gap-3"
                        aria-label="Accueil ASJA"
                    >
                        <img
                            className="h-10 w-10 object-contain"
                            src={Logo}
                            alt=""
                        />
                        <span className="font-display text-foreground hidden text-base font-bold tracking-tight sm:block">
                            {translate('universite')}
                        </span>
                    </InertiaLink>

                    <div className="hidden items-center gap-1 lg:flex">
                        <DesktopNav />
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

                        <InertiaLink
                            href="/login"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide uppercase sm:inline-flex"
                        >
                            <LogIn size={14} />
                            Espace étudiant
                        </InertiaLink>

                        <button
                            onClick={() => setOpen(true)}
                            className="text-foreground border-border cursor-pointer border p-2 lg:hidden"
                            aria-label="Ouvrir le menu"
                        >
                            <MenuIcon size={22} />
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
        className="text-foreground border-border cursor-pointer border p-2 hover:bg-accent hover:text-accent-foreground"
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
    const departments = useDepartments();
    const isHomePage = usePage().url.split('?')[0] === '/';
    const close = () => setOpen(false);

    return (
        <div
            className={`fixed inset-0 z-[60] lg:hidden ${open ? 'block' : 'hidden'}`}
        >
            <div className="fixed inset-0 bg-black/60" onClick={close} />

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
                    <button
                        onClick={close}
                        aria-label="Fermer le menu"
                        className="text-foreground border-border cursor-pointer border p-2 hover:bg-accent hover:text-accent-foreground"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto p-4">
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
                                    className="text-muted-foreground hover:text-foreground block cursor-pointer py-2 text-sm"
                                >
                                    {translate(item.key)}
                                </ScrollTo>
                            ) : (
                                <InertiaLink
                                    key={item.to}
                                    href={`/#${item.to}`}
                                    onClick={close}
                                    className="text-muted-foreground hover:text-foreground block py-2 text-sm"
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
                                className="text-muted-foreground hover:text-foreground block py-2 text-sm"
                            >
                                {dept.name}
                            </InertiaLink>
                        ))}
                    </NavSection>

                    <div className="space-y-1">
                        <InertiaLink
                            href="/actualites"
                            onClick={close}
                            className="text-foreground block py-2 text-sm font-bold uppercase"
                        >
                            {translate('navBar.blog')}
                        </InertiaLink>

                        <InertiaLink
                            href={isHomePage ? '#contact' : '/#contact'}
                            onClick={close}
                            className="text-foreground block py-2 text-sm font-bold uppercase"
                        >
                            {translate('navBar.contact')}
                        </InertiaLink>
                    </div>
                </div>

                <div className="border-border border-t p-4">
                    <InertiaLink
                        href="/login"
                        onClick={close}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-bold tracking-wide uppercase"
                    >
                        <LogIn size={14} />
                        Espace étudiant
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
            <div className="bg-popover border-border w-64 border p-1">
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
        activeClass={className ? '' : 'bg-accent text-accent-foreground'}
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
        <h3 className="text-foreground mb-1 text-xs font-bold tracking-wider uppercase">
            {title}
        </h3>
        <div className="border-border ml-1 space-y-0.5 border-l pl-3">
            {children}
        </div>
    </div>
);
