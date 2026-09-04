import { CmsProvider, useSection, type CmsContent } from '@/lib/cms';
import {
    formatDate,
    formatEventPeriod,
    POST_TYPE_LABELS,
    postImage,
    type Post,
    type PostType,
} from '@/lib/posts';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, Pin } from 'lucide-react';
import { BandTransition } from '../../page/landing/components/band-transition';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { ThemeProvider } from '../../page/theme/useThemeProvider';

interface Paginated {
    data: Post[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    posts: Paginated;
    filters: { type: PostType | null };
    counts: Record<string, number>;
    cms: CmsContent;
}

const FILTERS: { key: PostType | null; label: string; countKey: string }[] = [
    { key: null, label: 'Tout', countKey: 'all' },
    { key: 'article', label: 'Articles', countKey: 'article' },
    { key: 'annonce', label: 'Annonces', countKey: 'annonce' },
    { key: 'evenement', label: 'Événements', countKey: 'evenement' },
];

function dateLine(post: Post): { icon: React.ReactNode; text: string } | null {
    if (post.type === 'evenement' && post.event_start_at) {
        return {
            icon: <CalendarDays className="h-3.5 w-3.5" />,
            text: formatEventPeriod(post),
        };
    }

    const text = formatDate(post.published_at);
    return text ? { icon: null, text } : null;
}

const PostCard = ({
    post,
    index,
    featured = false,
}: {
    post: Post;
    index: number;
    featured?: boolean;
}) => {
    const image = postImage(post);
    const date = dateLine(post);

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.06 }}
            className={featured ? 'md:col-span-2 lg:col-span-3' : ''}
        >
            <Link
                href={`/actualites/${post.slug}`}
                className={`group border-border bg-card hover:bg-accent flex h-full overflow-hidden rounded-[22px] border transition-colors ${
                    featured ? 'flex-col md:flex-row' : 'flex-col'
                }`}
            >
                <div
                    className={`bg-muted relative overflow-hidden ${
                        featured
                            ? 'aspect-[16/10] md:aspect-auto md:w-1/2 md:shrink-0'
                            : 'aspect-[16/10]'
                    }`}
                >
                    {image ? (
                        <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : null}

                    <span className="bg-primary text-primary-foreground absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                        {POST_TYPE_LABELS[post.type] ?? 'Publication'}
                    </span>
                </div>

                <div
                    className={`flex flex-1 flex-col p-7 ${featured ? 'md:p-9' : ''}`}
                >
                    <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                        {post.is_pinned ? (
                            <span className="text-primary inline-flex items-center gap-1">
                                <Pin className="h-3 w-3" />
                                Épinglé
                            </span>
                        ) : null}

                        {date ? (
                            <span className="inline-flex items-center gap-1.5">
                                {date.icon}
                                {date.text}
                            </span>
                        ) : null}

                        {post.category ? (
                            <span className="text-primary">
                                {post.category}
                            </span>
                        ) : null}
                    </div>

                    <h2
                        className={`font-display text-foreground group-hover:text-primary font-bold transition-colors ${
                            featured ? 'text-2xl md:text-3xl' : 'text-xl'
                        }`}
                    >
                        {post.title}
                    </h2>

                    {post.excerpt ? (
                        <p
                            className={`text-muted-foreground mt-3 leading-relaxed ${
                                featured
                                    ? 'line-clamp-4'
                                    : 'line-clamp-3 text-sm'
                            }`}
                        >
                            {post.excerpt}
                        </p>
                    ) : null}

                    {post.location ? (
                        <p className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-xs">
                            <MapPin className="h-3.5 w-3.5" />
                            {post.location}
                        </p>
                    ) : null}

                    <span className="text-primary mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-bold uppercase">
                        Lire
                        <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                </div>
            </Link>
        </motion.article>
    );
};

function BlogIndexContent({ posts, filters, counts }: Omit<Props, 'cms'>) {
    const blog = useSection('blog');
    const activeType = filters.type ?? null;

    const showFeatured = posts.current_page === 1 && !activeType;

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Navbar />

            <main className="flex-1">
                <section className="band-dark pt-[104px] pb-[72px]">
                    <div
                        className="mx-auto w-full px-9"
                        style={{ maxWidth: '1320px' }}
                    >
                        {/* Header */}
                        <div className="mb-12 text-center">
                            <h1
                                className="font-display text-foreground font-black uppercase"
                                style={{
                                    fontSize: 'clamp(40px, 5vw, 64px)',
                                    lineHeight: 1,
                                    letterSpacing: '-0.04em',
                                }}
                            >
                                {String(blog.title ?? 'Actualités & Annonces')}
                            </h1>
                            {blog.subtitle ? (
                                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed">
                                    {String(blog.subtitle)}
                                </p>
                            ) : null}
                        </div>

                        {/* Filtres style pilules */}
                        <div className="mb-12 flex flex-wrap justify-center gap-2">
                            {FILTERS.map((filter) => {
                                const isActive = activeType === filter.key;
                                const count = counts[filter.countKey] ?? 0;

                                if (count === 0 && filter.key !== null)
                                    return null;

                                return (
                                    <Link
                                        key={filter.label}
                                        href={
                                            filter.key
                                                ? `/actualites?type=${filter.key}`
                                                : '/actualites'
                                        }
                                        className={`rounded-full px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition-colors ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border-border border'
                                        }`}
                                    >
                                        {filter.label}
                                        <span className="ml-2 opacity-60">
                                            {count}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Le titre et les filtres tiennent l'aplat noir ; la liste se
                    lit ensuite en blanc, le passage se faisant au scroll. */}
                <BandTransition direction="dark-to-light" />

                <section className="band-light pb-[104px]">
                    <div
                        className="mx-auto w-full px-9"
                        style={{ maxWidth: '1320px' }}
                    >
                        {posts.data.length === 0 ? (
                            <div className="border-border rounded-[22px] border border-dashed py-24 text-center">
                                <h3 className="text-foreground text-lg font-bold">
                                    Aucune publication
                                </h3>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    Revenez bientôt pour suivre l'actualité de
                                    l'ASJA.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {posts.data.map((post, index) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        index={index}
                                        featured={showFeatured && index === 0}
                                    />
                                ))}
                            </div>
                        )}

                        {posts.last_page > 1 ? (
                            <nav
                                aria-label="Pagination"
                                className="mt-14 flex flex-wrap justify-center gap-2"
                            >
                                {Array.from(
                                    { length: posts.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => {
                                    const params = new URLSearchParams();
                                    if (activeType)
                                        params.set('type', activeType);
                                    if (page > 1)
                                        params.set('page', String(page));
                                    const query = params.toString();

                                    return (
                                        <Link
                                            key={page}
                                            href={`/actualites${query ? `?${query}` : ''}`}
                                            aria-current={
                                                page === posts.current_page
                                                    ? 'page'
                                                    : undefined
                                            }
                                            className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
                                                page === posts.current_page
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    );
                                })}
                            </nav>
                        ) : null}
                    </div>
                </section>
            </main>

            {/* Retour au noir pour rejoindre le pied de page. */}
            <BandTransition direction="light-to-dark" />

            <Footer />
        </div>
    );
}

export default function BlogIndex({ cms, ...props }: Props) {
    return (
        <CmsProvider content={cms}>
            <Head title="Actualités" />
            <ThemeProvider>
                <BlogIndexContent {...props} />
            </ThemeProvider>
        </CmsProvider>
    );
}
