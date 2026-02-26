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
            <div className="flex min-h-screen flex-col overflow-x-hidden bg-gray-50 dark:bg-zinc-900">
                <Navbar />

                <main className="mt-20 flex-1">
                    <article className="mx-auto max-w-4xl px-4 py-12">
                        {}
                        <header className="mb-12 text-center">
                            {post.category && (
                                <div className="mb-6">
                                    <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold tracking-wider text-indigo-600 uppercase dark:bg-indigo-900/40 dark:text-indigo-400">
                                        {post.category}
                                    </span>
                                </div>
                            )}
                            <h1 className="mb-6 text-4xl leading-tight font-black text-gray-900 md:text-5xl dark:text-white">
                                {post.title}
                            </h1>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-gray-300">
                                    {post.author.name}
                                </span>
                                <span>•</span>
                                <span>
                                    {post.published_at &&
                                        new Date(
                                            post.published_at,
                                        ).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                </span>
                            </div>
                        </header>

                        {}
                        {post.cover_image && (
                            <div className="mb-12 aspect-[21/9] overflow-hidden rounded-2xl shadow-2xl">
                                <img
                                    src={`/storage/${post.cover_image}`}
                                    alt={post.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        {}
                        <div
                            className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-green-700 dark:prose-headings:text-green-500 prose-a:text-indigo-600 hover:prose-a:text-indigo-500 max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {}
                        <div className="mt-16 border-t border-gray-200 pt-8 text-center dark:border-zinc-800">
                            <Link
                                href={route('home')}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-700 px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
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
