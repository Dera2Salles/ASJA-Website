import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { classes, mentions } from '@/core/types';
import { Field, FieldGrid } from './form-card';

/**
 * Triplet mention / niveau / branche, partagé par les trois formulaires qui
 * ciblent une audience. La branche reste désactivée tant que la mention n'est
 * pas choisie, et pour les niveaux qui n'en ont pas.
 */
export const AudienceSelects = ({
    mention,
    level,
    branche,
    onMentionChange,
    onLevelChange,
    onBrancheChange,
    /** L1 et L2 sont en tronc commun : la branche n'a pas de sens. */
    brancheDisabledForBaseLevels = false,
}: {
    mention: string;
    level: string;
    branche?: string;
    onMentionChange: (value: string) => void;
    onLevelChange: (value: string) => void;
    onBrancheChange: (value: string) => void;
    brancheDisabledForBaseLevels?: boolean;
}) => {
    const brancheOptions =
        mention && mentions[mention]?.[level] ? mentions[mention][level] : [];

    const brancheDisabled =
        !mention ||
        (brancheDisabledForBaseLevels && (level === 'L1' || level === 'L2'));

    return (
        <FieldGrid>
            <Field label="Mention">
                <Select value={mention} onValueChange={onMentionChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(mentions).map((item) => (
                            <SelectItem key={item} value={item}>
                                {item.replace(/_/g, ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Niveau">
                <Select value={level} onValueChange={onLevelChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map((item) => (
                            <SelectItem key={item} value={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Branche">
                <Select
                    value={branche}
                    onValueChange={onBrancheChange}
                    disabled={brancheDisabled}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                        {brancheOptions.map((item) => (
                            <SelectItem key={item} value={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
        </FieldGrid>
    );
};
