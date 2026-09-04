import { CmsProvider, cmsImage, type CmsContent } from '@/lib/cms';
import { departmentLogo } from '@/lib/department-logos';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Check, GraduationCap } from 'lucide-react';
import { useId, useState } from 'react';
import { BandTransition } from '../../page/landing/components/band-transition';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { useThemeContext } from '../../page/theme/useThemeContext';
import { ThemeProvider } from '../../page/theme/useThemeProvider';

interface Program {
    id: number;
    title: string;
    description: string | null;
    competences: string | null;
    debouches: string | null;
}

interface Department {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    logo: string | null;
    hero_image: string | null;
    programs: Program[];
}

interface Props {
    department: Department;
    cms: CmsContent;
}

/** Bandeau d'ouverture style "C Vivant" */
const Hero = ({ department }: { department: Department }) => {
    const { isDark } = useThemeContext();
    const logo = cmsImage(
        department.logo,
        departmentLogo(department.slug, isDark),
    );
    const image = cmsImage(department.hero_image);

    return (
        <section className="relative flex min-h-[60vh] w-full items-end overflow-hidden">
            {image ? (
                <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-[#0e1411]" />
            )}

            {/* Gradient overlay */}
            <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(14,20,17,0.35) 0%, rgba(14,20,17,0.5) 45%, rgba(14,20,17,0.96) 100%)',
                }}
            />

            <div className="section-shell relative pb-12 sm:pb-14 lg:pb-[56px]">
                <div className="flex flex-col items-start gap-4">
                    {logo ? (
                        <motion.img
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            src={logo}
                            alt=""
                            className="h-14 w-14 rounded-xl object-contain sm:h-16 sm:w-16"
                        />
                    ) : null}

                    <motion.span
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase"
                    >
                        Mention
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="font-display max-w-4xl leading-[0.95] font-black tracking-[-0.04em] text-white uppercase"
                        style={{ fontSize: 'clamp(32px, 8.4vw, 72px)' }}
                    >
                        {department.name}
                    </motion.h1>

                    {department.description ? (
                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg"
                            style={{ color: '#c3cec8' }}
                        >
                            {department.description}
                        </motion.p>
                    ) : null}
                </div>
            </div>
        </section>
    );
};

/**
 * `competences` et `debouches` arrivent du CMS en texte libre, une entrée par
 * ligne. Ils étaient rendus tels quels dans un `whitespace-pre-line`, ce qui
 * donnait un pavé gris impossible à parcourir du regard : on les redécoupe
 * pour en faire de vraies listes. Les puces éventuellement saisies à la main
 * sont retirées, la mise en forme étant désormais celle du composant.
 */
const toLines = (value: string | null): string[] =>
    (value ?? '')
        .split(/\r?\n/)
        .map((line) => line.replace(/^[\s\u2022*\u2013-]+/, '').trim())
        .filter(Boolean);

const pad = (value: number) => String(value).padStart(2, '0');

/** Intitulé de bloc : icône, titre, filet, compteur. */
const BlockHeading = ({
    icon,
    title,
    count,
}: {
    icon: React.ReactNode;
    title: string;
    count: number;
}) => (
    <div className="mb-5 flex items-center gap-3">
        <span className="text-primary shrink-0">{icon}</span>
        <h4 className="text-foreground shrink-0 font-sans text-xs font-bold tracking-[0.16em] uppercase">
            {title}
        </h4>
        {/* Le filet occupe ce qui reste : il tient lieu de séparateur sans
            ajouter une bordure de plus au dessin. */}
        <span className="bg-border h-px flex-1" aria-hidden="true" />
        <span className="text-muted-foreground shrink-0 text-xs font-bold tabular-nums">
            {pad(count)}
        </span>
    </div>
);

