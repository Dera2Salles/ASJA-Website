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
import { Camera, Edit, MessageSquare, Plus, Trash2, User, X } from 'lucide-react';
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

export default function TestimoniesIndex({ testimonies }: { testimonies: Testimony[] }) {
    const [editing, setEditing] = useState<Testimony | null>(null);
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '', role: '', content: '', avatar: null as File | null, is_visible: true,
    });

    const openCreate = () => { reset(); setEditing(null); setShowForm(true); };
    const openEdit = (t: Testimony) => {
        setEditing(t);
        setData({ name: t.name, role: t.role ?? '', content: t.content, avatar: null, is_visible: t.is_visible });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            router.post(route('admin.testimonies.update', editing.id), { ...data, _method: 'PUT' }, {
                onSuccess: () => { setShowForm(false); toast.success('Témoignage mis à jour !'); },
            });
        } else {
            post(route('admin.testimonies.store'), { onSuccess: () => { setShowForm(false); toast.success('Témoignage ajouté !'); } });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer ce témoignage ?'))
            router.delete(route('admin.testimonies.destroy', id), { onSuccess: () => toast.success('Témoignage supprimé') });
    };

    return (
        <AdminLayout breadcrumbs={[{ label: 'Témoignages' }]}>
            <div className="space-y-8 pb-16">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Paroles d'{' '}<span className="text-primary dark:text-primary">Étudiants</span>
                        </h1>
                        <p className="text-muted-foreground text-sm">Gérez les témoignages qui inspirent nos futurs étudiants.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        {!showForm && (
                            <Button onClick={openCreate} className="dark:bg-primary h-10 gap-2 rounded-lg bg-card px-5 font-semibold text-white hover:bg-card">
                                <Plus size={18} /> Nouveau Témoignage
                            </Button>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                            <Card className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-white/5">
                                <div className="absolute top-4 right-4 z-20">
                                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="h-9 w-9 rounded-lg hover:bg-rose-50 hover:text-rose-600">
                                        <X size={18} />
                                    </Button>
                                </div>
                                <CardHeader className="px-8 pt-8 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary h-5 w-1 rounded-full" />
                                        <CardTitle className="text-lg font-bold tracking-tight">
                                            {editing ? 'Modifier le Témoignage' : 'Nouveau Témoignage'}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                                            <div className="space-y-5 md:col-span-8">
                                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Nom Complet</Label>
                                                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="ex: Jean Dupont" className="h-10 rounded-lg" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Rôle / Titre</Label>
                                                        <Input value={data.role} onChange={e => setData('role', e.target.value)} placeholder="ex: Étudiant en Informatique" className="h-10 rounded-lg" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Témoignage</Label>
                                                    <Textarea value={data.content} onChange={e => setData('content', e.target.value)} placeholder="Partagez l'expérience..." className="min-h-[120px] rounded-lg" required />
                                                </div>
                                            </div>
                                            <div className="space-y-5 md:col-span-4">
                                                <div className="space-y-2">
                                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Photo de Profil</Label>
                                                    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/50 p-5 dark:border-white/5">
                                                        <div className="relative">
                                                            <Avatar className="h-20 w-20 border border-white shadow-sm">
                                                                <AvatarFallback className="bg-accent text-primary"><User size={28} /></AvatarFallback>
                                                            </Avatar>
                                                            <Label className="bg-primary absolute right-0 bottom-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white text-white">
                                                                <Camera size={13} />
                                                                <input type="file" className="hidden" accept="image/*" onChange={e => setData('avatar', e.target.files?.[0] ?? null)} />
                                                            </Label>
                                                        </div>
                                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">PNG, JPG ou JPEG</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4 dark:border-white/5">
                                                    <div>
                                                        <Label className="text-sm font-semibold text-foreground">Visibilité</Label>
                                                        <p className="text-muted-foreground text-xs">Afficher sur le site</p>
                                                    </div>
                                                    <Switch checked={data.is_visible} onCheckedChange={c => setData('is_visible', c)} className="data-[state=checked]:bg-primary" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 border-t border-border pt-5 dark:border-white/5">
                                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="h-10 rounded-lg px-6 font-semibold text-muted-foreground hover:bg-muted">Annuler</Button>
                                            <Button type="submit" disabled={processing} className="bg-primary dark:bg-primary h-10 rounded-lg px-8 font-semibold text-white hover:opacity-90">
                                                {processing ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Ajouter le témoignage'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {testimonies.length === 0 && !showForm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 lg:col-span-2 dark:border-white/5 /30">
                            <div className="bg-accent mb-5 flex h-16 w-16 items-center justify-center rounded-xl">
                                <MessageSquare className="text-primary" size={28} strokeWidth={1.5} />
                            </div>
                            <h2 className="mb-1 text-lg font-bold text-foreground">Aucun témoignage</h2>
                            <p className="text-muted-foreground mb-6 text-sm">Soyez proactif et ajoutez le premier témoignage étudiant.</p>
                            <Button variant="outline" onClick={openCreate} className="border-border text-primary hover:bg-accent h-10 rounded-lg px-6 font-semibold">
                                Commencer maintenant
                            </Button>
                        </motion.div>
                    )}
                    {testimonies.map((t, i) => (
                        <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md dark:border-white/5">
                                <div className="flex items-start gap-5">
                                    <div className="relative shrink-0">
                                        <Avatar className="h-12 w-12 border border-white shadow-sm dark:border-white/5">
                                            {t.avatar && <AvatarImage src={`/storage/${t.avatar}`} />}
                                            <AvatarFallback className="bg-accent text-primary font-bold">{t.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {!t.is_visible && (
                                            <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-amber-500" title="Caché">
                                                <X size={10} strokeWidth={3} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="group-hover:text-primary text-base font-bold tracking-tight text-foreground transition-colors">{t.name}</h3>
                                                {t.role && <span className="text-primary dark:text-primary/70 text-xs font-medium">{t.role}</span>}
                                            </div>
                                            <div className="flex translate-x-2 gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                                                <Button size="icon" variant="ghost" onClick={() => openEdit(t)} className="hover:text-primary hover:bg-accent h-8 w-8 rounded-lg text-muted-foreground">
                                                    <Edit size={15} />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)} className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600">
                                                    <Trash2 size={15} />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed italic">"{t.content}"</p>
                                        {!t.is_visible && (
                                            <Badge variant="outline" className="rounded-full border-amber-500/30 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-900/10">
                                                Brouillon / Masqué
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
