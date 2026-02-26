import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Eye, EyeOff, Layers, Pencil, Plus, Trash2 } from 'lucide-react';

interface Department {
    id: number;
    slug: string;
    name: string;
    logo: string | null;
    color: string | null;
    is_visible: boolean;
    sort_order: number;
    programs_count: number;
}

export default function DepartmentsIndex({ departments }: { departments: Department[] }) {
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Supprimer le département "${name}" définitivement ?`)) {
            router.delete(route('admin.departments.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Départements / Mentions</h1>
                        <p className="text-gray-400 text-sm mt-1">{departments.length} mention(s)</p>
                    </div>
                    <Link
                        href={route('admin.departments.create')}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Nouveau département
                    </Link>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    {departments.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            Aucun département.{' '}
                            <Link href={route('admin.departments.create')} className="text-indigo-400 hover:underline">
                                Créer le premier
                            </Link>
                        </div>
                    )}
                    {departments.map((dept, i) => (
                        <div
                            key={dept.id}
                            className={`flex items-center gap-4 p-4 ${i !== departments.length - 1 ? 'border-b border-gray-700' : ''} hover:bg-gray-700/20 transition-colors`}
                        >
                            {/* Color dot / logo */}
                            <div
                                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                                style={{ backgroundColor: dept.color || '#4f46e5' }}
                            >
                                {dept.logo ? (
                                    <img src={`/storage/${dept.logo}`} alt="" className="w-8 h-8 object-contain" />
                                ) : (
                                    <Layers className="w-5 h-5 text-white" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{dept.name}</span>
                                    <span className="text-xs text-gray-500 font-mono bg-gray-700 px-1.5 py-0.5 rounded">
                                        /{dept.slug}
                                    </span>
                                    {!dept.is_visible && (
                                        <span className="text-xs text-yellow-400 bg-yellow-400/10 rounded px-2 py-0.5 flex items-center gap-1">
                                            <EyeOff className="w-3 h-3" /> Masqué
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {dept.programs_count} programme(s) · Ordre: {dept.sort_order}
                                </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                                <a
                                    href={route('department.show', dept.slug)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-gray-700 rounded flex items-center gap-1"
                                >
                                    <Eye className="w-3 h-3" /> Voir
                                </a>
                                <Link
                                    href={route('admin.departments.edit', dept.id)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 bg-indigo-400/10 rounded flex items-center gap-1"
                                >
                                    <Pencil className="w-3 h-3" /> Modifier
                                </Link>
                                <button
                                    onClick={() => handleDelete(dept.id, dept.name)}
                                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-400/10 rounded flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" /> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
