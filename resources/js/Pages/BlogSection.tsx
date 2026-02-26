import { Link } from '@inertiajs/react';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    cover_image: string | null;
    category: string | null;
    published_at: string | null;
}

export function BlogSection({ posts }: { posts: BlogPost[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <div
            id="blog"
            className="bg-white py-20 transition-colors duration-300 dark:bg-zinc-900"
        >
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-green-700 dark:text-green-500">
                        Actualités & Événements
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                        Restez informé de la vie de l'ASJA à travers nos
                        derniers articles.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={route('blog.show', post.slug)}
                            className="group flex flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-800"
                        >
                            <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-zinc-700">
                                {post.cover_image ? (
                                    <img
                                        src={`/storage/${post.cover_image}`}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <div className="mb-3 flex items-center gap-3">
                                    {post.category && (
                                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            {post.category}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {post.published_at &&
                                            new Date(
                                                post.published_at,
                                            ).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 dark:text-white">
                                    {post.title}
                                </h3>
                                <div className="mt-auto flex items-center pt-4 text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
                                    Lire la suite →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
