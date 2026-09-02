import asjaDark from '@/assets/Lieu_espace/Devant_asja.jpg';
import { cmsImage, useSection } from '@/lib/cms';
import { useThemeContext } from '@/page/theme/useThemeContext';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export const Description = () => {
    const { isDark } = useThemeContext();
    const hero = useSection('hero');

    const scrollToFiliere = () => {
        document
            .getElementById('filiere')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    // Force dark version since the site is strictly in dark mode
    const background = cmsImage(hero.background_image, asjaDark);

    const badgeText = String(
        hero.badge ?? 'Rentrée 2026 · Inscriptions ouvertes',
    );
    const titleText = String(hero.title ?? '');
    const highlightText = String(hero.title_highlight ?? '');
    const subtitleText = String(hero.subtitle ?? '');
    const ctaLabel = String(hero.cta_label ?? 'Découvrir nos filières');

    return (
        <section
            id="description"
            className="relative flex min-h-[88vh] w-full items-end overflow-hidden"
        >
            {/* Background image */}
            <img
                src={background}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Gradient overlay */}
            <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(14,20,17,0.35) 0%, rgba(14,20,17,0.5) 45%, rgba(14,20,17,0.96) 100%)',
                }}
            />

            {/* Content */}
            <div
                className="relative mx-auto w-full"
                style={{ maxWidth: '1320px', padding: '0 36px 72px' }}
            >
                {/* Pill badge */}
                <motion.span
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-wide uppercase"
                >
                    {badgeText}
                </motion.span>

                {/* H1 */}
                <motion.h1
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                    className="font-display mt-[26px] max-w-[1080px] leading-[0.94] font-black tracking-[-0.045em] text-white uppercase"
                    style={{ fontSize: 'clamp(56px, 8vw, 104px)' }}
                >
                    {titleText}
                    {highlightText && (
                        <>
                            <br />
                            <span className="text-primary">
                                {highlightText}
                            </span>
                        </>
                    )}
                </motion.h1>

                {/* Row: subtitle + buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.22, ease: 'easeOut' }}
                    className="mt-9 flex flex-row flex-wrap items-end justify-between gap-14"
                >
                    {/* Left: subtitle */}
                    <p
                        className="max-w-[520px] text-lg leading-relaxed"
                        style={{ color: '#c3cec8' }}
                    >
                        {subtitleText}
                    </p>

                    {/* Right: CTA buttons */}
                    <div className="flex gap-3.5">
                        <button
                            onClick={scrollToFiliere}
                            className="bg-primary text-primary-foreground cursor-pointer rounded-full px-8 py-4 text-base font-bold transition-colors hover:bg-white hover:text-black"
                        >
                            {ctaLabel}
                        </button>

                        <Link
                            href="/actualites"
                            className="rounded-full border border-white/35 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            Actualités &amp; événements
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
