import { MentionCardList } from '../components/mention-list-card';
import { ChartPie } from '../components/pie-chart';

export const Dashboard = () => {
    return (
        <div className="flex h-full w-full flex-col bg-white p-4 transition-all duration-500 dark:bg-zinc-800">
            <div className="flex justify-around gap-5">
                <MentionCardList />
                <ChartPie />
            </div>
        </div>
    );
};
