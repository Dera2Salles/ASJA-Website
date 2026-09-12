import { Img } from '@/Components/Img';
import { useSection } from '@/lib/cms';
import { formatDate, postImage, type Post } from '@/lib/posts';
import { Link } from '@inertiajs/react';
import { SectionCarousel } from '../page/landing/components/section-carousel';

const PostCard = ({ post }: { post: Post }) => {
    const image = postImage(post);
    const dateText = formatDate(post.published_at);

    return (
        <article className="flex h-full flex-col">
            <Link
                href={`/actualites/${post.slug}`}
                className="group bg-card border-border hover:bg-accent flex h-full flex-col overflow-hidden rounded-[22px] border transition-colors duration-200"
            >
                {image ? (
                    <div
                        className="relative overflow-hidden"
                        style={{ aspectRatio: '16/10' }}
                    >
                        <Img
                            src={image}
                            alt=""
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw"
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
        </article>
    );
};

export const BlogSection = ({ posts }: { posts: Post[] }) => {
    const content = useSection('blog');

    if (!posts || posts.length === 0) return null;

    return (
        <section id="actualites" className="section-rhythm">
            <div className="section-shell">
                <SectionCarousel
                    items={posts}
                    getKey={(post) => post.id}
                    label="Actualités et annonces"
                    itemLabel="actualité"
                    heading={
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
                    }
                    action={
                        <Link
                            href="/actualites"
                            className="text-primary tap-target inline-flex shrink-0 items-center text-sm font-bold hover:underline"
                        >
                            Toutes les actus →
                        </Link>
                    }
                    renderItem={(post) => <PostCard post={post} />}
                />
            </div>
        </section>
    );
};
