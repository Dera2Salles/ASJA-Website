import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout, Save, Settings2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
        post(route('admin.component-data.update'), {
            onSuccess: () => toast.success('Contenu mis à jour avec succès !'),
        });
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
                            Contenu du{' '}
                            <span className="text-asja-green-600 dark:text-primary">
                                Site
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            Personnalisez les éléments textuels de votre page
                            d'accueil.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="glass flex h-12 items-center gap-3 rounded-2xl border-white/50 px-6 font-bold text-slate-500 shadow-sm dark:border-white/5">
                            <Settings2
                                size={18}
                                className="text-asja-green-500"
                            />
                            Configuration Globale
                        </div>
                    </motion.div>
                </div>

                {}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {}
                    <div className="space-y-4 lg:col-span-3">
                        <div className="glass flex flex-col gap-2 rounded-[2.5rem] border-none p-2 shadow-xl">
                            <div className="mb-2 flex items-center gap-2 px-6 py-4">
                                <Layout
                                    size={16}
                                    className="text-asja-green-500"
                                />
                                <span className="text-muted-foreground text-[10px] font-black tracking-[3px] uppercase">
                                    Sections
                                </span>
                            </div>
                            {sections.map((s, i) => (
                                <motion.button
                                    key={s}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => switchSection(s)}
                                    className={`group relative rounded-3xl px-6 py-4 text-left text-sm font-black capitalize transition-all ${
                                        activeSection === s
                                            ? 'bg-asja-green-600 shadow-asja-green-900/20 text-white shadow-lg'
                                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    {activeSection === s && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute top-1/2 left-2 h-6 w-1 -translate-y-1/2 rounded-full bg-white"
                                        />
                                    )}
                                    <span
                                        className={
                                            activeSection === s ? 'ml-2' : ''
                                        }
                                    >
                                        {s}
                                    </span>
                                </motion.button>
                            ))}
                        </div>

                        <div className="glass bg-asja-green-600/5 group relative overflow-hidden rounded-[2.5rem] border-none p-8 shadow-xl">
                            <Sparkles
                                className="text-asja-green-500/10 absolute -right-4 -bottom-4 transition-transform duration-700 group-hover:scale-150"
                                size={120}
                            />
                            <p className="text-asja-green-800 dark:text-primary mb-2 text-[10px] font-black tracking-widest uppercase">
                                Conseil Pro
                            </p>
                            <p className="relative z-10 text-xs leading-relaxed font-bold text-slate-500">
                                Utilisez des titres percutants et des
                                descriptions concises pour une meilleure
                                lisibilité.
                            </p>
                        </div>
                    </div>

                    {}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="glass overflow-hidden rounded-[3rem] border-none shadow-2xl">
                                    <CardHeader className="border-b border-white/40 bg-white/30 px-10 py-8 dark:border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-2xl font-black text-slate-900 capitalize dark:text-white">
                                                    Configuration{' '}
                                                    {activeSection}
                                                </CardTitle>
                                                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                                                    Éditez les variables
                                                    visuelles de cette section
                                                </p>
                                            </div>
                                            <div className="bg-asja-green-500/10 flex h-12 w-12 items-center justify-center rounded-2xl">
                                                <Layout
                                                    className="text-asja-green-600"
                                                    size={24}
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10">
                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-10"
                                        >
                                            <div className="grid grid-cols-1 gap-8">
                                                {Object.entries(
                                                    data.data as Record<
                                                        string,
                                                        string
                                                    >,
                                                ).map(([key, val], idx) => {
                                                    const value = val as string;
                                                    const isLongText =
                                                        value &&
                                                        value.length > 60;

                                                    return (
                                                        <motion.div
                                                            key={key}
                                                            initial={{
                                                                opacity: 0,
                                                                x: -10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    idx * 0.05,
                                                            }}
                                                            className="space-y-3"
                                                        >
                                                            <div className="flex items-center justify-between px-2">
                                                                <Label className="text-asja-green-600/70 text-[10px] font-black tracking-[2px] uppercase">
                                                                    {key.replace(
                                                                        /_/g,
                                                                        ' ',
                                                                    )}
                                                                </Label>
                                                                <span className="text-[8px] font-black text-slate-300 uppercase">
                                                                    Variable:{' '}
                                                                    {key}
                                                                </span>
                                                            </div>

                                                            {isLongText ? (
                                                                <Textarea
                                                                    value={
                                                                        value
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'data',
                                                                            {
                                                                                ...data.data,
                                                                                [key]: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="focus:ring-asja-green-500/20 min-h-[120px] resize-none rounded-2xl border-none bg-slate-50/50 p-6 text-lg font-bold text-slate-800 transition-all placeholder:text-slate-300 focus:ring-2 dark:bg-black/20 dark:text-slate-200"
                                                                />
                                                            ) : (
                                                                <Input
                                                                    type="text"
                                                                    value={
                                                                        value
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'data',
                                                                            {
                                                                                ...data.data,
                                                                                [key]: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="focus:ring-asja-green-500/20 h-14 rounded-2xl border-none bg-slate-50/50 px-6 text-xl font-black text-slate-900 transition-all placeholder:text-slate-200 focus:ring-2 dark:bg-black/20 dark:text-white"
                                                                />
                                                            )}

                                                            {errors[
                                                                `data.${key}` as keyof typeof errors
                                                            ] && (
                                                                <p className="mt-1 ml-4 text-[10px] font-black text-rose-500 uppercase italic">
                                                                    {
                                                                        errors[
                                                                            `data.${key}` as keyof typeof errors
                                                                        ]
                                                                    }
                                                                </p>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex justify-end border-t border-white/40 pt-10 dark:border-white/5">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="bg-asja-green-600 dark:bg-primary shadow-asja-green-900/30 group h-14 rounded-[2rem] px-12 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
                                                >
                                                    {processing ? (
                                                        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    ) : (
                                                        <Save className="mr-3 h-5 w-5 transition-transform group-hover:rotate-12" />
                                                    )}
                                                    Enregistrer les
                                                    modifications
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {}
            <div className="bg-asja-green-500/5 pointer-events-none fixed top-[15%] left-[-5%] -z-10 h-[600px] w-[600px] rounded-full blur-[150px]" />
            <div className="bg-primary/5 pointer-events-none fixed right-[10%] bottom-0 -z-10 h-[400px] w-[400px] animate-pulse rounded-full blur-[120px]" />
        </AdminLayout>
    );
}
