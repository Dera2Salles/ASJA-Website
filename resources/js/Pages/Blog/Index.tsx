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
            <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-900">
                <Navbar />
                <main className="mt-20 flex-1">
                    <div className="mx-auto max-w-6xl px-4 py-12">
                        <div className="mb-12 text-center">
                            <h1 className="mb-4 text-4xl font-black text-gray-900 md:text-5xl dark:text-white">
                                Actualités & Événements
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                                Restez informé de la vie de l'ASJA à travers nos
                                derniers articles.
                            </p>
                        </div>

                        {posts.data.length === 0 && (
                            <div className="py-20 text-center text-gray-500">
                                Aucun article publié pour le moment.
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((post) => (
                                <Link
                                    key={post.id}
                                    href={route('blog.show', post.slug)}
                                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-800"
                                >
                                    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-700">
                                        {post.cover_image ? (
                                            <img
                                                src={`/storage/${post.cover_image}`}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-5xl text-gray-400">
                                                📰
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
                                                    ).toLocaleDateString(
                                                        'fr-FR',
                                                        {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                            </span>
                                        </div>
                                        <h2 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 dark:text-white">
                                            {post.title}
                                        </h2>
                                        <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                                            Par {post.author?.name}
                                        </div>
                                        <div className="mt-auto flex items-center pt-4 text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
                                            Lire la suite →
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {}
                        {posts.last_page > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {Array.from(
                                    { length: posts.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Link
                                        key={page}
                                        href={
                                            route('blog.index') +
                                            `?page=${page}`
                                        }
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                            page === posts.current_page
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
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
