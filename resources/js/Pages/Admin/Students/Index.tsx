import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Select as UISelect,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Filter,
    GraduationCap,
    Plus,
    Search,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Student {
    id: number;
    name: string;
    last_name: string | null;
    email: string | null;
    contact: string | null;
    mention: string | null;
    level: string | null;
    branche: string | null;
    grade: string | null;
    Premier: boolean;
    Deuxieme: boolean;
    Troisieme: boolean;
    created_at: string;
}

interface PaginatedStudents {
    data: Student[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    students: PaginatedStudents;
    filters: { search?: string; mention?: string; level?: string };
    mentions: string[];
}

const MENTIONS = [
    'Informatique',
    'Droit',
    'Économie',
    'Agronomie',
    'Sciences de la Terre',
    'LEA',
];
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];

function StudentForm({
    student,
    onClose,
}: {
    student: Student | null;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: student?.name ?? '',
        last_name: student?.last_name ?? '',
        email: student?.email ?? '',
        contact: student?.contact ?? '',
        password: '',
        mention: student?.mention ?? '',
        level: student?.level ?? '',
        branche: student?.branche ?? '',
        grade: student?.grade ?? '',
        Premier: student?.Premier ?? false,
        Deuxieme: student?.Deuxieme ?? false,
        Troisieme: student?.Troisieme ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (student) {
            router.post(
                route('admin.students.update', student.id),
                { ...data, _method: 'PUT' } as any,
                {
                    onSuccess: () => {
                        onClose();
                        toast.success('Étudiant mis à jour !');
                    },
                },
            );
        } else {
            router.post(route('admin.students.store'), data as any, {
                onSuccess: () => {
                    onClose();
                    toast.success('Étudiant ajouté avec succès !');
                },
            });
        }
    };

    return (
        <Card className="border-border bg-card relative mb-8 overflow-hidden border shadow-sm">
            <div className="absolute top-6 right-6 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-destructive-surface hover:text-destructive h-9 w-9 transition-all"
                >
                    <X size={18} />
                </Button>
            </div>
            <CardHeader className="px-8 pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-bold tracking-tight">
                        {student ? "Modifier l'Étudiant" : 'Nouvel Étudiant'}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {}
                        <div className="space-y-5">
                            <h3 className="text-sm font-medium">
                                Identité Personnel
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Prénom
                                    </Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="h-10"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-destructive mt-1 text-xs">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Nom de famille
                                    </Label>
                                    <Input
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData('last_name', e.target.value)
                                        }
                                        className="h-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Email Académique
                                </Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Contact Téléphonique
                                </Label>
                                <Input
                                    value={data.contact}
                                    onChange={(e) =>
                                        setData('contact', e.target.value)
                                    }
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Mot de passe
                                </Label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder={
                                        student
                                            ? 'Laisser vide si inchangé'
                                            : 'Mot de passe sécurisé'
                                    }
                                    className="h-10"
                                    required={!student}
                                />
                            </div>
                        </div>

                        {/* Cursus */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-medium">
                                Cursus Académique
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Mention
                                    </Label>
                                    <UISelect
                                        value={data.mention}
                                        onValueChange={(val) =>
                                            setData('mention', val)
                                        }
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Choisir..." />
                                        </SelectTrigger>
                                        <SelectContent className="">
                                            {MENTIONS.map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </UISelect>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Niveau
                                    </Label>
                                    <UISelect
                                        value={data.level}
                                        onValueChange={(val) =>
                                            setData('level', val)
                                        }
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Choisir..." />
                                        </SelectTrigger>
                                        <SelectContent className="">
                                            {LEVELS.map((l) => (
                                                <SelectItem key={l} value={l}>
                                                    {l}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </UISelect>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Branche de Spécialisation
                                </Label>
                                <Input
                                    value={data.branche}
                                    onChange={(e) =>
                                        setData('branche', e.target.value)
                                    }
                                    className="h-10"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Note Moyenne
                                    </Label>
                                    <Input
                                        value={data.grade}
                                        onChange={(e) =>
                                            setData('grade', e.target.value)
                                        }
                                        className="h-10 text-center"
                                    />
                                </div>
                                <div className="flex flex-col justify-end gap-3 pb-1">
                                    <Label className="text-muted-foreground mb-1 ml-2 text-sm font-medium">
                                        Tranches de Scolarité
                                    </Label>
                                    <div className="flex gap-4">
                                        {(
                                            [
                                                'Premier',
                                                'Deuxieme',
                                                'Troisieme',
                                            ] as const
                                        ).map((t, idx) => (
                                            <div
                                                key={t}
                                                className="flex items-center gap-2"
                                            >
                                                <Switch
                                                    checked={data[t]}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => setData(t, checked)}
                                                    className="data-[state=checked]:bg-primary scale-75"
                                                />
                                                <span className="text-muted-foreground text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-border flex justify-end gap-3 border-t pt-5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
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
                                : student
                                  ? 'Mettre à jour'
                                  : "Inscrire l'étudiant"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function StudentsIndex({ students, filters, mentions }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.students.index'),
            { search },
            { preserveState: true },
        );
    };

    const handleDelete = (id: number) => {
        if (
            confirm(
                'Supprimer cet étudiant définitivement ? Cette action est irréversible.',
            )
        ) {
            router.delete(route('admin.students.destroy', id), {
                onSuccess: () => toast.success('Étudiant supprimé'),
            });
        }
    };

    const openCreate = () => {
        setEditing(null);
        setShowForm(true);
    };
    const openEdit = (s: Student) => {
        setEditing(s);
        setShowForm(true);
    };

    const trancheStatus = (s: Student) => {
        const tranches: number[] = [];
        if (s.Premier) tranches.push(1);
        if (s.Deuxieme) tranches.push(2);
        if (s.Troisieme) tranches.push(3);

        return (
            <div className="flex gap-1">
                {[1, 2, 3].map((t) => (
                    <div
                        key={t}
                        className={`h-1 w-4 ${tranches.includes(t) ? 'bg-primary' : 'bg-muted dark:bg-card/10'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <AdminLayout breadcrumbs={[{ label: 'Étudiants' }]}>
            <div className="space-y-8 pb-16">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="admin-title">
                            Base des{' '}
                            <span className="text-primary dark:text-primary">
                                Étudiants
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {students.total} futur(s) diplômé(s) enregistrés
                            dans le système.
                        </p>
                    </div>

                    <div>
                        {!showForm && (
                            <Button
                                onClick={openCreate}
                                className="h-9 gap-2 px-4"
                            >
                                <Plus size={18} />
                                Nouvel Étudiant
                            </Button>
                        )}
                    </div>
                </div>

                {showForm && (
                    <div>
                        <StudentForm
                            student={editing}
                            onClose={() => setShowForm(false)}
                        />
                    </div>
                )}

                {/* Search & Filter */}
                <div className="border-border bg-card flex flex-col items-center justify-between gap-4 border p-4 shadow-sm lg:flex-row">
                    <form
                        onSubmit={handleSearch}
                        className="group relative w-full lg:w-[32rem]"
                    >
                        <Search
                            className="group-focus-within:text-primary text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors"
                            size={16}
                        />
                        <Input
                            placeholder="Rechercher par nom, matricule ou mention..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-border h-10 pr-10 pl-9"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    router.get(route('admin.students.index'));
                                }}
                                className="text-muted-foreground hover:text-destructive absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </form>

                    <div className="flex w-full items-center gap-3 lg:w-auto">
                        <Filter size={15} className="text-primary shrink-0" />
                        <UISelect
                            value={filters.mention ?? 'all'}
                            onValueChange={(val) =>
                                router.get(route('admin.students.index'), {
                                    ...filters,
                                    mention: val === 'all' ? undefined : val,
                                })
                            }
                        >
                            <SelectTrigger className="h-10 min-w-[180px]">
                                <SelectValue placeholder="Toutes les Mentions" />
                            </SelectTrigger>
                            <SelectContent className="">
                                <SelectItem
                                    value="all"
                                    className="text-primary font-semibold"
                                >
                                    Toutes les Mentions
                                </SelectItem>
                                {mentions.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </UISelect>
                    </div>
                </div>

                {/* Table */}
                <Card className="border-border bg-card overflow-hidden border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-border bg-muted/80 border-b dark:bg-black/10">
                                    <th className="text-muted-foreground px-6 py-4 text-left text-sm font-medium">
                                        Étudiant
                                    </th>
                                    <th className="text-muted-foreground px-5 py-4 text-left text-sm font-medium">
                                        Parcours
                                    </th>
                                    <th className="text-muted-foreground px-5 py-4 text-left text-sm font-medium">
                                        Niveau
                                    </th>
                                    <th className="text-muted-foreground px-5 py-4 text-left text-sm font-medium">
                                        Scolarité
                                    </th>
                                    <th className="text-muted-foreground px-5 py-4 text-left text-sm font-medium">
                                        Performance
                                    </th>
                                    <th className="text-muted-foreground px-6 py-4 text-right text-sm font-medium">
                                        Gestion
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-20 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-muted dark:bg-card/5 flex h-14 w-14 items-center justify-center">
                                                    <User
                                                        className="text-muted-foreground"
                                                        size={28}
                                                    />
                                                </div>
                                                <span className="text-muted-foreground text-xs font-medium">
                                                    Aucune donnée disponible
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((s, i) => (
                                        <tr
                                            key={s.id}
                                            className="group hover:bg-muted/60 border-border dark:hover:bg-card/[0.02] border-b transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="border-border h-9 w-9 border shadow-sm">
                                                        <AvatarFallback className="bg-accent text-primary text-xs font-bold">
                                                            {s.name.charAt(0)}
                                                            {s.last_name?.charAt(
                                                                0,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="group-hover:text-primary text-foreground text-sm font-semibold tracking-tight transition-colors">
                                                            {s.name}{' '}
                                                            {s.last_name}
                                                        </div>
                                                        <div className="text-muted-foreground text-xs">
                                                            {s.email ||
                                                                s.contact ||
                                                                'contact non renseigné'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-muted dark:bg-card/5 px-2.5 py-1 text-xs font-medium"
                                                >
                                                    {s.mention || 'Général'}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <GraduationCap
                                                        size={13}
                                                        className="text-primary"
                                                    />
                                                    <span className="text-muted-foreground text-sm">
                                                        {s.level || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    {trancheStatus(s)}
                                                    <div className="text-muted-foreground text-xs font-medium">
                                                        Tranches réglées
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {s.grade ? (
                                                    <Badge className="px-2.5 py-0.5 text-xs">
                                                        {s.grade}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            openEdit(s)
                                                        }
                                                        className="hover:text-primary hover:bg-accent text-muted-foreground h-9 w-9"
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleDelete(s.id)
                                                        }
                                                        className="text-muted-foreground hover:bg-destructive-surface hover:text-destructive h-9 w-9"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {students.last_page > 1 && (
                    <div className="border-border bg-card flex items-center justify-between border px-6 py-4 shadow-sm">
                        <div className="text-muted-foreground text-xs font-medium">
                            Page{' '}
                            <span className="text-primary font-semibold">
                                {students.current_page}
                            </span>{' '}
                            sur{' '}
                            <span className="text-foreground font-semibold">
                                {students.last_page}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                disabled={students.current_page === 1}
                                onClick={() =>
                                    router.get(route('admin.students.index'), {
                                        ...filters,
                                        page: students.current_page - 1,
                                    })
                                }
                                variant="outline"
                                className="h-9 gap-1.5 px-4 text-xs font-semibold"
                            >
                                <ChevronLeft size={14} /> Précédent
                            </Button>
                            <Button
                                disabled={
                                    students.current_page === students.last_page
                                }
                                onClick={() =>
                                    router.get(route('admin.students.index'), {
                                        ...filters,
                                        page: students.current_page + 1,
                                    })
                                }
                                className="h-9 gap-1.5 px-4 text-xs"
                            >
                                Suivant <ChevronRight size={14} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
