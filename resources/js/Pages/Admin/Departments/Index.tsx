import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, EyeOff, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function DepartmentsIndex({
    departments,
}: {
    departments: Department[];
}) {
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Supprimer le département "${name}" définitivement ?`)) {
            router.delete(route('admin.departments.destroy', id), {
                onSuccess: () => toast.success('Département supprimé'),
            });
        }
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
                            Nos{' '}
                            <span className="text-asja-green-600 dark:text-primary">
                                Départements
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            {departments.length} mention(s) académique(s)
                            gérée(s).
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href={route('admin.departments.create')}>
                            <Button className="dark:bg-primary hover:shadow-primary/30 group h-14 gap-3 rounded-[2rem] bg-slate-900 px-8 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95">
                                <Plus
                                    size={22}
                                    strokeWidth={3}
                                    className="transition-transform group-hover:rotate-90"
                                />
                                Nouveau département
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {departments.length === 0 && (
                        <div className="glass flex flex-col items-center justify-center rounded-[3rem] border-none py-24 md:col-span-2 lg:col-span-3">
                            <div className="bg-asja-green-50 dark:bg-asja-green-900/20 mb-6 flex h-24 w-24 items-center justify-center rounded-full">
                                <Layers
                                    className="text-asja-green-500"
                                    size={40}
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                                Aucun département
                            </h2>
                            <p className="text-muted-foreground mb-8 font-medium">
                                Commencez par structurer votre offre académique.
                            </p>
                            <Link href={route('admin.departments.create')}>
                                <Button
                                    variant="outline"
                                    className="border-asja-green-200 text-asja-green-600 hover:bg-asja-green-50 h-12 rounded-2xl px-8 font-black tracking-tight"
                                >
                                    Créer le premier
                                </Button>
                            </Link>
                        </div>
                    )}

                    {departments.map((dept, i) => (
                        <motion.div
                            key={dept.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group glass relative overflow-hidden rounded-[2.5rem] border-none transition-all hover:-translate-y-2 hover:shadow-2xl">
                                {}
                                <div
                                    className="absolute top-0 left-0 z-10 h-2 w-full"
                                    style={{
                                        backgroundColor:
                                            dept.color || '#10b981',
                                    }}
                                />

                                <CardContent className="p-8 pt-10">
                                    <div className="mb-6 flex items-start justify-between">
                                        <div
                                            className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] shadow-xl transition-transform group-hover:scale-110"
                                            style={{
                                                backgroundColor: `${dept.color || '#10b981'}20`,
                                            }}
                                        >
                                            {dept.logo ? (
                                                <img
                                                    src={`/storage/${dept.logo}`}
                                                    alt=""
                                                    className="h-10 w-10 object-contain"
                                                />
                                            ) : (
                                                <Layers
                                                    className="h-8 w-8"
                                                    style={{
                                                        color:
                                                            dept.color ||
                                                            '#10b981',
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="flex translate-x-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                            <Link
                                                href={route(
                                                    'admin.departments.edit',
                                                    dept.id,
                                                )}
                                            >
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="hover:text-asja-green-600 hover:bg-asja-green-50 h-10 w-10 rounded-2xl text-slate-400 transition-all active:scale-90"
                                                >
                                                    <Pencil
                                                        size={18}
                                                        strokeWidth={2.5}
                                                    />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleDelete(
                                                        dept.id,
                                                        dept.name,
                                                    )
                                                }
                                                className="h-10 w-10 rounded-2xl text-slate-400 transition-all hover:rotate-6 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                                            >
                                                <Trash2
                                                    size={18}
                                                    strokeWidth={2.5}
                                                />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="truncate text-xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                                    {dept.name}
                                                </h3>
                                                {!dept.is_visible && (
                                                    <EyeOff className="h-4 w-4 text-amber-500" />
                                                )}
                                            </div>
                                            <code className="text-muted-foreground rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase dark:bg-white/5">
                                                /{dept.slug}
                                            </code>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-100 pt-6 dark:border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-2xl leading-none font-black text-slate-900 dark:text-white">
                                                    {dept.programs_count}
                                                </span>
                                                <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                                                    Programmes
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className="text-asja-green-600 dark:text-primary text-xs font-black">
                                                    #{dept.sort_order}
                                                </span>
                                                <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                                                    Ordre
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Link
                                                href={route(
                                                    'department.show',
                                                    dept.slug,
                                                )}
                                                target="_blank"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className="hover:bg-asja-green-600 group/btn h-12 w-full justify-between rounded-xl bg-slate-50 text-[10px] font-black tracking-[2px] uppercase transition-all hover:text-white dark:bg-white/5"
                                                >
                                                    Voir sur le site
                                                    <ArrowRight
                                                        size={14}
                                                        className="transition-transform group-hover/btn:translate-x-1"
                                                    />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    {!dept.is_visible && (
                                        <div className="absolute top-4 right-4 transition-opacity group-hover:opacity-0">
                                            <Badge
                                                variant="outline"
                                                className="border-amber-500/20 bg-amber-500/5 text-[8px] font-black tracking-widest text-amber-500 uppercase"
                                            >
                                                Masqué
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {}
            <div className="bg-asja-green-500/5 pointer-events-none fixed top-[20%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full blur-[120px]" />
            <div className="bg-primary/5 pointer-events-none fixed right-[5%] bottom-[10%] -z-10 h-[300px] w-[300px] animate-pulse rounded-full blur-[100px]" />
        </AdminLayout>
    );
}
