import { Badge } from '@/components/ui/badge';
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
    Building2,
    CalendarClock,
    FileText,
    MapPin,
    MessageSquare,
    Pencil,
    Plus,
    Users,
} from 'lucide-react';
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

const chartConfig = {
    total: { label: 'Publications', color: 'var(--chart-1)' },
} satisfies ChartConfig;

/** Statut réel d'une publication, programmation comprise. */
function statusBadge(post: Post) {
    if (!post.published_at) {
        return <Badge variant="secondary">Brouillon</Badge>;
    }
    if (new Date(post.published_at) > new Date()) {
        return <Badge variant="outline">Programmée</Badge>;
    }
    return <Badge>En ligne</Badge>;
}

const StatCard = ({
    label,
    value,
    hint,
    icon: Icon,
    href,
}: {
    label: string;
    value: number;
    hint?: string;
    icon: React.ElementType;
    href: string;
}) => (
    <Link href={href} className="block">
        <Card className="app-interactive h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                <div className="space-y-1">
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">
                        {value}
                    </CardTitle>
                </div>
                <div className="bg-accent text-accent-foreground rounded-lg p-2.5">
                    <Icon className="size-5" />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-xs">{hint ?? ' '}</p>
            </CardContent>
        </Card>
    </Link>
);

export default function DashboardPage({
    stats,
    byType,
    activity,
    recentPosts,
    upcomingEvents,
}: Props) {
    const { auth } = usePage<PageProps>().props;

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
                <h1 className="text-2xl font-semibold tracking-tight">
                    Bonjour, {auth.user.name}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Voici l'état du site aujourd'hui.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Publications"
                    value={stats.posts}
                    hint={`${stats.published} en ligne · ${stats.drafts} brouillon(s)`}
                    icon={FileText}
                    href={route('admin.posts.index')}
                />
                <StatCard
                    label="Étudiants"
                    value={stats.students}
                    hint="Comptes étudiants enregistrés"
                    icon={Users}
                    href={route('admin.students.index')}
                />
                <StatCard
                    label="Mentions"
                    value={stats.departments}
                    hint="Filières publiées sur le site"
                    icon={Building2}
                    href={route('admin.departments.index')}
                />
                <StatCard
                    label="Témoignages"
                    value={stats.testimonies}
                    hint="Affichés sur la page d'accueil"
                    icon={MessageSquare}
                    href={route('admin.testimonies.index')}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Rythme de publication</CardTitle>
                        <CardDescription>
                            Publications créées sur les six derniers mois
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={chartConfig}
                            className="h-[240px] w-full"
                        >
                            <AreaChart
                                data={activity}
                                margin={{ left: -20, right: 8, top: 8 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="fillTotal"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-total)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-total)"
                                            stopOpacity={0.02}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    width={40}
                                />
                                <ChartTooltip
                                    content={<ChartTooltipContent />}
                                />
                                <Area
                                    dataKey="total"
                                    type="monotone"
                                    stroke="var(--color-total)"
                                    strokeWidth={2}
                                    fill="url(#fillTotal)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Répartition</CardTitle>
                        <CardDescription>Publications par type</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {byType.map((row) => {
                            const max = Math.max(
                                1,
                                ...byType.map((r) => r.total),
                            );
                            return (
                                <div key={row.type} className="space-y-1.5">
                                    <div className="flex items-baseline justify-between text-sm">
                                        <span className="font-medium">
                                            {row.type}
                                        </span>
                                        <span className="text-muted-foreground tabular-nums">
                                            {row.total}
                                        </span>
                                    </div>
                                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                        <div
                                            className="bg-primary h-full rounded-full transition-[width] duration-500"
                                            style={{
                                                width: `${(row.total / max) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {stats.scheduled > 0 ? (
                            <p className="text-muted-foreground border-t pt-4 text-xs">
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
                            <CardTitle>Publications récentes</CardTitle>
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
                            <p className="text-muted-foreground py-8 text-center text-sm">
                                Aucune publication pour le moment.
                            </p>
                        ) : (
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
                                                {POST_TYPE_LABELS[post.type]}
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
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Événements à venir</CardTitle>
                        <CardDescription>
                            {stats.upcomingEvents} événement(s) programmé(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {upcomingEvents.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                Aucun événement à venir.
                            </p>
                        ) : (
                            upcomingEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={route('admin.posts.edit', event.id)}
                                    className="hover:bg-accent block rounded-lg border p-3"
                                >
                                    <p className="truncate text-sm font-medium">
                                        {event.title}
                                    </p>
                                    <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
                                        <CalendarClock className="size-3.5" />
                                        {formatEventPeriod(event)}
                                    </p>
                                    {event.location ? (
                                        <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                                            <MapPin className="size-3.5" />
                                            {event.location}
                                        </p>
                                    ) : null}
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
