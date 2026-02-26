import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { Eye, Image as ImageIcon, Loader2, PlusCircle, Save, Tag } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BlogEditor } from '../../BlogEditor/components/BlogEditor';

export default function BlogCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        category: '',
        tags: [] as string[],
        is_published: false as boolean,
        cover_image: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.title.trim() || !data.content.trim()) {
            toast.error('Veuillez remplir le titre et le contenu.');
            return;
        }
        post(route('admin.blog.store'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Article créé !');
                reset();
                setImagePreview(null);
            },
            onError: () => toast.error('Erreur lors de la création.'),
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="text-sm text-gray-400 mb-1 flex gap-2">
                            <a href={route('admin.blog.index')} className="hover:text-white">Blog</a>
                            <span>/</span>
                            <span className="text-white">Nouvel article</span>
                        </nav>
                        <h1 className="text-2xl font-bold text-white">Nouvel Article</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setData('is_published', false)} className="bg-gray-800 text-gray-300 border-gray-600">
                            Brouillon
                        </Button>
                        <Button onClick={(e: any) => { setData('is_published', true); handleSubmit(e); }} disabled={processing} className="bg-indigo-600 hover:bg-indigo-500">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Publier
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="space-y-6 lg:col-span-8">
                        <Input
                            placeholder="Titre de l'article..."
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="h-auto border-none bg-transparent p-0 text-4xl font-black text-white placeholder:text-gray-600 focus-visible:ring-0"
                        />
                        {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}

                        <div className="overflow-hidden rounded-xl border border-gray-700 bg-white">
                            <div className="border-b bg-gray-50 px-4 py-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Corps de l'article</span>
                            </div>
                            <div className="p-1">
                                <BlogEditor
                                    content={data.content}
                                    onChange={(content) => setData('content', content)}
                                    placeholder="Commencez à écrire..."
                                    onImageUpload={async () => []}
                                />
                            </div>
                        </div>
                        {errors.content && <p className="text-red-400 text-sm">{errors.content}</p>}
                    </div>

                    <div className="space-y-4 lg:col-span-4">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold uppercase text-gray-400">Catégorie</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    placeholder="ex: Événements, Actualités..."
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm text-white">
                                    <ImageIcon className="h-4 w-4 text-indigo-400" /> Image à la une
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {imagePreview ? (
                                    <div className="relative group rounded-lg overflow-hidden">
                                        <img src={imagePreview} alt="" className="h-40 w-full object-cover" />
                                        <button
                                            onClick={() => { setData('cover_image', null); setImagePreview(null); }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 text-white text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                ) : (
                                    <Label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                        <PlusCircle className="h-6 w-6 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-400">Ajouter une image</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </Label>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm text-white">
                                    <Tag className="h-4 w-4 text-indigo-400" /> Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ajouter un tag..."
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        className="bg-gray-700 border-gray-600 text-white"
                                    />
                                    <Button size="sm" onClick={handleAddTag} className="bg-gray-700 text-white hover:bg-gray-600">
                                        +
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-red-900/40 hover:text-red-400 bg-gray-700 text-gray-200"
                                            onClick={() => setData('tags', data.tags.filter((t) => t !== tag))}
                                        >
                                            {tag} ×
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
