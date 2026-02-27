import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react';
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
            <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
                <Navbar />
                
                <main className="relative mt-20 flex-1 overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="pointer-events-none absolute top-40 right-0 -z-10 h-96 w-96 rounded-full bg-asja-green-50/50 blur-3xl dark:bg-asja-green-900/10" />
                    <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-asja-green-50/30 blur-3xl dark:bg-asja-green-900/5" />

                    <div className="mx-auto max-w-7xl px-4 py-20">
                        {/* Header Section */}
                        <div className="mb-20 text-center">
                            <Link 
                                href={route('home')}
                                className="mb-8 inline-flex items-center gap-2 text-xs font-black tracking-widest text-asja-green-600 uppercase transition-all hover:-translate-x-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour à l'accueil
                            </Link>
                            <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 uppercase md:text-6xl dark:text-white">
                                Actualités & <span className="text-asja-green-600">Reportages</span>
                            </h1>
                            <div className="mx-auto mb-8 h-2 w-24 rounded-full bg-asja-green-600" />
                            <p className="mx-auto max-w-2xl text-lg font-medium text-slate-600 dark:text-zinc-400">
                                Découvrez toute l'actualité de l'ASJA : événements, 
                                projets de recherche, vie étudiante et innovations académiques.
                            </p>
                        </div>

                        {posts.data.length === 0 ? (
                            <div className="rounded-[3rem] border-2 border-dashed border-slate-200 py-32 text-center dark:border-zinc-800">
                                <div className="mb-4 text-6xl">empty</div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aucun article publié</h3>
                                <p className="text-slate-500">Revenez bientôt pour de nouvelles actualités.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                                {posts.data.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={route('blog.show', post.slug)}
                                        className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-asja-green-200 hover:shadow-2xl hover:shadow-asja-green-900/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-asja-green-900/30 dark:hover:bg-zinc-900"
                                    >
                                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                                            {post.cover_image ? (
                                                <img
                                                    src={`/uploads/${post.cover_image}`}
                                                    alt={post.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-zinc-800">
                                                    <span className="text-6xl text-slate-300 dark:text-zinc-700">ASJA</span>
                                                </div>
                                            )}
                                            {post.category && (
                                                <div className="absolute top-6 left-6">
                                                    <span className="rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-asja-green-700 shadow-sm backdrop-blur-sm uppercase dark:bg-zinc-900/95 dark:text-asja-green-400">
                                                        {post.category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-1 flex-col p-10">
                                            <div className="mb-6 flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
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
                                            
                                            <h2 className="mb-6 line-clamp-2 text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-asja-green-700 dark:text-white dark:group-hover:text-asja-green-400">
                                                {post.title}
                                            </h2>
                                            
                                            <div className="mb-6 text-sm font-medium text-slate-500 dark:text-zinc-500">
                                                Par <span className="text-slate-900 dark:text-zinc-300">{post.author?.name}</span>
                                            </div>

                                            <div className="mt-auto flex items-center gap-1 pt-6 text-[10px] font-black tracking-[0.2em] text-asja-green-600 uppercase">
                                                <span>Lire l'article complet</span>
                                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="mt-24 flex justify-center gap-3">
                                {Array.from(
                                    { length: posts.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Link
                                        key={page}
                                        href={route('blog.index') + `?page=${page}`}
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-black transition-all duration-300 ${
                                            page === posts.current_page
                                                ? 'bg-asja-green-600 text-white shadow-lg shadow-asja-green-900/20'
                                                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
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
