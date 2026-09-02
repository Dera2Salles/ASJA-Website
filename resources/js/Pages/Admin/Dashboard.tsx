import {
    EmptyState,
    KpiCard,
    KpiRow,
    StatusBadge,
} from '@/components/admin/primitives';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    formatDate,
    formatEventPeriod,
    POST_TYPE_LABELS,
    type Post,
} from '@/lib/posts';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CalendarClock,
    CalendarX,
    FileText,
    MapPin,
    MessageSquare,
    Pencil,
    Plus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Stats {
    posts: number;
    published: number;
    drafts: number;
    scheduled: number;
    students: number;
    testimonies: number;
    departments: number;
    upcomingEvents: number;
}

interface Props {
    stats: Stats;
    byType: { type: string; total: number }[];
    activity: { month: string; total: number }[];
    recentPosts: Post[];
    upcomingEvents: Post[];
}

/* Courbe monochrome : le tracé reprend `--foreground`, l'aire n'est qu'une
   opacité de 10 % du même ton. */
const chartConfig = {
    total: { label: 'Publications', color: 'var(--foreground)' },
} satisfies ChartConfig;

/** Statut réel d'une publication, programmation comprise. */
function statusBadge(post: Post) {
    if (!post.published_at) {
        return <StatusBadge>Brouillon</StatusBadge>;
    }
    if (new Date(post.published_at) > new Date()) {
        return <StatusBadge tone="warning">Programmée</StatusBadge>;
    }
    return <StatusBadge tone="success">En ligne</StatusBadge>;
}

