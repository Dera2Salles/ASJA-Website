import AdminLayout from '@/Layouts/AdminLayout';
import {
    formatDate,
    POST_TYPE_LABELS,
    postImage,
    type Post,
} from '@/lib/posts';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Building2,
    FileText,
    MessageSquare,
    Plus,
    Users,
} from 'lucide-react';

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
    recentPosts: Post[];
}) {
    const { auth } = usePage<PageProps>().props;

    const cards = [
        {
            title: 'Publications',
            value: stats?.posts ?? 0,
            icon: FileText,
            href: route('admin.posts.index'),
        },
        {
            title: 'Étudiants',
            value: stats?.students ?? 0,
            icon: Users,
            href: route('admin.students.index'),
        },
        {
            title: 'Témoignages',
            value: stats?.testimonies ?? 0,
            icon: MessageSquare,
            href: route('admin.testimonies.index'),
        },
        {
            title: 'Mentions',
            value: stats?.departments ?? 0,
            icon: Building2,
            href: route('admin.departments.index'),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Tableau de bord" />

            <div className="space-y-10 pb-16">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-3xl">
                            Bonjour, {auth.user.name}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Aperçu de l'activité du site.
                        </p>
                    </div>

                    <Link
                        href={route('admin.posts.create')}
                        className="bg-primary text-primary-foreground border-border hover:bg-background hover:text-primary inline-flex items-center gap-2 self-start border px-4 py-2.5 text-sm font-bold uppercase"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle publication
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Link
                                href={card.href}
                                className="border-border bg-card hover:bg-primary group flex items-center justify-between border p-5"
                            >
                                <div>
                                    <p className="text-muted-foreground group-hover:text-primary-foreground text-xs font-bold tracking-wider uppercase">
                                        {card.title}
                                    </p>
                                    <p className="text-foreground group-hover:text-primary-foreground font-display mt-1.5 text-3xl font-bold">
                                        {card.value}
                                    </p>
                                </div>
                                <div className="border-border bg-background text-foreground group-hover:bg-accent group-hover:text-accent-foreground border p-3">
                                    <card.icon className="h-5 w-5" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div>
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-foreground text-xl">
                            Publications récentes
                        </h2>
                        <Link
                            href={route('admin.posts.index')}
                            className="text-primary group inline-flex items-center gap-1 text-sm font-bold uppercase hover:underline"
                        >
                            Voir tout
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {recentPosts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {recentPosts.map((post) => {
                                const image = postImage(post);
                                return (
                                    <Link
                                        key={post.id}
                                        href={route('admin.posts.edit', post.id)}
                                        className="border-border bg-card hover:bg-primary group overflow-hidden border"
                                    >
                                        <div className="bg-muted aspect-[16/9] overflow-hidden">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt=""
                                                    className="h-full w-full object-cover grayscale group-hover:grayscale-0"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="p-4">
                                            <p className="text-muted-foreground group-hover:text-primary-foreground mb-1.5 text-xs font-bold tracking-wider uppercase">
                                                {POST_TYPE_LABELS[post.type] ??
                                                    'Publication'}
                                            </p>
                                            <h3 className="text-foreground group-hover:text-primary-foreground truncate font-bold">
                                                {post.title}
                                            </h3>
                                            <p className="text-muted-foreground group-hover:text-primary-foreground mt-1 text-xs">
                                                {post.published_at
                                                    ? formatDate(post.published_at)
                                                    : 'Brouillon'}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="border-border border border-dashed py-16 text-center">
                            <FileText
                                className="text-muted-foreground mx-auto mb-4 h-10 w-10"
                                strokeWidth={1.5}
                            />
                            <h3 className="text-foreground font-semibold">
                                Aucune publication
                            </h3>
                            <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm">
                                Partagez les actualités de l'université avec vos
                                étudiants.
                            </p>
                            <Link
                                href={route('admin.posts.create')}
                                className="text-primary mt-6 inline-block text-sm font-semibold hover:underline"
                            >
                                Créer la première publication
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
