import { PageTitle, StatusBadge } from '@/components/admin/primitives';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ExternalLink,
    FileText,
    Loader2,
    Mail,
    MailWarning,
} from 'lucide-react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { STATUS_TONE } from './status';

interface Document {
    id: number;
    type: string;
    label: string;
    original_name: string;
    mime_type: string;
    size: number;
}

interface Application {
    id: number;
    reference: string;
    type_label: string;
    status: string;
    status_label: string;
    full_name: string;
    last_name: string;
    first_name: string;
    gender: string;
    nationality: string;
    birth_date: string;
    birth_place: string;
    phone: string;
    email: string;
    religion: string | null;
    bac_year: number;
    bac_series: string;
    bac_number: string;
    bac_mention: string;
    level: string;
    mention_name: string;
    student_number: string | null;
    previous_level: string | null;
    parent1_name: string | null;
    parent1_phone: string | null;
    parent2_name: string | null;
    parent2_phone: string | null;
    admin_note: string | null;
    submitted_at: string | null;
    receipt_sent_at: string | null;
    documents: Document[];
    missing_documents: string[];
}

interface Props {
    application: Application;
    options: { statuses: { value: string; label: string }[] };
}

const GENDERS: Record<string, string> = { M: 'Masculin', F: 'Féminin' };

const BAC_MENTIONS: Record<string, string> = {
    passable: 'Passable',
    assez_bien: 'Assez bien',
    bien: 'Bien',
    tres_bien: 'Très bien',
};

const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
        ? `${Math.round(bytes / 1024)} Ko`
        : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          })
        : '—';

const Row = ({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) => (
    <div className="border-border flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 border-b py-2.5 last:border-b-0">
        <dt className="admin-label">{label}</dt>
        <dd className="text-foreground text-right text-sm font-medium">
            {value === null || value === undefined || value === ''
                ? '—'
                : value}
        </dd>
    </div>
);

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
    <Card className="py-0">
        <CardContent className="p-5">
            <h2 className="admin-section-title">{title}</h2>
            <dl className="mt-3">{children}</dl>
        </CardContent>
    </Card>
);

/**
 * Dossier complet d'une demande.
 *
 * Tout ce que le candidat a déclaré, les pièces qu'il a jointes, et le seul
 * levier de l'administration : le statut, accompagné d'une note d'instruction.
 * Les pièces ne sont jamais servies en direct — chaque lien passe par la route
 * d'administration, qui lit le disque privé après contrôle des droits.
 */
