import {
    EmptyState,
    FieldError,
    KpiCard,
    KpiRow,
    PageTitle,
    StatusBadge,
} from '@/components/admin/primitives';
import { RowActions } from '@/components/admin/row-actions';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    GraduationCap,
    Pencil,
    Plus,
    PowerOff,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Series {
    id: number;
    code: string;
    label: string | null;
    is_active: boolean;
    sort_order: number;
    /** Dossiers déposés sous cette série : ce qui interdit sa suppression. */
    applications_count: number;
}

/** Valeurs du formulaire, communes à la création et à la modification. */
const emptyForm = {
    code: '',
    label: '',
    is_active: true as boolean,
    sort_order: '' as number | string,
};

export default function BacSeriesIndex({ series }: { series: Series[] }) {
    const [editing, setEditing] = useState<Series | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Series | null>(null);

    const { data, setData, errors, clearErrors, processing, reset } =
        useForm(emptyForm);

    const activeCount = series.filter((item) => item.is_active).length;
    const usedCount = series.reduce(
        (sum, item) => sum + item.applications_count,
        0,
    );

    const openCreate = () => {
        reset();
        clearErrors();
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (item: Series) => {
        clearErrors();
        setEditing(item);
        setData({
            code: item.code,
            label: item.label ?? '',
            is_active: item.is_active,
            sort_order: item.sort_order,
        });
        setFormOpen(true);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const done = (message: string) => () => {
            setFormOpen(false);
            toast.success(message);
        };

        if (editing) {
            router.put(route('admin.bac-series.update', editing.id), data, {
                preserveScroll: true,
                onSuccess: done('Série mise à jour'),
            });
        } else {
            router.post(route('admin.bac-series.store'), data, {
                preserveScroll: true,
                onSuccess: done('Série ajoutée'),
            });
        }
    };

    /* Désactiver depuis la ligne : c'est le geste courant — retirer une série
       du formulaire sans rien perdre — et il ne mérite pas l'ouverture du
       formulaire complet. Les autres champs sont renvoyés inchangés. */
    const toggleActive = (item: Series) => {
        router.put(
            route('admin.bac-series.update', item.id),
            {
                code: item.code,
                label: item.label ?? '',
                is_active: !item.is_active,
                sort_order: item.sort_order,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        item.is_active
                            ? `Série ${item.code} désactivée`
                            : `Série ${item.code} réactivée`,
                    ),
            },
        );
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;

        router.delete(route('admin.bac-series.destroy', pendingDelete.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Série supprimée'),
            /* Le serveur refuse la suppression d'une série déclarée sur un
               dossier : son motif est le seul message utile ici. */
            onError: (formErrors) =>
                toast.error(
                    formErrors.code ?? 'Cette série n’a pas pu être supprimée.',
                ),
            onFinish: () => setPendingDelete(null),
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    label: 'Candidatures',
                    href: route('admin.applications.index'),
                },
                { label: 'Séries du baccalauréat' },
            ]}
        >
            <Head title="Séries du baccalauréat" />

            <PageTitle
                title="Séries du baccalauréat"
                description="Les séries proposées au candidat dans le formulaire de candidature."
                actions={
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="size-4" />
                        Nouvelle série
                    </Button>
                }
            />

            <KpiRow className="xl:grid-cols-3">
                <KpiCard
                    label="Séries"
                    value={series.length}
                    icon={GraduationCap}
                />
                <KpiCard
                    label="Proposées au formulaire"
                    value={activeCount}
                    icon={CheckCircle2}
                />
                <KpiCard
                    label="Dossiers concernés"
                    value={usedCount}
                    icon={Users}
                />
            </KpiRow>

            <Card className="py-0">
                {series.length === 0 ? (
                    <EmptyState
                        icon={GraduationCap}
                        title="Aucune série"
                        description="Ajoutez les séries du baccalauréat que le formulaire de candidature doit proposer."
                        action={
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openCreate}
                            >
                                <Plus className="size-4" />
                                Créer la première
                            </Button>
                        }
                    />
                ) : (
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Intitulé</TableHead>
                                        <TableHead className="text-right">
                                            Ordre
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Dossiers
                                        </TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {series.map((item) => (
                                        <TableRow key={item.id}>
                                            {/* Un code peut s'écrire en toutes
                                                lettres : il s'enroule plutôt
                                                que d'étirer le tableau. */}
                                            <TableCell className="admin-mono max-w-xs font-medium whitespace-normal">
                                                {item.code}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {item.label ?? '—'}
                                            </TableCell>
                                            <TableCell className="admin-mono text-muted-foreground text-right">
                                                {item.sort_order}
                                            </TableCell>
                                            <TableCell className="admin-mono text-right">
                                                {item.applications_count}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    tone={
                                                        item.is_active
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                >
                                                    {item.is_active
                                                        ? 'Proposée'
                                                        : 'Désactivée'}
                                                </StatusBadge>
                                            </TableCell>
                                            <TableCell>
                                                <RowActions
                                                    actions={[
                                                        {
                                                            label: 'Modifier',
                                                            icon: Pencil,
                                                            onSelect: () =>
                                                                openEdit(item),
                                                        },
                                                        {
                                                            label: item.is_active
                                                                ? 'Désactiver'
                                                                : 'Réactiver',
                                                            icon: item.is_active
                                                                ? PowerOff
                                                                : CheckCircle2,
                                                            onSelect: () =>
                                                                toggleActive(
                                                                    item,
                                                                ),
                                                        },
                                                        {
                                                            label: 'Supprimer',
                                                            icon: Trash2,
                                                            onSelect: () =>
                                                                setPendingDelete(
                                                                    item,
                                                                ),
                                                            danger: true,
                                                        },
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Formulaire de création et de modification */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing
                                ? `Modifier la série ${editing.code}`
                                : 'Nouvelle série'}
                        </DialogTitle>
                        <DialogDescription>
                            Le code est la valeur enregistrée sur le dossier du
                            candidat. C’est l’intitulé, lui, que le candidat
                            voit dans le formulaire.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(event) =>
                                    setData(
                                        'code',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="A1, C, D, OSE, TECHNIQUE INDUSTRIEL…"
                                maxLength={255}
                                required
                            />
                            <FieldError>{errors.code}</FieldError>
                            {editing && editing.applications_count > 0 && (
                                <p className="text-muted-foreground text-xs">
                                    {editing.applications_count} dossier(s)
                                    portent ce code : le corriger les met à jour
                                    tous.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="label">
                                Intitulé{' '}
                                <span className="text-muted-foreground font-normal">
                                    (facultatif)
                                </span>
                            </Label>
                            <Input
                                id="label"
                                value={data.label}
                                onChange={(event) =>
                                    setData('label', event.target.value)
                                }
                                placeholder="ex : Sciences expérimentales"
                                maxLength={255}
                            />
                            <FieldError>{errors.label}</FieldError>
                            <p className="text-muted-foreground text-xs">
                                Affiché au candidat à la place du code. Sans
                                intitulé, c’est le code qui apparaît.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sort_order">
                                Ordre d’affichage
                            </Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                max={999}
                                value={data.sort_order}
                                onChange={(event) =>
                                    setData('sort_order', event.target.value)
                                }
                                placeholder="À la suite des autres"
                            />
                            <FieldError>{errors.sort_order}</FieldError>
                        </div>

                        <div className="border-border flex items-center justify-between border p-4">
                            <div>
                                <Label
                                    htmlFor="is_active"
                                    className="text-sm font-semibold"
                                >
                                    Proposée au formulaire
                                </Label>
                                <p className="text-muted-foreground text-xs">
                                    Désactivée, la série disparaît du formulaire
                                    mais reste lisible sur les dossiers déjà
                                    déposés.
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', checked)
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editing ? 'Enregistrer' : 'Ajouter'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Suppression : refusée côté serveur dès qu'un dossier la porte. */}
            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer la série {pendingDelete?.code} ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingDelete &&
                            pendingDelete.applications_count > 0
                                ? `${pendingDelete.applications_count} dossier(s) déclarent cette série : la suppression sera refusée. Désactivez-la pour la retirer du formulaire.`
                                : 'Cette série disparaîtra du formulaire de candidature. Aucun dossier ne la déclare.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
