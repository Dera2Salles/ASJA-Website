import AdminLayout from '@/Layouts/AdminLayout';
import {
    formatDate,
    formatEventPeriod,
    POST_TYPE_LABELS,
    postImage,
    type Post,
    type PostType,
} from '@/lib/posts';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarClock,
    Clock,
    ExternalLink,
    MapPin,
    Pencil,
    Pin,
    Plus,
    Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    posts: Post[];
    filters: { type: string | null };
    counts: Record<string, number>;
}

const FILTERS: { key: string | null; label: string; countKey: string }[] = [
    { key: null, label: 'Toutes', countKey: 'all' },
    { key: 'article', label: 'Articles', countKey: 'article' },
    { key: 'annonce', label: 'Annonces', countKey: 'annonce' },
    { key: 'evenement', label: 'Événements', countKey: 'evenement' },
];

/** Statut réel d'une publication, programmation comprise. */
function status(post: Post): { label: string; className: string } {
    if (!post.published_at) {
        return {
            label: 'Brouillon',
            className: 'bg-muted text-muted-foreground',
        };
    }

    if (new Date(post.published_at) > new Date()) {
        return {
            label: 'Programmée',
            className: 'bg-accent text-accent-foreground',
        };
    }

    return {
        label: 'En ligne',
        className: 'bg-primary text-primary-foreground',
    };
}

const PostRow = ({ post }: { post: Post }) => {
    const image = postImage(post);
    const state = status(post);

    const remove = () => {
        if (!confirm(`Supprimer « ${post.title} » ? Cette action est définitive.`))
            return;

        router.delete(route('admin.posts.destroy', post.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Publication supprimée.'),
        });
    };

    return (
        <div className="border-border bg-card hover:border-primary/40 flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center">
            <div className="bg-muted h-20 w-full shrink-0 overflow-hidden rounded-lg sm:w-32">
                {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover" />
                ) : null}
            </div>

            <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="border-border text-muted-foreground rounded border px-2 py-0.5 text-[11px] font-semibold">
                        {POST_TYPE_LABELS[post.type]}
                    </span>
                    <span
                        className={`rounded px-2 py-0.5 text-[11px] font-semibold ${state.className}`}
                    >
                        {state.label}
                    </span>
                    {post.is_pinned ? (
                        <span className="text-primary inline-flex items-center gap-1 text-[11px] font-semibold">
                            <Pin className="h-3 w-3" />
                            Épinglée
                        </span>
                    ) : null}
                </div>

                <h3 className="text-foreground truncate font-semibold">
                    {post.title}
                </h3>

                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.published_at
                            ? formatDate(post.published_at)
                            : 'Non publiée'}
                    </span>

                    {post.type === 'evenement' && post.event_start_at ? (
                        <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            {formatEventPeriod(post)}
                        </span>
                    ) : null}

                    {post.location ? (
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {post.location}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                {post.published_at &&
                new Date(post.published_at) <= new Date() ? (
                    <a
                        href={`/actualites/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Voir sur le site"
                        className="text-muted-foreground hover:text-primary hover:bg-accent rounded-lg p-2 transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                ) : null}

                <Link
                    href={route('admin.posts.edit', post.id)}
                    aria-label="Modifier"
                    className="text-muted-foreground hover:text-primary hover:bg-accent rounded-lg p-2 transition-colors"
                >
                    <Pencil className="h-4 w-4" />
                </Link>

                <button
                    onClick={remove}
                    aria-label="Supprimer"
                    className="text-muted-foreground hover:text-destructive hover:bg-accent cursor-pointer rounded-lg p-2 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default function PostsIndex({ posts, filters, counts }: Props) {
    return (
        <AdminLayout>
            <Head title="Publications" />

            <div className="pb-16">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-3xl">Publications</h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Articles, annonces et événements du site.
                        </p>
                    </div>

                    <Link
                        href={route('admin.posts.create')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 self-start rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle publication
                    </Link>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {FILTERS.map((filter) => {
                        const isActive = (filters.type ?? null) === filter.key;
                        return (
                            <Link
                                key={filter.label}
                                href={
                                    filter.key
                                        ? `${route('admin.posts.index')}?type=${filter.key}`
                                        : route('admin.posts.index')
                                }
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border-border text-muted-foreground hover:text-foreground border'
                                }`}
                            >
                                {filter.label}
                                <span className="ml-1.5 opacity-70">
                                    {counts[filter.countKey] ?? 0}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {posts.length === 0 ? (
                    <div className="border-border text-muted-foreground rounded-xl border border-dashed py-20 text-center">
                        <p className="mb-4 text-sm">
                            Aucune publication pour ce filtre.
                        </p>
                        <Link
                            href={route('admin.posts.create')}
                            className="text-primary text-sm font-semibold hover:underline"
                        >
                            Créer la première publication
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map((post) => (
                            <PostRow key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
