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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/Layouts/AdminLayout';
import { uploadUrl } from '@/lib/uploads';
import { Head, Link, router } from '@inertiajs/react';
import {
    ExternalLink,
    Layers,
    Pencil,
    Plus,
    Search,
    SearchX,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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

type Visibility = 'all' | 'visible' | 'hidden';

/**
 * Vignette d'une mention. La carte ne se soulève pas et ne porte pas d'ombre :
 * elle se détache par son filet, et son seul indice de couleur est la pastille
 * de statut. Les actions restent visibles en permanence — les révéler au
 * survol les rendait inatteignables au clavier.
 */
const DepartmentCard = ({
    department,
    onDelete,
}: {
    department: Department;
    onDelete: (department: Department) => void;
}) => (
    <Card className="app-card-interactive gap-0 py-0">
        <CardContent className="flex h-full flex-col gap-4 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="border-border bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden border">
                        {department.logo ? (
                            <img
                                src={uploadUrl(department.logo)}
                                alt=""
                                className="size-full object-contain p-1"
                            />
                        ) : (
                            <Layers
                                className="text-muted-foreground size-4"
                                aria-hidden="true"
                            />
                        )}
                    </span>

                    {/* Le slug ne s'affiche plus : c'est une donnée technique
                        qui n'apprend rien à un gestionnaire et qui volait la
                        vedette au nom. Il reste porté par les données, sert
                        toujours aux routes, à l'aperçu public et à la
                        recherche, et s'édite dans le formulaire.

                        `line-clamp-2` plutôt que `truncate` : « Langues
                        étrangères appliquées » se coupait au milieu d'un mot
                        alors qu'il tient sur deux lignes. */}
                    <p className="text-foreground line-clamp-2 min-w-0 text-[15px] leading-snug font-semibold">
                        {department.name}
                    </p>
                </div>

                <RowActions
                    actions={[
                        {
                            label: 'Modifier',
                            icon: Pencil,
                            onSelect: () =>
                                router.visit(
                                    route(
                                        'admin.departments.edit',
                                        department.id,
                                    ),
                                ),
                        },
                        {
                            label: 'Voir sur le site',
                            icon: ExternalLink,
                            onSelect: () =>
                                window.open(
                                    route('department.show', department.slug),
                                    '_blank',
                                    'noopener,noreferrer',
                                ),
                        },
                        {
                            label: 'Supprimer',
                            icon: Trash2,
                            onSelect: () => onDelete(department),
                            danger: true,
                        },
                    ]}
                />
            </div>

            {/* Chiffres de la mention, alignés en chasse fixe pour que les
                cartes se comparent d'un coup d'œil. */}
            <div className="border-border mt-auto flex items-end justify-between gap-3 border-t pt-3">
                <div>
                    <p className="admin-mono text-foreground text-base">
                        {department.programs_count}
                    </p>
                    <p className="admin-label">Programmes</p>
                </div>

                <div className="text-right">
                    <p className="admin-mono text-muted-foreground text-base">
                        {department.sort_order}
                    </p>
                    <p className="admin-label">Ordre</p>
                </div>

                <StatusBadge
                    tone={department.is_visible ? 'success' : 'warning'}
                >
                    {department.is_visible ? 'En ligne' : 'Masquée'}
                </StatusBadge>
            </div>
        </CardContent>
    </Card>
);

export default function DepartmentsIndex({
    departments,
}: {
    departments: Department[];
}) {
    const [query, setQuery] = useState('');
    const [visibility, setVisibility] = useState<Visibility>('all');
    const [pendingDelete, setPendingDelete] = useState<Department | null>(null);

    const visibleCount = departments.filter((d) => d.is_visible).length;
    const programCount = departments.reduce(
        (sum, d) => sum + d.programs_count,
        0,
    );

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return departments.filter((department) => {
            const matchesQuery =
                !needle ||
                department.name.toLowerCase().includes(needle) ||
                department.slug.toLowerCase().includes(needle);
            const matchesVisibility =
                visibility === 'all' ||
                (visibility === 'visible' && department.is_visible) ||
                (visibility === 'hidden' && !department.is_visible);
            return matchesQuery && matchesVisibility;
        });
    }, [departments, query, visibility]);

    const confirmDelete = () => {
        if (!pendingDelete) return;
        router.delete(route('admin.departments.destroy', pendingDelete.id), {
            onSuccess: () => toast.success('Mention supprimée'),
            onFinish: () => setPendingDelete(null),
        });
    };

    const isFiltered = query.trim() !== '' || visibility !== 'all';

    return (
        <AdminLayout breadcrumbs={[{ label: 'Mentions' }]}>
            <Head title="Mentions" />

            <PageTitle
                title="Mentions"
                description="Structurez l'offre académique publiée sur le site."
                actions={
                    <Button asChild size="sm">
                        <Link href={route('admin.departments.create')}>
                            <Plus className="size-4" />
                            Nouvelle mention
                        </Link>
                    </Button>
                }
            />

            <KpiRow className="xl:grid-cols-3">
                <KpiCard
                    label="Mentions"
                    value={departments.length}
                    icon={Layers}
                />
                <KpiCard
                    label="En ligne"
                    value={visibleCount}
                    icon={ExternalLink}
                />
                <KpiCard
                    label="Programmes"
                    value={programCount}
                    icon={Layers}
                />
            </KpiRow>

            {/* Recherche et filtre de visibilité : le tri se fait à l'écran,
                la liste étant courte par nature. */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <Search
                        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                        aria-hidden="true"
                    />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Rechercher une mention…"
                        aria-label="Rechercher une mention"
                        className="h-9 pl-9"
                    />
                </div>

                <Tabs
                    value={visibility}
                    onValueChange={(value) =>
                        setVisibility(value as Visibility)
                    }
                >
                    <TabsList>
                        <TabsTrigger value="all">Toutes</TabsTrigger>
                        <TabsTrigger value="visible">En ligne</TabsTrigger>
                        <TabsTrigger value="hidden">Masquées</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {filtered.length === 0 ? (
                <Card className="py-0">
                    {isFiltered ? (
                        <EmptyState
                            icon={SearchX}
                            title="Aucune mention ne correspond"
                            description="Ajustez la recherche ou le filtre de visibilité."
                            action={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setQuery('');
                                        setVisibility('all');
                                    }}
                                >
                                    Réinitialiser les filtres
                                </Button>
                            }
                        />
                    ) : (
                        <EmptyState
                            icon={Layers}
                            title="Aucune mention"
                            description="Commencez par structurer votre offre académique."
                            action={
                                <Button asChild variant="outline" size="sm">
                                    <Link
                                        href={route('admin.departments.create')}
                                    >
                                        <Plus className="size-4" />
                                        Créer la première
                                    </Link>
                                </Button>
                            }
                        />
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((department) => (
                        <DepartmentCard
                            key={department.id}
                            department={department}
                            onDelete={setPendingDelete}
                        />
                    ))}
                </div>
            )}

            {/* La confirmation native du navigateur ne suivait pas la charte
                et n'était pas stylable. */}
            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer « {pendingDelete?.name} » ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette mention et ses{' '}
                            {pendingDelete?.programs_count ?? 0} programme(s)
                            seront définitivement supprimés du site.
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
