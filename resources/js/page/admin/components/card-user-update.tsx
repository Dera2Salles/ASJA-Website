import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';
import { AudienceSelects } from './audience-selects';
import { AvatarUploader } from './avatar-uploader';
import { Field, FormCard } from './form-card';

export const CardUpdateUser = () => {
    const {
        setMention,
        setLevel,
        level,
        setBranche,
        mention,
        setName,
        branche,
        setLastName,
        setContact,
        updateUserInformation,
        handleImageChange,
        image,
        name,
        lastName,
        contact,
        setImage,
    } = useAdminDashboardContext();

    const { closeUpdateUser } = useModalContext();

    /* La fermeture vide le formulaire : sans cela, les valeurs du dernier
       étudiant modifié réapparaîtraient à l'ouverture suivante. */
    const close = () => {
        setName('');
        setLastName('');
        setContact('');
        setImage('');
        closeUpdateUser();
    };

    return (
        <FormCard
            title="Modifier l'étudiant"
            description="Mettez à jour l'identité et l'affectation."
            onClose={close}
            footer={
                <>
                    <Button variant="outline" size="sm" onClick={close}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={updateUserInformation}>
                        Enregistrer
                    </Button>
                </>
            }
        >
            <form className="space-y-5">
                <AvatarUploader
                    image={image as string}
                    onCallBack={handleImageChange}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Nom" htmlFor="update-name">
                        <Input
                            id="update-name"
                            onChange={(e) => setName(e.target.value)}
                            value={name.toLocaleUpperCase()}
                        />
                    </Field>

                    <Field label="Prénom" htmlFor="update-lastname">
                        <Input
                            id="update-lastname"
                            onChange={(e) => setLastName(e.target.value)}
                            value={lastName}
                        />
                    </Field>

                    <Field
                        label="Contact"
                        htmlFor="update-contact"
                        className="sm:col-span-2"
                    >
                        <Input
                            id="update-contact"
                            type="tel"
                            inputMode="tel"
                            onChange={(e) => setContact(e.target.value)}
                            value={contact}
                        />
                    </Field>
                </div>

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
