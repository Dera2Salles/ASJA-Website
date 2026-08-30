import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export type PostType = 'article' | 'annonce' | 'evenement';

export interface Post {
    id: number;
    type: PostType;
    title: string;
    slug: string;
    excerpt: string | null;
    content?: string;
    cover_image: string | null;
    category: string | null;
    tags?: string[] | null;
    is_pinned?: boolean;
    published_at: string | null;
    event_start_at: string | null;
    event_end_at: string | null;
    location: string | null;
    author?: { id: number; name: string } | null;
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
    article: 'Article',
    annonce: 'Annonce',
    evenement: 'Événement',
};

/** Chemin public d'une image de publication, stockée sur le disque `public`. */
export function postImage(post: Pick<Post, 'cover_image'>): string | null {
    const value = post.cover_image;
    if (!value) return null;
    if (/^(https?:)?\/\//.test(value) || value.startsWith('/')) return value;
    return `/storage/${value}`;
}

function safeParse(value: string | null): Date | null {
    if (!value) return null;
    const date = parseISO(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | null): string {
    const date = safeParse(value);
    return date ? format(date, 'd MMMM yyyy', { locale: fr }) : '';
}

/**
 * Période d'un événement, condensée quand elle tient sur une seule journée
 * (« 12 mars 2026 » plutôt que « 12 mars 2026 — 12 mars 2026 »).
 */
export function formatEventPeriod(post: Post): string {
    const start = safeParse(post.event_start_at);
    if (!start) return '';

    const end = safeParse(post.event_end_at);

    if (!end || isSameDay(start, end)) {
        return format(start, 'd MMMM yyyy', { locale: fr });
    }

    const sameMonth =
        start.getMonth() === end.getMonth() &&
        start.getFullYear() === end.getFullYear();

    return sameMonth
        ? `${format(start, 'd', { locale: fr })} – ${format(end, 'd MMMM yyyy', { locale: fr })}`
        : `${format(start, 'd MMM', { locale: fr })} – ${format(end, 'd MMM yyyy', { locale: fr })}`;
}
