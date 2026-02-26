import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    sections: string[];
    componentData: Record<string, Record<string, string>>;
}

export default function ComponentDataIndex({ sections, componentData }: Props) {
    const [activeSection, setActiveSection] = useState(sections[0]);

    const { data, setData, post, processing, errors } = useForm<{
        section: string;
        data: Record<string, string>;
    }>({
        section: activeSection,
        data: componentData[activeSection] ?? {},
    });

    const switchSection = (section: string) => {
        setActiveSection(section);
        setData({ section, data: componentData[section] ?? {} });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.component-data.update'));
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-8">Landing Page Content</h1>

                <div className="flex gap-2 flex-wrap mb-6">
                    {sections.map((s) => (
                        <button
                            key={s}
                            onClick={() => switchSection(s)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                                activeSection === s
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 capitalize">{activeSection} Section</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {Object.entries(data.data as Record<string, string>).map(([key, val]) => {
                            const value = val as string;
                            return (
                                <div key={key}>
                                    <label className="block text-sm text-gray-400 mb-1 capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </label>
                                    {value && value.length > 60 ? (
                                        <textarea
                                            value={value}
                                            onChange={(e) =>
                                                setData('data', { ...data.data, [key]: e.target.value })
                                            }
                                        rows={3}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) =>
                                            setData('data', { ...data.data, [key]: e.target.value })
                                        }
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                )}
                                {errors[`data.${key}` as keyof typeof errors] && (
                                    <p className="text-red-400 text-xs mt-1">{errors[`data.${key}` as keyof typeof errors]}</p>
                                )}
                            </div>
                        )})}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
