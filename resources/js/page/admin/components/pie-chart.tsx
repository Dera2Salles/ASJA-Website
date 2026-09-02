'use client';

import { Cell, Pie, PieChart } from 'recharts';

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { useAdminDashboardContext } from '../bloc/useAdminContext';

/**
 * Répartition globale des étudiants. Les parts sont distinguées par une rampe
 * de gris — de `--chart-1` à `--chart-5` — et non par des teintes de marque :
 * la charte interdit toute couleur saturée sur une grande surface.
 */
const SLICE_FILLS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--muted-foreground)',
];

export const ChartPie = () => {
    const { mentionData } = useAdminDashboardContext();

    const item = [
        { Mention: 'DROIT', Etudiant: mentionData?.DROIT.totalStudent },
        {
            Mention: 'INFORMATIQUE',
            Etudiant: mentionData?.INFORMATIQUE.totalStudent,
        },
        { Mention: 'ECONOMIE', Etudiant: mentionData?.ECONOMIE.totalStudent },
        { Mention: 'AGRONOMIE', Etudiant: mentionData?.AGRONOMIE.totalStudent },
        {
            Mention: 'LEA',
            Etudiant: mentionData?.LANGUE_ET_CULTURE.totalStudent,
        },
        {
            Mention: 'ST',
            Etudiant: mentionData?.SCIENCE_DE_LA_TERRE.totalStudent,
        },
    ];

    const fakeData = [
        { Mention: 'DROIT', Etudiant: 275 },
        { Mention: 'INFORMATIQUE', Etudiant: 200 },
        { Mention: 'ECONOMIE', Etudiant: 187 },
        { Mention: 'AGRONOMIE', Etudiant: 173 },
        { Mention: 'LEA', Etudiant: 90 },
        { Mention: 'ST', Etudiant: 90 },
    ];

    const chartData = mentionData ? item : fakeData;

    const chartConfig = {
        Etudiant: { label: 'Étudiants' },
        DROIT: { label: 'Droit' },
        INFORMATIQUE: { label: 'Informatique' },
        ECONOMIE: { label: 'Économie' },
        AGRONOMIE: { label: 'Agronomie' },
        LEA: { label: 'Langue étrangère appliquée' },
        ST: { label: 'Science de la Terre' },
    } satisfies ChartConfig;

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[260px]"
        >
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="Etudiant" nameKey="Mention">
                    {chartData.map((entry, index) => (
                        <Cell
                            key={entry.Mention}
                            fill={SLICE_FILLS[index % SLICE_FILLS.length]}
                            stroke="var(--background)"
                            strokeWidth={1}
                        />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
};
