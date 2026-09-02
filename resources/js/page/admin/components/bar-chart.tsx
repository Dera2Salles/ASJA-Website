import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { Mention } from '@/core/types';
import type { MentionDto } from '@/features/mention/mention.dto';

/**
 * Répartition d'une mention par niveau. Le graphique est monochrome : la
 * barre reprend `--chart-1`, la grille reste un filet très léger, et aucune
 * couleur ne distingue une mention d'une autre.
 */
export const BarChartGraph = ({
    mention,
    item,
}: {
    mention: Mention;
    item: MentionDto;
}) => {
    const key = mention.replace(/ /g, '_') as keyof MentionDto;

    const chartData = ['L1', 'L2', 'L3', 'M1', 'M2'].map((niveau, index) => ({
        Niveau: niveau,
        Etudiant: item?.[key]?.data[index]?.studentNumber ?? 0,
    }));

    const fakeData = [
        { Niveau: 'L1', Etudiant: 324 },
        { Niveau: 'L2', Etudiant: 100 },
        { Niveau: 'L3', Etudiant: 43 },
        { Niveau: 'M1', Etudiant: 12 },
        { Niveau: 'M2', Etudiant: 90 },
    ];

    const data = item ? chartData : fakeData;

    const chartConfig = {
        Etudiant: {
            label: 'Étudiants',
            color: 'var(--chart-1)',
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.6}
                />
                <XAxis
                    dataKey="Niveau"
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                />
                <ChartTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={<ChartTooltipContent />}
                />
                <Bar
                    dataKey="Etudiant"
                    fill="var(--color-Etudiant)"
                    radius={2}
                />
            </BarChart>
        </ChartContainer>
    );
};
