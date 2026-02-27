import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Share2, User } from 'lucide-react';
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
            <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
                <Navbar />

                <main className="mt-20 flex-1">
                    <article className="relative">
                        {/* Hero Header Section */}
                        <div className="bg-slate-50 py-20 dark:bg-zinc-900/50">
                            <div className="mx-auto max-w-4xl px-4 text-center">
                                {post.category && (
                                    <div className="mb-8">
                                        <span className="rounded-full bg-asja-green-100 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-asja-green-700 shadow-sm uppercase dark:bg-asja-green-900/30 dark:text-asja-green-400">
                                            {post.category}
                                        </span>
                                    </div>
                                )}
                                <h1 className="mb-8 text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl dark:text-white">
                                    {post.title}
                                </h1>
                                <div className="flex items-center justify-center gap-6 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-asja-green-600" />
                                        <span className="text-slate-900 dark:text-zinc-300">
                                            {post.author.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-asja-green-600" />
                                        <span>
                                            {post.published_at &&
                                                new Date(post.published_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto max-w-4xl px-4 py-16">
                            {/* Featured Image */}
                            {post.cover_image && (
                                <div className="relative -mt-32 mb-16 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-asja-green-900/20 ring-8 ring-white dark:ring-zinc-950">
                                    <img
                                        src={`/uploads/${post.cover_image}`}
                                        alt={post.title}
                                        className="aspect-[21/10] w-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Post Content */}
                            <div
                                className="prose prose-lg max-w-none dark:prose-invert 
                                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                                prose-p:text-slate-600 prose-p:leading-relaxed dark:prose-p:text-zinc-400
                                prose-a:font-bold prose-a:text-asja-green-600 prose-a:no-underline hover:prose-a:text-asja-green-700
                                prose-strong:text-slate-900 dark:prose-strong:text-white
                                prose-img:rounded-[2rem] prose-img:shadow-xl"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Footer / Actions */}
                            <div className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-slate-100 pt-10 md:flex-row dark:border-zinc-800">
                                <Link
                                    href={route('blog.index')}
                                    className="group flex items-center gap-3 text-xs font-black tracking-widest text-slate-400 uppercase transition-colors hover:text-asja-green-600"
                                >
                                    <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                                    Retour aux actualités
                                </Link>
                                
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Partager :</span>
                                    <button className="rounded-full bg-slate-100 p-3 text-slate-600 transition-all hover:bg-asja-green-600 hover:text-white dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-asja-green-600 dark:hover:text-white">
                                        <Share2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Background Shapes */}
                        <div className="pointer-events-none absolute top-1/2 left-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-asja-green-50/50 blur-3xl dark:bg-asja-green-900/10" />
                        <div className="pointer-events-none absolute top-3/4 right-0 -z-10 h-96 w-96 translate-x-1/2 rounded-full bg-asja-green-50/30 blur-3xl dark:bg-asja-green-900/5" />
                    </article>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}
