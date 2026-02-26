import { Card, CardContent } from '@/components/ui/card';
import type { Mention } from '@/core/types';
import type { MentionDto } from '@/features/mention/mention.dto';
import { MdPerson2 } from 'react-icons/md';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { BarChartGraph } from './bar-chart';

const MentionCart = ({
    className,
    mention,
    color,
    item,
    totalStudent,
}: {
    className: string;
    mention: Mention;
    color: string;
    item: MentionDto;
    totalStudent: number;
}) => {
    return (
        <Card
            className={` ${className} flex h-85 w-2/7 cursor-pointer items-center justify-center p-5 text-2xl font-semibold text-black transition-all duration-500 dark:bg-transparent dark:text-white`}
        >
            <CardContent className="flex h-full w-full flex-col justify-center wrap-anywhere">
                <p className="text-start text-3xl">{mention}</p>
                <p className="my-5 flex items-center gap-2 text-start text-lg">
                    {' '}
                    <MdPerson2 className="text-2xl text-gray-400" />
                    {totalStudent} etudiants
                </p>
                <BarChartGraph color={color} item={item} mention={mention} />
            </CardContent>
        </Card>
    );
};

export const MentionCardList = () => {
    const { mentionData } = useAdminDashboardContext();
    return (
        <div className="flex w-full flex-row flex-wrap items-center justify-center gap-5 bg-transparent py-10 transition-all duration-500">
            {' '}
            <MentionCart
                item={mentionData as MentionDto}
                totalStudent={mentionData?.DROIT.totalStudent as number}
                mention="DROIT"
                className="border-4 border-red-600"
                color="#dc2626"
            />
            <MentionCart
                item={mentionData as MentionDto}
                totalStudent={mentionData?.INFORMATIQUE.totalStudent as number}
                mention="INFORMATIQUE"
                className="border-4 border-violet-600"
                color="#7c3aed"
            />
            <MentionCart
                item={mentionData as MentionDto}
                totalStudent={mentionData?.ECONOMIE.totalStudent as number}
                mention="ECONOMIE"
                className="border-4 border-yellow-600"
                color="#d97706"
            />
            <MentionCart
                item={mentionData as MentionDto}
                totalStudent={mentionData?.AGRONOMIE.totalStudent as number}
                mention="AGRONOMIE"
                className="border-4 border-green-600"
                color="#059669"
            />
            <MentionCart
                item={mentionData as MentionDto}
                totalStudent={
                    mentionData?.LANGUE_ET_CULTURE.totalStudent as number
                }
                mention="LANGUE ET CULTURE"
                className="border-4 border-blue-600"
                color="#2563eb"
            />
            <MentionCart
                item={mentionData as MentionDto}
                totalStudent={
                    mentionData?.SCIENCE_DE_LA_TERRE.totalStudent as number
                }
                mention="SCIENCE DE LA TERRE"
                className="border-4 border-gray-600"
                color="#4b5563"
            />
        </div>
    );
};
