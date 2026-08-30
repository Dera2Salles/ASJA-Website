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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                            Nos{' '}
                            <span className="text-primary dark:text-primary">
                                Départements
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-base">
                            {departments.length} mention(s) académique(s)
                            gérée(s).
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href={route('admin.departments.create')}>
                            <Button className="dark:bg-primary h-11 gap-2 rounded-lg bg-card px-6 font-semibold text-white transition-all hover:bg-card">
                                <Plus
                                    size={18}
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
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 md:col-span-2 lg:col-span-3 dark:border-white/5">
                            <div className="bg-accent mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                                <Layers
                                    className="text-primary"
                                    size={32}
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h2 className="mb-2 text-xl font-bold text-foreground">
                                Aucun département
                            </h2>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Commencez par structurer votre offre académique.
                            </p>
                            <Link href={route('admin.departments.create')}>
                                <Button
                                    variant="outline"
                                    className="border-border text-primary hover:bg-accent h-10 rounded-lg px-6 font-semibold"
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
                            <Card className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/5 /50">
                                {}
                                <div className="bg-primary absolute top-0 left-0 z-10 h-1.5 w-full" />

                                <CardContent className="p-6 pt-8">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="bg-accent flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-105">
                                            {dept.logo ? (
                                                <img
                                                    src={`/storage/${dept.logo}`}
                                                    alt=""
                                                    className="h-10 w-10 object-contain"
                                                />
                                            ) : (
                                                <Layers className="text-primary h-8 w-8" />
                                            )}
                                        </div>

                                        <div className="flex translate-x-4 gap-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                            <Link
                                                href={route(
                                                    'admin.departments.edit',
                                                    dept.id,
                                                )}
                                            >
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="hover:text-primary hover:bg-accent h-8 w-8 rounded-lg text-muted-foreground transition-all active:scale-90"
                                                >
                                                    <Pencil
                                                        size={14}
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
                                                className="h-8 w-8 rounded-lg text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                                            >
                                                <Trash2
                                                    size={14}
                                                />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="truncate text-base font-bold tracking-tight text-foreground uppercase">
                                                    {dept.name}
                                                </h3>
                                                {!dept.is_visible && (
                                                    <EyeOff className="h-4 w-4 text-amber-500" />
                                                )}
                                            </div>
                                            <code className="text-muted-foreground rounded bg-muted px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase dark:bg-card/5">
                                                /{dept.slug}
                                            </code>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border pt-4 dark:border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-lg leading-none font-bold text-foreground">
                                                    {dept.programs_count}
                                                </span>
                                                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                                                    Programmes
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className="text-primary dark:text-primary text-xs font-bold">
                                                    #{dept.sort_order}
                                                </span>
                                                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                                                    Ordre
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-3">
                                            <Link
                                                href={route(
                                                    'department.show',
                                                    dept.slug,
                                                )}
                                                target="_blank"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className="hover:bg-primary group/btn h-10 w-full justify-between rounded-lg bg-muted text-[10px] font-bold tracking-wider uppercase transition-all hover:text-white dark:bg-card/5"
                                                >
                                                    Voir sur le site
                                                    <ArrowRight
                                                        size={12}
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
                                                className="border-amber-500/20 bg-amber-500/5 text-[8px] font-bold tracking-widest text-amber-500 uppercase"
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
        </AdminLayout>
    );
}
