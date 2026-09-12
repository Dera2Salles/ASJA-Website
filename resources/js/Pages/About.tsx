import { Breadcrumbs } from '@/Components/Breadcrumbs';
import { Img } from '@/Components/Img';
import { Seo } from '@/Components/Seo';
import {
    CmsProvider,
    cmsImage,
    cmsList,
    useSection,
    type CmsContent,
} from '@/lib/cms';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AppelCandidaterSection } from '../page/landing/components/appel-candidater-section';
import { BandTransition } from '../page/landing/components/band-transition';
import { Footer } from '../page/landing/components/footer';
import { Navbar } from '../page/landing/components/nav-bar';
import { ThemeProvider } from '../page/theme/useThemeProvider';

interface Props {
    cms: CmsContent;
}

type Value = { title: string; description: string; image?: string };
type Photo = { image?: string; caption?: string };
type Stat = { value: string; label: string };

/* Visuels livrés avec le site : la page est complète dès la première visite,
   avant qu'aucune photo n'ait été téléversée depuis l'administration. */
const fallbackGallery: Photo[] = [
    { image: '', caption: 'Le campus, façade principale' },
    { image: '', caption: 'La bibliothèque' },
    { image: '', caption: "L'amphithéâtre" },
    { image: '', caption: 'Les couloirs' },
    { image: '', caption: 'Le terrain de sport' },
];
const fallbackPhotos = [
    'Lieu_espace/Asja-devant-quality-2',
    'Lieu_espace/Bibliotheque-quality',
    'Lieu_espace/Amphitheatre-interieur',
    'Lieu_espace/asja_couloir',
    'Lieu_espace/terrain-basket',
];

/* ─── Bannière ───────────────────────────────────────────────────────────── */
const Hero = () => {
    const about = useSection('about');
    const image = cmsImage(about.hero_image);

    return (
        <section className="relative flex min-h-[58vh] w-full items-end overflow-hidden">
            {/* Bannière : l'élément LCP de la page. */}
            <Img
                src={image}
                source="Lieu_espace/Asja-devant-quality-2"
                alt=""
                aria-hidden="true"
                priority
                sizes="100vw"
                className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Le texte tombe toujours sur la moitié basse, la plus sombre du
                dégradé : aucun titre ne se retrouve blanc sur ciel clair. */}
            <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.5) 45%, rgba(0, 0, 0, 0.96) 100%)',
                }}
            />

            <div className="section-shell relative pb-12 sm:pb-14 lg:pb-[56px]">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="text-primary font-sans text-xs font-bold tracking-[0.18em] uppercase"
                >
                    {String(about.eyebrow ?? 'L’université')}
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="font-display mt-3 max-w-4xl leading-[0.95] font-black tracking-[-0.04em] text-white uppercase"
                    style={{ fontSize: 'clamp(32px, 8.4vw, 72px)' }}
                >
                    {String(about.title ?? 'À propos de l’ASJA')}
                </motion.h1>

                {about.intro ? (
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
                        style={{ color: '#cccccc' }}
                    >
                        {String(about.intro)}
                    </motion.p>
                ) : null}
            </div>
        </section>
    );
};

/* ─── Notre histoire ─────────────────────────────────────────────────────── */
const Story = () => {
    const about = useSection('about');
    const stats = cmsList<Stat>(useSection('stats').items);

    return (
        <section className="band-light section-rhythm">
            <div className="section-shell">
                {/* Photo et texte se partagent la rangée à partir de `md` ;
                    en dessous, la photo passe au-dessus du texte. */}
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="w-full shrink-0 overflow-hidden rounded-[22px] md:w-[46%]"
                    >
                        <Img
                            src={cmsImage(about.story_image)}
                            source="Lieu_espace/Bibliotheque-quality"
                            alt=""
                            aria-hidden="true"
                            sizes="(min-width: 768px) 46vw, 100vw"
                            className="aspect-[4/3] h-full w-full object-cover"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: 0.55,
                            delay: 0.08,
                            ease: 'easeOut',
                        }}
                        className="flex-1"
                    >
                        <h2 className="font-display text-foreground text-[clamp(28px,6vw,48px)] leading-[1] font-black tracking-tight uppercase">
                            {String(about.story_title ?? 'Notre histoire')}
                        </h2>
                        <p className="text-muted-foreground mt-5 text-[15px] leading-relaxed sm:text-base">
                            {String(about.story_text ?? '')}
                        </p>
                    </motion.div>
                </div>

                {/* Chiffres clés — la section `stats` du CMS, jusqu'ici saisie
                    dans l'administration sans être affichée nulle part. */}
                {stats.length > 0 ? (
                    <div className="border-border mt-12 grid grid-cols-2 gap-px border-t pt-10 sm:mt-14 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={`${stat.label}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{
                                    duration: 0.45,
                                    delay: index * 0.07,
                                    ease: 'easeOut',
                                }}
                            >
                                <p className="font-display text-primary text-[clamp(30px,6vw,48px)] leading-none font-black tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-muted-foreground mt-2 text-[13px] font-semibold tracking-[0.12em] uppercase">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
};

