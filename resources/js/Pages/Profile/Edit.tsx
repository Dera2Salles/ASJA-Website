import { PageTitle } from '@/components/admin/primitives';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { ShieldCheck, Trash2, User as UserIcon } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

/**
 * Bloc de réglage : en-tête sous un filet, contenu en dessous. Le même
 * gabarit que les autres écrans de l'administration, pour que le profil ne
 * soit pas la seule page à parler une autre langue.
 */
const SettingsCard = ({
    icon: Icon,
    title,
    description,
    children,
    tone = 'neutral',
}: {
    icon: ElementType;
    title: string;
    description: string;
    children: ReactNode;
    /** `danger` ne teinte que le titre — jamais la surface. */
    tone?: 'neutral' | 'danger';
}) => (
    <Card className="gap-0 p-0">
        <header className="border-border flex items-start gap-3 border-b px-5 py-4">
            <Icon
                className={
                    tone === 'danger'
                        ? 'text-destructive mt-0.5 size-4 shrink-0'
                        : 'text-muted-foreground mt-0.5 size-4 shrink-0'
                }
                aria-hidden="true"
            />
            <div className="min-w-0">
                <h2
                    className={
                        tone === 'danger'
                            ? 'admin-section-title text-destructive'
                            : 'admin-section-title'
                    }
                >
                    {title}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    {description}
                </p>
            </div>
        </header>

        <div className="px-5 py-5">{children}</div>
    </Card>
);

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AdminLayout breadcrumbs={[{ label: 'Mon profil' }]}>
            <Head title="Mon profil" />

            <PageTitle
                title="Mon profil"
                description="Vos informations de compte et vos réglages de connexion."
            />

            <div className="grid max-w-3xl gap-4">
                <SettingsCard
                    icon={UserIcon}
                    title="Informations personnelles"
                    description="Le nom et l'adresse e-mail associés à votre compte."
                >
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </SettingsCard>

                <SettingsCard
                    icon={ShieldCheck}
                    title="Mot de passe"
                    description="Un mot de passe long et unique protège l'ensemble du site."
                >
                    <UpdatePasswordForm />
                </SettingsCard>

                <SettingsCard
                    icon={Trash2}
                    tone="danger"
                    title="Supprimer le compte"
                    description="La suppression est définitive : rien n'est conservé."
                >
                    <DeleteUserForm />
                </SettingsCard>
            </div>
        </AdminLayout>
    );
}
