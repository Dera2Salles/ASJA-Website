import type { Mention } from '@/core/types';
import type { MentionDto } from '@/features/mention/mention.dto';
import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { BarChartGraph } from './bar-chart';
import { Panel, PanelBody, PanelHead } from './panel';

/**
 * Une mention par carte : libellé discret en en-tête, effectif en gros
 * chiffre, répartition par niveau en dessous. Plus de bordure colorée ni de
 * pastille de couleur — les six cartes forment une grille homogène.
 */
const MentionCard = ({
    mention,
    item,
    totalStudent,
}: {
    mention: Mention;
    item: MentionDto;
    totalStudent: number;
}) => (
    <Panel className="app-card-interactive flex flex-col">
        <PanelHead title={mention} />
        <PanelBody className="flex flex-1 flex-col gap-4">
            <div className="flex items-baseline gap-2">
                <span className="admin-figure">{totalStudent ?? 0}</span>
                <span className="text-muted-foreground text-sm">étudiants</span>
            </div>
            <div className="h-36">
                <BarChartGraph item={item} mention={mention} />
            </div>
        </PanelBody>
    </Panel>
);

const MENTIONS: { key: keyof MentionDto; label: Mention }[] = [
    { key: 'DROIT', label: 'DROIT' },
    { key: 'INFORMATIQUE', label: 'INFORMATIQUE' },
    { key: 'ECONOMIE', label: 'ECONOMIE' },
    { key: 'AGRONOMIE', label: 'AGRONOMIE' },
    { key: 'LANGUE_ET_CULTURE', label: 'LANGUE ET CULTURE' as Mention },
    { key: 'SCIENCE_DE_LA_TERRE', label: 'SCIENCE DE LA TERRE' as Mention },
];

export const MentionCardList = () => {
    const { mentionData } = useAdminDashboardContext();
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MENTIONS.map(({ key, label }) => (
                <MentionCard
                    key={key}
                    item={mentionData as MentionDto}
                    totalStudent={mentionData?.[key]?.totalStudent as number}
                    mention={label}
                />
            ))}
        </div>
    );
};