/* ─── Nos valeurs ────────────────────────────────────────────────────────── */
const Values = () => {
    const about = useSection('about');
    const values = cmsList<Value>(about.values);

    if (values.length === 0) return null;

    return (
        <section className="band-light section-rhythm">
            <div className="section-shell">
                <h2 className="font-display text-foreground mb-9 max-w-[640px] text-[clamp(30px,7.4vw,64px)] leading-[0.98] font-black tracking-tight uppercase sm:mb-11">
                    {String(about.values_title ?? 'Ce qui nous tient')}
                </h2>

                <div className="mobile-carousel sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {values.map((value, index) => {
                        const image = cmsImage(value.image);

                        return (
                            <motion.article
                                key={`${value.title}-${index}`}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.07,
                                    ease: 'easeOut',
                                }}
                            >
                                <div className="bg-card relative flex h-full min-h-[260px] flex-col justify-end overflow-hidden rounded-[22px] p-6 sm:p-7 lg:p-8">
                                    {image ? (
                                        <>
                                            <Img
                                                src={image}
                                                alt=""
                                                aria-hidden="true"
                                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw"
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            <div
                                                className="absolute inset-0"
                                                aria-hidden="true"
                                                style={{
                                                    background:
                                                        'linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.85))',
                                                }}
                                            />
                                        </>
                                    ) : null}

                                    <div className="relative z-10">
                                        <h3 className="font-display text-[22px] leading-tight font-extrabold text-white uppercase sm:text-[26px]">
                                            {value.title}
                                        </h3>
                                        <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#cccccc]">
                                            {value.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

/* ─── Galerie ────────────────────────────────────────────────────────────── */
const Gallery = () => {
    const about = useSection('about');
    const stored = cmsList<Photo>(about.gallery);
    const photos = stored.length > 0 ? stored : fallbackGallery;

    return (
        <section className="band-light pb-14 sm:pb-16 lg:pb-20">
            <div className="section-shell">
                <h2 className="font-display text-foreground mb-8 text-[clamp(26px,5.4vw,40px)] leading-[1] font-black tracking-tight uppercase sm:mb-10">
                    {String(about.gallery_title ?? 'Le campus en images')}
                </h2>

                <div className="mobile-carousel sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {photos.map((photo, index) => (
                        <motion.figure
                            key={`${photo.caption}-${index}`}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{
                                duration: 0.5,
                                delay: Math.min(index, 5) * 0.07,
                                ease: 'easeOut',
                            }}
                            className="m-0"
                        >
                            <div className="overflow-hidden rounded-[22px]">
                                <Img
                                    src={cmsImage(photo.image)}
                                    source={
                                        fallbackPhotos[
                                            index % fallbackPhotos.length
                                        ]
                                    }
                                    alt={photo.caption ?? ''}
                                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw"
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </div>
                            {photo.caption ? (
                                <figcaption className="text-muted-foreground mt-2.5 text-[13px] font-semibold">
                                    {photo.caption}
                                </figcaption>
                            ) : null}
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
};

/**
 * Page « À propos ».
 *
 * Elle reprend l'alternance de bandes de la page d'accueil — sombre pour la
 * bannière et les visuels, claire pour le récit — avec les mêmes fondus
 * (`BandTransition`) d'une bande à l'autre : aucun texte ne se retrouve posé
 * sur le dégradé. Tout son contenu vient de la section `about` du CMS.
 */
export default function About({ cms }: Props) {
    return (
        <CmsProvider content={cms}>
            <Head title="À propos" />
            <Seo />
            <ThemeProvider>
                <div className="square-corners flex min-h-screen flex-col overflow-x-clip">
                    <Navbar />

                    <main className="flex-1">
                        <Hero />

                        <BandTransition direction="dark-to-light" />

                        {/* Fil d'Ariane : la page se partage et s'atteint
                            depuis un moteur de recherche, pas seulement depuis
                            le menu. */}
                        <div className="band-light border-border border-b">
                            <div className="section-shell py-3.5">
                                <Breadcrumbs
                                    items={[
                                        { label: 'Accueil', href: '/' },
                                        { label: 'À propos' },
                                    ]}
                                />
                            </div>
                        </div>

                        <Story />

                        <BandTransition direction="light-to-dark" />

                        <Values />

                        <Gallery />

                        <AppelCandidaterSection />
                    </main>

                    <Footer />
                </div>
            </ThemeProvider>
        </CmsProvider>
    );
}
