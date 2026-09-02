import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';
import { AudienceSelects } from './audience-selects';
import FilePicker from './file-picker';
import { Field, FormCard } from './form-card';

export const CardAddDoc = () => {
    const {
        setLessonTitle,
        sendToServer,
        setMention,
        setLevel,
        level,
        setBranche,
        mention,
        branche,
    } = useAdminDashboardContext();

    const { closeAddDoc } = useModalContext();

    return (
        <FormCard
            title="Ajouter un document"
            description="Déposez un support et choisissez à qui il s'adresse."
            onClose={closeAddDoc}
            footer={
                <>
                    <Button variant="outline" size="sm" onClick={closeAddDoc}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={sendToServer}>
                        Ajouter le document
                    </Button>
                </>
            }
        >
            <form className="space-y-5">
                <Field label="Titre" htmlFor="doc-title">
                    <Input
                        id="doc-title"
                        placeholder="Algorithmique — chapitre 1"
                        onChange={(e) => setLessonTitle(e.target.value)}
                    />
                </Field>

                <Separator />

                <AudienceSelects
                    mention={mention}
                    level={level}
                    branche={branche}
                    onMentionChange={setMention}
                    onLevelChange={setLevel}
                    onBrancheChange={setBranche}
                />

                <Separator />

                <Field label="Fichier">
                    <FilePicker />
                </Field>
            </form>
        </FormCard>
    );
};