export default function ApplicationShow({ application, options }: Props) {
    const { data, setData, put, processing } = useForm({
        status: application.status,
        admin_note: application.admin_note ?? '',
    });

    const save = (event: React.FormEvent) => {
        event.preventDefault();

        put(route('admin.applications.status', application.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Statut mis à jour'),
        });
    };

    const resend = () =>
        router.post(
            route('admin.applications.receipt', application.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Accusé de réception renvoyé'),
                onError: () => toast.error('Envoi impossible'),
            },
        );

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    label: 'Candidatures',
                    href: route('admin.applications.index'),
                },
                { label: application.reference },
            ]}
            actions={
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        router.visit(route('admin.applications.index'))
                    }
                >
                    <ArrowLeft className="size-4" />
                    Retour
                </Button>
            }
        >
            <Head title={`Demande ${application.reference}`} />

            <PageTitle
                title={application.full_name}
                description={`${application.reference} — ${application.type_label}`}
                actions={
                    <StatusBadge
                        tone={STATUS_TONE[application.status] ?? 'neutral'}
                    >
                        {application.status_label}
                    </StatusBadge>
                }
            />

            {/* Dossier incomplet : le signal le plus utile de l'écran. */}
            {application.missing_documents.length > 0 && (
                <Card className="border-destructive/50 py-0">
                    <CardContent className="flex items-start gap-3 p-4">
                        <AlertTriangle
                            className="text-destructive mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-foreground text-sm font-medium">
                                Dossier incomplet
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Pièces manquantes :{' '}
                                {application.missing_documents.join(', ')}.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
                <div className="space-y-5">
                    <Block title="Informations personnelles">
                        <Row label="Nom" value={application.last_name} />
                        <Row label="Prénom" value={application.first_name} />
                        <Row
                            label="Sexe"
                            value={
                                GENDERS[application.gender] ??
                                application.gender
                            }
                        />
                        <Row
                            label="Nationalité"
                            value={application.nationality}
                        />
                        <Row
                            label="Date de naissance"
                            value={formatDate(application.birth_date)}
                        />
                        <Row
                            label="Lieu de naissance"
                            value={application.birth_place}
                        />
                        <Row label="Téléphone" value={application.phone} />
                        <Row label="Adresse e-mail" value={application.email} />
                        <Row label="Religion" value={application.religion} />
                    </Block>

                    <Block title="Baccalauréat">
                        <Row
                            label="Année d’obtention"
                            value={application.bac_year}
                        />
                        <Row label="Série" value={application.bac_series} />
                        <Row label="Numéro" value={application.bac_number} />
                        <Row
                            label="Mention"
                            value={
                                BAC_MENTIONS[application.bac_mention] ??
                                application.bac_mention
                            }
                        />
                    </Block>

                    <Block title="Inscription demandée">
                        <Row
                            label="Type de demande"
                            value={application.type_label}
                        />
                        <Row label="Niveau" value={application.level} />
                        <Row label="Mention" value={application.mention_name} />
                        <Row
                            label="Numéro matricule"
                            value={application.student_number}
                        />
                        <Row
                            label="Niveau précédent"
                            value={application.previous_level}
                        />
                    </Block>

                    <Block title="Parents">
                        <Row
                            label="Parent 1"
                            value={application.parent1_name}
                        />
                        <Row
                            label="Téléphone 1"
                            value={application.parent1_phone}
                        />
                        <Row
                            label="Parent 2"
                            value={application.parent2_name}
                        />
                        <Row
                            label="Téléphone 2"
                            value={application.parent2_phone}
                        />
                    </Block>
                </div>

                <div className="space-y-5">
                    {/* Instruction */}
                    <Card className="py-0">
                        <CardContent className="p-5">
                            <h2 className="admin-section-title">
                                Instruction du dossier
                            </h2>

                            <form onSubmit={save} className="mt-4 space-y-4">
                                <div>
                                    <label
                                        htmlFor="status"
                                        className="admin-label"
                                    >
                                        Statut
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(event) =>
                                            setData(
                                                'status',
                                                event.target.value,
                                            )
                                        }
                                        className="border-border bg-background text-foreground mt-1.5 h-9 w-full border px-3 text-sm"
                                    >
                                        {options.statuses.map((status) => (
                                            <option
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="admin_note"
                                        className="admin-label"
                                    >
                                        Note interne
                                    </label>
                                    <Textarea
                                        id="admin_note"
                                        rows={4}
                                        value={data.admin_note}
                                        placeholder="Pièce illisible, rendez-vous fixé, dossier retiré…"
                                        onChange={(event) =>
                                            setData(
                                                'admin_note',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-1.5"
                                    />
                                    <p className="admin-meta mt-1.5">
                                        Visible de l’administration seule ; le
                                        candidat n’en reçoit rien.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    Enregistrer
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Pièces justificatives */}
                    <Card className="py-0">
                        <CardContent className="p-5">
                            <h2 className="admin-section-title">
                                Pièces justificatives
                            </h2>

                            {application.documents.length === 0 ? (
                                <p className="text-muted-foreground mt-3 text-sm">
                                    Aucune pièce jointe à cette demande.
                                </p>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {application.documents.map((document) => (
                                        <li
                                            key={document.id}
                                            className="border-border flex items-center gap-3 border p-3"
                                        >
                                            <FileText
                                                className="text-muted-foreground size-4 shrink-0"
                                                aria-hidden="true"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="text-foreground text-sm font-medium">
                                                    {document.label}
                                                </p>
                                                <p className="admin-meta truncate">
                                                    {document.original_name} —{' '}
                                                    {formatSize(document.size)}
                                                </p>
                                            </div>

                                            {/* Lien direct plutôt qu'une visite
                                                Inertia : la réponse est un
                                                fichier, pas une page. */}
                                            <a
                                                href={route(
                                                    'admin.applications.document',
                                                    [
                                                        application.id,
                                                        document.id,
                                                    ],
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center"
                                                aria-label={`Ouvrir « ${document.label} »`}
                                            >
                                                <ExternalLink className="size-4" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Accusé de réception */}
                    <Card className="py-0">
                        <CardContent className="p-5">
                            <h2 className="admin-section-title">
                                Accusé de réception
                            </h2>

                            <p className="text-muted-foreground mt-3 flex items-start gap-2 text-sm">
                                {application.receipt_sent_at ? (
                                    <>
                                        <Mail
                                            className="mt-0.5 size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                        <span>
                                            Envoyé à {application.email} le{' '}
                                            {formatDate(
                                                application.receipt_sent_at,
                                            )}
                                            .
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <MailWarning
                                            className="text-destructive mt-0.5 size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                        <span>
                                            Jamais envoyé. Le dépôt a bien été
                                            enregistré, mais le courrier n’est
                                            pas parti.
                                        </span>
                                    </>
                                )}
                            </p>

                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={resend}
                            >
                                <Mail className="size-4" />
                                {application.receipt_sent_at
                                    ? 'Renvoyer'
                                    : 'Envoyer'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="py-0">
                        <CardContent className="p-5">
                            <h2 className="admin-section-title">Dépôt</h2>
                            <dl className="mt-3">
                                <Row
                                    label="Numéro de demande"
                                    value={application.reference}
                                />
                                <Row
                                    label="Déposée le"
                                    value={formatDate(application.submitted_at)}
                                />
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
