import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Eye,
    Image as ImageIcon,
    Loader2,
    MessageSquare,
    PlusCircle,
    Save,
    Tag,
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BlogEditor } from './components/BlogEditor';

interface PostFormData {
    title: string;
    excerpt: string;
    content: string;
    category_id: string;
    tags: string[];
    status: string;
    featured_image: File | string | null;
    published_at: string;
}

function Page({
    categories = [],
    post: existingPost = null,
}: {
    categories: any[];
    post?: any;
}) {
    const { data, setData, post, processing, errors, reset, transform } =
        useForm<PostFormData>({
            title: existingPost?.title || '',
            excerpt: existingPost?.excerpt || '',
            content: existingPost?.content || '',
            category_id: existingPost?.category_id
                ? String(existingPost.category_id)
                : '',
            tags: existingPost?.tags?.map((t: any) => t.name) || [],
            status: existingPost?.status || 'draft',
            featured_image: existingPost?.featured_image || null,
            published_at: existingPost?.published_at || '',
        });

    const [newTag, setNewTag] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(
        existingPost?.featured_image || null,
    );
    const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleImageUploadForEditor = async (
        files: File[],
    ): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await axios.post(route('upload'), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                urls.push(response.data.url);
            } catch (error) {
                console.error('Upload failed for', file.name, error);
            }
        }
        return urls;
    };

    const handleAddTag = () => {
        if (newTag.trim() && !data.tags.includes(newTag.trim())) {
            setData('tags', [...data.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setData(
            'tags',
            data.tags.filter((tag) => tag !== tagToRemove),
        );
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('featured_image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.title.trim() || !data.content.trim()) {
            toast.error('Veuillez remplir le titre et le contenu.');
            return;
        }

        const payload: any = { ...data };

        if (!(payload.featured_image instanceof File)) {
            delete payload.featured_image;
        }

        const url = existingPost
            ? route('blog.update', existingPost.id)
            : route('blog.store');

        // La charge utile se prépare via transform() : `data` n'est pas une
        // option acceptée par post().
        transform(() => ({
            ...payload,
            _method: existingPost ? 'put' : 'post',
            category_id: data.category_id ? Number(data.category_id) : null,
        }));

        post(url, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Enregistré avec succès !');
                if (!existingPost) {
                    reset();
                    setImagePreview(null);
                }
            },
            onError: (errors) => {
                console.log('Erreurs de validation:', errors);
            },
        });
    };
    return (
        <>
            return (
            <div className="relative py-8">
                <div className="relative z-10 mx-auto max-w-[1600px] space-y-12">
                    {}
                    <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-1"
                        >
                            <nav className="text-muted-foreground mb-4 flex items-center gap-2 text-[10px] font-black tracking-[3px] uppercase">
                                <span>Admin</span>
                                <span className="text-primary/50">
                                    /
                                </span>
                                <span className="text-primary dark:text-primary">
                                    Blog
                                </span>
                            </nav>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
                                {existingPost
                                    ? 'Modifier l’article'
                                    : 'Nouvel Article'}
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <Button
                                variant="outline"
                                onClick={() => window.open('', '_blank')}
                                className="glass h-12 rounded-2xl border-white/50 px-6 font-bold text-slate-600 shadow-sm transition-all hover:bg-white/80 dark:border-white/5 dark:text-slate-300"
                            >
                                <Eye className="mr-2 h-4 w-4" /> Aperçu
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="bg-primary dark:bg-primary shadow-primary/20 group h-12 rounded-2xl px-8 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                                )}
                                {existingPost ? 'Enregistrer' : 'Publier'}
                            </Button>
                        </motion.div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        <div className="space-y-10 lg:col-span-8">
                            {}
                            <div className="group space-y-4">
                                <Input
                                    id="post-title"
                                    placeholder="Entrez votre titre ici..."
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    className="h-auto border-none bg-transparent p-0 text-5xl font-black tracking-tight text-slate-900 placeholder:text-slate-200 focus-visible:ring-0 md:text-6xl dark:text-white dark:placeholder:text-slate-800"
                                />
                                <motion.div
                                    className="bg-primary h-1.5 w-24 rounded-full"
                                    initial={{ width: 40 }}
                                    whileInView={{ width: 120 }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>

                            {}
                            <div className="glass relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                                <div className="flex items-center justify-between border-b border-white/40 bg-white/30 px-8 py-5 dark:border-white/5">
                                    <span className="text-primary dark:text-primary text-[10px] font-black tracking-[3px] uppercase">
                                        Corps de l'article
                                    </span>
                                    <div className="flex gap-2">
                                        <div className="bg-primary/50 h-2 w-2 rounded-full" />
                                        <div className="bg-primary h-2 w-2 rounded-full" />
                                    </div>
                                </div>
                                <div className="min-h-[600px] bg-white/50 backdrop-blur-sm dark:bg-black/20">
                                    <BlogEditor
                                        content={data.content}
                                        onChange={(content) =>
                                            setData('content', content)
                                        }
                                        placeholder="Écrivez quelque chose d'extraordinaire..."
                                        onImageUpload={
                                            handleImageUploadForEditor
                                        }
                                    />
                                </div>
                            </div>

                            {}
                            <Card className="glass overflow-hidden rounded-[2rem] border-none shadow-xl">
                                <CardHeader className="px-8 pt-8 pb-4">
                                    <CardTitle className="text-muted-foreground flex items-center gap-2 text-[10px] font-black tracking-[3px] uppercase">
                                        <MessageSquare
                                            size={14}
                                            className="text-primary"
                                        />
                                        Résumé de l'article
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <Textarea
                                        placeholder="Une courte introduction pour accrocher vos lecteurs..."
                                        value={data.excerpt}
                                        onChange={(e) =>
                                            setData('excerpt', e.target.value)
                                        }
                                        className="focus:ring-ring/20 resize-none rounded-2xl border-none bg-slate-50/50 p-4 text-lg font-medium placeholder:text-slate-300 focus:ring-2 dark:bg-white/5 dark:placeholder:text-white/10"
                                        rows={4}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {}
                        <div className="space-y-8 lg:col-span-4">
                            {}
                            <Card className="glass overflow-hidden rounded-[2rem] border-none shadow-xl">
                                <CardHeader className="bg-primary/5 px-8 py-6">
                                    <CardTitle className="text-primary dark:text-primary text-sm leading-none font-black tracking-widest uppercase">
                                        Publication
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 p-8">
                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                                            État actuel
                                        </Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(val) =>
                                                setData('status', val)
                                            }
                                        >
                                            <SelectTrigger className="h-12 rounded-xl border-white/50 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="glass rounded-xl border-none">
                                                <SelectItem
                                                    value="draft"
                                                    className="font-bold"
                                                >
                                                    Brouillon
                                                </SelectItem>
                                                <SelectItem
                                                    value="publish"
                                                    className="font-bold"
                                                >
                                                    Publié
                                                </SelectItem>
                                                <SelectItem
                                                    value="future"
                                                    className="font-bold"
                                                >
                                                    Planifié
                                                </SelectItem>
                                                <SelectItem
                                                    value="private"
                                                    className="font-bold"
                                                >
                                                    Privé
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                                            Catégorie
                                        </Label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(val) =>
                                                    setData('category_id', val)
                                                }
                                            >
                                                <SelectTrigger className="h-12 grow rounded-xl border-white/50 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                                <SelectContent className="glass rounded-xl border-none">
                                                    {categories.map((cat) => (
                                                        <SelectItem
                                                            key={cat.id}
                                                            value={String(
                                                                cat.id,
                                                            )}
                                                            className="font-bold"
                                                        >
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="glass hover:bg-primary h-12 w-12 shrink-0 rounded-xl shadow-sm transition-all hover:text-white"
                                                onClick={() =>
                                                    setShowNewCategoryDialog(
                                                        true,
                                                    )
                                                }
                                            >
                                                <PlusCircle size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {}
                            <Card className="glass overflow-hidden rounded-[2rem] border-none shadow-xl">
                                <CardHeader className="px-8 py-6">
                                    <CardTitle className="text-muted-foreground flex items-center gap-3 text-sm font-black tracking-widest uppercase">
                                        <ImageIcon className="text-primary h-4 w-4" />
                                        Image à la une
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    {imagePreview ? (
                                        <div className="group relative overflow-hidden rounded-2xl border-none shadow-2xl">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="bg-primary/60 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="rounded-full px-6 font-bold shadow-2xl"
                                                    onClick={() => {
                                                        setData(
                                                            'featured_image',
                                                            null,
                                                        );
                                                        setImagePreview(null);
                                                    }}
                                                >
                                                    Changer l'image
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Label className="border-border hover:bg-accent/50 dark:hover:bg-primary/5 group flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50/50 transition-all dark:border-white/5 dark:bg-white/5">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="shadow-primary/5 rounded-3xl bg-white p-4 shadow-xl transition-transform group-hover:scale-110 dark:bg-slate-800">
                                                    <PlusCircle className="text-primary dark:text-primary h-8 w-8" />
                                                </div>
                                                <span className="group-hover:text-primary text-sm font-black tracking-widest text-slate-400 uppercase transition-colors">
                                                    Ajouter une image
                                                </span>
                                            </div>
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
                            <Card className="glass overflow-hidden rounded-[2rem] border-none shadow-xl">
                                <CardHeader className="px-8 py-6">
                                    <CardTitle className="text-muted-foreground flex items-center gap-3 text-sm font-black tracking-widest uppercase">
                                        <Tag className="text-primary h-4 w-4" />
                                        Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 px-8 pb-8">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ajouter un tag..."
                                            value={newTag}
                                            onChange={(e) =>
                                                setNewTag(e.target.value)
                                            }
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                handleAddTag()
                                            }
                                            className="h-10 rounded-xl border-none bg-slate-50/50 font-bold placeholder:font-medium placeholder:text-slate-300 dark:bg-white/5"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleAddTag}
                                            className="hover:bg-primary h-10 rounded-xl bg-slate-900 px-4 font-bold transition-colors dark:bg-white dark:text-slate-900"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="cursor-pointer rounded-full border-none bg-white/50 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase shadow-sm transition-all hover:bg-rose-500 hover:text-white dark:bg-white/5 dark:hover:bg-rose-600"
                                                onClick={() =>
                                                    handleRemoveTag(tag)
                                                }
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {}
                <div className="pointer-events-none fixed top-0 left-1/2 -z-10 h-full w-full -translate-x-1/2 bg-slate-50/50 dark:bg-transparent" />

                {}
                <Dialog
                    open={showNewCategoryDialog}
                    onOpenChange={setShowNewCategoryDialog}
                >
                    <DialogContent className="glass overflow-hidden rounded-[2.5rem] border-none p-10">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-3xl leading-tight font-black text-slate-900 dark:text-white">
                                Nouvelle Catégorie
                            </DialogTitle>
                            <p className="font-medium text-slate-500">
                                Créez une nouvelle division pour organiser votre
                                blog.
                            </p>
                        </DialogHeader>
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="category-name"
                                    className="text-primary text-[10px] font-black tracking-widest uppercase"
                                >
                                    Nom de la catégorie
                                </Label>
                                <Input
                                    id="category-name"
                                    value={newCategoryName}
                                    onChange={(e) =>
                                        setNewCategoryName(e.target.value)
                                    }
                                    placeholder="ex: Événements Académiques"
                                    className="h-14 rounded-2xl border-white/50 bg-white/50 px-6 text-lg font-bold shadow-inner dark:border-white/5 dark:bg-white/5"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-10 gap-3 sm:justify-start">
                            <Button
                                onClick={() => {
                                    router.post(
                                        route('categories.store'),
                                        { name: newCategoryName },
                                        {
                                            onSuccess: () => {
                                                setShowNewCategoryDialog(false);
                                                setNewCategoryName('');
                                                toast.success(
                                                    'Catégorie ajoutée !',
                                                );
                                            },
                                        },
                                    );
                                }}
                                className="bg-primary dark:bg-primary shadow-primary/20 h-14 grow rounded-2xl font-black text-white shadow-xl"
                            >
                                Ajouter la catégorie
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowNewCategoryDialog(false)}
                                className="h-14 rounded-2xl px-8 font-black font-bold text-slate-500 transition-all hover:bg-slate-50"
                            >
                                Annuler
                            </Button>
                        </DialogFooter>

                        {}
                        <div className="bg-primary/10 absolute -right-20 -bottom-20 -z-10 h-64 w-64 rounded-full blur-[80px]" />
                    </DialogContent>
                </Dialog>
            </div>
            );
        </>
    );
}

Page.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
export default Page;
