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
        <Card className="glass relative mb-12 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
            <div className="absolute top-6 right-6 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-10 w-10 rounded-full font-black transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                >
                    <X size={20} strokeWidth={3} />
                </Button>
            </div>
            <CardHeader className="relative z-10 px-10 pt-10 pb-6">
                <div className="text-asja-green-600 dark:text-primary flex items-center gap-4">
                    <div className="bg-asja-green-500 h-6 w-1.5 rounded-full" />
                    <CardTitle className="text-xl leading-none font-black tracking-widest uppercase">
                        {student ? "Modifier l'Étudiant" : 'Nouvel Étudiant'}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 px-10 pb-10">
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {}
                        <div className="space-y-6">
                            <h3 className="text-asja-green-600 text-[10px] font-black tracking-[3px] uppercase opacity-70">
                                Identité Personnel
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                        Prénom
                                    </Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 ml-2 text-[10px] font-bold text-rose-500 uppercase italic">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                        Nom de famille
                                    </Label>
                                    <Input
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData('last_name', e.target.value)
                                        }
                                        className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                    Email Académique
                                </Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                    Contact Téléphonique
                                </Label>
                                <Input
                                    value={data.contact}
                                    onChange={(e) =>
                                        setData('contact', e.target.value)
                                    }
                                    className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
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
                                    className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20"
                                    required={!student}
                                />
                            </div>
                        </div>

                        {}
                        <div className="space-y-6">
                            <h3 className="text-asja-green-600 text-[10px] font-black tracking-[3px] uppercase opacity-70">
                                Cursus Académique
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                        Mention
                                    </Label>
                                    <UISelect
                                        value={data.mention}
                                        onValueChange={(val) =>
                                            setData('mention', val)
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20">
                                            <SelectValue placeholder="Choisir..." />
                                        </SelectTrigger>
                                        <SelectContent className="glass rounded-xl border-none">
                                            {MENTIONS.map((m) => (
                                                <SelectItem
                                                    key={m}
                                                    value={m}
                                                    className="font-bold"
                                                >
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </UISelect>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                        Niveau
                                    </Label>
                                    <UISelect
                                        value={data.level}
                                        onValueChange={(val) =>
                                            setData('level', val)
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20">
                                            <SelectValue placeholder="Choisir..." />
                                        </SelectTrigger>
                                        <SelectContent className="glass rounded-xl border-none">
                                            {LEVELS.map((l) => (
                                                <SelectItem
                                                    key={l}
                                                    value={l}
                                                    className="font-bold"
                                                >
                                                    {l}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </UISelect>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                    Branche de Spécialisation
                                </Label>
                                <Input
                                    value={data.branche}
                                    onChange={(e) =>
                                        setData('branche', e.target.value)
                                    }
                                    className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 font-bold dark:border-white/5 dark:bg-black/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground ml-2 text-[10px] font-black tracking-widest uppercase">
                                        Note Moyenne
                                    </Label>
                                    <Input
                                        value={data.grade}
                                        onChange={(e) =>
                                            setData('grade', e.target.value)
                                        }
                                        className="focus:ring-asja-green-500/20 h-12 rounded-xl border-white/40 bg-white/50 text-center font-bold dark:border-white/5 dark:bg-black/20"
                                    />
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
                                                    className="data-[state=checked]:bg-asja-green-600 scale-75"
                                                />
                                                <span className="text-[10px] font-black text-slate-500 uppercase">
                                                    {idx + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 border-t border-white/40 pt-6 dark:border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
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
                        className={`h-1 w-4 rounded-full ${tranches.includes(t) ? 'bg-asja-green-500' : 'bg-slate-200 dark:bg-white/10'}`}
                    />
                ))}
            </div>
        );
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
                            Base des{' '}
                            <span className="text-asja-green-600 dark:text-primary">
                                Étudiants
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            {students.total} futur(s) diplômé(s) enregistrés
                            dans le système.
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
                                Nouvel Étudiant
                            </Button>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        >
                            <StudentForm
                                student={editing}
                                onClose={() => setShowForm(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border-none p-6 shadow-xl lg:flex-row"
                >
                    <form
                        onSubmit={handleSearch}
                        className="group relative w-full lg:w-[32rem]"
                    >
                        <Search
                            className="group-focus-within:text-asja-green-500 absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors"
                            size={18}
                            strokeWidth={2.5}
                        />
                        <Input
                            placeholder="Rechercher par nom, matricule ou mention..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="focus:ring-asja-green-500/20 h-12 rounded-xl border-none bg-slate-50/50 pr-12 pl-12 font-bold transition-all placeholder:font-medium focus:ring-2 dark:bg-black/20"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    router.get(route('admin.students.index'));
                                }}
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-rose-500"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        )}
                    </form>

                    <div className="flex w-full items-center gap-4 lg:w-auto">
                        <div className="flex grow items-center gap-2 lg:grow-0">
                            <Filter size={16} className="text-asja-green-500" />
                            <UISelect
                                value={filters.mention ?? 'all'}
                                onValueChange={(val) =>
                                    router.get(route('admin.students.index'), {
                                        ...filters,
                                        mention:
                                            val === 'all' ? undefined : val,
                                    })
                                }
                            >
                                <SelectTrigger className="h-12 min-w-[180px] rounded-xl border-none bg-slate-50/50 font-bold dark:bg-black/20">
                                    <SelectValue placeholder="Toutes les Mentions" />
                                </SelectTrigger>
                                <SelectContent className="glass rounded-xl border-none">
                                    <SelectItem
                                        value="all"
                                        className="text-asja-green-600 font-bold"
                                    >
                                        Toutes les Mentions
                                    </SelectItem>
                                    {mentions.map((m) => (
                                        <SelectItem
                                            key={m}
                                            value={m}
                                            className="font-bold"
                                        >
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </UISelect>
                        </div>
                    </div>
                </motion.div>

                {}
                <Card className="glass overflow-hidden rounded-[3rem] border-none shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/40 bg-slate-50/30 dark:border-white/5 dark:bg-black/10">
                                    <th className="text-muted-foreground px-10 py-6 text-left text-[10px] font-black tracking-[2px] uppercase">
                                        Étudiant
                                    </th>
                                    <th className="text-muted-foreground px-6 py-6 text-left text-[10px] font-black tracking-[2px] uppercase">
                                        Parcours
                                    </th>
                                    <th className="text-muted-foreground px-6 py-6 text-left text-[10px] font-black tracking-[2px] uppercase">
                                        Niveau
                                    </th>
                                    <th className="text-muted-foreground px-6 py-6 text-left text-[10px] font-black tracking-[2px] uppercase">
                                        Scolarité
                                    </th>
                                    <th className="text-muted-foreground px-6 py-6 text-left text-[10px] font-black tracking-[2px] uppercase">
                                        Performance
                                    </th>
                                    <th className="text-muted-foreground px-10 py-6 text-right text-[10px] font-black tracking-[2px] uppercase">
                                        Gestion
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-24 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5">
                                                    <User
                                                        className="text-slate-300"
                                                        size={32}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Aucune donnée disponible
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((s, i) => (
                                        <motion.tr
                                            key={s.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="group hover:bg-asja-green-50/30 dark:hover:bg-primary/5 border-b border-white/20 transition-colors dark:border-white/5"
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border-2 border-white shadow-md transition-transform group-hover:scale-110 dark:border-slate-800">
                                                        <AvatarFallback className="bg-asja-green-100 text-asja-green-600 text-xs font-black">
                                                            {s.name.charAt(0)}
                                                            {s.last_name?.charAt(
                                                                0,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="group-hover:text-asja-green-600 font-black tracking-tight text-slate-900 uppercase transition-colors dark:text-white">
                                                            {s.name}{' '}
                                                            {s.last_name}
                                                        </div>
                                                        <div className="text-muted-foreground text-[10px] font-bold lowercase opacity-70">
                                                            {s.email ||
                                                                s.contact ||
                                                                'contact non renseigné'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-lg bg-white/50 px-3 py-1 text-[9px] font-black tracking-widest uppercase dark:bg-white/5"
                                                >
                                                    {s.mention || 'Général'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap
                                                        size={14}
                                                        className="text-asja-green-500"
                                                    />
                                                    <span className="text-xs font-black text-slate-600 dark:text-slate-400">
                                                        {s.level || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1.5">
                                                    {trancheStatus(s)}
                                                    <div className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
                                                        Tranches réglées
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                {s.grade ? (
                                                    <Badge className="bg-asja-green-600 shadow-asja-green-900/10 rounded-full px-2.5 py-0.5 text-[10px] font-black text-white shadow-lg">
                                                        {s.grade}
                                                    </Badge>
                                                ) : (
                                                    <span className="font-black text-slate-300">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            openEdit(s)
                                                        }
                                                        className="hover:text-asja-green-600 hover:bg-asja-green-50 h-10 w-10 rounded-2xl text-slate-400 transition-all active:scale-90"
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
                                                            handleDelete(s.id)
                                                        }
                                                        className="h-10 w-10 rounded-2xl text-slate-400 transition-all hover:rotate-6 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                                                    >
                                                        <Trash2
                                                            size={18}
                                                            strokeWidth={2.5}
                                                        />
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

                {}
                {students.last_page > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass flex items-center justify-between rounded-[2.5rem] border-none px-8 py-5 shadow-xl"
                    >
                        <div className="text-muted-foreground text-[10px] font-black tracking-[2px] uppercase">
                            Page{' '}
                            <span className="text-asja-green-600">
                                {students.current_page}
                            </span>{' '}
                            sur{' '}
                            <span className="text-slate-900 dark:text-white">
                                {students.last_page}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                disabled={students.current_page === 1}
                                onClick={() =>
                                    router.get(route('admin.students.index'), {
                                        ...filters,
                                        page: students.current_page - 1,
                                    })
                                }
                                variant="outline"
                                className="h-10 gap-2 rounded-xl border-white/50 px-6 text-[10px] font-black tracking-widest uppercase dark:border-white/5"
                            >
                                <ChevronLeft size={16} strokeWidth={3} />{' '}
                                Précédent
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
                                className="bg-asja-green-600 dark:bg-primary shadow-asja-green-900/20 h-10 gap-2 rounded-xl px-6 text-[10px] font-black tracking-widest text-white uppercase shadow-lg"
                            >
                                Suivant{' '}
                                <ChevronRight size={16} strokeWidth={3} />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            {}
            <div className="bg-asja-green-500/5 pointer-events-none fixed top-[15%] left-[-10%] -z-10 h-[600px] w-[600px] rounded-full blur-[150px]" />
            <div className="bg-primary/5 pointer-events-none fixed right-[-5%] bottom-[5%] -z-10 h-[400px] w-[400px] rounded-full blur-[120px]" />
        </AdminLayout>
    );
}