export default function DashboardPage({
    stats,
    byType,
    activity,
    recentPosts,
    upcomingEvents,
}: Props) {
    const { auth } = usePage<PageProps>().props;

    /* La période ne fait que découper la série réellement fournie par le
       serveur : aucune donnée n'est extrapolée. */
    const [range, setRange] = useState<'3' | '6'>('6');
    const visibleActivity = activity.slice(range === '3' ? -3 : -6);

    return (
        <AdminLayout
            breadcrumbs={[{ label: 'Tableau de bord' }]}
            actions={
                <Button asChild size="sm">
                    <Link href={route('admin.posts.create')}>
                        <Plus className="size-4" />
                        Nouvelle publication
                    </Link>
                </Button>
            }
        >
            <Head title="Tableau de bord" />

            <div>
                <h1 className="admin-title">Bonjour, {auth.user.name}</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Voici l'état du site aujourd'hui.
                </p>
            </div>

            <KpiRow>
                <Link href={route('admin.posts.index')} className="block">
                    <KpiCard
                        label="Publications"
                        value={stats.posts}
                        icon={FileText}
                        className="app-interactive h-full"
                    />
                </Link>
                <Link href={route('admin.students.index')} className="block">
                    <KpiCard
                        label="Étudiants"
                        value={stats.students}
                        icon={Users}
                        className="app-interactive h-full"
                    />
                </Link>
                <Link href={route('admin.departments.index')} className="block">
                    <KpiCard
                        label="Mentions"
                        value={stats.departments}
                        icon={Building2}
                        className="app-interactive h-full"
                    />
                </Link>
                <Link href={route('admin.testimonies.index')} className="block">
                    <KpiCard
                        label="Témoignages"
                        value={stats.testimonies}
                        icon={MessageSquare}
                        className="app-interactive h-full"
                    />
                </Link>
            </KpiRow>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="admin-section-title">
                                Rythme de publication
                            </CardTitle>
                            <CardDescription>
                                {stats.published} en ligne · {stats.drafts}{' '}
                                brouillon(s)
                            </CardDescription>
                        </div>

                        <Tabs
                            value={range}
                            onValueChange={(value) =>
                                setRange(value as '3' | '6')
                            }
                        >
                            <TabsList>
                                <TabsTrigger value="3">3 mois</TabsTrigger>
                                <TabsTrigger value="6">6 mois</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>

                    <CardContent>
                        <ChartContainer
                            config={chartConfig}
                            className="h-[240px] w-full"
                        >
                            <AreaChart
                                data={visibleActivity}
                                margin={{ left: -20, right: 8, top: 8 }}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    stroke="var(--border)"
                                    strokeOpacity={0.6}
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    stroke="var(--muted-foreground)"
                                    fontSize={11}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    width={40}
                                    stroke="var(--muted-foreground)"
                                    fontSize={11}
                                />
                                <ChartTooltip
                                    content={<ChartTooltipContent />}
                                />
                                <Area
                                    dataKey="total"
                                    type="monotone"
                                    stroke="var(--color-total)"
                                    strokeWidth={2}
                                    fill="var(--color-total)"
                                    fillOpacity={0.1}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="admin-section-title">
                            Répartition
                        </CardTitle>
                        <CardDescription>Publications par type</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {byType.map((row) => {
                            const max = Math.max(
                                1,
                                ...byType.map((r) => r.total),
                            );
                            return (
                                <div key={row.type} className="space-y-1.5">
                                    <div className="flex items-baseline justify-between text-sm">
                                        <span>{row.type}</span>
                                        <span className="admin-mono text-foreground">
                                            {row.total}
                                        </span>
                                    </div>
                                    <div className="bg-muted h-1.5 w-full overflow-hidden">
                                        <div
                                            className="bg-foreground h-full"
                                            style={{
                                                width: `${(row.total / max) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {stats.scheduled > 0 ? (
                            <p className="admin-meta border-border border-t pt-4">
                                {stats.scheduled} publication(s) programmée(s)
                                en attente de mise en ligne.
                            </p>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="admin-section-title">
                                Publications récentes
                            </CardTitle>
                            <CardDescription>
                                Les six dernières, tous statuts confondus
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('admin.posts.index')}>
                                Tout voir
                            </Link>
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {recentPosts.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="Aucune publication"
                                description="Rédigez une première publication pour la voir apparaître ici."
                                action={
                                    <Button asChild size="sm" variant="outline">
                                        <Link
                                            href={route('admin.posts.create')}
                                        >
                                            <Plus className="size-4" />
                                            Nouvelle publication
                                        </Link>
                                    </Button>
                                }
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Titre</TableHead>
                                            <TableHead className="hidden sm:table-cell">
                                                Type
                                            </TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Date
                                            </TableHead>
                                            <TableHead className="w-10" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentPosts.map((post) => (
                                            <TableRow key={post.id}>
                                                <TableCell className="max-w-[22ch] truncate font-medium">
                                                    {post.title}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground hidden sm:table-cell">
                                                    {
                                                        POST_TYPE_LABELS[
                                                            post.type
                                                        ]
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {statusBadge(post)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground hidden md:table-cell">
                                                    {post.published_at
                                                        ? formatDate(
                                                              post.published_at,
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'admin.posts.edit',
                                                                post.id,
                                                            )}
                                                            aria-label="Modifier"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="admin-section-title">
                                Événements à venir
                            </CardTitle>
                            <CardDescription>
                                {stats.upcomingEvents} événement(s) programmé(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {upcomingEvents.length === 0 ? (
                                <EmptyState
                                    icon={CalendarX}
                                    title="Aucun événement à venir"
                                    description="Les événements programmés apparaîtront ici."
                                    className="py-10"
                                />
                            ) : (
                                upcomingEvents.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={route(
                                            'admin.posts.edit',
                                            event.id,
                                        )}
                                        className="border-border hover:bg-accent block border p-3"
                                    >
                                        <p className="truncate text-sm font-medium">
                                            {event.title}
                                        </p>
                                        <p className="admin-meta mt-1.5 flex items-center gap-1.5">
                                            <CalendarClock className="size-3.5" />
                                            {formatEventPeriod(event)}
                                        </p>
                                        {event.location ? (
                                            <p className="admin-meta mt-1 flex items-center gap-1.5">
                                                <MapPin className="size-3.5" />
                                                {event.location}
                                            </p>
                                        ) : null}
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Seul aplat fort du plan de travail : une surface
                        inversée, noire en clair et blanche en sombre. */}
                    <div className="app-panel-green flex flex-1 flex-col justify-between gap-6 p-5">
                        <p className="text-[15px] leading-snug font-medium">
                            Une annonce à faire ? Elle apparaît sur la page
                            d'accueil dès sa mise en ligne.
                        </p>
                        <Link
                            href={route('admin.posts.create')}
                            className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 hover:opacity-80"
                        >
                            Rédiger une publication
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
