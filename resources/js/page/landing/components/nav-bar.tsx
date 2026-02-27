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
import { MenuIcon, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
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

const filiereLinks = [
    { href: '/mention/agronomie', key: 'filiereSection.AGRO.name' },
    { href: '/mention/informatique', key: 'filiereSection.INFO.name' },
    { href: '/mention/droit', key: 'filiereSection.DROIT.name' },
    { href: '/mention/economie', key: 'filiereSection.ECO.name' },
    {
        href: '/mention/langue-etrangere-applique',
        key: 'filiereSection.LEA.name',
    },
    { href: '/mention/science-de-la-terre', key: 'filiereSection.ST.name' },
];

export const Navbar = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [scrolled, setScrolled] = useState<boolean>(false);
    const { toggleTheme, isDark } = useThemeContext();
    const { translate } = useLangue();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFiliereClick = (href: string) => {
        window.location.href = href;
        setOpen(false);
    };
    const handleLogoClick = () => (window.location.href = '/');

    useScrollLock(open);

    return (
        <header className="fixed top-0 left-0 z-50 w-full">
            <AnnonceSection />
            <nav
                className={`transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/80 shadow-lg backdrop-blur-sm dark:bg-zinc-900/80'
                        : 'bg-transparent'
                }`}
            >
                <div className="container mx-auto flex items-center justify-between p-4">
                    <div
                        className="flex cursor-pointer items-center gap-3"
                        onClick={handleLogoClick}
                    >
                        <img
                            className="h-12 w-12"
                            src={Logo}
                            alt="Logo de l'université ASJA"
                        />
                        <h1 className="hidden text-lg font-bold text-gray-900 sm:block dark:text-white">
                            {translate('universite')}
                        </h1>
                    </div>

                    <div className="hidden items-center gap-2 md:flex">
                        <DesktopNav onFiliereClick={handleFiliereClick} />
                        <button
                            className="cursor-pointer rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-zinc-700"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    <button
                        onClick={() => setOpen(true)}
                        className="p-2 text-gray-800 md:hidden dark:text-white"
                        aria-label="Open menu"
                    >
                        <MenuIcon size={28} />
                    </button>
                </div>
            </nav>
            <MobileNav
                open={open}
                setOpen={setOpen}
                onFiliereClick={handleFiliereClick}
            />
        </header>
    );
};

