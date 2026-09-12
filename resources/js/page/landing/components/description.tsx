import { Img } from '@/Components/Img';
import { cmsImage, useSection } from '@/lib/cms';
import { HERO_IMAGE } from '@/lib/images';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export const Description = () => {
    const hero = useSection('hero');

    const scrollToFiliere = () => {
        document
            .getElementById('filiere')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    /* Photo du hero, identique en light mode (pas de variante sombre).
       Sans valeur téléversée, `background` reste vide et <Img> sert les
       déclinaisons du visuel livré. */
    const background = cmsImage(hero.background_image);

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
            className="relative flex min-h-[78svh] w-full items-end overflow-hidden sm:min-h-[84vh] lg:min-h-[88vh]"
        >
            {/* Photo de fond : l'élément LCP de la page d'accueil.
                `priority` la sort de la file d'attente paresseuse, et la vue
                racine en pose le préchargement dans le document — sans quoi le
                navigateur ne la découvrirait qu'après l'exécution de React. */}
            <Img
                src={background}
                source={HERO_IMAGE}
                alt=""
                aria-hidden="true"
                priority
                sizes="100vw"
                className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Gradient overlay */}
            <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.5) 45%, rgba(0, 0, 0, 0.96) 100%)',
                }}
            />

            {/* Content */}
            <div className="section-shell relative pb-14 sm:pb-16 lg:pb-[72px]">
                {/* Pill badge */}
                <motion.span
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] leading-snug font-bold tracking-wide uppercase sm:px-4 sm:text-xs"
                >
                    {badgeText}
                </motion.span>

                {/* H1 */}
                <motion.h1
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                    className="font-display mt-5 max-w-[1080px] leading-[0.94] font-black tracking-[-0.045em] text-white uppercase sm:mt-[26px]"
                    // Le plancher de 56 px faisait déborder « ANTSIRABE » du
                    // cadre en dessous de 400 px de large ; 8,4 vw suit la
                    // largeur réelle de l'écran jusqu'au palier bureau.
                    style={{ fontSize: 'clamp(34px, 8.4vw, 104px)' }}
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
                    className="mt-7 flex flex-col gap-7 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-14"
                >
                    {/* Left: subtitle */}
                    <p
                        className="max-w-[520px] text-base leading-relaxed sm:text-lg"
                        style={{ color: '#cccccc' }}
                    >
                        {subtitleText}
                    </p>

                    {/* Right: CTA buttons */}
                    {/* Les deux libellés sont trop longs pour tenir côte à
                        côte sous 640 px : ils s'y brisaient sur trois lignes.
                        Pleine largeur et empilés au doigt, alignés dès qu'il y
                        a la place. */}
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-3.5">
                        <button
                            onClick={scrollToFiliere}
                            className="bg-primary text-primary-foreground inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full px-7 text-[15px] font-bold whitespace-nowrap transition-colors hover:bg-white hover:text-black sm:w-auto sm:px-8 sm:text-base"
                        >
                            {ctaLabel}
                        </button>

                        <Link
                            href="/actualites"
                            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/35 px-7 text-[15px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-white/10 sm:w-auto sm:px-8 sm:text-base"
                        >
                            Actualités &amp; événements
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