/** Sélecteur d'un parcours. */
const ProgramTab = ({
    title,
    index,
    isActive,
    onSelect,
    layoutId,
}: {
    title: string;
    index: number;
    isActive: boolean;
    onSelect: () => void;
    layoutId: string;
}) => (
    <button
        type="button"
        onClick={onSelect}
        aria-current={isActive}
        className={`relative flex min-h-[60px] w-full items-center gap-4 overflow-hidden rounded-2xl border px-5 py-3.5 text-left ${
            isActive
                ? 'border-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:border-primary'
        }`}
    >
        {/* L'aplat actif est un calque partagé : il glisse d'une carte à
            l'autre au lieu de s'allumer et s'éteindre. Le passer par
            `layoutId` plutôt que par une transition CSS contourne aussi la
            règle de base du site, qui coupe toute transition sur `button`. */}
        {isActive ? (
            <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 430, damping: 38 }}
                className="bg-primary absolute inset-0"
                aria-hidden="true"
            />
        ) : null}

        <span
            className={`font-display relative text-[13px] font-black tabular-nums ${
                isActive
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
            }`}
        >
            {pad(index + 1)}
        </span>

        <span className="font-display relative flex-1 text-[15px] leading-tight font-bold uppercase">
            {title}
        </span>

        <ArrowRight
            className={`relative h-4 w-4 shrink-0 ${isActive ? 'opacity-90' : 'opacity-30'}`}
            aria-hidden="true"
        />
    </button>
);

/** Un débouché, présenté comme un métier atteignable et non comme une ligne. */
const OpportunityCard = ({ label }: { label: string }) => (
    <div className="group border-border bg-card hover:border-primary flex items-center gap-3.5 rounded-2xl border p-4 transition-colors sm:p-5">
        <span className="bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors">
            <Briefcase className="h-[18px] w-[18px]" />
        </span>
        <span className="font-display text-foreground text-[15px] leading-snug font-bold">
            {label}
        </span>
    </div>
);

