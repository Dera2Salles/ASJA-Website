import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { useAdminDashboardContext } from '../bloc/useAdminContext';
import { useModalContext } from '../bloc/useModalContext';
import { AudienceSelects } from './audience-selects';
import { AvatarUploader } from './avatar-uploader';
import { Field, FormCard } from './form-card';

const TRANCHES = ['1re tranche', '2e tranche', '3e tranche'] as const;

export const CardInputUser = () => {
    const {
        setMention,
        setLevel,
        level,
        setBranche,
        mention,
        setName,
        branche,
        setLastName,
        setPassword,
        setContact,
        sendStudentInformation,
        handleImageChange,
        image,
        isPremierPaid,
        isDeuxiemePaid,
        isTroisiemePaid,
        setIsPremierPaid,
        setIsDeuxiemePaid,
        setIsTroisiemePaid,
        name,
        lastName,
        contact,
        password,
    } = useAdminDashboardContext();

    const { closeAddUser } = useModalContext();

    const trancheState = [
        { checked: isPremierPaid, toggle: setIsPremierPaid },
        { checked: isDeuxiemePaid, toggle: setIsDeuxiemePaid },
        { checked: isTroisiemePaid, toggle: setIsTroisiemePaid },
    ];

    return (
        <FormCard
            title="Ajouter un étudiant"
            description="Renseignez l'identité, l'affectation et les tranches réglées."
            onClose={closeAddUser}
            footer={
                <>
                    <Button variant="outline" size="sm" onClick={closeAddUser}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={sendStudentInformation}>
                        Ajouter l'étudiant
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
                    <Field label="Nom" htmlFor="student-name">
                        <Input
                            id="student-name"
                            placeholder="RAKOTO"
                            onChange={(e) => setName(e.target.value)}
                            value={name.toLocaleUpperCase()}
                        />
                    </Field>

                    <Field label="Prénom" htmlFor="student-lastname">
                        <Input
                            id="student-lastname"
                            placeholder="Jean"
                            onChange={(e) => setLastName(e.target.value)}
                            value={lastName}
                        />
                    </Field>

                    <Field label="Contact" htmlFor="student-contact">
                        <Input
                            id="student-contact"
                            type="tel"
                            inputMode="tel"
                            placeholder="034 00 000 00"
                            onChange={(e) => setContact(e.target.value)}
                            value={contact}
                        />
                    </Field>

                    <Field
                        label="Mot de passe"
                        htmlFor="student-password"
                        hint="Communiqué à l'étudiant pour sa première connexion."
                    >
                        <Input
                            id="student-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                <Separator />

                <fieldset className="space-y-3">
                    <legend className="admin-label mb-2">
                        Tranches réglées
                    </legend>
                    <div className="flex flex-wrap gap-5">
                        {TRANCHES.map((label, index) => (
                            <label
                                key={label}
                                className="flex cursor-pointer items-center gap-2 text-sm"
                            >
                                <Checkbox
                                    checked={trancheState[index].checked}
                                    onCheckedChange={() =>
                                        trancheState[index].toggle(
                                            (value) => !value,
                                        )
                                    }
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </fieldset>
            </form>
        </FormCard>
    );
};
