import { CmsProvider, cmsImage, type CmsContent } from '@/lib/cms';
import { departmentLogo } from '@/lib/department-logos';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, GraduationCap } from 'lucide-react';
import { useState } from 'react';
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

            <div
                className="relative mx-auto w-full"
                style={{ maxWidth: '1320px', padding: '0 36px 56px' }}
            >
                <div className="flex flex-col items-start gap-4">
                    {logo ? (
                        <motion.img
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            src={logo}
                            alt=""
                            className="h-16 w-16 rounded-xl object-contain"
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
                        style={{ fontSize: 'clamp(42px, 6vw, 72px)' }}
                    >
                        {department.name}
                    </motion.h1>

                    {department.description ? (
                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="mt-4 max-w-2xl text-lg leading-relaxed"
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

const DetailBlock = ({
    icon,
    title,
    body,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
}) => (
    <div className="bg-card border-border rounded-[22px] border p-8">
        <div className="mb-4 flex items-center gap-2.5">
            <span className="text-primary">{icon}</span>
            <h4 className="text-muted-foreground font-sans text-xs font-bold tracking-[0.16em] uppercase">
                {title}
            </h4>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
            {body}
        </p>
    </div>
);

/** Parcours */
const Programs = ({ programs }: { programs: Program[] }) => {
    const [activeId, setActiveId] = useState<number>(programs[0].id);
    const active = programs.find((p) => p.id === activeId) ?? programs[0];

    return (
        <section id="parcours" className="band-light py-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                {/* En-tête de section */}
                <div className="mb-12">
                    <h2
                        className="font-display text-foreground font-black uppercase"
                        style={{
                            fontSize: 'clamp(40px, 4vw, 56px)',
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                        }}
                    >
                        Nos parcours
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
                        Chaque parcours mène à des compétences et des débouchés
                        qui lui sont propres.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    <nav className="lg:col-span-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0">
                            {programs.map((program) => {
                                const isActive = program.id === active.id;
                                return (
                                    <button
                                        key={program.id}
                                        onClick={() => setActiveId(program.id)}
                                        aria-current={isActive}
                                        className={`shrink-0 rounded-full px-6 py-3.5 text-left text-sm font-bold transition-all lg:w-full lg:rounded-xl lg:px-5 lg:py-4 ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border-border border'
                                        }`}
                                    >
                                        {program.title}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    <motion.div
                        key={active.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:col-span-8"
                    >
                        <h3 className="font-display text-foreground mb-4 text-3xl font-bold">
                            {active.title}
                        </h3>

                        {active.description ? (
                            <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                                {active.description}
                            </p>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-2">
                            {active.competences ? (
                                <DetailBlock
                                    icon={<GraduationCap className="h-5 w-5" />}
                                    title="Compétences acquises"
                                    body={active.competences}
                                />
                            ) : null}

                            {active.debouches ? (
                                <DetailBlock
                                    icon={<Briefcase className="h-5 w-5" />}
                                    title="Débouchés"
                                    body={active.debouches}
                                />
                            ) : null}
                        </div>
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
                <div className="flex min-h-screen flex-col overflow-x-hidden">
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
                            className="band-light pb-[104px]"
                            style={{ borderTop: '1px solid var(--border)' }}
                        >
                            <div
                                className="mx-auto w-full px-9 pt-[80px]"
                                style={{ maxWidth: '1320px' }}
                            >
                                <div className="rounded-[28px] bg-[#35cf7f] px-[56px] py-[72px] text-center text-[#0e1411]">
                                    <h2 className="font-display m-0 text-[clamp(36px,5vw,56px)] leading-[0.98] font-black tracking-[-0.04em] uppercase">
                                        Intéressé par cette mention ?
                                    </h2>
                                    <p className="mx-auto mt-5 max-w-[620px] text-lg leading-[1.58] font-medium text-[#0e1411]/90">
                                        Contactez-nous pour tout savoir sur les
                                        modalités d'inscription et de
                                        candidature.
                                    </p>

                                    <div className="mt-9 flex flex-wrap justify-center gap-3.5">
                                        <Link
                                            href="/#contact"
                                            className="inline-flex items-center gap-2 rounded-full bg-[#0e1411] px-[34px] py-[17px] text-[15px] font-bold text-white transition-colors hover:bg-white hover:text-[#0e1411]"
                                        >
                                            Nous contacter
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>

                                        <Link
                                            href="/#filiere"
                                            className="rounded-full border border-[#0e1411]/35 px-[32px] py-[17px] text-[15px] font-semibold text-[#0e1411] hover:bg-[#0e1411]/10"
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
