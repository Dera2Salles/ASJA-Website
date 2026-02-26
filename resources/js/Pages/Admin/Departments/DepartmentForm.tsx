import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';
import { Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Building2,
    ChevronLeft,
    GraduationCap,
    Image as ImageIcon,
    Layers,
    LayoutGrid,
    Palette,
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Program {
    id?: number;
    title: string;
    description: string;
    competences: string;
    debouches: string;
    sort_order: number;
}

interface Department {
    id?: number;
    slug: string;
    name: string;
    description: string;
    color: string;
    logo: string | null;
    hero_image: string | null;
    is_visible: boolean;
    sort_order: number;
    programs?: Program[];
}

interface Props {
    department?: Department;
    isEdit?: boolean;
}

export default function DepartmentForm({ department, isEdit = false }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        slug: department?.slug ?? '',
        name: department?.name ?? '',
        description: department?.description ?? '',
        color: department?.color ?? '#10b981',
        logo: null as File | null,
        hero_image: null as File | null,
        is_visible: department?.is_visible ?? true,
        sort_order: department?.sort_order ?? 0,
    });

    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [showProgramForm, setShowProgramForm] = useState(false);
    const [programForm, setProgramForm] = useState<Program>({
        title: '',
        description: '',
        competences: '',
        debouches: '',
        sort_order: 0,
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (isEdit && department?.id) {
            router.post(
                route('admin.departments.update', department.id),
                {
                    ...data,
                    _method: 'PUT',
                } as any,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        toast.success('Département mis à jour !');
                        setIsSaving(false);
                    },
                    onError: () => setIsSaving(false),
                },
            );
        } else {
            post(route('admin.departments.store'), {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Département créé !');
                    setIsSaving(false);
                },
                onError: () => setIsSaving(false),
            });
        }
    };

    const handleProgramSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!department?.id) return;
        if (editingProgram?.id) {
            router.put(
                route('admin.departments.programs.update', {
                    department: department.id,
                    program: editingProgram.id,
                }),
                programForm as any,
                {
                    onSuccess: () => {
                        setShowProgramForm(false);
                        setEditingProgram(null);
                        toast.success('Programme mis à jour');
                    },
                },
            );
        } else {
            router.post(
                route('admin.departments.programs.store', {
                    department: department.id,
                }),
                programForm as any,
                {
                    onSuccess: () => {
                        setShowProgramForm(false);
                        toast.success('Programme ajouté');
                    },
                },
            );
        }
    };

    const deleteProgram = (programId: number) => {
        if (!department?.id || !confirm('Supprimer ce programme ?')) return;
        router.delete(
            route('admin.departments.programs.destroy', {
                department: department.id,
                program: programId,
            }),
            {
                onSuccess: () => toast.success('Programme supprimé'),
            },
        );
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-5xl space-y-12 pb-20">
                {}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link
                            href={route('admin.departments.index')}
                            className="hover:text-asja-green-600 group mb-4 inline-flex items-center gap-2 text-sm font-black text-slate-400 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Retour à la liste
                        </Link>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
                            {isEdit ? 'Édition' : 'Nouveau'}{' '}
                            <span className="text-asja-green-600 dark:text-primary">
                                Département
                            </span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg font-medium">
                            {isEdit
                                ? `Modification des paramètres de ${department?.name}`
                                : 'Créez une nouvelle mention académique.'}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {}
                    <div className="space-y-10 lg:col-span-8">
                        <Card className="glass overflow-hidden rounded-[3rem] border-none shadow-2xl">
                            <CardHeader className="border-b border-white/40 bg-white/30 px-10 py-8 dark:border-white/5">
                                <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white">
                                    <Building2
                                        className="text-asja-green-600"
                                        size={24}
                                    />
                                    Informations Générales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 p-10">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                            Nom du département
                                        </Label>
                                        <Input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="ex: GÉNIE INFORMATIQUE"
                                            className="focus:ring-asja-green-500/20 h-14 rounded-2xl border-none bg-slate-50/50 px-6 text-lg font-black focus:ring-2 dark:bg-black/20"
                                        />
                                        {errors.name && (
                                            <p className="ml-1 text-[10px] font-black text-rose-500 uppercase">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    {!isEdit && (
                                        <div className="space-y-3">
                                            <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                                Slug (URL)
                                            </Label>
                                            <Input
                                                value={data.slug}
                                                onChange={(e) =>
                                                    setData(
                                                        'slug',
                                                        e.target.value
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                '-',
                                                            ),
                                                    )
                                                }
                                                placeholder="ex: informatique"
                                                className="focus:ring-asja-green-500/20 h-14 rounded-2xl border-none bg-slate-50/50 px-6 font-mono font-bold focus:ring-2 dark:bg-black/20"
                                            />
                                            {errors.slug && (
                                                <p className="ml-1 text-[10px] font-black text-rose-500 uppercase">
                                                    {errors.slug}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                        Description
                                    </Label>
                                    <Textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Présentez brièvement ce département..."
                                        className="focus:ring-asja-green-500/20 min-h-[120px] rounded-[2rem] border-none bg-slate-50/50 p-6 leading-relaxed font-medium focus:ring-2 dark:bg-black/20"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-3">
                                    <div className="flex flex-col gap-4">
                                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                            Identité visuelle
                                        </Label>
                                        <div className="flex items-center gap-4 rounded-2xl bg-slate-50/50 p-3 dark:bg-black/20">
                                            <div
                                                className="group relative h-12 w-12 cursor-pointer rounded-xl shadow-lg transition-transform hover:scale-110"
                                                style={{
                                                    backgroundColor: data.color,
                                                }}
                                            >
                                                <input
                                                    type="color"
                                                    value={data.color}
                                                    onChange={(e) =>
                                                        setData(
                                                            'color',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                />
                                                <Palette className="pointer-events-none absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white/50" />
                                            </div>
                                            <Input
                                                value={data.color}
                                                onChange={(e) =>
                                                    setData(
                                                        'color',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10 border-none bg-transparent p-0 font-mono text-xs font-bold text-slate-500 shadow-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                            Ordre
                                        </Label>
                                        <div className="rounded-2xl bg-slate-50/50 p-3 dark:bg-black/20">
                                            <Input
                                                type="number"
                                                value={data.sort_order}
                                                onChange={(e) =>
                                                    setData(
                                                        'sort_order',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="h-10 border-none bg-transparent p-0 text-center text-lg font-black shadow-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex h-[76px] flex-col items-center justify-end gap-3 rounded-2xl bg-slate-50/50 p-3 dark:bg-black/20">
                                        <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                            Visibilité
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'text-[10px] font-black uppercase',
                                                    !data.is_visible
                                                        ? 'text-rose-500'
                                                        : 'text-slate-300',
                                                )}
                                            >
                                                Off
                                            </span>
                                            <Switch
                                                checked={data.is_visible}
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'is_visible',
                                                        checked,
                                                    )
                                                }
                                                className="data-[state=checked]:bg-asja-green-600"
                                            />
                                            <span
                                                className={cn(
                                                    'text-[10px] font-black uppercase',
                                                    data.is_visible
                                                        ? 'text-asja-green-600'
                                                        : 'text-slate-300',
                                                )}
                                            >
                                                On
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <Card className="glass group overflow-hidden rounded-[2.5rem] border-none shadow-xl">
                                <CardHeader className="border-b border-white/40 bg-white/20 p-6 dark:border-white/5">
                                    <CardTitle className="flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                                        <Layers className="text-asja-green-600 h-4 w-4" />{' '}
                                        Logo / Icône
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex min-h-[220px] flex-col items-center justify-center p-8">
                                    {department?.logo && !data.logo ? (
                                        <div className="group/logo relative mb-6 h-24 w-24">
                                            <div
                                                className="absolute inset-0 rounded-full opacity-20 blur-xl"
                                                style={{
                                                    backgroundColor: data.color,
                                                }}
                                            />
                                            <img
                                                src={`/storage/${department.logo}`}
                                                alt=""
                                                className="relative h-full w-full rounded-2xl bg-white/50 object-contain p-2 shadow-xl backdrop-blur-md transition-all group-hover/logo:scale-110"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-300 dark:border-white/10 dark:bg-white/5">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    <Label className="dark:bg-primary cursor-pointer rounded-xl bg-slate-900 px-6 py-3 text-xs font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95">
                                        {department?.logo
                                            ? 'Remplacer le logo'
                                            : 'Choisir un logo'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setData(
                                                    'logo',
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                        />
                                    </Label>
                                    {data.logo && (
                                        <p className="text-asja-green-600 mt-2 max-w-[150px] truncate text-[10px] font-bold">
                                            {data.logo.name}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="glass overflow-hidden rounded-[2.5rem] border-none shadow-xl">
                                <CardHeader className="border-b border-white/40 bg-white/20 p-6 dark:border-white/5">
                                    <CardTitle className="flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                                        <ImageIcon className="text-asja-green-600 h-4 w-4" />{' '}
                                        Image de Bannière
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex min-h-[220px] flex-col items-center justify-center p-8">
                                    {department?.hero_image &&
                                    !data.hero_image ? (
                                        <div className="relative mb-6 h-24 w-full">
                                            <img
                                                src={`/storage/${department.hero_image}`}
                                                alt=""
                                                className="h-full w-full rounded-2xl border-2 border-white/50 object-cover shadow-lg"
                                            />
                                            <div className="bg-asja-green-900/10 absolute inset-0 rounded-2xl" />
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex h-24 w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-300 dark:border-white/10 dark:bg-white/5">
                                            <LayoutGrid size={32} />
                                        </div>
                                    )}
                                    <Label className="cursor-pointer rounded-xl bg-slate-100 px-6 py-3 text-xs font-black text-slate-600 transition-all hover:scale-105 active:scale-95 dark:bg-white/10 dark:text-white">
                                        {department?.hero_image
                                            ? 'Modifier la bannière'
                                            : 'Image Hero'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setData(
                                                    'hero_image',
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                        />
                                    </Label>
                                    {data.hero_image && (
                                        <p className="text-asja-green-600 mt-2 max-w-[150px] truncate text-[10px] font-bold">
                                            {data.hero_image.name}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {}
                    <div className="space-y-8 lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass bg-asja-green-600 relative overflow-hidden rounded-[2.5rem] border-none text-white shadow-xl">
                                <GraduationCap className="absolute -right-8 -bottom-8 h-40 w-40 opacity-10" />
                                <CardContent className="relative z-10 space-y-6 p-8">
                                    <h3 className="text-2xl leading-tight font-black tracking-tight uppercase">
                                        Prêt à publier ?
                                    </h3>
                                    <p className="text-asja-green-50 text-sm leading-relaxed font-medium opacity-90">
                                        Assurez-vous que l'identité visuelle
                                        (couleurs, logo) correspond aux
                                        standards académiques de l'ASJA.
                                    </p>
                                    <div className="flex flex-col gap-3 pt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={processing || isSaving}
                                            className="text-asja-green-900 hover:bg-asja-green-50 group h-14 w-full rounded-2xl bg-white font-black tracking-widest uppercase shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            {isSaving ? (
                                                <div className="border-asja-green-600 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                                            ) : (
                                                <>
                                                    <Save className="mr-3 h-5 w-5 transition-transform group-hover:rotate-12" />
                                                    {isEdit
                                                        ? 'Mettre à jour'
                                                        : 'Confirmer la création'}
                                                </>
                                            )}
                                        </Button>
                                        <Link
                                            href={route(
                                                'admin.departments.index',
                                            )}
                                            className="w-full"
                                        >
                                            <Button
                                                variant="ghost"
                                                className="w-full rounded-2xl text-xs font-black tracking-widest text-white uppercase hover:bg-white/10"
                                            >
                                                Quitter sans sauver
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {}
                        <div className="glass space-y-6 rounded-[3rem] border-none p-10 shadow-xl">
                            <h4 className="text-asja-green-600 text-[10px] font-black tracking-[4px] uppercase">
                                Recommandations
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    {
                                        title: 'Identité',
                                        text: 'Le nom doit être en majuscules pour les titres officiels.',
                                    },
                                    {
                                        title: 'Slug',
                                        text: 'Le slug est permanent après création. Choisissez-le bien.',
                                    },
                                    {
                                        title: 'Media',
                                        text: 'Privilégiez le format PNG ou SVG pour les logos.',
                                    },
                                ].map((tip, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="bg-asja-green-500/10 text-asja-green-600 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                                            {i + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs leading-none font-black text-slate-900 dark:text-white">
                                                {tip.title}
                                            </p>
                                            <p className="text-muted-foreground text-[10px] leading-tight font-medium">
                                                {tip.text}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {}
                {isEdit && department?.id && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-20 space-y-10"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-8 dark:border-white/5">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                    Programmes &{' '}
                                    <span className="text-asja-green-600">
                                        Parcours
                                    </span>
                                </h2>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Structurez l'offre académique pour ce
                                    département.
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    setEditingProgram(null);
                                    setProgramForm({
                                        title: '',
                                        description: '',
                                        competences: '',
                                        debouches: '',
                                        sort_order: 0,
                                    });
                                    setShowProgramForm(true);
                                }}
                                className="dark:bg-primary h-12 gap-2 rounded-2xl bg-slate-900 px-6 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} />
                                Nouveau programme
                            </Button>
                        </div>

                        <AnimatePresence>
                            {showProgramForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <Card className="glass bg-asja-green-500/5 mb-12 rounded-[2.5rem] border-none shadow-2xl">
                                        <CardHeader className="flex flex-row items-center justify-between px-10 pt-8 pb-4">
                                            <CardTitle className="text-asja-green-700 text-xl font-black tracking-tight uppercase">
                                                {editingProgram
                                                    ? 'Modifier le programme'
                                                    : 'Nouveau Programme'}
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setShowProgramForm(false)
                                                }
                                                className="rounded-full hover:bg-rose-50 hover:text-rose-500"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-10">
                                            <form
                                                onSubmit={handleProgramSubmit}
                                                className="space-y-8"
                                            >
                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                    <div className="space-y-3">
                                                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                            Titre du parcours
                                                        </Label>
                                                        <Input
                                                            value={
                                                                programForm.title
                                                            }
                                                            onChange={(e) =>
                                                                setProgramForm({
                                                                    ...programForm,
                                                                    title: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                            required
                                                            className="focus:ring-asja-green-500/20 h-12 rounded-xl border-none bg-white/50 px-6 font-bold focus:ring-2 dark:bg-black/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                            Ordre
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                programForm.sort_order
                                                            }
                                                            onChange={(e) =>
                                                                setProgramForm({
                                                                    ...programForm,
                                                                    sort_order:
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                })
                                                            }
                                                            className="focus:ring-asja-green-500/20 h-12 rounded-xl border-none bg-white/50 px-6 font-bold focus:ring-2 dark:bg-black/20"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                        Description courte
                                                    </Label>
                                                    <Textarea
                                                        value={
                                                            programForm.description
                                                        }
                                                        onChange={(e) =>
                                                            setProgramForm({
                                                                ...programForm,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        rows={2}
                                                        className="focus:ring-asja-green-500/20 min-h-[80px] rounded-xl border-none bg-white/50 p-6 text-sm focus:ring-2 dark:bg-black/20"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                    <div className="space-y-3">
                                                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                            Compétences acquises
                                                        </Label>
                                                        <Textarea
                                                            value={
                                                                programForm.competences
                                                            }
                                                            onChange={(e) =>
                                                                setProgramForm({
                                                                    ...programForm,
                                                                    competences:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            placeholder="Listez les savoir-faire..."
                                                            className="focus:ring-asja-green-500/20 min-h-[120px] rounded-xl border-none bg-white/50 p-6 text-sm leading-relaxed focus:ring-2 dark:bg-black/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                            Débouchés
                                                            professionnels
                                                        </Label>
                                                        <Textarea
                                                            value={
                                                                programForm.debouches
                                                            }
                                                            onChange={(e) =>
                                                                setProgramForm({
                                                                    ...programForm,
                                                                    debouches:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            placeholder="Métiers, carrières..."
                                                            className="focus:ring-asja-green-500/20 min-h-[120px] rounded-xl border-none bg-white/50 p-6 text-sm leading-relaxed focus:ring-2 dark:bg-black/20"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3 pt-4">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setShowProgramForm(
                                                                false,
                                                            )
                                                        }
                                                        className="rounded-xl font-bold"
                                                    >
                                                        Annuler
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="bg-asja-green-600 dark:bg-primary shadow-asja-green-900/20 rounded-xl px-10 font-black text-white shadow-xl"
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {(department.programs ?? []).length === 0 &&
                                !showProgramForm && (
                                    <div className="glass flex flex-col items-center justify-center rounded-[3rem] border-none py-20 text-slate-400 md:col-span-2">
                                        <GraduationCap
                                            size={48}
                                            className="mb-4 opacity-20"
                                        />
                                        <p className="text-xs font-black tracking-widest uppercase">
                                            Aucun programme publié
                                        </p>
                                    </div>
                                )}
                            {(department.programs ?? []).map((prog, idx) => (
                                <motion.div
                                    key={prog.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="group glass relative overflow-hidden rounded-[2.5rem] border-none p-8 shadow-xl transition-all hover:-translate-y-1">
                                        <div className="bg-asja-green-500/5 pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-[40px]" />
                                        <div className="space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-asja-green-600 shadow-asja-green-500/30 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black text-white shadow-lg">
                                                        {prog.sort_order}
                                                    </div>
                                                    <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                                        {prog.title}
                                                    </h3>
                                                </div>
                                                <div className="flex translate-x-1 gap-1 opacity-0 transition-all transition-opacity duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingProgram(
                                                                prog,
                                                            );
                                                            setProgramForm({
                                                                ...prog,
                                                                sort_order:
                                                                    prog.sort_order ??
                                                                    0,
                                                            });
                                                            setShowProgramForm(
                                                                true,
                                                            );
                                                        }}
                                                        className="hover:text-asja-green-600 hover:bg-asja-green-50 h-9 w-9 rounded-xl text-slate-400 transition-all"
                                                    >
                                                        <Pencil
                                                            size={16}
                                                            strokeWidth={2.5}
                                                        />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            prog.id &&
                                                            deleteProgram(
                                                                prog.id,
                                                            )
                                                        }
                                                        className="h-9 w-9 rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                                                    >
                                                        <Trash2
                                                            size={16}
                                                            strokeWidth={2.5}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>

                                            {prog.description && (
                                                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed font-bold">
                                                    {prog.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                {prog.competences && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-asja-green-600 border-asja-green-600/10 bg-asja-green-500/[0.03] rounded-lg px-3 py-1 text-[9px] font-black uppercase"
                                                    >
                                                        📚 Compétences
                                                    </Badge>
                                                )}
                                                {prog.debouches && (
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-lg border-indigo-500/10 bg-indigo-500/[0.03] px-3 py-1 text-[9px] font-black text-indigo-500 uppercase"
                                                    >
                                                        💼 Débouchés
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {}
            <div className="bg-asja-green-500/[0.03] pointer-events-none fixed top-[10%] left-[-10%] -z-10 h-[600px] w-[600px] rounded-full blur-[150px]" />
            <div className="bg-primary/[0.02] pointer-events-none fixed right-[-5%] bottom-[10%] -z-10 h-[500px] w-[500px] animate-pulse rounded-full blur-[120px]" />
        </AdminLayout>
    );
}
