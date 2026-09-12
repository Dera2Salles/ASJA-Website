import { Breadcrumbs } from '@/Components/Breadcrumbs';
import { Img } from '@/Components/Img';
import { Seo } from '@/Components/Seo';
import { CmsProvider, type CmsContent } from '@/lib/cms';
import {
    formatDate,
    formatEventPeriod,
    POST_TYPE_LABELS,
    postGalleryImages,
    postImage,
    type Post,
} from '@/lib/posts';
import { Head, Link } from '@inertiajs/react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Images,
    Link2,
    MapPin,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BandTransition } from '../page/landing/components/band-transition';
import { Footer } from '../page/landing/components/footer';
import { Navbar } from '../page/landing/components/nav-bar';
import { ThemeProvider } from '../page/theme/useThemeProvider';

interface Props {
    post: Post;
    related: Post[];
    cms: CmsContent;
}

const GalleryViewer = ({ images }: { images: string[] }) => {
    const reduceMotion = useReducedMotion();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const [emblaRef, embla] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        loop: false,
        duration: reduceMotion ? 0 : 26,
    });

    const [snaps, setSnaps] = useState<number[]>([]);
    const [selected, setSelected] = useState(0);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const onSelect = useCallback(() => {
        if (!embla) return;
        setSelected(embla.selectedScrollSnap());
        setCanPrev(embla.canScrollPrev());
        setCanNext(embla.canScrollNext());
    }, [embla]);

    const onReInit = useCallback(() => {
        if (!embla) return;
        setSnaps(embla.scrollSnapList());
        onSelect();
    }, [embla, onSelect]);

    useEffect(() => {
        if (!embla) return;
        onReInit();
        embla.on('select', onSelect);
        embla.on('reInit', onReInit);
        return () => {
            embla.off('select', onSelect);
            embla.off('reInit', onReInit);
        };
    }, [embla, onSelect, onReInit]);

    const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
    const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

    // Clavier pour la modal lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;

        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            else if (e.key === 'ArrowLeft') {
                setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : images.length - 1,
                );
            } else if (e.key === 'ArrowRight') {
                setLightboxIndex((prev) =>
                    prev !== null && prev < images.length - 1 ? prev + 1 : 0,
                );
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIndex, images.length]);

    if (images.length === 0) return null;

    return (
        <div className="border-border mt-12 space-y-4 border-t pt-10">
            <div className="flex items-center justify-between">
                <h3 className="font-display text-foreground flex items-center gap-2 text-xl font-bold uppercase">
                    <Images className="text-primary h-5 w-5" />
                    Galerie photos ({images.length})
                </h3>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={scrollPrev}
                        disabled={!canPrev}
                        aria-label="Image précédente"
                        className="border-border text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={scrollNext}
                        disabled={!canNext}
                        aria-label="Image suivante"
                        className="border-border text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Piste Carrousel */}
            <div ref={emblaRef} className="overflow-hidden rounded-[22px]">
                <div className="-ml-3 flex touch-pan-y sm:-ml-4">
                    {images.map((url, idx) => (
                        <div
                            key={idx}
                            className="min-w-0 shrink-0 grow-0 basis-[85%] pl-3 sm:basis-1/2 sm:pl-4 md:basis-1/3"
                        >
                            <button
                                type="button"
                                onClick={() => setLightboxIndex(idx)}
                                className="group border-border bg-muted relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[16px] border transition-transform"
                            >
                                <Img
                                    src={url}
                                    alt={`Photo ${idx + 1} de la galerie, cliquer pour agrandir`}
                                    sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 85vw"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pastilles indicatrices */}
            {snaps.length > 1 ? (
                <div className="flex items-center justify-center gap-1 pt-2">
                    {snaps.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => embla?.scrollTo(idx)}
                            className="flex h-6 items-center justify-center px-1"
                        >
                            <span
                                className={`block h-1.5 rounded-full ${
                                    idx === selected
                                        ? 'bg-primary w-6'
                                        : 'bg-foreground/20 w-1.5'
                                }`}
                                style={{
                                    transition:
                                        'width 240ms ease-out, background-color 200ms ease-out',
                                }}
                            />
                        </button>
                    ))}
                </div>
            ) : null}

            {/* Lightbox plein écran */}
            {lightboxIndex !== null ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxIndex(null)}
                        aria-label="Fermer"
                        className="hover:text-primary absolute top-5 right-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div
                        className="relative max-h-[85vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[lightboxIndex]}
                            alt={`Photo ${lightboxIndex + 1} sur ${images.length}`}
                            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                        />
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-white/80">
                            {lightboxIndex + 1} / {images.length}
                        </div>
                    </div>

                    {images.length > 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex((prev) =>
                                        prev !== null && prev > 0
                                            ? prev - 1
                                            : images.length - 1,
                                    );
                                }}
                                aria-label="Précédente"
                                className="hover:text-primary absolute top-1/2 left-4 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex((prev) =>
                                        prev !== null &&
                                        prev < images.length - 1
                                            ? prev + 1
                                            : 0,
                                    );
                                }}
                                aria-label="Suivante"
                                className="hover:text-primary absolute top-1/2 right-4 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};

