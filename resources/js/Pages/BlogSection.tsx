import { useSection } from '@/lib/cms';
import { formatDate, postImage, type Post } from '@/lib/posts';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

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
                className="group bg-card border-border hover:bg-accent flex h-full flex-col overflow-hidden rounded-[22px] border transition-colors duration-200"
            >
                {image ? (
                    <div
                        className="relative overflow-hidden"
                        style={{ aspectRatio: '16/10' }}
                    >
                        <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-75 group-hover:scale-105"
                        />
                    </div>
                ) : null}

                <div className="flex flex-1 flex-col p-5 sm:p-[26px]">
                    {dateText ? (
                        <p className="text-primary m-0 text-[12.5px] font-bold tracking-wider uppercase">
                            {dateText}
                        </p>
                    ) : null}

                    <h3
                        className="font-display text-foreground group-hover:text-primary mt-2.5 font-bold transition-colors"
                        style={{
                            fontSize: '21px',
                            letterSpacing: '-0.015em',
                            lineHeight: '1.2',
                        }}
                    >
                        {post.title}
                    </h3>

                    {post.excerpt ? (
                        <p className="text-muted-foreground mt-2.5 line-clamp-2 text-[14.5px] leading-[1.6]">
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
        <section id="actualites" className="section-rhythm">
            <div className="section-shell">
                {/* Header — le titre et le lien se partageaient une rangée sans
                    rupture ; sous 420 px, « Toutes les actus » venait mordre
                    sur le titre. */}
                <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
                    <h2
                        className="font-display text-foreground m-0 font-black uppercase"
                        style={{
                            fontSize: 'clamp(30px, 7vw, 48px)',
                            lineHeight: 1,
                            letterSpacing: '-0.035em',
                        }}
                    >
                        {String(content.title ?? 'Actualités & Annonces')}
                    </h2>
                    <Link
                        href="/actualites"
                        className="text-primary tap-target inline-flex shrink-0 items-center text-sm font-bold hover:underline"
                    >
                        Toutes les actus →
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {posts.slice(0, 3).map((post, index) => (
                        <PostCard key={post.id} post={post} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};
