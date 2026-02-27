import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar, ChevronRight } from 'lucide-react';

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
        <section
            id="events"
            className="relative overflow-hidden bg-white py-24 transition-colors duration-300 dark:bg-zinc-950"
        >
            {/* Background decorative elements */}
            <div className="pointer-events-none absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-asja-green-50/50 blur-3xl dark:bg-asja-green-900/10" />
            <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-asja-green-50/30 blur-3xl dark:bg-asja-green-900/5" />

            <div className="container mx-auto px-4">
                <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-2xl text-center md:text-left">
                        <h2 className="mb-4 text-4xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
                            Actualités & <span className="text-asja-green-600">Événements</span>
                        </h2>
                        <div className="mb-6 h-1.5 w-20 rounded-full bg-asja-green-600 md:mx-0" />
                        <p className="text-lg font-medium text-slate-600 dark:text-zinc-400">
                            Restez informé de la vie de l'ASJA à travers nos
                            derniers articles, annonces et reportages.
                        </p>
                    </div>
                    
                    <Link href={route('blog.index')}>
                        <Button 
                            variant="outline" 
                            className="group hidden border-2 border-asja-green-600/20 font-bold text-asja-green-700 transition-all hover:bg-asja-green-600 hover:text-white md:flex"
                        >
                            Voir tous les articles
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={route('blog.show', post.slug)}
                            className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50/50 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-asja-green-200 hover:bg-white hover:shadow-xl hover:shadow-asja-green-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-asja-green-900/30 dark:hover:bg-zinc-900"
                        >
                            <div className="relative aspect-[16/10] w-full overflow-hidden">
                                {post.cover_image ? (
                                    <img
                                        src={`/uploads/${post.cover_image}`}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-zinc-800">
                                        <span className="text-4xl">📰</span>
                                    </div>
                                )}
                                {post.category && (
                                    <div className="absolute top-4 left-4">
                                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black tracking-widest text-asja-green-700 shadow-sm backdrop-blur-sm uppercase dark:bg-zinc-900/90 dark:text-asja-green-400">
                                            {post.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-1 flex-col p-8">
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                    <Calendar className="h-3 w-3 text-asja-green-600" />
                                    <span>
                                        {post.published_at &&
                                            new Date(post.published_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                    </span>
                                </div>
                                
                                <h3 className="mb-4 line-clamp-2 text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-asja-green-700 dark:text-white dark:group-hover:text-asja-green-400">
                                    {post.title}
                                </h3>
                                
                                <div className="mt-auto flex items-center gap-1 pt-4 text-xs font-black tracking-widest text-asja-green-600 uppercase">
                                    <span>Lire la suite</span>
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 flex justify-center md:hidden">
                    <Link href={route('blog.index')} className="w-full">
                        <Button 
                            className="w-full h-12 rounded-xl bg-asja-green-600 font-bold text-white shadow-lg shadow-asja-green-900/20"
                        >
                            Voir tous les articles
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
