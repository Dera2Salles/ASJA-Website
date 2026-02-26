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

export default function DepartmentShow({
    department,
}: {
    department: Department;
}) {
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(
        null,
    );
    const accentColor = department.color || '#4f46e5';

    const displayed = selectedProgram ?? null;

    return (
        <ThemeProvider>
            <Head title={`${department.name} - ASJA`} />
            <div className="flex min-h-screen flex-col overflow-x-hidden bg-gray-50 dark:bg-zinc-900">
                <Navbar />

                {}
                <section className="relative mt-16 h-80 overflow-hidden md:h-96">
                    {department.hero_image ? (
                        <img
                            src={`/storage/${department.hero_image}`}
                            alt={department.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div
                            className="h-full w-full"
                            style={{ backgroundColor: accentColor }}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                        {department.logo && (
                            <img
                                src={`/storage/${department.logo}`}
                                alt=""
                                className="mb-4 h-20 w-20 object-contain drop-shadow-lg"
                            />
                        )}
                        <h1 className="mb-3 text-3xl font-black text-white drop-shadow-lg md:text-5xl">
                            {department.name}
                        </h1>
                        <div
                            className="h-1 w-20 rounded-full"
                            style={{ backgroundColor: accentColor }}
                        />
                    </div>
                </section>

                {}
                {department.programs.length > 0 && (
                    <section className="sticky top-16 z-10 border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
                            <button
                                onClick={() => setSelectedProgram(null)}
                                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                    !selectedProgram
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
                                }`}
                                style={
                                    !selectedProgram
                                        ? { backgroundColor: accentColor }
                                        : {}
                                }
                            >
                                Vue générale
                            </button>
                            {department.programs.map((prog) => (
                                <button
                                    key={prog.id}
                                    onClick={() => setSelectedProgram(prog)}
                                    className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                        selectedProgram?.id === prog.id
                                            ? 'text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300'
                                    }`}
                                    style={
                                        selectedProgram?.id === prog.id
                                            ? { backgroundColor: accentColor }
                                            : {}
                                    }
                                >
                                    {prog.title}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
                    {}
                    {!selectedProgram && department.description && (
                        <div className="mb-12 max-w-3xl">
                            <div className="mb-4 flex items-center gap-3">
                                <div
                                    className="h-8 w-1 rounded-full"
                                    style={{ backgroundColor: accentColor }}
                                />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    À propos de la mention
                                </h2>
                            </div>
                            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                                {department.description}
                            </p>
                        </div>
                    )}

                    {}
                    {!selectedProgram && department.programs.length > 0 && (
                        <div>
                            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                                Nos parcours
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {department.programs.map((prog) => (
                                    <button
                                        key={prog.id}
                                        onClick={() => setSelectedProgram(prog)}
                                        className="group rounded-2xl bg-white p-6 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-800"
                                    >
                                        <div
                                            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                                            style={{
                                                backgroundColor:
                                                    accentColor + '20',
                                            }}
                                        >
                                            <BookOpen
                                                className="h-5 w-5"
                                                style={{ color: accentColor }}
                                            />
                                        </div>
                                        <h3 className="mb-2 font-bold text-gray-900 dark:text-white">
                                            {prog.title}
                                        </h3>
                                        {prog.description && (
                                            <p className="line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                                                {prog.description}
                                            </p>
                                        )}
                                        <div
                                            className="mt-4 text-sm font-medium"
                                            style={{ color: accentColor }}
                                        >
                                            Voir le détail →
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {}
                    {selectedProgram && (
                        <div className="max-w-3xl">
                            <button
                                onClick={() => setSelectedProgram(null)}
                                className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                                ← Retour aux parcours
                            </button>
                            <h2 className="mb-6 text-3xl font-black text-gray-900 dark:text-white">
                                {selectedProgram.title}
                            </h2>
                            {selectedProgram.description && (
                                <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                                    {selectedProgram.description}
                                </p>
                            )}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {selectedProgram.competences && (
                                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-zinc-800">
                                        <div className="mb-4 flex items-center gap-3">
                                            <GraduationCap
                                                className="h-6 w-6"
                                                style={{ color: accentColor }}
                                            />
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Compétences acquises
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-gray-400">
                                            {selectedProgram.competences}
                                        </p>
                                    </div>
                                )}
                                {selectedProgram.debouches && (
                                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-zinc-800">
                                        <div className="mb-4 flex items-center gap-3">
                                            <Briefcase
                                                className="h-6 w-6"
                                                style={{ color: accentColor }}
                                            />
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Débouchés professionnels
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-gray-400">
                                            {selectedProgram.debouches}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>

                <div className="border-t border-gray-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mx-auto max-w-4xl px-4 text-center">
                        <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                            Intéressé par cette mention ?
                        </h3>
                        <p className="mb-6 text-gray-500 dark:text-gray-400">
                            Contactez-nous pour plus d'informations sur les
                            inscriptions.
                        </p>
                        <Link
                            href={route('home') + '#contact'}
                            className="inline-flex items-center rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
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
