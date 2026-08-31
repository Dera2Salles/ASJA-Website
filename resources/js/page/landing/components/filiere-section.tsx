import { cmsImage, useSection } from '@/lib/cms';
import { departmentLogo } from '@/lib/department-logos';
import { useThemeContext } from '@/page/theme/useThemeContext';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

// Imports des images réelles pour les fonds de chaque filière
import infoImg from '@/assets/Mentions/InformatiqueImage/Victoir_Hackathon2025-quality.jpg';
import ecoImg from '@/assets/Mentions/Economie/Eco-event-quality-5.jpg';
import droitImg from '@/assets/Mentions/Droit/student-droit-1.jpg';
import agroImg from '@/assets/Mentions/AgronomieImage/Agro.jpg';
import stImg from '@/assets/Mentions/SienceDeLaTerre/ST-VisiteSurTerain-quality.jpg';
import leaImg from '@/assets/Mentions/LEA/Visite_Culinaire_française-quality.jpg';

type Department = {
    id: number;
    slug: string;
    name: string;
    logo: string | null;
};

// Association des slugs aux images réelles importées
const departmentImages: Record<string, string> = {
    informatique: infoImg,
    droit: droitImg,
    economie: ecoImg,
    agronomie: agroImg,
    'sciences-de-la-terre': stImg,
    lea: leaImg,
};

// Parcours textuels de secours pour chaque filière (comme affichés dans le design HTML)
const departmentSubtitles: Record<string, string> = {
    informatique: 'Génie logiciel · Télécom · Génie industriel',
    droit: 'Affaires · Processuel',
    economie: 'Développement · Commerce international',
    agronomie: 'Animale · Végétale · Agroalimentaire',
    'sciences-de-la-terre': 'Hydrogéologie · Géologie minière',
    lea: 'Traduction · Interprétation · Communication interculturelle',
};

/** Returns the card "variant" for a given index, cycling if more than 6 cards. */
function cardVariant(index: number): 'photo-first' | 'dark' | 'green' | 'photo-last' {
    // Pattern: photo(col-2), dark, green, dark, dark, photo(col-2)
    const patterns = [
        'photo-first',
        'dark',
        'green',
        'dark',
        'dark',
        'photo-last',
    ] as const;
    return patterns[index % patterns.length];
}

/* ─── Photo background card (col-span-2) ─────────────────────────────────── */
const PhotoCard = ({
    department,
    index,
    isDark,
}: {
    department: Department;
    index: number;
    isDark: boolean;
}) => {
    const logo = cmsImage(department.logo, departmentLogo(department.slug, isDark));
    const bgImage = departmentImages[department.slug] || logo;
    const sub = departmentSubtitles[department.slug] || '';

    return (
        <motion.div
            className="col-span-2"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
        >
            <Link
                href={`/mention/${department.slug}`}
                className="relative flex min-h-[300px] overflow-hidden rounded-[22px] flex-col justify-end"
            >
                {/* Background image */}
                {bgImage && (
                    <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to bottom, rgba(14,20,17,0.1), rgba(14,20,17,0.88))',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 p-8">
                    {logo && (
                        <img
                            src={logo}
                            alt=""
                            className="mb-3.5 h-[52px] w-auto object-contain"
                        />
                    )}
                    <h3 className="font-display text-3xl font-extrabold uppercase text-white">
                        {department.name}
                    </h3>
                    {sub && <p className="mt-2 text-[14.5px] text-[#c3cec8] font-medium">{sub}</p>}
                </div>
            </Link>
        </motion.div>
    );
};

/* ─── Dark card (single col) ─────────────────────────────────────────────── */
const DarkCard = ({
    department,
    index,
    isDark,
}: {
    department: Department;
    index: number;
    isDark: boolean;
}) => {
    const logo = cmsImage(department.logo, departmentLogo(department.slug, isDark));
    const bgImage = departmentImages[department.slug] || logo;
    const sub = departmentSubtitles[department.slug] || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
        >
            <Link
                href={`/mention/${department.slug}`}
                className="relative bg-card flex min-h-[300px] flex-col justify-between rounded-[22px] p-8 overflow-hidden"
            >
                {/* Background image */}
                {bgImage && (
                    <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to bottom, rgba(14,20,17,0.15), rgba(14,20,17,0.85))',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-between min-h-[236px]">
                    {logo && (
                        <img
                            src={logo}
                            alt=""
                            className="h-[52px] w-auto object-contain self-start"
                        />
                    )}

                    <div className="mt-auto">
                        <h3 className="font-display text-[26px] font-extrabold uppercase text-white leading-tight">
                            {department.name}
                        </h3>
                        {sub && <p className="mt-2 text-sm text-[#9aa8a1] font-medium">{sub}</p>}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

/* ─── Green card (single col) ────────────────────────────────────────────── */
const GreenCard = ({
    department,
    index,
    isDark,
}: {
    department: Department;
    index: number;
    isDark: boolean;
}) => {
    const logo = cmsImage(department.logo, departmentLogo(department.slug, isDark));
    const bgImage = departmentImages[department.slug] || logo;
    const sub = departmentSubtitles[department.slug] || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
        >
            <Link
                href={`/mention/${department.slug}`}
                className="relative bg-primary text-primary-foreground flex min-h-[300px] flex-col justify-between rounded-[22px] p-8 overflow-hidden"
            >
                {/* Background image */}
                {bgImage && (
                    <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover grayscale opacity-25 mix-blend-multiply"
                    />
                )}

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-between min-h-[236px]">
                    {logo && (
                        <img
                            src={logo}
                            alt=""
                            className="h-[52px] w-auto object-contain self-start"
                        />
                    )}

                    <div className="mt-auto">
                        <h3 className="font-display text-[26px] font-extrabold uppercase leading-tight">
                            {department.name}
                        </h3>
                        {sub && <p className="mt-2 text-sm opacity-75 font-medium">{sub}</p>}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

/* ─── Section ─────────────────────────────────────────────────────────────── */
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
        <section id="filiere" className="band-dark py-[104px]">
            <div className="mx-auto max-w-[1320px] px-9">

                {/* ── Header ── */}
                <div className="mb-11 flex items-end justify-between gap-12">
                    <h2 className="font-display max-w-[640px] text-[clamp(42px,5vw,64px)] font-black uppercase leading-[0.98] tracking-tight text-foreground">
                        {String(programs.title ?? 'Six mentions. Un seul niveau\u00a0: haut.')}
                    </h2>

                    {programs.subtitle ? (
                        <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
                            {String(programs.subtitle)}
                        </p>
                    ) : null}
                </div>

                {/* ── Grid ── */}
                <div className="grid grid-cols-4 gap-4">
                    {list.map((department, index) => {
                        const variant = cardVariant(index);

                        if (variant === 'photo-first' || variant === 'photo-last') {
                            return (
                                <PhotoCard
                                    key={department.id}
                                    department={department}
                                    index={index}
                                    isDark={isDark}
                                />
                            );
                        }

                        if (variant === 'green') {
                            return (
                                <GreenCard
                                    key={department.id}
                                    department={department}
                                    index={index}
                                    isDark={isDark}
                                />
                            );
                        }

                        // default: 'dark'
                        return (
                            <DarkCard
                                key={department.id}
                                department={department}
                                index={index}
                                isDark={isDark}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
