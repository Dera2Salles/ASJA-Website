import { BlogEditor } from '@/BlogEditor/components/BlogEditor';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    POST_TYPE_LABELS,
    postImage,
    type Post,
    type PostType,
} from '@/lib/posts';
import { Link, router } from '@inertiajs/react';
import {
    CalendarClock,
    ChevronLeft,
    ImageUp,
    Loader2,
    MapPin,
    Pin,
    Plus,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

type FormState = {
    type: PostType;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    is_published: boolean;
    is_pinned: boolean;
    published_at: string;
    event_start_at: string;
    event_end_at: string;
    location: string;
    cover_image: File | null;
};

/** Convertit une date ISO du serveur vers la valeur d'un input datetime-local. */
function toInputDate(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const Field = ({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-2">
        <label className="text-foreground block text-sm font-semibold">
            {label}
        </label>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
        {children}
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
);

export function PostForm({ post }: { post?: Post }) {
    const isEdit = Boolean(post);

    const [data, setData] = useState<FormState>({
        type: post?.type ?? 'article',
        title: post?.title ?? '',
        excerpt: post?.excerpt ?? '',
        content: post?.content ?? '',
        category: post?.category ?? '',
        tags: post?.tags ?? [],
        is_published: Boolean(post?.published_at) || false,
        is_pinned: Boolean(post?.is_pinned),
        published_at: toInputDate(post?.published_at),
        event_start_at: toInputDate(post?.event_start_at),
        event_end_at: toInputDate(post?.event_end_at),
        location: post?.location ?? '',
        cover_image: null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [preview, setPreview] = useState<string | null>(
        post ? postImage(post) : null,
    );
    const [newTag, setNewTag] = useState('');

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setData((prev) => ({ ...prev, [key]: value }));

    const isEvent = data.type === 'evenement';

    const submit = (publish: boolean) => {
        setProcessing(true);
        setErrors({});

        const payload: Record<string, unknown> = {
            type: data.type,
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            category: data.category,
            tags: data.tags,
            is_published: publish,
            is_pinned: data.is_pinned,
            published_at: data.published_at || null,
            location: isEvent ? data.location : null,
            event_start_at: isEvent ? data.event_start_at || null : null,
            event_end_at: isEvent ? data.event_end_at || null : null,
        };

        if (data.cover_image) payload.cover_image = data.cover_image;
        if (isEdit) payload._method = 'put';

        router.post(
            isEdit
                ? route('admin.posts.update', post!.id)
                : route('admin.posts.store'),
            payload as never,
            {
                forceFormData: true,
                onSuccess: () =>
                    toast.success(
                        publish
                            ? 'Publication en ligne.'
                            : 'Brouillon enregistré.',
                    ),
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    toast.error('Vérifiez les champs du formulaire.');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="mx-auto max-w-5xl pb-16">
            <Link
                href={route('admin.posts.index')}
                className="text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
                Retour aux publications
            </Link>

            <h1 className="admin-title mb-8">
                {isEdit ? 'Modifier la publication' : 'Nouvelle publication'}
            </h1>

            <div className="space-y-6">
                {/* Le type détermine où la publication apparaît sur le site et
                    quels champs sont pertinents. */}
                <div className="border-border bg-card border p-6">
                    <Field label="Type de publication">
                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(POST_TYPE_LABELS) as PostType[]).map(
                                (type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => set('type', type)}
                                        className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                                            data.type === type
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border-border text-muted-foreground hover:text-foreground border'
                                        }`}
                                    >
                                        {POST_TYPE_LABELS[type]}
                                    </button>
                                ),
                            )}
                        </div>
                    </Field>
                </div>

                <div className="border-border bg-card space-y-6 border p-6">
                    <Field label="Titre" error={errors.title}>
                        <Input
                            value={data.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="Titre de la publication"
                        />
                    </Field>

                    <Field
                        label="Résumé"
                        error={errors.excerpt}
                        hint="Affiché dans les listes et les cartes. Quelques phrases suffisent."
                    >
                        <Textarea
                            rows={3}
                            value={data.excerpt}
                            onChange={(e) => set('excerpt', e.target.value)}
                        />
                    </Field>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Catégorie" error={errors.category}>
                            <Input
                                value={data.category}
                                onChange={(e) =>
                                    set('category', e.target.value)
                                }
                                placeholder="Vie étudiante, Admission…"
                            />
                        </Field>

                        <Field label="Étiquettes">
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const tag = newTag.trim();
                                            if (
                                                tag &&
                                                !data.tags.includes(tag)
                                            ) {
                                                set('tags', [
                                                    ...data.tags,
                                                    tag,
                                                ]);
                                            }
                                            setNewTag('');
                                        }
                                    }}
                                    placeholder="Entrée pour ajouter"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const tag = newTag.trim();
                                        if (tag && !data.tags.includes(tag)) {
                                            set('tags', [...data.tags, tag]);
                                        }
                                        setNewTag('');
                                    }}
                                    className="border-border text-muted-foreground hover:text-primary cursor-pointer border px-3 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {data.tags.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {data.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-accent text-accent-foreground inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    set(
                                                        'tags',
                                                        data.tags.filter(
                                                            (t) => t !== tag,
                                                        ),
                                                    )
                                                }
                                                className="cursor-pointer"
                                                aria-label={`Retirer ${tag}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </Field>
                    </div>

                    <Field
                        label="Image de couverture"
                        error={errors.cover_image}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-muted border-border h-24 w-40 shrink-0 overflow-hidden border">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                                        Aucune image
                                    </div>
                                )}
                            </div>

                            <label className="border-border text-foreground hover:border-primary hover:text-primary inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors">
                                <ImageUp className="h-4 w-4" />
                                Choisir une image
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        set('cover_image', file);
                                        const reader = new FileReader();
                                        reader.onloadend = () =>
                                            setPreview(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }}
                                />
                            </label>
                        </div>
                    </Field>
                </div>

                {/* Champs propres aux événements : masqués pour les autres types
                    plutôt qu'affichés vides. */}
                {isEvent ? (
                    <div className="border-border bg-card space-y-6 border p-6">
                        <h2 className="text-foreground flex items-center gap-2 text-lg">
                            <CalendarClock className="text-primary h-4 w-4" />
                            Détails de l'événement
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field label="Début" error={errors.event_start_at}>
                                <Input
                                    type="datetime-local"
                                    value={data.event_start_at}
                                    onChange={(e) =>
                                        set('event_start_at', e.target.value)
                                    }
                                />
                            </Field>

                            <Field label="Fin" error={errors.event_end_at}>
                                <Input
                                    type="datetime-local"
                                    value={data.event_end_at}
                                    onChange={(e) =>
                                        set('event_end_at', e.target.value)
                                    }
                                />
                            </Field>
                        </div>

                        <Field label="Lieu" error={errors.location}>
                            <div className="relative">
                                <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    className="pl-9"
                                    value={data.location}
                                    onChange={(e) =>
                                        set('location', e.target.value)
                                    }
                                    placeholder="Campus ASJA, Antsirabe"
                                />
                            </div>
                        </Field>
                    </div>
                ) : null}

                <div className="border-border bg-card border p-6">
                    <Field label="Contenu" error={errors.content}>
                        <div className="border-border overflow-hidden border">
                            <BlogEditor
                                content={data.content}
                                onChange={(content) => set('content', content)}
                            />
                        </div>
                    </Field>
                </div>

                <div className="border-border bg-card space-y-6 border p-6">
                    <Field
                        label="Date de publication"
                        error={errors.published_at}
                        hint="Laissez vide pour publier immédiatement. Une date future programme la mise en ligne."
                    >
                        <Input
                            type="datetime-local"
                            value={data.published_at}
                            onChange={(e) =>
                                set('published_at', e.target.value)
                            }
                        />
                    </Field>

                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.is_pinned}
                            onChange={(e) => set('is_pinned', e.target.checked)}
                            className="accent-primary h-4 w-4 cursor-pointer"
                        />
                        <span className="text-foreground flex items-center gap-1.5 text-sm font-medium">
                            <Pin className="h-3.5 w-3.5" />
                            Épingler en tête de liste
                        </span>
                    </label>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => submit(false)}
                        className="border-border text-foreground hover:border-primary hover:text-primary cursor-pointer border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                        Enregistrer le brouillon
                    </button>

                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => submit(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        Publier
                    </button>
                </div>
            </div>
        </div>
    );
}
