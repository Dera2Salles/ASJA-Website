import { Head, Link } from '@inertiajs/react';
import { BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { ThemeProvider } from '../../page/theme/useThemeProvider';

interface Program {
    id: number;
    title: string;
    description: string | null;
    competences: string | null;
    debouches: string | null;
}

interface Department {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    logo: string | null;
    hero_image: string | null;
    color: string | null;
    programs: Program[];
}

export default function DepartmentShow({ department }: { department: Department }) {
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const accentColor = department.color || '#4f46e5';

    const displayed = selectedProgram ?? null;

    return (
        <ThemeProvider>
            <Head title={`${department.name} - ASJA`} />
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-900 overflow-x-hidden">
                <Navbar />

                {/* Hero */}
                <section className="relative h-80 md:h-96 mt-16 overflow-hidden">
                    {department.hero_image ? (
                        <img
                            src={`/storage/${department.hero_image}`}
                            alt={department.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full" style={{ backgroundColor: accentColor }} />
                    )}
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                        {department.logo && (
                            <img
                                src={`/storage/${department.logo}`}
                                alt=""
                                className="w-20 h-20 object-contain mb-4 drop-shadow-lg"
                            />
                        )}
                        <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-3">
                            {department.name}
                        </h1>
                        <div
                            className="w-20 h-1 rounded-full"
                            style={{ backgroundColor: accentColor }}
                        />
                    </div>
                </section>

                {/* Programs selector */}
                {department.programs.length > 0 && (
                    <section className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-16 z-10">
                        <div className="max-w-6xl mx-auto px-4 flex gap-2 py-3 overflow-x-auto">
                            <button
                                onClick={() => setSelectedProgram(null)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    !selectedProgram
                                        ? 'text-white'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                                style={!selectedProgram ? { backgroundColor: accentColor } : {}}
                            >
                                Vue générale
                            </button>
                            {department.programs.map((prog) => (
                                <button
                                    key={prog.id}
                                    onClick={() => setSelectedProgram(prog)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                        selectedProgram?.id === prog.id
                                            ? 'text-white'
                                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                    }`}
                                    style={selectedProgram?.id === prog.id ? { backgroundColor: accentColor } : {}}
                                >
                                    {prog.title}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
                    {/* General description */}
                    {!selectedProgram && department.description && (
                        <div className="max-w-3xl mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: accentColor }} />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    À propos de la mention
                                </h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                {department.description}
                            </p>
                        </div>
                    )}

                    {/* Programs grid when no program selected */}
                    {!selectedProgram && department.programs.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Nos parcours
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {department.programs.map((prog) => (
                                    <button
                                        key={prog.id}
                                        onClick={() => setSelectedProgram(prog)}
                                        className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-left group"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                            style={{ backgroundColor: accentColor + '20' }}
                                        >
                                            <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                            {prog.title}
                                        </h3>
                                        {prog.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                                                {prog.description}
                                            </p>
                                        )}
                                        <div className="mt-4 text-sm font-medium" style={{ color: accentColor }}>
                                            Voir le détail →
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selected program detail */}
                    {selectedProgram && (
                        <div className="max-w-3xl">
                            <button
                                onClick={() => setSelectedProgram(null)}
                                className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 flex items-center gap-2"
                            >
                                ← Retour aux parcours
                            </button>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6">
                                {selectedProgram.title}
                            </h2>
                            {selectedProgram.description && (
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                    {selectedProgram.description}
                                </p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedProgram.competences && (
                                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-md">
                                        <div className="flex items-center gap-3 mb-4">
                                            <GraduationCap className="w-6 h-6" style={{ color: accentColor }} />
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Compétences acquises
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                            {selectedProgram.competences}
                                        </p>
                                    </div>
                                )}
                                {selectedProgram.debouches && (
                                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-md">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Briefcase className="w-6 h-6" style={{ color: accentColor }} />
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Débouchés professionnels
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                            {selectedProgram.debouches}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>

                <div className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 py-10">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Intéressé par cette mention ?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Contactez-nous pour plus d'informations sur les inscriptions.
                        </p>
                        <Link
                            href={route('home') + '#contact'}
                            className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all hover:-translate-y-0.5"
                            style={{ backgroundColor: accentColor }}
                        >
                            Nous contacter
                        </Link>
                    </div>
                </div>

                <Footer />
            </div>
        </ThemeProvider>
    );
}
