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
        <div id="blog" className="py-20 bg-white dark:bg-zinc-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-green-700 dark:text-green-500 mb-4">
                        Actualités & Événements
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Restez informé de la vie de l'ASJA à travers nos derniers articles.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={route('blog.show', post.slug)}
                            className="bg-gray-50 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group flex flex-col"
                        >
                            <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-zinc-700">
                                {post.cover_image ? (
                                    <img
                                        src={`/storage/${post.cover_image}`}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    {post.category && (
                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
                                            {post.category}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {post.published_at && new Date(post.published_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                    {post.title}
                                </h3>
                                <div className="mt-auto pt-4 flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:underline">
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