const DesktopNav = ({
    onFiliereClick,
}: {
    onFiliereClick: (href: string) => void;
}) => {
    const { translate } = useLangue();
    const isHomePage = window.location.pathname === '/';

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavItem trigger={translate('navBar.accueil')}>
                    {homeSections.map((item) => (
                        isHomePage ? (
                            <ScrollLink key={item.to} to={item.to}>
                                {translate(item.key)}
                            </ScrollLink>
                        ) : (
                            <button
                                key={item.to}
                                onClick={() => (window.location.href = `/#${item.to}`)}
                                className="block w-full cursor-pointer rounded-md px-4 py-2 text-left text-gray-800 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-700"
                            >
                                {translate(item.key)}
                            </button>
                        )
                    ))}
                </NavItem>
                <NavItem trigger={translate('navBar.filieres')}>
                    {filiereLinks.map((item) => (
                        <FiliereLink
                            key={item.href}
                            onClick={() => onFiliereClick(item.href)}
                        >
                            {translate(item.key)}
                        </FiliereLink>
                    ))}
                </NavItem>

                <NavigationMenuItem>
                    <button
                        onClick={() => (window.location.href = '/blog')}
                        className="group inline-flex h-10 w-max cursor-pointer items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700"
                    >
                        {translate('navBar.blog')}
                    </button>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    {isHomePage ? (
                        <ScrollLink to="contact">
                            {translate('navBar.contact')}
                        </ScrollLink>
                    ) : (
                        <button
                            onClick={() => (window.location.href = '/#contact')}
                            className="group inline-flex h-10 w-max cursor-pointer items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700"
                        >
                            {translate('navBar.contact')}
                        </button>
                    )}
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

const MobileNav = ({
    open,
    setOpen,
    onFiliereClick,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    onFiliereClick: (href: string) => void;
}) => {
    const { translate } = useLangue();
    const { toggleTheme, isDark } = useThemeContext();
    const handleLinkClick = () => setOpen(false);
    const isHomePage = window.location.pathname === '/';

    return (
        <div
            className={`fixed inset-0 z-50 md:hidden ${open ? 'block' : 'hidden'}`}
        >
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setOpen(false)}
            />
            <div
                className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900"
                style={{
                    transform: open ? 'translateX(0)' : 'translateX(-100%)',
                }}
            >
                <div className="flex items-center justify-between border-b p-4 dark:border-zinc-700">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                        Menu
                    </h1>
                    <div
                        onClick={toggleTheme}
                        className="mt-4 flex items-center justify-between rounded-full bg-gray-100 p-3 dark:bg-zinc-800"
                    >
                        <div className="p-2 text-green-700">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-2">
                        <X
                            size={24}
                            className="text-gray-700 dark:text-gray-300"
                        />
                    </button>
                </div>

                <div className="flex h-full flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        <NavSection title={translate('navBar.accueil')}>
                            {homeSections.map((item) => (
                                isHomePage ? (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        spy
                                        smooth
                                        offset={-50}
                                        duration={500}
                                        onClick={handleLinkClick}
                                        activeClass="text-green-600 dark:text-green-400 font-semibold"
                                        className="block py-2 text-gray-700 dark:text-gray-300"
                                    >
                                        {translate(item.key)}
                                    </Link>
                                ) : (
                                    <button
                                        key={item.to}
                                        onClick={() => (window.location.href = `/#${item.to}`)}
                                        className="block w-full py-2 text-left text-gray-700 dark:text-gray-300"
                                    >
                                        {translate(item.key)}
                                    </button>
                                )
                            ))}
                        </NavSection>
                        <NavSection title={translate('navBar.filieres')}>
                            {filiereLinks.map((item) => (
                                <button
                                    key={item.href}
                                    onClick={() => onFiliereClick(item.href)}
                                    className="block w-full py-2 text-left text-gray-700 dark:text-gray-300"
                                >
                                    {translate(item.key)}
                                </button>
                            ))}
                        </NavSection>

                        <button
                            onClick={() => (window.location.href = '/blog')}
                            className="block w-full py-2 text-left font-semibold text-gray-800 dark:text-white"
                        >
                            {translate('navBar.blog')}
                        </button>

                        <button
                            onClick={() => (window.location.href = isHomePage ? '#contact' : '/#contact')}
                            className="block w-full py-2 text-left font-semibold text-gray-800 dark:text-white"
                        >
                            {translate('navBar.contact')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavItem = ({
    trigger,
    children,
}: {
    trigger: string;
    children: React.ReactNode;
}) => (
    <NavigationMenuItem>
        <NavigationMenuTrigger className="bg-transparent text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-700">
            {trigger}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
            <div className="w-60 space-y-1 rounded-lg bg-white p-2 shadow-lg dark:bg-zinc-800">
                {children}
            </div>
        </NavigationMenuContent>
    </NavigationMenuItem>
);

const ScrollLink = ({
    to,
    children,
}: {
    to: string;
    children: React.ReactNode;
}) => (
    <Link
        to={to}
        spy={true}
        smooth={true}
        offset={-80}
        duration={500}
        activeClass="text-green-600 dark:text-green-400 bg-gray-100 dark:bg-zinc-700"
        className="block cursor-pointer rounded-md px-4 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-700"
    >
        {children}
    </Link>
);

const FiliereLink = ({
    onClick,
    children,
}: {
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        onClick={onClick}
        className="block w-full cursor-pointer rounded-md px-4 py-2 text-left text-gray-800 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-700"
    >
        {children}
    </button>
);

const NavSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div>
        <h3 className="mb-1 px-2 font-semibold text-gray-900 dark:text-white">
            {title}
        </h3>
        <div className="ml-2 space-y-1 border-l-2 border-gray-200 pl-4 dark:border-zinc-700">
            {children}
        </div>
    </div>
);
