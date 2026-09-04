import { CmsProvider, type CmsContent } from '@/lib/cms';
import {
    formatDate,
    formatEventPeriod,
    POST_TYPE_LABELS,
    postImage,
    type Post,
} from '@/lib/posts';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    Link2,
    MapPin,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { BandTransition } from '../page/landing/components/band-transition';
import { Footer } from '../page/landing/components/footer';
import { Navbar } from '../page/landing/components/nav-bar';
import { ThemeProvider } from '../page/theme/useThemeProvider';

interface Props {
    post: Post;
    related: Post[];
    cms: CmsContent;
}

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
                    <img
                        src={image}
                        alt=""
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
    const isEvent = post.type === 'evenement';
    const period = isEvent ? formatEventPeriod(post) : '';

    return (
        <div className="flex min-h-screen flex-col overflow-x-clip">
            <Navbar />

            <main className="flex-1">
                <article>
                    <div className="band-dark">
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
                        {image ? (
                            <motion.figure
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="border-border overflow-hidden border-b"
                            >
                                <img
                                    src={image}
                                    alt=""
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
            <ThemeProvider>
                <ArticleContent {...props} />
            </ThemeProvider>
        </CmsProvider>
    );
}
