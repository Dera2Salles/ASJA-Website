import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { uploadUrl } from '@/lib/uploads';
import { cn } from '@/lib/utils';
import { Link, router, useForm } from '@inertiajs/react';
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
        <AdminLayout
            breadcrumbs={[
                { label: 'Mentions', href: route('admin.departments.index') },
                { label: department ? 'Modifier' : 'Nouvelle' },
            ]}
        >
            <div className="mx-auto max-w-5xl space-y-6">
                {}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link
                            href={route('admin.departments.index')}
                            className="hover:text-primary group text-muted-foreground mb-3 inline-flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Retour à la liste
                        </Link>
                        <h1 className="admin-title">
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
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {}
                    <div className="space-y-10 lg:col-span-8">
                        <Card className="border-border bg-card overflow-hidden border">
                            <CardHeader className="border-border bg-muted/60 border-b px-8 py-6">
                                <CardTitle className="text-foreground flex items-center gap-3 text-base font-medium">
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
                                        <Label className="text-sm font-medium">
                                            Nom du département
                                        </Label>
                                        <Input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="ex: GÉNIE INFORMATIQUE"
                                            className="h-10"
                                        />
                                        {errors.name && (
                                            <p className="text-destructive mt-1 text-xs">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    {!isEdit && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">
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
                                                className="h-10 font-mono"
                                            />
                                            {errors.slug && (
                                                <p className="text-destructive mt-1 text-xs">
                                                    {errors.slug}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
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
                                        className="border-border min-h-[120px] leading-relaxed"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-3">
                                    <div className="flex flex-col gap-4">
                                        <Label className="text-sm font-medium">
                                            Ordre
                                        </Label>
                                        <div className="bg-muted/50 p-3 dark:bg-black/20">
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

                                    <div className="bg-muted/50 flex h-[76px] flex-col items-center justify-end gap-3 p-3 dark:bg-black/20">
                                        <Label className="text-sm font-medium">
                                            Visibilité
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'text-xs font-semibold',
                                                    !data.is_visible
                                                        ? 'text-destructive'
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
                            <Card className="border-border bg-card overflow-hidden border">
                                <CardHeader className="border-border border-b px-6 py-5">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <Layers className="text-primary h-4 w-4" />{' '}
                                        Logo / Icône
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex min-h-[220px] flex-col items-center justify-center p-8">
                                    {department?.logo && !data.logo ? (
                                        <div className="group/logo relative mb-6 h-24 w-24">
                                            <img
                                                src={uploadUrl(department.logo)}
                                                alt=""
                                                className="bg-card/50 relative h-20 w-full overflow-hidden object-contain p-2"
                                            />
                                        </div>
                                    ) : (
                                        <div className="border-border bg-muted text-muted-foreground dark:bg-card/5 mb-6 flex h-20 w-20 items-center justify-center border border-dashed dark:border-white/10">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    <Label className="dark:bg-primary bg-card text-primary-foreground hover:bg-card cursor-pointer px-5 py-2.5 text-xs font-semibold transition-colors">
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
                                        <p className="text-primary mt-2 max-w-[150px] truncate text-xs font-medium">
                                            {data.logo.name}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-border bg-card overflow-hidden border">
                                <CardHeader className="border-border border-b px-6 py-5">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <ImageIcon className="text-primary h-4 w-4" />{' '}
                                        Image de Bannière
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex min-h-[220px] flex-col items-center justify-center p-8">
                                    {department?.hero_image &&
                                    !data.hero_image ? (
                                        <div className="relative mb-6 h-24 w-full">
                                            <img
                                                src={uploadUrl(
                                                    department.hero_image,
                                                )}
                                                alt=""
                                                className="border-border h-full w-full border object-cover"
                                            />
                                            <div className="bg-primary/10 absolute inset-0" />
                                        </div>
                                    ) : (
                                        <div className="border-border bg-muted text-muted-foreground dark:bg-card/5 mb-6 flex h-24 w-full items-center justify-center border border-dashed dark:border-white/10">
                                            <LayoutGrid size={32} />
                                        </div>
                                    )}
                                    <Label className="bg-muted text-muted-foreground hover:bg-muted dark:bg-card/10 cursor-pointer px-5 py-2.5 text-xs font-semibold transition-colors">
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
                                        <p className="text-primary mt-2 max-w-[150px] truncate text-xs font-medium">
                                            {data.hero_image.name}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {}
                    <div className="space-y-8 lg:col-span-4">
                        <div>
                            <Card className="border-primary bg-primary text-primary-foreground relative overflow-hidden border">
                                <GraduationCap className="absolute -right-8 -bottom-8 h-32 w-32 opacity-10" />
                                <CardContent className="relative z-10 space-y-5 p-6">
                                    <h3 className="text-xl leading-tight font-medium tracking-tight">
                                        Prêt à publier ?
                                    </h3>
                                    <p className="text-primary-foreground text-sm leading-relaxed opacity-80">
                                        Assurez-vous que l'identité visuelle
                                        (couleurs, logo) correspond aux
                                        standards académiques de l'ASJA.
                                    </p>
                                    <div className="flex flex-col gap-3 pt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={processing || isSaving}
                                            className="text-primary hover:bg-accent group bg-card h-12 w-full font-medium transition-colors hover:opacity-90"
                                        >
                                            {isSaving ? (
                                                <div className="border-primary h-5 w-5 animate-spin border border-t-transparent" />
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
                                                className="hover:bg-primary-foreground/10 w-full text-xs font-medium"
                                            >
                                                Quitter sans sauver
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {}
                        <div className="border-border bg-card space-y-4 border p-6">
                            <h4 className="text-sm font-medium">
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
                                        <div className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center text-xs font-medium">
                                            {i + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-foreground text-xs leading-none font-semibold">
                                                {tip.title}
                                            </p>
                                            <p className="text-muted-foreground text-xs leading-tight font-medium">
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
                    <div className="mt-20 space-y-10">
                        <div className="border-border flex items-center justify-between border-b pb-8">
                            <div className="space-y-1">
                                <h2 className="text-foreground text-2xl font-medium tracking-tight">
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
                                className="h-9 gap-2 px-4"
                            >
                                <Plus size={20} strokeWidth={3} />
                                Nouveau programme
                            </Button>
                        </div>

                        {showProgramForm && (
                            <div className="overflow-hidden">
                                <Card className="border-border bg-card mb-6 overflow-hidden border">
                                    <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-3">
                                        <CardTitle className="text-primary text-base font-medium tracking-tight">
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
                                            className="hover:bg-destructive-surface hover:text-destructive"
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
                                                    <Label className="text-sm font-medium">
                                                        Titre du parcours
                                                    </Label>
                                                    <Input
                                                        value={
                                                            programForm.title
                                                        }
                                                        onChange={(e) =>
                                                            setProgramForm({
                                                                ...programForm,
                                                                title: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        required
                                                        className="h-10"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium">
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
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                            })
                                                        }
                                                        className="h-10 text-center"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium">
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
                                                                e.target.value,
                                                        })
                                                    }
                                                    rows={2}
                                                    className="min-h-[80px]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium">
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
                                                        className="min-h-[120px]"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium">
                                                        Débouchés professionnels
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
                                                        className="min-h-[120px]"
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
                                                    className="font-medium"
                                                >
                                                    Annuler
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="px-6 hover:opacity-90"
                                                >
                                                    Enregistrer
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {(department.programs ?? []).length === 0 &&
                                !showProgramForm && (
                                    <div className="border-border text-muted-foreground flex flex-col items-center justify-center border border-dashed py-16 md:col-span-2">
                                        <GraduationCap
                                            size={32}
                                            className="mb-3 opacity-30"
                                        />
                                        <p className="text-xs font-medium">
                                            Aucun programme publié
                                        </p>
                                    </div>
                                )}
                            {(department.programs ?? []).map((prog, idx) => (
                                <div key={prog.id}>
                                    <Card className="app-card-interactive group relative overflow-hidden p-6">
                                        <div className="bg-primary/5 pointer-events-none absolute top-0 right-0 h-32 w-32 blur-[40px]" />
                                        <div className="space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center text-xs font-medium">
                                                        {prog.sort_order}
                                                    </div>
                                                    <h3 className="text-foreground text-base font-medium tracking-tight">
                                                        {prog.title}
                                                    </h3>
                                                </div>
                                                <div className="flex translate-x-1 gap-1 opacity-0 transition-colors transition-opacity duration-300 group-hover:translate-x-0 group-hover:opacity-100">
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
                                                        className="hover:text-primary hover:bg-accent text-muted-foreground h-9 w-9 transition-colors"
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
                                                        className="text-muted-foreground hover:bg-destructive-surface hover:text-destructive h-9 w-9 transition-colors"
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
                                                        className="text-primary border-primary/10 bg-primary/[0.03] px-2 py-0.5 text-xs font-medium"
                                                    >
                                                        📚 Compétences
                                                    </Badge>
                                                )}
                                                {prog.debouches && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-border bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium"
                                                    >
                                                        💼 Débouchés
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {}
            <div className="bg-primary/[0.02] pointer-events-none fixed right-[-5%] bottom-[10%] -z-10 h-[500px] w-[500px] animate-pulse blur-[120px]" />
        </AdminLayout>
    );
}
