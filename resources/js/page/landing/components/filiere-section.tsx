import { cmsImage, useSection } from '@/lib/cms';
import { departmentLogo } from '@/lib/department-logos';
import { useThemeContext } from '@/page/theme/useThemeContext';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from './section-heading';

type Department = {
    id: number;
    slug: string;
    name: string;
    logo: string | null;
};

const MentionCard = ({
    department,
    index,
    isDark,
}: {
    department: Department;
    index: number;
    isDark: boolean;
}) => {
    const logo = cmsImage(
        department.logo,
        departmentLogo(department.slug, isDark),
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
        >
            <Link
                href={`/mention/${department.slug}`}
                className="border-border bg-card hover:bg-primary group flex h-full flex-col items-center border p-7 text-center"
            >
                {logo ? (
                    <div className="mb-5 flex h-24 w-24 items-center justify-center">
                        <img
                            src={logo}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                ) : null}

                <h3 className="text-foreground group-hover:text-primary-foreground text-base font-bold">
                    {department.name}
                </h3>

                <span className="text-primary-foreground mt-4 hidden items-center gap-1 text-sm font-bold uppercase group-hover:inline-flex">
                    Découvrir
                    <ArrowUpRight className="h-4 w-4" />
                </span>
            </Link>
        </motion.div>
    );
};

export const FiliereSection = () => {
    const { isDark } = useThemeContext();
    const programs = useSection('programs');

    // Les mentions proviennent de la base : leurs adresses sont donc toujours
    // valides, contrairement à l'ancienne liste écrite en dur.
    const { departments } = usePage().props as unknown as {
        departments?: Department[];
    };

    const list = departments ?? [];

    if (list.length === 0) return null;

    return (
        <section id="filiere" className="band-light section">
            <div className="section-container">
                <SectionHeading
                    eyebrow={String(programs.eyebrow ?? '')}
                    title={String(programs.title ?? '')}
                    subtitle={String(programs.subtitle ?? '')}
                />

                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
                    {list.map((department, index) => (
                        <MentionCard
                            key={department.id}
                            department={department}
                            index={index}
                            isDark={isDark}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
