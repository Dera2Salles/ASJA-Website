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
                            className="hover:text-primary group mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Retour à la liste
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {isEdit ? 'Édition' : 'Nouveau'}{' '}
                            <span className="text-primary dark:text-primary">
                                Département
                            </span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {isEdit
                                ? `Modification des paramètres de ${department?.name}`
                                : 'Créez une nouvelle mention académique.'}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {}
                    <div className="space-y-10 lg:col-span-8">
                        <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-white/5">
                            <CardHeader className="border-b border-border bg-muted/60 px-8 py-6 dark:border-white/5">
                                <CardTitle className="flex items-center gap-3 text-base font-bold text-foreground">
                                    <Building2
                                        className="text-primary"
                                        size={24}
                                    />
                                    Informations Générales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 p-8">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                            Nom du département
                                        </Label>
                                        <Input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="ex: GÉNIE INFORMATIQUE"
                                            className="h-10 rounded-lg"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                                        )}
                                    </div>
                                    {!isEdit && (
                                        <div className="space-y-3">
                                            <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                                                className="h-10 rounded-lg font-mono"
                                            />
                                            {errors.slug && (
                                                <p className="mt-1 text-xs text-rose-500">{errors.slug}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                                        className="min-h-[120px] rounded-lg border-border leading-relaxed dark:border-white/5"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-3">

                                    <div className="flex flex-col gap-4">
                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                            Ordre
                                        </Label>
                                        <div className="rounded-2xl bg-muted/50 p-3 dark:bg-black/20">
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
                                                className="h-10 border-none bg-transparent p-0 text-center text-lg font-medium shadow-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex h-[76px] flex-col items-center justify-end gap-3 rounded-2xl bg-muted/50 p-3 dark:bg-black/20">
                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                            Visibilité
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'text-xs font-semibold',
                                                    !data.is_visible
                                                        ? 'text-rose-500'
                                                        : 'text-muted-foreground',
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
                                                className="data-[state=checked]:bg-primary"
                                            />
                                            <span
                                                className={cn(
                                                    'text-xs font-semibold',
                                                    data.is_visible
                                                        ? 'text-primary'
                                                        : 'text-muted-foreground',
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
                            <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-white/5">
                                <CardHeader className="border-b border-border px-6 py-5 dark:border-white/5">
                                    <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wide">
                                        <Layers className="text-primary h-4 w-4" />{' '}
                                        Logo / Icône
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex min-h-[220px] flex-col items-center justify-center p-8">
                                    {department?.logo && !data.logo ? (
                                        <div className="group/logo relative mb-6 h-24 w-24">
                                            <img
                                                src={`/storage/${department.logo}`}
                                                alt=""
                                    className="relative h-20 w-full overflow-hidden rounded-xl bg-card/50 object-contain p-2 shadow-sm"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-muted-foreground dark:border-white/10 dark:bg-card/5">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    <Label className="dark:bg-primary cursor-pointer rounded-lg bg-card px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-card">
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
                                        <p className="text-primary mt-2 max-w-[150px] truncate text-[10px] font-bold">
                                            {data.logo.name}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-white/5">
                                <CardHeader className="border-b border-border px-6 py-5 dark:border-white/5">
                                    <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wide">
                                        <ImageIcon className="text-primary h-4 w-4" />{' '}
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
                                                className="h-full w-full rounded-2xl border border-white/50 object-cover shadow-lg"
                                            />
                                            <div className="bg-primary/10 absolute inset-0 rounded-2xl" />
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex h-24 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-muted-foreground dark:border-white/10 dark:bg-card/5">
                                            <LayoutGrid size={32} />
                                        </div>
                                    )}
                                    <Label className="cursor-pointer rounded-lg bg-muted px-5 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted dark:bg-card/10">
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
                                        <p className="text-primary mt-2 max-w-[150px] truncate text-[10px] font-bold">
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
                            <Card className="relative overflow-hidden rounded-xl border border-primary bg-primary text-white shadow-md">
                                <GraduationCap className="absolute -right-8 -bottom-8 h-32 w-32 opacity-10" />
                                <CardContent className="relative z-10 space-y-5 p-6">
                                    <h3 className="text-xl leading-tight font-bold tracking-tight">
                                        Prêt à publier ?
                                    </h3>
                                    <p className="text-accent-foreground text-sm leading-relaxed font-medium opacity-90">
                                        Assurez-vous que l'identité visuelle
                                        (couleurs, logo) correspond aux
                                        standards académiques de l'ASJA.
                                    </p>
                                    <div className="flex flex-col gap-3 pt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={processing || isSaving}
                                            className="text-primary hover:bg-accent group h-12 w-full rounded-lg bg-card font-bold tracking-wide shadow-sm transition-all hover:opacity-90"
                                        >
                                            {isSaving ? (
                                                <div className="border-primary h-5 w-5 animate-spin rounded-full border border-t-transparent" />
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
                                                className="w-full rounded-lg text-xs font-semibold text-white hover:bg-card/10"
                                            >
                                                Quitter sans sauver
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {}
                        <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm dark:border-white/5">
                            <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                                        <div className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                                            {i + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs leading-none font-semibold text-foreground">
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
                        <div className="flex items-center justify-between border-b border-border pb-8 dark:border-white/5">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                    Programmes &{' '}
                                    <span className="text-primary">
                                        Parcours
                                    </span>
                                </h2>
                                <p className="text-muted-foreground text-sm">
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
                                className="dark:bg-primary h-10 gap-2 rounded-lg bg-card px-5 font-semibold text-white transition-all hover:bg-card"
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
                                    <Card className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-white/5">
                                        <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-3">
                                            <CardTitle className="text-primary text-base font-bold tracking-tight">
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
                                                className="rounded-lg hover:bg-rose-50 hover:text-rose-500"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <form
                                                onSubmit={handleProgramSubmit}
                                                className="space-y-8"
                                            >
                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                    <div className="space-y-3">
                                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                                                            className="h-10 rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                                                            className="h-10 rounded-lg text-center"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                                                        className="min-h-[80px] rounded-lg"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                    <div className="space-y-3">
                                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                                                            className="min-h-[120px] rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                                                            className="min-h-[120px] rounded-lg"
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
                                                        className="bg-primary dark:bg-primary rounded-lg px-8 font-semibold text-white hover:opacity-90"
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
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-muted-foreground md:col-span-2 dark:border-white/5">
                                        <GraduationCap size={32} className="mb-3 opacity-30" />
                                        <p className="text-xs font-medium tracking-wider">
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
                                    <Card className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:border-white/5">
                                        <div className="bg-primary/5 pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-[40px]" />
                                        <div className="space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
                                                        {prog.sort_order}
                                                    </div>
                                                    <h3 className="text-base font-bold tracking-tight text-foreground">
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
                                                        className="hover:text-primary hover:bg-accent h-9 w-9 rounded-xl text-muted-foreground transition-all"
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
                                                        className="h-9 w-9 rounded-xl text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600"
                                                    >
                                                        <Trash2
                                                            size={16}
                                                            strokeWidth={2.5}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>

                                            {prog.description && (
                                                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                                                    {prog.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                {prog.competences && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-primary border-primary/10 bg-primary/[0.03] rounded-md px-2 py-0.5 text-xs font-medium"
                                                    >
                                                        📚 Compétences
                                                    </Badge>
                                                )}
                                                {prog.debouches && (
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-md border-indigo-500/10 bg-indigo-500/[0.03] px-2 py-0.5 text-xs font-medium text-indigo-500"
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
            <div className="bg-primary/[0.02] pointer-events-none fixed right-[-5%] bottom-[10%] -z-10 h-[500px] w-[500px] animate-pulse rounded-full blur-[120px]" />
        </AdminLayout>
    );
}
