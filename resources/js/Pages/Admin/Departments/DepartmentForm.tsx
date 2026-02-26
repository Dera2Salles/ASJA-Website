import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

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
        color: department?.color ?? '#4f46e5',
        logo: null as File | null,
        hero_image: null as File | null,
        is_visible: department?.is_visible ?? true,
        sort_order: department?.sort_order ?? 0,
    });

    const [programs, setPrograms] = useState<Program[]>(department?.programs ?? []);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [showProgramForm, setShowProgramForm] = useState(false);
    const [programForm, setProgramForm] = useState<Program>({
        title: '', description: '', competences: '', debouches: '', sort_order: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && department?.id) {
            router.post(route('admin.departments.update', department.id), {
                ...data,
                _method: 'PUT',
            } as any, { forceFormData: true });
        } else {
            post(route('admin.departments.store'), { forceFormData: true });
        }
    };

    const handleProgramSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!department?.id) return;
        if (editingProgram?.id) {
            router.put(
                route('admin.departments.programs.update', { department: department.id, program: editingProgram.id }),
                programForm as any,
                { onSuccess: () => { setShowProgramForm(false); setEditingProgram(null); } }
            );
        } else {
            router.post(
                route('admin.departments.programs.store', { department: department.id }),
                programForm as any,
                { onSuccess: () => { setShowProgramForm(false); } }
            );
        }
    };

    const deleteProgram = (programId: number) => {
        if (!department?.id || !confirm('Supprimer ce programme ?')) return;
        router.delete(route('admin.departments.programs.destroy', { department: department.id, program: programId }));
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-8">
                    {isEdit ? `Modifier: ${department?.name}` : 'Nouveau département'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
                        <h2 className="font-semibold text-gray-300 mb-4">Informations générales</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Nom *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="ex: INFORMATIQUE"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            {!isEdit && (
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Slug (URL) *</label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        required
                                        placeholder="ex: informatique"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                    {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug}</p>}
                                    <p className="text-xs text-gray-500 mt-1">URL: /mention/{data.slug || 'slug'}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Couleur de marque</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Ordre d'affichage</label>
                                <input
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_visible}
                                        onChange={(e) => setData('is_visible', e.target.checked)}
                                        className="w-4 h-4 accent-indigo-500"
                                    />
                                    <span className="text-sm text-gray-300">Visible sur le site</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Logo</label>
                                {department?.logo && (
                                    <img src={`/storage/${department.logo}`} alt="" className="w-16 h-16 object-contain mb-2 rounded bg-gray-700 p-1" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('logo', e.target.files?.[0] ?? null)}
                                    className="w-full text-sm text-gray-400 file:mr-3 file:bg-gray-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Image hero</label>
                                {department?.hero_image && (
                                    <img src={`/storage/${department.hero_image}`} alt="" className="w-full h-24 object-cover mb-2 rounded" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('hero_image', e.target.files?.[0] ?? null)}
                                    className="w-full text-sm text-gray-400 file:mr-3 file:bg-gray-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            {processing ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le département'}
                        </button>
                        <a
                            href={route('admin.departments.index')}
                            className="text-gray-400 hover:text-white text-sm transition-colors px-4 py-2.5"
                        >
                            Annuler
                        </a>
                    </div>
                </form>

                {/* Programs section — only shown in edit mode */}
                {isEdit && department?.id && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Programmes / Parcours</h2>
                            <button
                                onClick={() => { setEditingProgram(null); setProgramForm({ title: '', description: '', competences: '', debouches: '', sort_order: 0 }); setShowProgramForm(true); }}
                                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Ajouter un programme
                            </button>
                        </div>

                        {showProgramForm && (
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4">
                                <form onSubmit={handleProgramSubmit} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Titre *</label>
                                        <input
                                            type="text"
                                            value={programForm.title}
                                            onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                                            required
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Description</label>
                                        <textarea
                                            value={programForm.description}
                                            onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                                            rows={2}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Compétences acquises</label>
                                            <textarea
                                                value={programForm.competences}
                                                onChange={(e) => setProgramForm({ ...programForm, competences: e.target.value })}
                                                rows={3}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Débouchés</label>
                                            <textarea
                                                value={programForm.debouches}
                                                onChange={(e) => setProgramForm({ ...programForm, debouches: e.target.value })}
                                                rows={3}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-1">
                                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                            Enregistrer
                                        </button>
                                        <button type="button" onClick={() => setShowProgramForm(false)} className="text-gray-400 hover:text-white text-sm px-3">
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="space-y-3">
                            {(department.programs ?? []).length === 0 && (
                                <div className="text-center py-8 text-gray-500 bg-gray-800 border border-gray-700 rounded-xl">
                                    Aucun programme pour ce département.
                                </div>
                            )}
                            {(department.programs ?? []).map((prog) => (
                                <div key={prog.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex gap-4">
                                    <div className="flex-1">
                                        <div className="font-medium text-white">{prog.title}</div>
                                        {prog.description && (
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{prog.description}</p>
                                        )}
                                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                            {prog.competences && <span>📚 Compétences: {prog.competences.substring(0, 50)}...</span>}
                                            {prog.debouches && <span>💼 Débouchés: {prog.debouches.substring(0, 50)}...</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => { setEditingProgram(prog); setProgramForm({ ...prog, sort_order: prog.sort_order ?? 0 }); setShowProgramForm(true); }}
                                            className="p-1.5 text-indigo-400 hover:bg-indigo-400/10 rounded"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => prog.id && deleteProgram(prog.id)}
                                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
