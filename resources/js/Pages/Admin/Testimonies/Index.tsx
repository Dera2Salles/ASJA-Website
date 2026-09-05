import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { uploadUrl } from '@/lib/uploads';
import { router, useForm } from '@inertiajs/react';
import {
    Camera,
    Edit,
    MessageSquare,
    Plus,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Testimony {
    id: number;
    name: string;
    role: string | null;
    content: string;
    avatar: string | null;
    is_visible: boolean;
}

export default function TestimoniesIndex({
    testimonies,
}: {
    testimonies: Testimony[];
}) {
    const [editing, setEditing] = useState<Testimony | null>(null);
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        role: '',
        content: '',
        avatar: null as File | null,
        is_visible: true,
    });

    const openCreate = () => {
        reset();
        setEditing(null);
        setShowForm(true);
    };
    const openEdit = (t: Testimony) => {
        setEditing(t);
        setData({
            name: t.name,
            role: t.role ?? '',
            content: t.content,
            avatar: null,
            is_visible: t.is_visible,
        });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            router.post(
                route('admin.testimonies.update', editing.id),
                { ...data, _method: 'PUT' },
                {
                    onSuccess: () => {
                        setShowForm(false);
                        toast.success('Témoignage mis à jour !');
                    },
                },
            );
        } else {
            post(route('admin.testimonies.store'), {
                onSuccess: () => {
                    setShowForm(false);
                    toast.success('Témoignage ajouté !');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer ce témoignage ?'))
            router.delete(route('admin.testimonies.destroy', id), {
                onSuccess: () => toast.success('Témoignage supprimé'),
            });
    };

    return (
        <AdminLayout breadcrumbs={[{ label: 'Témoignages' }]}>
            <div className="space-y-8 pb-16">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="admin-title">
                            Paroles d'{' '}
                            <span className="text-primary dark:text-primary">
                                Étudiants
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Gérez les témoignages qui inspirent nos futurs
                            étudiants.
                        </p>
                    </div>
                    <div>
                        {!showForm && (
                            <Button
                                onClick={openCreate}
                                className="dark:bg-primary bg-card text-primary-foreground hover:bg-card h-10 gap-2 px-5 font-semibold"
                            >
                                <Plus size={18} /> Nouveau Témoignage
                            </Button>
                        )}
                    </div>
                </div>

                {showForm && (
                    <div>
                        <Card className="border-border bg-card relative overflow-hidden border shadow-sm">
                            <div className="absolute top-4 right-4 z-20">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowForm(false)}
                                    className="hover:bg-destructive-surface hover:text-destructive h-9 w-9"
                                >
                                    <X size={18} />
                                </Button>
                            </div>
                            <CardHeader className="px-8 pt-8 pb-4">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-lg font-bold tracking-tight">
                                        {editing
                                            ? 'Modifier le Témoignage'
                                            : 'Nouveau Témoignage'}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                                        <div className="space-y-5 md:col-span-8">
                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Nom Complet
                                                    </Label>
                                                    <Input
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="ex: Jean Dupont"
                                                        className="h-10"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Rôle / Titre
                                                    </Label>
                                                    <Input
                                                        value={data.role}
                                                        onChange={(e) =>
                                                            setData(
                                                                'role',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="ex: Étudiant en Informatique"
                                                        className="h-10"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Témoignage
                                                </Label>
                                                <Textarea
                                                    value={data.content}
                                                    onChange={(e) =>
                                                        setData(
                                                            'content',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Partagez l'expérience..."
                                                    className="min-h-[120px]"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-5 md:col-span-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Photo de Profil
                                                </Label>
                                                <div className="border-border bg-muted/50 flex flex-col items-center gap-4 border border-dashed p-5">
                                                    <div className="relative">
                                                        <Avatar className="h-20 w-20 border border-white shadow-sm">
                                                            <AvatarFallback className="bg-accent text-primary">
                                                                <User
                                                                    size={28}
                                                                />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <Label className="bg-primary text-primary-foreground absolute right-0 bottom-0 flex h-7 w-7 cursor-pointer items-center justify-center border border-white">
                                                            <Camera size={13} />
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'avatar',
                                                                        e.target
                                                                            .files?.[0] ??
                                                                            null,
                                                                    )
                                                                }
                                                            />
                                                        </Label>
                                                    </div>
                                                    <span className="text-muted-foreground text-xs font-medium uppercase">
                                                        PNG, JPG ou JPEG
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="border-border bg-muted/50 flex items-center justify-between border p-4">
                                                <div>
                                                    <Label className="text-foreground text-sm font-semibold">
                                                        Visibilité
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Afficher sur le site
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={data.is_visible}
                                                    onCheckedChange={(c) =>
                                                        setData('is_visible', c)
                                                    }
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-border flex justify-end gap-3 border-t pt-5">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setShowForm(false)}
                                            className="text-muted-foreground hover:bg-muted h-10 px-6 font-semibold"
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-9 px-6 hover:opacity-90"
                                        >
                                            {processing
                                                ? 'Enregistrement...'
                                                : editing
                                                  ? 'Mettre à jour'
                                                  : 'Ajouter le témoignage'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {testimonies.length === 0 && !showForm && (
                        <div className="border-border bg-card /30 flex flex-col items-center justify-center border border-dashed py-20 lg:col-span-2">
                            <div className="bg-accent mb-5 flex h-16 w-16 items-center justify-center">
                                <MessageSquare
                                    className="text-primary"
                                    size={28}
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h2 className="text-foreground mb-1 text-lg font-bold">
                                Aucun témoignage
                            </h2>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Soyez proactif et ajoutez le premier témoignage
                                étudiant.
                            </p>
                            <Button
                                variant="outline"
                                onClick={openCreate}
                                className="border-border text-primary hover:bg-accent h-10 px-6 font-semibold"
                            >
                                Commencer maintenant
                            </Button>
                        </div>
                    )}
                    {testimonies.map((t, i) => (
                        <div key={t.id}>
                            <Card className="group border-border bg-card relative overflow-hidden border p-6 transition-all hover:shadow-md">
                                <div className="flex items-start gap-5">
                                    <div className="relative shrink-0">
                                        <Avatar className="h-12 w-12 border border-white shadow-sm">
                                            {t.avatar && (
                                                <AvatarImage
                                                    src={uploadUrl(t.avatar)}
                                                />
                                            )}
                                            <AvatarFallback className="bg-accent text-primary font-bold">
                                                {t.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {!t.is_visible && (
                                            <div
                                                className="bg-warning absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center border border-white"
                                                title="Caché"
                                            >
                                                <X
                                                    size={10}
                                                    strokeWidth={3}
                                                    className="text-primary-foreground"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="group-hover:text-primary text-foreground text-base font-bold tracking-tight transition-colors">
                                                    {t.name}
                                                </h3>
                                                {t.role && (
                                                    <span className="text-primary dark:text-primary/70 text-xs font-medium">
                                                        {t.role}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex translate-x-2 gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => openEdit(t)}
                                                    className="hover:text-primary hover:bg-accent text-muted-foreground h-8 w-8"
                                                >
                                                    <Edit size={15} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleDelete(t.id)
                                                    }
                                                    className="text-muted-foreground hover:bg-destructive-surface hover:text-destructive h-8 w-8"
                                                >
                                                    <Trash2 size={15} />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed italic">
                                            "{t.content}"
                                        </p>
                                        {!t.is_visible && (
                                            <Badge
                                                variant="outline"
                                                className="border-warning/30 bg-warning-surface text-warning dark:bg-warning-surface/10 px-2 py-0.5 text-xs font-semibold"
                                            >
                                                Brouillon / Masqué
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
