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
import {
    Eye,
    Image as ImageIcon,
    Loader2,
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
            data.tags.filter((tag: string) => tag !== tagToRemove),
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

        transform((data: PostFormData) => ({
            ...data,
            ...payload,
            _method: existingPost ? 'put' : 'post',
            category_id: data.category_id ? Number(data.category_id) : null,
        }));

        post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Enregistré avec succès !');
                if (!existingPost) {
                    reset();
                    setImagePreview(null);
                }
            },
            onError: (errors: any) => {
                console.log('Erreurs de validation:', errors);
            },
        });
    };
    return (
        <>
            <div className="min-h-screen bg-[#F8F9FC] px-4 py-6 dark:bg-slate-950 md:px-8">
                <div className="mx-auto max-w-[1600px] space-y-6">
                    {}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Admin</span>
                                <span>/</span>
                                <span className="font-medium text-brand-primary">
                                    Blog
                                </span>
                            </nav>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {existingPost
                                    ? 'Modifier l’article'
                                    : 'Nouvel Article'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.open('', '_blank')}
                                className="bg-white shadow-sm"
                            >
                                <Eye className="mr-2 h-4 w-4" /> Prévisualiser
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="bg-brand-primary-navy shadow-md hover:bg-brand-primary"
                            >
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {existingPost
                                    ? 'Enregistrer'
                                    : "Publier l'article"}
                            </Button>
                        </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        <div className="space-y-6 lg:col-span-8">
                            {}
                            <div className="group space-y-2">
                                <Input
                                    id="post-title"
                                    placeholder="Titre de l'article..."
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    className="h-auto border-none bg-transparent p-0 text-4xl font-black text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 dark:text-white dark:placeholder:text-slate-700 md:text-5xl"
                                />
                                <div className="h-0.5 w-20 bg-brand-gold transition-all group-focus-within:w-48" />
                            </div>

                            {}
                            <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-card">
                                <div className="border-b bg-slate-50/50 px-4 py-2 dark:bg-slate-900/50">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Corps de l'article
                                    </span>
                                </div>
                                <div className="p-1">
                                    <BlogEditor
                                        content={data.content}
                                        onChange={(content) =>
                                            setData('content', content)
                                        }
                                        placeholder="Commencez à écrire votre histoire ici..."
                                        onImageUpload={
                                            handleImageUploadForEditor
                                        }
                                    />
                                </div>
                            </div>

                            {}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Résumé (Extrait)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        placeholder="Une brève introduction..."
                                        value={data.excerpt}
                                        onChange={(e) =>
                                            setData('excerpt', e.target.value)
                                        }
                                        className="resize-none border-slate-200 focus:border-brand-gold focus:ring-brand-gold/10"
                                        rows={3}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {}
                        <div className="space-y-6 lg:col-span-4">
                            {}
                            <Card className="overflow-hidden border-none shadow-sm">
                                <CardHeader className="bg-slate-50 pb-4 dark:bg-slate-900/50">
                                    <CardTitle className="text-base">
                                        Paramètres de publication
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase text-slate-400">
                                            Statut
                                        </Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(val) =>
                                                setData('status', val)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">
                                                    Brouillon
                                                </SelectItem>
                                                <SelectItem value="publish">
                                                    Publié
                                                </SelectItem>
                                                <SelectItem value="future">
                                                    Planifié
                                                </SelectItem>
                                                <SelectItem value="private">
                                                    Privé
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase text-slate-400">
                                            Catégorie
                                        </Label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(val) =>
                                                    setData('category_id', val)
                                                }
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem
                                                            key={cat.id}
                                                            value={String(
                                                                cat.id,
                                                            )}
                                                        >
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="shrink-0"
                                                onClick={() =>
                                                    setShowNewCategoryDialog(
                                                        true,
                                                    )
                                                }
                                            >
                                                <PlusCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {}
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ImageIcon className="h-4 w-4 text-brand-gold" />{' '}
                                        Image à la une
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {imagePreview ? (
                                        <div className="group relative overflow-hidden rounded-lg border">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setData(
                                                            'featured_image',
                                                            null,
                                                        );
                                                        setImagePreview(null);
                                                    }}
                                                >
                                                    Remplacer l'image
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="rounded-full bg-white p-3 shadow-sm">
                                                    <PlusCircle className="h-6 w-6 text-brand-primary" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600">
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
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Tag className="h-4 w-4 text-brand-gold" />{' '}
                                        Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add tag..."
                                            value={newTag}
                                            onChange={(e) =>
                                                setNewTag(e.target.value)
                                            }
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                handleAddTag()
                                            }
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleAddTag}
                                            className="bg-slate-100 text-slate-900 hover:bg-slate-200"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.tags.map((tag: string) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="cursor-pointer bg-slate-100 px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-red-50 hover:text-red-600"
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
                <Dialog
                    open={showNewCategoryDialog}
                    onOpenChange={setShowNewCategoryDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Ajouter une nouvelle catégorie
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="category-name">
                                    Nom de la catégorie
                                </Label>
                                <Input
                                    id="category-name"
                                    value={newCategoryName}
                                    onChange={(e) =>
                                        setNewCategoryName(e.target.value)
                                    }
                                    placeholder="Entrez le nom de la catégorie"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowNewCategoryDialog(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={() => {
                                    router.post(
                                        route('categories.store'),
                                        { name: newCategoryName },
                                        {
                                            onSuccess: () => {
                                                setShowNewCategoryDialog(false);
                                                setNewCategoryName('');
                                            },
                                        },
                                    );
                                }}
                            >
                                Ajouter
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Page.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
export default Page;
