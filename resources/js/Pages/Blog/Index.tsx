import { Head, Link } from '@inertiajs/react';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { ThemeProvider } from '../../page/theme/useThemeProvider';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    cover_image: string | null;
    category: string | null;
    published_at: string | null;
    author: { name: string };
}

interface Paginated {
    data: BlogPost[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function BlogIndex({ posts }: { posts: Paginated }) {
    return (
        <ThemeProvider>
            <Head title="Blog & Actualités - ASJA" />
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-900">
                <Navbar />
                <main className="flex-1 mt-20">
                    <div className="max-w-6xl mx-auto px-4 py-12">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                                Actualités & Événements
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                                Restez informé de la vie de l'ASJA à travers nos derniers articles.
                            </p>
                        </div>

                        {posts.data.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                Aucun article publié pour le moment.
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.data.map((post) => (
                                <Link
                                    key={post.id}
                                    href={route('blog.show', post.slug)}
                                    className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group flex flex-col"
                                >
                                    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-700">
                                        {post.cover_image ? (
                                            <img
                                                src={`/storage/${post.cover_image}`}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">📰</div>
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
                                                {post.published_at && new Date(post.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {post.title}
                                        </h2>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            Par {post.author?.name}
                                        </div>
                                        <div className="mt-auto pt-4 flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:underline">
                                            Lire la suite →
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: posts.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={route('blog.index') + `?page=${page}`}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                            page === posts.current_page
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}
