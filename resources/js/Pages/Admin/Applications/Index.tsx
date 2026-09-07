import {
    EmptyState,
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
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    FileWarning,
    Inbox,
    MailCheck,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { STATUS_TONE } from './status';

interface Option {
    value: string;
    label: string;
}

interface ApplicationRow {
    id: number;
    reference: string;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    full_name: string;
    email: string;
    phone: string;
    level: string;
    mention_name: string;
    documents_count: number;
    receipt_sent_at: string | null;
    created_at: string;
}

interface Props {
    applications: {
        data: ApplicationRow[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        type?: string;
        mention?: string;
        level?: string;
    };
    options: {
        statuses: Option[];
        types: Option[];
        levels: string[];
        mentions: { slug: string; name: string }[];
    };
    counts: Record<string, number>;
}

/** Date courte, en français, sans l'heure : la liste se lit en diagonale. */
const shortDate = (value: string) =>
    new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

/**
 * Liste des demandes d'inscription et de réinscription.
 *
 * Elle vit dans le tableau de bord existant : même barre latérale, mêmes
 * briques, mêmes conventions de filtre que l'écran des étudiants. Rien n'est
 * dupliqué d'une administration à l'autre — il n'y en a qu'une.
 */
export default function ApplicationsIndex({
    applications,
    filters,
    options,
    counts,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [pendingDelete, setPendingDelete] = useState<ApplicationRow | null>(
        null,
    );

    /* La recherche part d'elle-même après une pause de frappe : un bouton
       « Rechercher » de plus n'apprendrait rien à personne. */
    useEffect(() => {
        if (search === (filters.search ?? '')) return;

        const timer = window.setTimeout(() => {
            router.get(
                route('admin.applications.index'),
                { ...filters, search: search || undefined },
                { preserveState: true, replace: true },
            );
        }, 350);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applyFilter = (key: string, value: string) =>
        router.get(
            route('admin.applications.index'),
            { ...filters, [key]: value || undefined, page: undefined },
            { preserveState: true, replace: true },
        );

    const confirmDelete = () => {
        if (!pendingDelete) return;

        router.delete(route('admin.applications.destroy', pendingDelete.id), {
            onSuccess: () => toast.success('Demande supprimée'),
            onFinish: () => setPendingDelete(null),
        });
    };

    const isFiltered = Boolean(
        filters.search ||
            filters.status ||
            filters.type ||
            filters.mention ||
            filters.level,
    );

    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

    return (
        <AdminLayout breadcrumbs={[{ label: 'Candidatures' }]}>
            <Head title="Candidatures" />

            <PageTitle
                title="Candidatures"
                description="Demandes d’inscription et de réinscription déposées en ligne."
            />

            <KpiRow>
                <KpiCard
                    label="Total des demandes"
                    value={total}
                    icon={Inbox}
                />
                <KpiCard
                    label="En attente"
                    value={counts.pending ?? 0}
                    icon={FileWarning}
                />
                <KpiCard
                    label="En traitement"
                    value={counts.processing ?? 0}
                    icon={Eye}
                />
                <KpiCard
                    label="Finalisées"
                    value={counts.finalized ?? 0}
                    icon={MailCheck}
                />
            </KpiRow>

            {/* Filtres */}
            <Card className="py-0">
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <div className="relative min-w-56 flex-1">
                        <Search
                            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Numéro, nom, e-mail, téléphone…"
                            className="pl-9"
                            aria-label="Rechercher une demande"
                        />
                    </div>

                    {[
                        {
                            key: 'status',
                            label: 'Tous les statuts',
                            items: options.statuses,
                        },
                        {
                            key: 'type',
                            label: 'Tous les types',
                            items: options.types,
                        },
                        {
                            key: 'level',
                            label: 'Tous les niveaux',
                            items: options.levels.map((level) => ({
                                value: level,
                                label: level,
                            })),
                        },
                        {
                            key: 'mention',
                            label: 'Toutes les mentions',
                            items: options.mentions.map((mention) => ({
                                value: mention.slug,
                                label: mention.name,
                            })),
                        },
                    ].map((filter) => (
                        <select
                            key={filter.key}
                            value={
                                (filters as Record<string, string | undefined>)[
                                    filter.key
                                ] ?? ''
                            }
                            onChange={(event) =>
                                applyFilter(filter.key, event.target.value)
                            }
                            aria-label={filter.label}
                            className="border-border bg-background text-foreground h-9 border px-3 text-sm"
                        >
                            <option value="">{filter.label}</option>
                            {filter.items.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    ))}

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                router.get(route('admin.applications.index'));
                            }}
                        >
                            Réinitialiser
                        </Button>
                    )}
                </CardContent>
            </Card>

            <Card className="py-0">
                <CardContent className="p-0">
                    {applications.data.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title={
                                isFiltered
                                    ? 'Aucune demande ne correspond'
                                    : 'Aucune demande pour le moment'
                            }
                            description={
                                isFiltered
                                    ? 'Modifiez ou réinitialisez les filtres.'
                                    : 'Les demandes déposées depuis le site apparaîtront ici.'
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Candidat</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Niveau / Mention</TableHead>
                                        <TableHead>Pièces</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Déposée le</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {applications.data.map((application) => (
                                        <TableRow key={application.id}>
                                            <TableCell>
                                                <Link
                                                    href={route(
                                                        'admin.applications.show',
                                                        application.id,
                                                    )}
                                                    className="admin-mono text-foreground hover:text-primary text-sm font-medium"
                                                >
                                                    {application.reference}
                                                </Link>
                                            </TableCell>

                                            <TableCell>
                                                <p className="text-foreground text-sm font-medium">
                                                    {application.full_name}
                                                </p>
                                                <p className="admin-meta">
                                                    {application.email}
                                                </p>
                                            </TableCell>

                                            <TableCell className="text-sm">
                                                {application.type_label}
                                            </TableCell>

                                            <TableCell>
                                                <p className="text-foreground text-sm">
                                                    {application.level}
                                                </p>
                                                <p className="admin-meta">
                                                    {application.mention_name}
                                                </p>
                                            </TableCell>

                                            <TableCell className="admin-mono text-sm">
                                                {application.documents_count}
                                            </TableCell>

                                            <TableCell>
                                                <StatusBadge
                                                    tone={
                                                        STATUS_TONE[
                                                            application.status
                                                        ] ?? 'neutral'
                                                    }
                                                >
                                                    {application.status_label}
                                                </StatusBadge>
                                            </TableCell>

                                            <TableCell className="admin-meta whitespace-nowrap">
                                                {shortDate(
                                                    application.created_at,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <RowActions
                                                    actions={[
                                                        {
                                                            label: 'Ouvrir le dossier',
                                                            icon: Eye,
                                                            onSelect: () =>
                                                                router.visit(
                                                                    route(
                                                                        'admin.applications.show',
                                                                        application.id,
                                                                    ),
                                                                ),
                                                        },
                                                        {
                                                            label: 'Supprimer',
                                                            icon: Trash2,
                                                            danger: true,
                                                            onSelect: () =>
                                                                setPendingDelete(
                                                                    application,
                                                                ),
                                                        },
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {applications.last_page > 1 && (
                <div className="flex items-center justify-between gap-3">
                    <p className="admin-meta">
                        Page {applications.current_page} sur{' '}
                        {applications.last_page} — {applications.total} demandes
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={applications.current_page === 1}
                            onClick={() =>
                                router.get(route('admin.applications.index'), {
                                    ...filters,
                                    page: applications.current_page - 1,
                                })
                            }
                        >
                            <ChevronLeft className="size-4" />
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                applications.current_page ===
                                applications.last_page
                            }
                            onClick={() =>
                                router.get(route('admin.applications.index'), {
                                    ...filters,
                                    page: applications.current_page + 1,
                                })
                            }
                        >
                            Suivant
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer cette demande ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            La demande {pendingDelete?.reference} et les pièces
                            justificatives qui l’accompagnent seront
                            définitivement supprimées.
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
