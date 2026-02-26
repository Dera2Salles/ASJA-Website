import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Newspaper, Plus, Search } from 'lucide-react';
import { AdminBlogCard } from '../components/AdminBlogCard';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    cover_image: string | null;
    is_published: boolean;
    created_at: string;
    category?: string;
    author?: { id: number; name: string };
}

interface Props {
    posts: Post[];
}

export default function BlogIndex({ posts }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
            router.delete(route('admin.blog.destroy', id), {
                onSuccess: () => {},
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-12 pb-20">
                {}
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
                            Articles du{' '}
                            <span className="text-asja-green-600 dark:text-primary">
                                Blog
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            Gérez, éditez et publiez vos histoires
                            universitaires.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href={route('admin.blog.create')}>
                            <Button className="dark:bg-primary hover:shadow-primary/30 group h-14 gap-3 rounded-[2rem] bg-slate-900 px-8 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95">
                                <Plus
                                    size={22}
                                    strokeWidth={3}
                                    className="transition-transform group-hover:rotate-90"
                                />
                                Nouvel Article
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass flex flex-col items-center justify-between gap-4 rounded-[2rem] border-none p-4 shadow-xl md:flex-row"
                >
                    <div className="group relative w-full md:w-96">
                        <Search
                            className="group-focus-within:text-asja-green-500 absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors"
                            size={18}
                            strokeWidth={2.5}
                        />
                        <Input
                            placeholder="Rechercher un article..."
                            className="focus:ring-asja-green-500/20 h-12 rounded-xl border-none bg-slate-50/50 pl-12 font-bold transition-all placeholder:font-medium focus:ring-2 dark:bg-black/20"
                        />
                    </div>

                    <div className="scrollbar-none flex w-full items-center gap-3 overflow-x-auto pb-2 md:w-auto md:pb-0">
                        <Button
                            variant="secondary"
                            className="bg-asja-green-500 hover:bg-asja-green-600 rounded-full px-6 font-bold text-white"
                        >
                            Tous
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-muted-foreground rounded-full px-6 font-bold hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            Publiés
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-muted-foreground rounded-full px-6 font-bold hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            Brouillons
                        </Button>
                    </div>
                </motion.div>

                {}
                {posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass flex flex-col items-center justify-center rounded-[3rem] border-none py-24"
                    >
                        <div className="bg-asja-green-50 dark:bg-asja-green-900/20 mb-6 flex h-24 w-24 items-center justify-center rounded-full">
                            <Newspaper
                                className="text-asja-green-500"
                                size={40}
                                strokeWidth={1.5}
                            />
                        </div>
                        <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                            Aucun article trouvé
                        </h2>
                        <p className="text-muted-foreground mb-8 font-medium">
                            Commencez par créer votre premier article pour le
                            blog.
                        </p>
                        <Link href={route('admin.blog.create')}>
                            <Button
                                variant="outline"
                                className="border-asja-green-200 text-asja-green-600 hover:bg-asja-green-50 h-12 rounded-2xl px-8 font-black tracking-tight"
                            >
                                Créer un article
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.2 }}
                            >
                                <AdminBlogCard
                                    post={{
                                        ...post,
                                        cover_image: post.cover_image || null,
                                    }}
                                    onDelete={handleDelete}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {}
            <div className="bg-asja-green-500/5 pointer-events-none fixed top-[20%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full blur-[120px]" />
            <div className="bg-primary/5 pointer-events-none fixed right-[5%] bottom-[10%] -z-10 h-[300px] w-[300px] animate-pulse rounded-full blur-[100px]" />
        </AdminLayout>
    );
}
