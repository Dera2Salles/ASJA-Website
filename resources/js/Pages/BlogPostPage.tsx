import { Head, Link } from '@inertiajs/react';
import { Footer } from '../page/landing/components/footer';
import { Navbar } from '../page/landing/components/nav-bar';
import { ThemeProvider } from '../page/theme/useThemeProvider';

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    cover_image: string | null;
    category: string | null;
    published_at: string | null;
    author: { name: string };
}

export default function BlogPostPage({ post }: { post: Post }) {
    return (
        <ThemeProvider>
            <Head title={`${post.title} - ASJA`} />
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-900 overflow-x-hidden">
                <Navbar />

                <main className="flex-1 mt-20">
                    <article className="max-w-4xl mx-auto px-4 py-12">
                        {/* Header */}
                        <header className="mb-12 text-center">
                            {post.category && (
                                <div className="mb-6">
                                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                            )}
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-gray-300">
                                    {post.author.name}
                                </span>
                                <span>•</span>
                                <span>
                                    {post.published_at && new Date(post.published_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </header>

                        {/* Cover Image */}
                        {post.cover_image && (
                            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl aspect-[21/9]">
                                <img
                                    src={`/storage/${post.cover_image}`}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-green-700 dark:prose-headings:text-green-500 prose-a:text-indigo-600 hover:prose-a:text-indigo-500"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Footer/Back */}
                        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-zinc-800 text-center">
                            <Link
                                href={route('home')}
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 shadow-md transition-all hover:-translate-y-0.5"
                            >
                                ← Retour à l'accueil
                            </Link>
                        </div>
                    </article>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}