/** Parcours */
const Programs = ({ programs }: { programs: Program[] }) => {
    const [activeId, setActiveId] = useState<number>(programs[0].id);
    const activeIndex = Math.max(
        0,
        programs.findIndex((program) => program.id === activeId),
    );
    const active = programs[activeIndex];
    const layoutId = useId();

    const competences = toLines(active.competences);
    const debouches = toLines(active.debouches);

    return (
        <section id="parcours" className="band-light section-rhythm">
            <div className="section-shell">
                {/* En-tête de section */}
                <div className="mb-10 sm:mb-12">
                    <h2
                        className="font-display text-foreground font-black uppercase"
                        style={{
                            fontSize: 'clamp(30px, 7.4vw, 56px)',
                            lineHeight: 1.02,
                            letterSpacing: '-0.04em',
                        }}
                    >
                        Nos parcours
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl text-[15px] leading-relaxed sm:text-base">
                        Chaque parcours mène à des compétences et des débouchés
                        qui lui sont propres.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                    {/* ── Colonne de sélection ── */}
                    <nav
                        aria-label="Parcours de la mention"
                        className="lg:col-span-4"
                    >
                        {/* Collante en bureau : la colonne de droite est
                            nettement plus haute, la liste laissait sinon un
                            grand vide sous elle. */}
                        <div className="lg:sticky lg:top-24">
                            {programs.length > 1 ? (
                                <div className="mb-4 flex items-baseline justify-between gap-4">
                                    <span className="eyebrow">
                                        {programs.length} parcours
                                    </span>
                                    {/* Repère de position : on voit d'un coup
                                        d'œil qu'il reste des parcours à ouvrir. */}
                                    <span className="text-muted-foreground text-xs font-bold tabular-nums">
                                        <motion.span
                                            key={active.id}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.22 }}
                                            className="text-foreground inline-block"
                                        >
                                            {pad(activeIndex + 1)}
                                        </motion.span>
                                        {' / '}
                                        {pad(programs.length)}
                                    </span>
                                </div>
                            ) : null}

                            <div className="flex flex-col gap-2.5">
                                {programs.map((program, index) => (
                                    <ProgramTab
                                        key={program.id}
                                        title={program.title}
                                        index={index}
                                        isActive={program.id === active.id}
                                        onSelect={() => setActiveId(program.id)}
                                        layoutId={layoutId}
                                    />
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* ── Contenu du parcours ── */}
                    <motion.div
                        key={active.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="lg:col-span-8"
                    >
                        <h3 className="font-display text-foreground text-2xl font-bold sm:text-3xl">
                            {active.title}
                        </h3>

                        {active.description ? (
                            <p className="text-muted-foreground mt-3 max-w-2xl text-[15px] leading-relaxed sm:text-base">
                                {active.description}
                            </p>
                        ) : null}

                        {competences.length > 0 ? (
                            <div className="mt-9">
                                <BlockHeading
                                    icon={<GraduationCap className="h-5 w-5" />}
                                    title="Compétences acquises"
                                    count={competences.length}
                                />
                                <ul className="border-border bg-card divide-border divide-y rounded-[22px] border">
                                    {competences.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-3 px-5 py-3.5"
                                        >
                                            <Check
                                                className="text-primary mt-0.5 h-4 w-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span className="text-foreground text-[15px] leading-relaxed">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {debouches.length > 0 ? (
                            <div className="mt-9">
                                <BlockHeading
                                    icon={<Briefcase className="h-5 w-5" />}
                                    title="Débouchés"
                                    count={debouches.length}
                                />
                                {/* Une carte par métier : c'est la réponse à
                                    « qu'est-ce que je fais après ? », elle
                                    mérite mieux qu'une ligne de paragraphe. */}
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {debouches.map((item) => (
                                        <OpportunityCard
                                            key={item}
                                            label={item}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default function DepartmentShow({ department, cms }: Props) {
    return (
        <CmsProvider content={cms}>
            <Head title={department.name} />
            <ThemeProvider>
                <div className="flex min-h-screen flex-col overflow-x-clip">
                    <Navbar />

                    <main className="flex-1">
                        <Hero department={department} />

                        {/* Le bandeau d'ouverture reste noir ; la page se
                            découvre en blanc au fil du scroll, comme la
                            landing passe de son hero sombre au campus clair. */}
                        <BandTransition direction="dark-to-light" />

                        {department.programs.length > 0 ? (
                            <Programs programs={department.programs} />
                        ) : null}

                        {/* CTA final */}
                        <section
                            className="band-light pb-16 sm:pb-20 lg:pb-[104px]"
                            style={{ borderTop: '1px solid var(--border)' }}
                        >
                            <div className="section-shell pt-14 sm:pt-16 lg:pt-[80px]">
                                <div className="rounded-[28px] bg-[#35cf7f] px-6 py-12 text-center text-[#0e1411] sm:px-10 sm:py-16 lg:px-[56px] lg:py-[72px]">
                                    <h2 className="font-display m-0 text-[clamp(28px,7.4vw,56px)] leading-[0.98] font-black tracking-[-0.04em] uppercase">
                                        Intéressé par cette mention ?
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-[620px] text-base leading-[1.58] font-medium text-[#0e1411]/90 sm:mt-5 sm:text-lg">
                                        Contactez-nous pour tout savoir sur les
                                        modalités d'inscription et de
                                        candidature.
                                    </p>

                                    <div className="mx-auto mt-8 flex w-full max-w-[420px] flex-col gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3.5">
                                        <Link
                                            href="/#contact"
                                            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#0e1411] px-8 text-[15px] font-bold text-white transition-colors hover:bg-white hover:text-[#0e1411] sm:w-auto sm:px-[34px]"
                                        >
                                            Nous contacter
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>

                                        <Link
                                            href="/#filiere"
                                            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-[#0e1411]/35 px-8 text-[15px] font-semibold text-[#0e1411] hover:bg-[#0e1411]/10 sm:w-auto sm:px-[32px]"
                                        >
                                            Voir les autres mentions
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>

                    {/* Retour au noir pour rejoindre le pied de page. */}
                    <BandTransition direction="light-to-dark" />

                    <Footer />
                </div>
            </ThemeProvider>
        </CmsProvider>
    );
}
