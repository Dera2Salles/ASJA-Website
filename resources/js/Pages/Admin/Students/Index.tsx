import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';

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

const MENTIONS = ['Informatique', 'Droit', 'Économie', 'Agronomie', 'Sciences de la Terre', 'LEA'];
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];

function StudentForm({
    student,
    onClose,
}: {
    student: Student | null;
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors } = useForm({
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
            router.put(route('admin.students.update', student.id), data as any, {
                onSuccess: onClose,
            });
        } else {
            router.post(route('admin.students.store'), data as any, {
                onSuccess: onClose,
            });
        }
    };

    const field = (
        label: string,
        key: keyof typeof data,
        type: string = 'text',
        required = false
    ) => (
        <div>
            <label className="block text-xs text-gray-400 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type={type}
                value={data[key] as string}
                onChange={(e) => setData(key, e.target.value)}
                required={required}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">
                    {student ? 'Modifier étudiant' : 'Nouvel étudiant'}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {field('Prénom', 'name', 'text', true)}
                    {field('Nom', 'last_name')}
                    {field('Email', 'email', 'email')}
                    {field('Contact', 'contact')}
                    {!student && field('Mot de passe', 'password', 'password', true)}
                    {student && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Nouveau mot de passe (laisser vide = inchangé)
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Mention</label>
                        <select
                            value={data.mention}
                            onChange={(e) => setData('mention', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">—</option>
                            {MENTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Niveau</label>
                        <select
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">—</option>
                            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    {field('Branche', 'branche')}
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {field('Note', 'grade')}
                    <div className="flex flex-col gap-2 justify-end">
                        {(['Premier', 'Deuxieme', 'Troisieme'] as const).map((t) => (
                            <label key={t} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data[t]}
                                    onChange={(e) => setData(t, e.target.checked)}
                                    className="w-4 h-4 accent-indigo-500"
                                />
                                Tranche {t}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {processing ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-sm transition-colors px-3">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function StudentsIndex({ students, filters, mentions }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.students.index'), { search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cet étudiant définitivement ?')) {
            router.delete(route('admin.students.destroy', id));
        }
    };

    const openCreate = () => { setEditing(null); setShowForm(true); };
    const openEdit = (s: Student) => { setEditing(s); setShowForm(true); };

    const trancheLabel = (s: Student) => {
        const t = [];
        if (s.Premier) t.push('1ère');
        if (s.Deuxieme) t.push('2ème');
        if (s.Troisieme) t.push('3ème');
        return t.join(', ') || '—';
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Étudiants</h1>
                        <p className="text-gray-400 text-sm mt-1">{students.total} étudiant(s) au total</p>
                    </div>
                    <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Nouvel étudiant
                    </button>
                </div>

                {showForm && (
                    <StudentForm student={editing} onClose={() => setShowForm(false)} />
                )}

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, contact, mention..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">
                            Chercher
                        </button>
                        {(filters.search) && (
                            <button
                                type="button"
                                onClick={() => router.get(route('admin.students.index'))}
                                className="text-gray-400 hover:text-white text-sm px-3"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                    <select
                        value={filters.mention ?? ''}
                        onChange={(e) => router.get(route('admin.students.index'), { ...filters, mention: e.target.value })}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Toutes les mentions</option>
                        {mentions.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-900/50">
                                <th className="text-left px-5 py-3 text-gray-400 font-medium">Étudiant</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Mention</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Niveau</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tranches</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Note</th>
                                <th className="text-right px-5 py-3 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        Aucun étudiant trouvé.
                                    </td>
                                </tr>
                            )}
                            {students.data.map((s, i) => (
                                <tr key={s.id} className={`${i !== students.data.length - 1 ? 'border-b border-gray-700' : ''} hover:bg-gray-700/30 transition-colors`}>
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-white">{s.name} {s.last_name}</div>
                                        <div className="text-xs text-gray-400">{s.email || s.contact || '—'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{s.mention || '—'}</td>
                                    <td className="px-4 py-3 text-gray-300">{s.level || '—'}</td>
                                    <td className="px-4 py-3 text-gray-300">{trancheLabel(s)}</td>
                                    <td className="px-4 py-3">
                                        {s.grade ? (
                                            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded">{s.grade}</span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => openEdit(s)}
                                                className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {students.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <span className="text-sm text-gray-400">
                            Page {students.current_page} sur {students.last_page}
                        </span>
                        <div className="flex gap-2">
                            {students.current_page > 1 && (
                                <button
                                    onClick={() => router.get(route('admin.students.index'), { ...filters, page: students.current_page - 1 })}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Précédent
                                </button>
                            )}
                            {students.current_page < students.last_page && (
                                <button
                                    onClick={() => router.get(route('admin.students.index'), { ...filters, page: students.current_page + 1 })}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700"
                                >
                                    Suivant <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
