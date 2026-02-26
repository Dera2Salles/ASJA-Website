import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Testimony {
    id: number;
    name: string;
    role: string | null;
    content: string;
    avatar: string | null;
    is_visible: boolean;
}

interface Props {
    testimonies: Testimony[];
}

export default function TestimoniesIndex({ testimonies }: Props) {
    const [editing, setEditing] = useState<Testimony | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        role: '',
        content: '',
        avatar: null as File | null,
        is_visible: true,
    });

    const openCreate = () => {
        reset();
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (t: Testimony) => {
        setEditing(t);
        setData({ name: t.name, role: t.role ?? '', content: t.content, avatar: null, is_visible: t.is_visible });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            router.post(
                route('admin.testimonies.update', editing.id),
                { ...data, _method: 'PUT' },
                { onSuccess: () => setShowForm(false) },
            );
        } else {
            post(route('admin.testimonies.store'), { onSuccess: () => setShowForm(false) });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this testimony?')) {
            router.delete(route('admin.testimonies.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Testimonies</h1>
                    <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        + Add Testimony
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
                        <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Testimony' : 'New Testimony'}</h2>
                        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Role / Title</label>
                                    <input
                                        type="text"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Content *</label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Avatar Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('avatar', e.target.files?.[0] ?? null)}
                                        className="w-full text-sm text-gray-400 file:mr-3 file:bg-gray-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
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
                                        <span className="text-sm text-gray-400">Visible on site</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm transition-colors px-3">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Testimonies list */}
                <div className="space-y-4">
                    {testimonies.length === 0 && (
                        <div className="bg-gray-800 rounded-2xl p-8 text-center text-gray-500">
                            No testimonies yet. Add your first one!
                        </div>
                    )}
                    {testimonies.map((t) => (
                        <div key={t.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex gap-4 items-start">
                            {t.avatar ? (
                                <img src={`/storage/${t.avatar}`} alt={t.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
                                    {t.name.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white">{t.name}</span>
                                    {t.role && <span className="text-xs text-gray-400 bg-gray-700 rounded px-2 py-0.5">{t.role}</span>}
                                    {!t.is_visible && <span className="text-xs text-yellow-400 bg-yellow-400/10 rounded px-2 py-0.5">Hidden</span>}
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-2">{t.content}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => openEdit(t)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 bg-indigo-400/10 rounded">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 bg-red-400/10 rounded">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
