import { cmsImage, useSection } from '@/lib/cms';
import { departmentLogo } from '@/lib/department-logos';
import { useThemeContext } from '@/page/theme/useThemeContext';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

// Imports des images réelles pour les fonds de chaque filière
import agroImg from '@/assets/Mentions/AgronomieImage/Agro.jpg';
import droitImg from '@/assets/Mentions/Droit/student-droit-1.jpg';
import ecoImg from '@/assets/Mentions/Economie/Eco-event-quality-5.jpg';
import infoImg from '@/assets/Mentions/InformatiqueImage/Victoir_Hackathon2025-quality.jpg';
import leaImg from '@/assets/Mentions/LEA/Visite_Culinaire_française-quality.jpg';
import stImg from '@/assets/Mentions/SienceDeLaTerre/ST-VisiteSurTerain-quality.jpg';

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
function cardVariant(
    index: number,
): 'photo-first' | 'dark' | 'green' | 'photo-last' {
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
    const logo = cmsImage(
        department.logo,
        departmentLogo(department.slug, isDark),
    );
    const bgImage = departmentImages[department.slug] || logo;
    const sub = departmentSubtitles[department.slug] || '';

    return (
        <motion.div
            className="sm:col-span-2"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
        >
            <Link
                href={`/mention/${department.slug}`}
                className="relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-[22px] sm:min-h-[280px] lg:min-h-[300px]"
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
                            'linear-gradient(to bottom, rgba(20,27,23,0.1), rgba(20,27,23,0.88))',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 p-6 sm:p-7 lg:p-8">
                    {logo && (
                        <img
                            src={logo}
                            alt=""
                            className="mb-3 h-11 w-auto object-contain sm:mb-3.5 sm:h-[52px]"
                        />
                    )}
                    <h3 className="font-display text-2xl leading-tight font-extrabold text-white uppercase sm:text-3xl">
                        {department.name}
                    </h3>
                    {sub && (
                        <p className="mt-2 text-[13.5px] leading-snug font-medium text-[#c3cec8] sm:text-[14.5px]">
                            {sub}
                        </p>
                    )}
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
    const logo = cmsImage(
        department.logo,
        departmentLogo(department.slug, isDark),
    );
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
                className="bg-card relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[22px] p-6 sm:min-h-[280px] sm:p-7 lg:min-h-[300px] lg:p-8"
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
                            'linear-gradient(to bottom, rgba(20,27,23,0.15), rgba(20,27,23,0.85))',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex h-full min-h-[184px] flex-col justify-between sm:min-h-[210px] lg:min-h-[236px]">
                    {logo && (
                        <img
                            src={logo}
                            alt=""
                            className="h-11 w-auto self-start object-contain sm:h-[52px]"
                        />
                    )}

                    <div className="mt-auto">
                        <h3 className="font-display text-[22px] leading-tight font-extrabold text-white uppercase sm:text-[26px]">
                            {department.name}
                        </h3>
                        {sub && (
                            <p className="mt-2 text-[13.5px] leading-snug font-medium text-[#9aa8a1] sm:text-sm">
                                {sub}
                            </p>
                        )}
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
    const logo = cmsImage(
        department.logo,
        departmentLogo(department.slug, isDark),
    );
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
                className="bg-primary text-primary-foreground relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[22px] p-6 sm:min-h-[280px] sm:p-7 lg:min-h-[300px] lg:p-8"
            >
                {/* Background image */}
                {bgImage && (
                    <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply grayscale"
                    />
                )}

                {/* Content */}
                <div className="relative z-10 flex h-full min-h-[184px] flex-col justify-between sm:min-h-[210px] lg:min-h-[236px]">
                    {logo && (
                        <img
                            src={logo}
                            alt=""
                            className="h-11 w-auto self-start object-contain sm:h-[52px]"
                        />
                    )}

                    <div className="mt-auto">
                        <h3 className="font-display text-[22px] leading-tight font-extrabold uppercase sm:text-[26px]">
                            {department.name}
                        </h3>
                        {sub && (
                            <p className="mt-2 text-[13.5px] leading-snug font-medium opacity-75 sm:text-sm">
                                {sub}
                            </p>
                        )}
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
        <section id="filiere" className="band-dark section-rhythm">
            <div className="section-shell">
                {/* ── Header ──
                    Le titre et le chapô partageaient une rangée sans point de
                    rupture : sous 700 px, le chapô se retrouvait comprimé sur
                    une colonne de quelques caractères, à cheval sur le titre. */}
                <div className="mb-9 flex flex-col gap-4 sm:mb-11 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
                    <h2 className="font-display text-foreground max-w-[640px] text-[clamp(30px,7.4vw,64px)] leading-[0.98] font-black tracking-tight uppercase">
                        {String(
                            programs.title ??
                                'Six mentions. Un seul niveau\u00a0: haut.',
                        )}
                    </h2>

                    {programs.subtitle ? (
                        <p className="text-muted-foreground max-w-sm text-[15px] leading-relaxed sm:text-base">
                            {String(programs.subtitle)}
                        </p>
                    ) : null}
                </div>

                {/* ── Grid ──
                    `grid-cols-4` était figé : sur téléphone, chaque mention
                    tombait à ~70 px de large et son nom débordait par-dessus
                    la carte voisine. La mosaïque du bureau est intacte à
                    partir de `lg`. */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    {list.map((department, index) => {
                        const variant = cardVariant(index);

                        if (
                            variant === 'photo-first' ||
                            variant === 'photo-last'
                        ) {
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
