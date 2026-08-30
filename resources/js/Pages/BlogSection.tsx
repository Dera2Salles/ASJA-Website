import { useSection } from '@/lib/cms';
import { formatDate, postImage, type Post } from '@/lib/posts';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '../page/landing/components/section-heading';

const PostCard = ({ post, index }: { post: Post; index: number }) => {
    const image = postImage(post);

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
            className="group flex flex-col"
        >
            <Link
                href={`/actualites/${post.slug}`}
                className="border-border bg-card elevation-1 hover:elevation-3 flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-1"
            >
                <div className="bg-muted relative aspect-[16/10] overflow-hidden">
                    {image ? (
                        <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : null}
                </div>

                <div className="flex flex-1 flex-col p-6">
                    <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs">
                        {post.category ? (
                            <>
                                <span className="text-primary font-semibold">
                                    {post.category}
                                </span>
                                <span aria-hidden="true">·</span>
                            </>
                        ) : null}
                        <time>{formatDate(post.published_at)}</time>
                    </div>

                    <h3 className="text-foreground group-hover:text-primary mb-2 text-lg font-bold transition-colors">
                        {post.title}
                    </h3>

                    {post.excerpt ? (
                        <p className="text-muted-foreground line-clamp-3 flex-1 text-sm leading-relaxed">
                            {post.excerpt}
                        </p>
                    ) : null}

                    <span className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
                        Lire la suite
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </Link>
        </motion.article>
    );
};

export const BlogSection = ({ posts }: { posts: Post[] }) => {
    const content = useSection('blog');

    if (!posts || posts.length === 0) return null;

    return (
        // L'ancre « actualites » remplace « events », qui était déjà utilisée
        // par la section Événements : deux éléments partageaient le même id,
        // ce qui cassait le défilement depuis la navigation.
        <section id="actualites" className="bg-muted/40 section">
            <div className="section-container">
                <SectionHeading
                    eyebrow={String(content.eyebrow ?? '')}
                    title={String(content.title ?? '')}
                    subtitle={String(content.subtitle ?? '')}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post, index) => (
                        <PostCard key={post.id} post={post} index={index} />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/actualites"
                        className="border-border text-foreground hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition-colors"
                    >
                        {String(content.cta_label ?? '')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
