import { useSection } from '@/lib/cms';
import { formatDate, postImage, type Post } from '@/lib/posts';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const PostCard = ({ post, index }: { post: Post; index: number }) => {
    const image = postImage(post);
    const dateText = formatDate(post.published_at);

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
            className="flex flex-col"
        >
            <Link
                href={`/actualites/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[22px] bg-card border border-border transition-colors duration-200 hover:bg-accent"
            >
                {image ? (
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                        <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-75 group-hover:scale-105"
                        />
                    </div>
                ) : null}

                <div className="flex flex-1 flex-col p-[26px]">
                    {dateText ? (
                        <p className="m-0 text-[12.5px] font-bold text-primary uppercase tracking-wider">
                            {dateText}
                        </p>
                    ) : null}

                    <h3
                        className="font-display font-bold text-foreground mt-2.5 transition-colors group-hover:text-primary"
                        style={{ fontSize: '21px', letterSpacing: '-0.015em', lineHeight: '1.2' }}
                    >
                        {post.title}
                    </h3>

                    {post.excerpt ? (
                        <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-[1.6] text-muted-foreground">
                            {post.excerpt}
                        </p>
                    ) : null}
                </div>
            </Link>
        </motion.article>
    );
};

export const BlogSection = ({ posts }: { posts: Post[] }) => {
    const content = useSection('blog');

    if (!posts || posts.length === 0) return null;

    return (
        <section id="actualites" className="py-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                
                {/* Header */}
                <div className="mb-10 flex items-end justify-between gap-10">
                    <h2
                        className="font-display font-black uppercase text-foreground m-0"
                        style={{
                            fontSize: '48px',
                            lineHeight: 1,
                            letterSpacing: '-0.035em',
                        }}
                    >
                        {String(content.title ?? 'Actualités & Annonces')}
                    </h2>
                    <Link
                        href="/actualites"
                        className="shrink-0 text-sm font-bold text-primary hover:underline"
                    >
                        Toutes les actus →
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {posts.slice(0, 3).map((post, index) => (
                        <PostCard key={post.id} post={post} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};
