import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';
import { AudienceSelects } from './audience-selects';
import { Field, FormCard } from './form-card';
import { UploadAndViewImage } from './upload-view-image';

export const CardAddPost = () => {
    const {
        setMention,
        setLevel,
        level,
        setBranche,
        mention,
        branche,
        sendPost,
        setDescription,
        setPostTitle,
        description,
        postTitle,
        handleImageChange,
        image,
    } = useAdminDashboardContext();

    const { closeAddPost } = useModalContext();

    return (
        <FormCard
            title="Nouvelle annonce"
            description="Rédigez l'annonce et choisissez ses destinataires."
            onClose={closeAddPost}
            footer={
                <>
                    <Button variant="outline" size="sm" onClick={closeAddPost}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={sendPost}>
                        Publier
                    </Button>
                </>
            }
        >
            <form className="space-y-5">
                <Field label="Titre" htmlFor="post-title">
                    <Input
                        id="post-title"
                        placeholder="Reprise des cours"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                    />
                </Field>

                <Field label="Message" htmlFor="post-description">
                    <Textarea
                        id="post-description"
                        rows={6}
                        placeholder="Écrivez votre annonce…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Field>

                <Field label="Illustration" hint="Optionnelle, au ratio 16/9.">
                    <UploadAndViewImage
                        image={image as string}
                        onCallBack={handleImageChange}
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
                    brancheDisabledForBaseLevels
                />
            </form>
        </FormCard>
    );
};
