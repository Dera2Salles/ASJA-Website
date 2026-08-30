import { CmsProvider, cmsImage, type CmsContent } from '@/lib/cms';
import { departmentLogo } from '@/lib/department-logos';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { SectionHeading } from '../../page/landing/components/section-heading';
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

/** Bandeau d'ouverture, calqué sur celui de la page d'accueil. */
const Hero = ({ department }: { department: Department }) => {
    const { isDark } = useThemeContext();
    const logo = cmsImage(
        department.logo,
        departmentLogo(department.slug, isDark),
    );
    const image = cmsImage(department.hero_image);

    return (
        <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden">
            {image ? (
                <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 h-full w-full object-cover"
                />
            ) : (
                <div className="bg-foreground absolute inset-0 -z-20" />
            )}

            <div
                className="absolute inset-0 -z-10 bg-black/70"
                aria-hidden="true"
            />

            <div className="section-container relative py-28 text-center">
                {logo ? (
                    <motion.img
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        src={logo}
                        alt=""
                        className="mx-auto mb-7 h-20 w-20 object-contain"
                    />
                ) : null}

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className="mb-5 text-xs font-semibold tracking-[0.22em] text-white/70 uppercase"
                >
                    Mention
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="mx-auto max-w-4xl text-3xl font-extrabold text-white md:text-5xl lg:text-6xl"
                >
                    {department.name}
                </motion.h1>

                {department.description ? (
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg"
                    >
                        {department.description}
                    </motion.p>
                ) : null}
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
    <div className="border-border bg-card border p-6">
        <div className="mb-4 flex items-center gap-2.5">
            <span className="text-primary">{icon}</span>
            <h4 className="text-foreground text-sm font-bold tracking-wide uppercase">
                {title}
            </h4>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
            {body}
        </p>
    </div>
);

/**
 * Parcours en maître/détail persistant.
 *
 * L'ancienne page remplaçait entièrement son contenu au clic sur un parcours,
 * obligeant à revenir en arrière pour en consulter un autre. Ici la liste
 * reste visible : comparer deux parcours ne coûte plus qu'un clic.
 */
const Programs = ({ programs }: { programs: Program[] }) => {
    const [activeId, setActiveId] = useState<number>(programs[0].id);
    const active = programs.find((p) => p.id === activeId) ?? programs[0];

    return (
        <section id="parcours" className="band-light section border-border border-y">
            <div className="section-container">
                <SectionHeading
                    eyebrow="Formations"
                    title="Nos parcours"
                    subtitle="Chaque parcours mène à des compétences et des débouchés qui lui sont propres."
                />

                <div className="grid gap-8 lg:grid-cols-12">
                    <nav className="lg:col-span-4">
                        {/* Défilement horizontal sur mobile, colonne sur grand
                            écran : la liste reste accessible dans les deux cas. */}
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
                            {programs.map((program) => {
                                const isActive = program.id === active.id;
                                return (
                                    <button
                                        key={program.id}
                                        onClick={() => setActiveId(program.id)}
                                        aria-current={isActive}
                                        className={`shrink-0 border px-5 py-4 text-left text-sm font-bold lg:w-full lg:shrink lg:border-b-0 lg:last:border-b ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground'
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
                        <h3 className="text-foreground mb-4 text-2xl md:text-3xl">
                            {active.title}
                        </h3>

                        {active.description ? (
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                {active.description}
                            </p>
                        ) : null}

                        <div className="grid gap-5 md:grid-cols-2">
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

                        {department.programs.length > 0 ? (
                            <Programs programs={department.programs} />
                        ) : null}

                        <section className="band-dark section">
                            <div className="section-container text-center">
                                <h2 className="text-foreground text-2xl md:text-3xl">
                                    Intéressé par cette mention ?
                                </h2>
                                <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
                                    Contactez-nous pour tout savoir sur les
                                    modalités d'inscription.
                                </p>

                                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <Link
                                        href="/#contact"
                                        className="bg-primary text-primary-foreground inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold uppercase"
                                    >
                                        Nous contacter
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <Link
                                        href="/#filiere"
                                        className="border-border text-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 border px-8 py-3.5 text-sm font-bold uppercase"
                                    >
                                        Voir les autres mentions
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </main>

                    <Footer />
                </div>
            </ThemeProvider>
        </CmsProvider>
    );
}
