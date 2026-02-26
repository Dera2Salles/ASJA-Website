import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Calendar,
    ChevronLeft,
    EyeOff,
    FileText,
    Image as ImageIcon,
    Loader2,
    PlusCircle,
    Save,
    Sparkles,
    Tag,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BlogEditor } from '../../../BlogEditor/components/BlogEditor';

interface Post {
    id: number;
    title: string;
    content: string;
    cover_image: string | null;
    category: string | null;
    tags: string[] | null;
    is_published: boolean;
}

export default function BlogEdit({ post }: { post: Post }) {
    const { data, setData, processing, errors } = useForm({
        title: post.title,
        content: post.content,
        category: post.category ?? '',
        tags: post.tags ?? [],
        is_published: post.is_published,
        cover_image: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        post.cover_image ? `/storage/${post.cover_image}` : null,
    );
    const [newTag, setNewTag] = useState('');

    const handleAddTag = () => {
        if (newTag.trim() && !data.tags.includes(newTag.trim())) {
            setData('tags', [...data.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover_image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (publish?: boolean) => {
        const payload = { ...data };
        if (publish !== undefined) payload.is_published = publish;

        router.post(
            route('admin.blog.update', post.id),
            { ...payload, _method: 'PUT' } as any,
            {
                forceFormData: true,
                onSuccess: () => toast.success('Article mis à jour !'),
                onError: () => toast.error('Erreur lors de la mise à jour.'),
            },
        );
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-6xl space-y-12 pb-20">
                {}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link
                            href={route('admin.blog.index')}
                            className="hover:text-asja-green-600 group mb-4 inline-flex items-center gap-2 text-sm font-black text-slate-400 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Retour au Blog
                        </Link>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
                            Modifier{' '}
                            <span className="text-asja-green-600 dark:text-primary">
                                l'Article
                            </span>
                        </h1>
                    </motion.div>

                    <div className="flex gap-3">
                        {post.is_published && (
                            <Button
                                variant="ghost"
                                onClick={() => handleSubmit(false)}
                                disabled={processing}
                                className="flex h-12 gap-2 rounded-xl px-6 font-black text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            >
                                <EyeOff size={18} />
                                Dépublier
                            </Button>
                        )}
                        <Button
                            onClick={() => handleSubmit()}
                            disabled={processing}
                            className="bg-asja-green-600 dark:bg-primary shadow-asja-green-900/20 flex h-12 gap-2 rounded-xl px-8 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {post.is_published
                                ? 'Enregistrer les modifications'
                                : 'Publier maintenant'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {}
                    <div className="space-y-8 lg:col-span-8">
                        <div className="space-y-4">
                            <Input
                                placeholder="Titre de l'article..."
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                className="h-auto border-none bg-transparent p-0 text-4xl font-black text-slate-900 transition-all placeholder:text-slate-200 focus-visible:ring-0 lg:text-5xl dark:text-white dark:placeholder:text-zinc-800"
                            />
                            {errors.title && (
                                <p className="text-[10px] font-black tracking-widest text-rose-500 uppercase">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <Card className="glass overflow-hidden rounded-[2.5rem] border-none bg-white shadow-2xl dark:bg-zinc-950/50">
                            <div className="flex items-center justify-between border-b border-white/40 bg-slate-50/50 px-8 py-4 dark:border-white/5 dark:bg-black/20">
                                <span className="text-muted-foreground flex items-center gap-2 text-[10px] font-black tracking-[2px] uppercase">
                                    <FileText
                                        size={14}
                                        className="text-asja-green-600"
                                    />{' '}
                                    Édition du contenu
                                </span>
                                <div className="flex gap-2">
                                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                                    <div className="bg-asja-green-400 h-2 w-2 rounded-full" />
                                </div>
                            </div>
                            <div className="min-h-[500px] p-2">
                                <BlogEditor
                                    content={data.content}
                                    onChange={(content) =>
                                        setData('content', content)
                                    }
                                    placeholder="Libérez votre créativité ici..."
                                    onImageUpload={async () => []}
                                />
                            </div>
                        </Card>
                    </div>

                    {}
                    <div className="space-y-6 lg:col-span-4">
                        {}
                        <Card className="glass space-y-8 overflow-hidden rounded-[2.5rem] border-none p-8 shadow-xl">
                            <div className="space-y-6">
                                <div className="text-asja-green-600 flex items-center gap-3">
                                    <Sparkles size={20} />
                                    <h3 className="text-sm font-black tracking-widest text-slate-900 uppercase dark:text-white">
                                        Classification
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                        Catégorie principale
                                    </Label>
                                    <Input
                                        value={data.category}
                                        onChange={(e) =>
                                            setData('category', e.target.value)
                                        }
                                        placeholder="ex: Actualités"
                                        className="focus:ring-asja-green-500/20 h-12 rounded-xl border-none bg-slate-50 px-4 font-bold focus:ring-2 dark:bg-white/5"
                                    />
                                    {errors.category && (
                                        <p className="text-[10px] font-black text-rose-500 uppercase">
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                        Tags / Mots-clés
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ajouter..."
                                            value={newTag}
                                            onChange={(e) =>
                                                setNewTag(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                handleAddTag())
                                            }
                                            className="focus:ring-asja-green-500/20 h-11 rounded-xl border-none bg-slate-50 px-4 text-xs font-bold focus:ring-2 dark:bg-white/5"
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleAddTag}
                                            className="dark:bg-primary h-11 w-11 rounded-xl bg-slate-900 text-white"
                                        >
                                            <Tag size={16} />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <AnimatePresence>
                                            {data.tags.map((tag) => (
                                                <motion.div
                                                    key={tag}
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.8,
                                                    }}
                                                >
                                                    <Badge
                                                        variant="secondary"
                                                        className="group flex cursor-pointer items-center gap-1 rounded-lg border-none bg-slate-100 px-3 py-1.5 font-bold text-slate-600 transition-all hover:bg-rose-50 hover:text-rose-500 dark:bg-white/5 dark:text-zinc-400"
                                                        onClick={() =>
                                                            setData(
                                                                'tags',
                                                                data.tags.filter(
                                                                    (t) =>
                                                                        t !==
                                                                        tag,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        {tag}
                                                        <X
                                                            size={10}
                                                            className="opacity-40 group-hover:opacity-100"
                                                        />
                                                    </Badge>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {}
                        <Card className="glass group overflow-hidden rounded-[2.5rem] border-none shadow-xl">
                            <CardHeader className="border-b border-white/40 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-black/20">
                                <CardTitle className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
                                    <ImageIcon className="text-asja-green-600 h-4 w-4" />{' '}
                                    Image à la une
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                {imagePreview ? (
                                    <div className="group/img relative mb-4 aspect-video overflow-hidden rounded-2xl shadow-lg">
                                        <img
                                            src={imagePreview}
                                            alt=""
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setData(
                                                        'cover_image',
                                                        null,
                                                    );
                                                    setImagePreview(null);
                                                }}
                                                className="rounded-xl text-xs font-black text-white uppercase hover:bg-white/20"
                                            >
                                                Remplacer l'image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Label className="hover:bg-asja-green-50/50 dark:hover:bg-primary/5 group-hover:border-asja-green-500/30 flex h-40 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all dark:border-white/10 dark:bg-white/[0.02]">
                                        <PlusCircle className="mb-3 h-8 w-8 text-slate-300 transition-transform group-hover:scale-110 dark:text-zinc-700" />
                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                            Ajouter un visuel
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </Label>
                                )}
                            </CardContent>
                        </Card>

                        {}
                        <div className="glass space-y-6 rounded-[2.5rem] border-none p-8 shadow-xl">
                            <div className="text-asja-green-600 flex items-center gap-3">
                                <Calendar size={18} />
                                <h3 className="text-[10px] font-black tracking-widest text-slate-900 uppercase dark:text-white">
                                    Statut
                                </h3>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-slate-900 dark:text-white">
                                    {post.is_published
                                        ? 'En ligne'
                                        : 'Brouillon'}
                                </p>
                                <p className="text-[10px] leading-tight font-medium text-slate-400">
                                    {post.is_published
                                        ? 'Cet article est actuellement visible par le public.'
                                        : "Cet article n'est pas encore visible sur le site."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="bg-asja-green-500/[0.05] pointer-events-none fixed top-[5%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full blur-[150px]" />
            <div className="bg-primary/[0.02] pointer-events-none fixed bottom-[15%] left-[-5%] -z-10 h-[400px] w-[400px] rounded-full blur-[100px]" />
        </AdminLayout>
    );
}