const ShareButton = () => {
    const [copied, setCopied] = useState(false);

    const share = async () => {
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({ url, title: document.title });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Ignored
        }
    };

    return (
        <button
            onClick={share}
            className="border-border bg-card text-foreground hover:bg-accent cursor-pointer rounded-full border px-5 py-2.5 text-xs font-bold uppercase transition-colors"
        >
            {copied ? (
                <span className="inline-flex items-center gap-1.5">
                    <Check className="text-primary h-3.5 w-3.5" />
                    Lien copié
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />
                    Partager
                </span>
            )}
        </button>
    );
};

const RelatedCard = ({ post }: { post: Post }) => {
    const image = postImage(post);

    return (
        <Link
            href={`/actualites/${post.slug}`}
            className="group border-border bg-card hover:bg-accent flex h-full flex-col overflow-hidden rounded-[22px] border transition-colors"
        >
            <div className="bg-muted aspect-[16/10] overflow-hidden">
                {image ? (
                    <Img
                        src={image}
                        alt=""
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : null}
            </div>
            <div className="flex flex-1 flex-col p-6">
                <p className="text-muted-foreground mb-2 text-xs font-semibold">
                    {formatDate(post.published_at)}
                </p>
                <h3 className="font-display text-foreground group-hover:text-primary text-lg font-bold transition-colors">
                    {post.title}
                </h3>
            </div>
        </Link>
    );
};

function ArticleContent({ post, related }: Omit<Props, 'cms'>) {
    const image = postImage(post);
    const gallery = postGalleryImages(post);
    const isEvent = post.type === 'evenement';
    const period = isEvent ? formatEventPeriod(post) : '';

    return (
        <div className="square-corners flex min-h-screen flex-col overflow-x-clip">
            <Navbar />

            <main className="flex-1">
                <article>
                    <div className="band-light">
                        <header className="border-border border-b py-14 md:py-20">
                            <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
                                <Link
                                    href="/actualites"
                                    className="text-muted-foreground hover:text-primary group mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Toutes les actualités
                                </Link>

                                <div className="mb-5 flex flex-wrap items-center gap-2">
                                    <span className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-[10px] font-bold tracking-[0.14em] uppercase">
                                        {POST_TYPE_LABELS[post.type] ??
                                            'Publication'}
                                    </span>
                                    {post.category ? (
                                        <span className="border-border text-muted-foreground bg-card rounded-full border px-4 py-1.5 text-[10px] font-bold tracking-[0.14em] uppercase">
                                            {post.category}
                                        </span>
                                    ) : null}
                                </div>

                                <h1
                                    className="font-display text-foreground leading-[1.05] font-black tracking-tight uppercase"
                                    style={{
                                        fontSize: 'clamp(27px, 7vw, 56px)',
                                    }}
                                >
                                    {post.title}
                                </h1>

                                {post.excerpt ? (
                                    <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                ) : null}

                                <div className="text-muted-foreground mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold">
                                    {post.author ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <User className="text-primary h-3.5 w-3.5" />
                                            {post.author.name}
                                        </span>
                                    ) : null}
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays className="text-primary h-3.5 w-3.5" />
                                        {formatDate(post.published_at)}
                                    </span>
                                </div>
                            </div>
                        </header>

                        {isEvent && (period || post.location) ? (
                            <div className="border-border bg-card/30 border-b">
                                <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8">
                                    <dl className="grid gap-5 sm:grid-cols-2">
                                        {period ? (
                                            <div>
                                                <dt className="text-muted-foreground text-[10px] font-bold tracking-[0.14em] uppercase">
                                                    Date
                                                </dt>
                                                <dd className="text-foreground mt-1.5 inline-flex items-center gap-2 font-bold">
                                                    <CalendarDays className="text-primary h-4 w-4" />
                                                    {period}
                                                </dd>
                                            </div>
                                        ) : null}

                                        {post.location ? (
                                            <div>
                                                <dt className="text-muted-foreground text-[10px] font-bold tracking-[0.14em] uppercase">
                                                    Lieu
                                                </dt>
                                                <dd className="text-foreground mt-1.5 inline-flex items-center gap-2 font-bold">
                                                    <MapPin className="text-primary h-4 w-4" />
                                                    {post.location}
                                                </dd>
                                            </div>
                                        ) : null}
                                    </dl>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Le chapeau tient l'aplat noir ; l'article se lit
                        ensuite en blanc, le passage se faisant au scroll. */}
                    <BandTransition direction="dark-to-light" />

                    <div className="band-light">
                        {/* Fil d'Ariane : on arrive presque toujours ici d'un
                            lien partagé ou d'un moteur de recherche, donc sans
                            être passé par la liste des actualités. */}
                        <div className="border-border border-b">
                            <div className="mx-auto w-full max-w-3xl px-5 py-3.5 sm:px-8">
                                <Breadcrumbs
                                    items={[
                                        { label: 'Accueil', href: '/' },
                                        {
                                            label: 'Actualités',
                                            href: '/actualites',
                                        },
                                        { label: post.title },
                                    ]}
                                />
                            </div>
                        </div>

                        {image ? (
                            <motion.figure
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="border-border overflow-hidden border-b"
                            >
                                {/* Photo de couverture : l'élément LCP de
                                    l'article. */}
                                <Img
                                    src={image}
                                    alt=""
                                    priority
                                    sizes="100vw"
                                    className="aspect-[21/9] w-full object-cover"
                                />
                            </motion.figure>
                        ) : null}

                        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 md:py-20">
                            <div
                                className="article-content"
                                dangerouslySetInnerHTML={{
                                    __html: post.content ?? '',
                                }}
                            />

                            {/* Galerie d'images */}
                            <GalleryViewer images={gallery} />

                            {post.tags && post.tags.length > 0 ? (
                                <div className="mt-12 flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="border-border text-muted-foreground bg-card rounded-full border px-4 py-1.5 text-xs font-semibold"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            ) : null}

                            <div className="border-border mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
                                <Link
                                    href="/actualites"
                                    className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-xs font-bold uppercase transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Retour aux actualités
                                </Link>

                                <ShareButton />
                            </div>
                        </div>

                        {related.length > 0 ? (
                            <section className="border-border border-t py-14 sm:py-16 lg:py-[80px]">
                                <div className="section-shell">
                                    <h2 className="font-display text-foreground mb-9 text-2xl font-bold md:text-3xl">
                                        À lire également
                                    </h2>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        {related.map((item) => (
                                            <RelatedCard
                                                key={item.id}
                                                post={item}
                                            />
                                        ))}
                                    </div>

                                    <div className="mt-10">
                                        <Link
                                            href="/actualites"
                                            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-full border px-7 py-3 text-xs font-bold uppercase transition-colors"
                                        >
                                            Voir toutes les publications
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        ) : null}
                    </div>
                </article>
            </main>

            {/* Retour au noir pour rejoindre le pied de page. */}
            <BandTransition direction="light-to-dark" />

            <Footer />
        </div>
    );
}

export default function BlogPostPage({ cms, ...props }: Props) {
    return (
        <CmsProvider content={cms}>
            <Head title={props.post.title} />
            <Seo />
            <ThemeProvider>
                <ArticleContent {...props} />
            </ThemeProvider>
        </CmsProvider>
    );
}
