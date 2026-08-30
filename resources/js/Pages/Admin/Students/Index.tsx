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
import { AnimatePresence, motion } from 'framer-motion';
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
        <Card className="relative mb-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-white/5">
            <div className="absolute top-6 right-6 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-9 w-9 rounded-lg transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                >
                    <X size={18} />
                </Button>
            </div>
            <CardHeader className="px-8 pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary h-5 w-1 rounded-full" />
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
                            <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Identité Personnel
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Prénom</Label>
                                    <Input value={data.name} onChange={e => setData('name', e.target.value)} className="h-10 rounded-lg" required />
                                    {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Nom de famille</Label>
                                    <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="h-10 rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Email Académique</Label>
                                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="h-10 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Contact Téléphonique</Label>
                                <Input value={data.contact} onChange={e => setData('contact', e.target.value)} className="h-10 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Mot de passe</Label>
                                <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                    placeholder={student ? 'Laisser vide si inchangé' : 'Mot de passe sécurisé'}
                                    className="h-10 rounded-lg" required={!student} />
                            </div>
                        </div>

                        {/* Cursus */}
                        <div className="space-y-5">
                            <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Cursus Académique
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Mention</Label>
                                    <UISelect value={data.mention} onValueChange={val => setData('mention', val)}>
                                        <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {MENTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </UISelect>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Niveau</Label>
                                    <UISelect value={data.level} onValueChange={val => setData('level', val)}>
                                        <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                        </SelectContent>
                                    </UISelect>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Branche de Spécialisation</Label>
                                <Input value={data.branche} onChange={e => setData('branche', e.target.value)} className="h-10 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Note Moyenne</Label>
                                    <Input value={data.grade} onChange={e => setData('grade', e.target.value)} className="h-10 rounded-lg text-center" />
                                </div>
                                <div className="flex flex-col justify-end gap-3 pb-1">
                                    <Label className="text-muted-foreground mb-1 ml-2 text-[10px] font-black tracking-widest uppercase">
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
                                                <span className="text-[10px] font-black text-muted-foreground uppercase">
                                                    {idx + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border pt-5 dark:border-white/5">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-10 rounded-lg px-6 font-semibold text-muted-foreground hover:bg-muted">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-primary dark:bg-primary h-10 rounded-lg px-8 font-semibold text-white hover:opacity-90">
                            {processing ? 'Enregistrement...' : student ? 'Mettre à jour' : "Inscrire l'étudiant"}
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
                        className={`h-1 w-4 rounded-full ${tranches.includes(t) ?'bg-primary' : 'bg-muted dark:bg-card/10'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-16">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Base des{' '}
                            <span className="text-primary dark:text-primary">Étudiants</span>
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {students.total} futur(s) diplômé(s) enregistrés dans le système.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        {!showForm && (
                            <Button
                                onClick={openCreate}
                                className="dark:bg-primary h-10 gap-2 rounded-lg bg-card px-5 font-semibold text-white transition-all hover:bg-card"
                            >
                                <Plus size={18} />
                                Nouvel Étudiant
                            </Button>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                            <StudentForm student={editing} onClose={() => setShowForm(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search & Filter */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row dark:border-white/5">
                    <form onSubmit={handleSearch} className="group relative w-full lg:w-[32rem]">
                        <Search className="group-focus-within:text-primary absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors" size={16} />
                        <Input
                            placeholder="Rechercher par nom, matricule ou mention..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 rounded-lg border-border pr-10 pl-9 dark:border-white/5"
                        />
                        {search && (
                            <button type="button" onClick={() => { setSearch(''); router.get(route('admin.students.index')); }}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-rose-500">
                                <X size={14} />
                            </button>
                        )}
                    </form>

                    <div className="flex w-full items-center gap-3 lg:w-auto">
                        <Filter size={15} className="text-primary shrink-0" />
                        <UISelect value={filters.mention ?? 'all'} onValueChange={(val) =>
                            router.get(route('admin.students.index'), { ...filters, mention: val === 'all' ? undefined : val })}>
                            <SelectTrigger className="h-10 min-w-[180px] rounded-lg">
                                <SelectValue placeholder="Toutes les Mentions" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="text-primary font-semibold">Toutes les Mentions</SelectItem>
                                {mentions.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </UISelect>
                    </div>
                </motion.div>

                {/* Table */}
                <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/80 dark:border-white/5 dark:bg-black/10">
                                    <th className="text-muted-foreground px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">Étudiant</th>
                                    <th className="text-muted-foreground px-5 py-4 text-left text-xs font-semibold tracking-wider uppercase">Parcours</th>
                                    <th className="text-muted-foreground px-5 py-4 text-left text-xs font-semibold tracking-wider uppercase">Niveau</th>
                                    <th className="text-muted-foreground px-5 py-4 text-left text-xs font-semibold tracking-wider uppercase">Scolarité</th>
                                    <th className="text-muted-foreground px-5 py-4 text-left text-xs font-semibold tracking-wider uppercase">Performance</th>
                                    <th className="text-muted-foreground px-6 py-4 text-right text-xs font-semibold tracking-wider uppercase">Gestion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted dark:bg-card/5">
                                                    <User className="text-muted-foreground" size={28} />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">Aucune donnée disponible</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((s, i) => (
                                        <motion.tr key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                            className="group hover:bg-muted/60 border-b border-border transition-colors dark:border-white/5 dark:hover:bg-card/[0.02]">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-border shadow-sm">
                                                        <AvatarFallback className="bg-accent text-primary text-xs font-bold">
                                                            {s.name.charAt(0)}{s.last_name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="group-hover:text-primary text-sm font-semibold tracking-tight text-foreground transition-colors">
                                                            {s.name} {s.last_name}
                                                        </div>
                                                        <div className="text-muted-foreground text-xs">
                                                            {s.email || s.contact || 'contact non renseigné'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge variant="secondary" className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium dark:bg-card/5">
                                                    {s.mention || 'Général'}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <GraduationCap size={13} className="text-primary" />
                                                    <span className="text-sm text-muted-foreground">{s.level || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    {trancheStatus(s)}
                                                    <div className="text-[10px] font-medium text-muted-foreground">Tranches réglées</div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {s.grade ? (
                                                    <Badge className="bg-primary rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">{s.grade}</Badge>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)}
                                                        className="hover:text-primary hover:bg-accent h-9 w-9 rounded-lg text-muted-foreground">
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}
                                                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {students.last_page > 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4 shadow-sm dark:border-white/5">
                        <div className="text-muted-foreground text-xs font-medium">
                            Page <span className="text-primary font-semibold">{students.current_page}</span> sur{' '}
                            <span className="font-semibold text-foreground">{students.last_page}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button disabled={students.current_page === 1}
                                onClick={() => router.get(route('admin.students.index'), { ...filters, page: students.current_page - 1 })}
                                variant="outline" className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold">
                                <ChevronLeft size={14} /> Précédent
                            </Button>
                            <Button disabled={students.current_page === students.last_page}
                                onClick={() => router.get(route('admin.students.index'), { ...filters, page: students.current_page + 1 })}
                                className="bg-primary dark:bg-primary h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold text-white">
                                Suivant <ChevronRight size={14} />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
}
