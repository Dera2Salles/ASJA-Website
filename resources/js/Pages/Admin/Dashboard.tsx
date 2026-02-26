import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Building2,
    FileText,
    MessageSquare,
    Plus,
    Users,
} from 'lucide-react';
import { AdminBlogCard } from './components/AdminBlogCard';

interface DashboardStats {
    posts: number;
    students: number;
    testimonies: number;
    departments: number;
}

export default function DashboardPage({
    stats,
    recentPosts = [],
}: {
    stats: DashboardStats;
    recentPosts: any[];
}) {
    const { auth } = usePage<PageProps>().props;
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            destroy(route('admin.blog.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const STATS = [
        {
            title: 'Articles de Blog',
            value: stats?.posts || 0,
            icon: FileText,
            color: 'asja-green-600',
            bg: 'bg-asja-green-50 dark:bg-asja-green-900/20',
        },
        {
            title: 'Étudiants Inscrits',
            value: stats?.students || 0,
            icon: Users,
            color: 'blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            title: 'Témoignages',
            value: stats?.testimonies || 0,
            icon: MessageSquare,
            color: 'amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            title: 'Départements',
            value: stats?.departments || 0,
            icon: Building2,
            color: 'rose-600',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
                            Ravi de vous revoir,{' '}
                            <span className="text-asja-green-600 dark:text-primary decoration-asja-green-500/20 underline decoration-8 underline-offset-8">
                                {auth.user.name}
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            Voici un aperçu de l'activité de l'université
                            aujourd'hui.
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

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="glass group relative overflow-hidden rounded-[2.5rem] border-none p-4 transition-all hover:-translate-y-2 hover:shadow-2xl">
                                <div
                                    className={cn(
                                        'absolute top-[-10%] right-[-10%] h-32 w-32 rounded-full opacity-20 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-60',
                                        stat.bg,
                                    )}
                                />

                                <CardHeader className="relative z-10 flex flex-row items-center justify-between p-4 pb-4">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle className="text-muted-foreground text-[10px] font-black tracking-[3px] whitespace-nowrap uppercase">
                                            {stat.title}
                                        </CardTitle>
                                        <div className="text-glow mt-2 text-5xl font-black tracking-tighter">
                                            {stat.value}
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            'rounded-2xl border border-white/50 bg-white/80 p-4 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 dark:border-white/5 dark:bg-white/5',
                                            `text-${stat.color}`,
                                        )}
                                    >
                                        <stat.icon
                                            size={28}
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-2 rounded-full bg-green-600" />
                            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                                Articles récents
                            </h2>
                        </div>
                        <Link
                            href={route('admin.blog.index')}
                            className="group flex items-center gap-2 text-sm font-black tracking-wider text-green-600 uppercase transition-colors hover:text-green-700 dark:text-green-500"
                        >
                            Voir tout le blog
                            <ArrowRight
                                size={16}
                                strokeWidth={3}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </Link>
                    </div>

                    {recentPosts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {recentPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <AdminBlogCard
                                        post={post}
                                        onDelete={handleDelete}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-[3rem] border-4 border-dashed border-gray-100 bg-white/50 p-16 text-center dark:border-zinc-900 dark:bg-zinc-900/30"
                        >
                            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 text-gray-200 dark:bg-zinc-800 dark:text-zinc-700">
                                <FileText
                                    className="h-12 w-12"
                                    strokeWidth={1}
                                />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                Votre blog est vide
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm font-medium text-gray-500 dark:text-zinc-500">
                                Partagez les actualités de l'université avec vos
                                étudiants dès maintenant.
                            </p>
                            <Link
                                href={route('admin.blog.create')}
                                className="mt-8 inline-block"
                            >
                                <Button className="h-12 rounded-2xl bg-green-600 px-8 font-black text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95">
                                    Créer mon premier article
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
