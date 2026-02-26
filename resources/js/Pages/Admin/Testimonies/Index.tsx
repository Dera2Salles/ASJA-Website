import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
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

interface Props {
    testimonies: Testimony[];
}

export default function TestimoniesIndex({ testimonies }: Props) {
    const [editing, setEditing] = useState<Testimony | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
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
        if (confirm('Supprimer ce témoignage ?')) {
            router.delete(route('admin.testimonies.destroy', id), {
                onSuccess: () => toast.success('Témoignage supprimé'),
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-12 pb-20">
                {}
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
                            Paroles d'
                            <span className="text-asja-green-600 dark:text-primary">
                                Étudiants
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            Gérez les témoignages qui inspirent nos futurs
                            étudiants.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {!showForm && (
                            <Button
                                onClick={openCreate}
                                className="dark:bg-primary hover:shadow-primary/30 group h-14 gap-3 rounded-[2rem] bg-slate-900 px-8 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus
                                    size={22}
                                    strokeWidth={3}
                                    className="transition-transform group-hover:rotate-90"
                                />
                                Nouveau Témoignage
                            </Button>
                        )}
                    </motion.div>
                </div>

                {}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        >
                            <Card className="glass relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                                <div className="absolute top-6 right-6 z-20">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowForm(false)}
                                        className="h-10 w-10 rounded-full font-black transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </Button>
                                </div>
                                <CardHeader className="relative z-10 px-10 pt-10 pb-6">
                                    <div className="text-asja-green-600 dark:text-primary flex items-center gap-4">
                                        <div className="bg-asja-green-500 h-6 w-1.5 rounded-full" />
                                        <CardTitle className="text-xl leading-none font-black tracking-widest uppercase">
                                            {editing
                                                ? 'Modifier le Témoignage'
                                                : 'Nouveau Témoignage'}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10 px-10 pb-10">
                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-8"
                                    >
                                        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
                                            {}
                                            <div className="space-y-6 md:col-span-8">
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                                            Nom Complet
                                                        </Label>
                                                        <Input
                                                            value={data.name}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="ex: Jean Dupont"
                                                            className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                                            Rôle / Titre
                                                        </Label>
                                                        <Input
                                                            value={data.role}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'role',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="ex: Étudiant en Informatique"
                                                            className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
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
                                                        className="focus:ring-asja-green-500/20 min-h-[120px] rounded-2xl border-white/40 bg-white/50 text-lg leading-relaxed font-medium dark:border-white/5 dark:bg-black/20"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {}
                                            <div className="space-y-8 md:col-span-4">
                                                <div className="space-y-3">
                                                    <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                                        Photo de Profil
                                                    </Label>
                                                    <div className="border-asja-green-100 group hover:bg-asja-green-50/50 dark:hover:bg-primary/5 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed bg-slate-50/50 p-6 transition-all duration-300 dark:border-white/5 dark:bg-black/20">
                                                        <div className="relative">
                                                            <Avatar className="h-24 w-24 border-4 border-white shadow-2xl transition-transform group-hover:scale-105 dark:border-slate-800">
                                                                <AvatarFallback className="bg-asja-green-100 text-asja-green-600 text-2xl font-bold">
                                                                    <User
                                                                        size={
                                                                            32
                                                                        }
                                                                    />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <Label className="bg-asja-green-600 absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-white shadow-lg transition-all hover:scale-110 active:scale-90">
                                                                <Camera
                                                                    size={14}
                                                                />
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'avatar',
                                                                            e
                                                                                .target
                                                                                .files?.[0] ??
                                                                                null,
                                                                        )
                                                                    }
                                                                />
                                                            </Label>
                                                        </div>
                                                        <span className="group-hover:text-asja-green-600 text-[10px] font-black text-slate-400 uppercase transition-colors">
                                                            PNG, JPG ou JPEG
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between rounded-3xl border border-white/40 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-black/20">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-[11px] font-black tracking-widest text-slate-900 uppercase dark:text-white">
                                                            Visibilité
                                                        </Label>
                                                        <p className="text-muted-foreground text-[10px] font-medium">
                                                            Afficher sur le site
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={
                                                            data.is_visible
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setData(
                                                                'is_visible',
                                                                checked,
                                                            )
                                                        }
                                                        className="data-[state=checked]:bg-asja-green-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() =>
                                                    setShowForm(false)
                                                }
                                                className="h-12 rounded-xl px-8 font-black text-slate-500 transition-all hover:bg-slate-100"
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-asja-green-600 dark:bg-primary shadow-asja-green-900/20 h-12 rounded-xl px-10 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
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

                                {}
                                <div className="bg-asja-green-500/10 absolute top-[-10%] left-[-10%] -z-10 h-64 w-64 rounded-full blur-[100px]" />
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {testimonies.length === 0 && !showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass flex flex-col items-center justify-center rounded-[3rem] border-none py-24 lg:col-span-2"
                        >
                            <div className="bg-asja-green-50 dark:bg-asja-green-900/20 mb-6 flex h-24 w-24 items-center justify-center rounded-full">
                                <MessageSquare
                                    className="text-asja-green-500"
                                    size={40}
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                                Aucun témoignage
                            </h2>
                            <p className="text-muted-foreground mb-8 font-medium">
                                Soyez proactif et ajoutez le premier témoignage
                                étudiant.
                            </p>
                            <Button
                                variant="outline"
                                onClick={openCreate}
                                className="border-asja-green-200 text-asja-green-600 hover:bg-asja-green-50 h-12 rounded-2xl px-8 font-black tracking-tight"
                            >
                                Commencer maintenant
                            </Button>
                        </motion.div>
                    )}

                    {testimonies.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group glass relative overflow-hidden rounded-[2.5rem] border-none p-8 transition-all hover:-translate-y-2 hover:shadow-2xl">
                                <div className="relative z-10 flex items-start gap-6">
                                    <div className="relative shrink-0">
                                        <Avatar className="ring-asja-green-50 dark:ring-asja-green-900/10 h-16 w-16 border-2 border-white shadow-xl ring-4 transition-transform group-hover:scale-110 dark:border-white/5">
                                            {t.avatar && (
                                                <AvatarImage
                                                    src={`/storage/${t.avatar}`}
                                                />
                                            )}
                                            <AvatarFallback className="bg-asja-green-100 text-asja-green-600 text-xl font-bold">
                                                {t.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {!t.is_visible && (
                                            <div
                                                className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-lg dark:border-slate-900"
                                                title="Caché"
                                            >
                                                <X
                                                    size={12}
                                                    strokeWidth={4}
                                                    className="text-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="group-hover:text-asja-green-600 truncate text-lg leading-tight font-black tracking-tight text-slate-900 uppercase transition-colors dark:text-white">
                                                    {t.name}
                                                </h3>
                                                {t.role && (
                                                    <span className="text-asja-green-600 dark:text-primary/70 text-[10px] font-black tracking-widest uppercase">
                                                        {t.role}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex translate-x-4 gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => openEdit(t)}
                                                    className="hover:text-asja-green-600 hover:bg-asja-green-50 dark:hover:bg-primary/10 h-10 w-10 rounded-2xl text-slate-400 transition-all active:scale-90"
                                                >
                                                    <Edit
                                                        size={18}
                                                        strokeWidth={2.5}
                                                    />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleDelete(t.id)
                                                    }
                                                    className="h-10 w-10 rounded-2xl text-slate-400 transition-all hover:rotate-6 hover:bg-rose-50 hover:text-rose-600 active:scale-95 dark:hover:bg-rose-950/30"
                                                >
                                                    <Trash2
                                                        size={18}
                                                        strokeWidth={2.5}
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <MessageSquare className="text-asja-green-500/10 absolute -top-2 -left-2 h-4 w-4 -scale-x-100" />
                                            <p className="text-muted-foreground line-clamp-3 pl-2 leading-relaxed font-medium italic">
                                                "{t.content}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {}
                                {!t.is_visible && (
                                    <div className="mt-4 flex justify-end">
                                        <Badge
                                            variant="outline"
                                            className="rounded-full border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[9px] font-black tracking-[2px] text-amber-500 uppercase"
                                        >
                                            Brouillon / Masqué
                                        </Badge>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {}
            <div className="bg-asja-green-500/5 pointer-events-none fixed top-[20%] right-[-10%] -z-10 h-[500px] w-[500px] rounded-full blur-[120px]" />
            <div className="bg-primary/5 animate-bounce-slow pointer-events-none fixed bottom-[10%] left-[5%] -z-10 h-[300px] w-[300px] rounded-full blur-[100px]" />
        </AdminLayout>
    );
}
