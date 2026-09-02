import { KpiCard, KpiRow } from '@/components/admin/primitives';
import type { MentionDto } from '@/features/mention/mention.dto';
import { GraduationCap, Layers, TrendingUp, Users } from 'lucide-react';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { MentionCardList } from '../components/mention-list-card';
import { PageHeader, Panel, PanelBody, PanelHead } from '../components/panel';
import { ChartPie } from '../components/pie-chart';

const MENTION_KEYS: (keyof MentionDto)[] = [
    'DROIT',
    'INFORMATIQUE',
    'ECONOMIE',
    'AGRONOMIE',
    'LANGUE_ET_CULTURE',
    'SCIENCE_DE_LA_TERRE',
];

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];

/**
 * Les indicateurs sont dérivés des effectifs réellement chargés : aucun
 * chiffre n'est inventé, et les cartes restent vides tant que les données
 * ne sont pas arrivées.
 */
const useDashboardStats = (mentionData?: MentionDto) => {
    const totals = MENTION_KEYS.map(
        (key) => mentionData?.[key]?.totalStudent ?? 0,
    );
    const totalStudents = totals.reduce((sum, value) => sum + value, 0);

    const activeMentions = totals.filter((value) => value > 0).length;

    const perLevel = LEVELS.map((level, index) => ({
        level,
        count: MENTION_KEYS.reduce(
            (sum, key) =>
                sum + (mentionData?.[key]?.data[index]?.studentNumber ?? 0),
            0,
        ),
    }));

    const busiestLevel = perLevel.reduce(
        (best, current) => (current.count > best.count ? current : best),
        { level: '—', count: 0 },
    );

    const largestIndex = totals.indexOf(Math.max(...totals));
    const largestMention =
        totalStudents > 0
            ? String(MENTION_KEYS[largestIndex]).replace(/_/g, ' ')
            : '—';

    return { totalStudents, activeMentions, busiestLevel, largestMention };
};

export const Dashboard = () => {
    const { mentionData } = useAdminDashboardContext();
    const { totalStudents, activeMentions, busiestLevel, largestMention } =
        useDashboardStats(mentionData);

    return (
        <div className="space-y-6 p-4 md:p-6">
            <PageHeader
                title="Statistiques"
                description="Répartition des étudiants par mention et par niveau"
            />

            <KpiRow>
                <KpiCard
                    label="Étudiants inscrits"
                    value={totalStudents.toLocaleString('fr-FR')}
                    icon={Users}
                />
                <KpiCard
                    label="Mentions actives"
                    value={activeMentions}
                    icon={Layers}
                />
                <KpiCard
                    label="Niveau le plus fourni"
                    value={busiestLevel.level}
                    icon={GraduationCap}
                />
                <KpiCard
                    label="Mention la plus fournie"
                    value={
                        <span className="text-lg leading-8 font-semibold">
                            {largestMention}
                        </span>
                    }
                    icon={TrendingUp}
                />
            </KpiRow>

            {/* La grille des mentions occupe l'essentiel ; la répartition
                globale tient dans un panneau étroit à droite au-delà de
                1280px, et repasse sous la grille en dessous. */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
                <MentionCardList />

                <Panel className="h-fit">
                    <PanelHead
                        title="Répartition globale"
                        description="Tous niveaux confondus"
                    />
                    <PanelBody>
                        <ChartPie />
                    </PanelBody>
                </Panel>
            </div>
        </div>
    );
};
