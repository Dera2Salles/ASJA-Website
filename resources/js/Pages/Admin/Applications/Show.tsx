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
    Hourglass,
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
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    full_name: string;
    /** Le nom, ou le matricule d'une réinscription, qui n'en déclare pas. */
    display_name: string;

    /* Tout ce qui suit n'est déclaré qu'en première inscription : une
       réinscription ne redonne ni état civil, ni CIN, ni baccalauréat, ni
       parents — ils figurent déjà au dossier de l'étudiant. */
    last_name: string | null;
    first_name: string | null;
    gender: string | null;
    nationality: string | null;
    birth_date: string | null;
    birth_place: string | null;
    phone: string | null;
    email: string;
    marital_status: string | null;
    marital_status_label: string | null;
    religion: string | null;
    religion_label: string | null;
    cin_number: string | null;
    cin_issued_place: string | null;
    cin_issued_at: string | null;
    cin_duplicate_at: string | null;
    spouse_cin_number: string | null;
    bac_year: number | null;
    bac_series: string | null;
    bac_number: string | null;
    bac_mention: string | null;
    level: string | null;
    mention_name: string | null;
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

    /* Suivi du dossier : ce que l'administration a réclamé au candidat, et ce
       qu'il a renvoyé depuis. */
    requested_documents: string[] | null;
    requested_fields: string[] | null;
    completion_message: string | null;
    completion_requested_at: string | null;
    completed_at: string | null;
    fees_receipt_at: string | null;

    /** Le bordereau des frais généraux est-il attendu à cette étape ? */
    awaits_fees_receipt: boolean;
    /** Nature de ce bordereau, ou `null` pour un type qui n'en doit pas. */
    fees_receipt_type: string | null;
}

interface Choice {
    value: string;
    label: string;
}

interface Props {
    application: Application;
    options: {
        statuses: Choice[];
        /** Pièces du dépôt qu'un dossier « à compléter » peut faire redéposer. */
        requestableDocuments: Choice[];
        /** Champs déclarés que ce même dossier peut rouvrir à la correction. */
        requestableFields: Choice[];
        /** Valeur du statut « à compléter », pour ne pas l'écrire en dur ici. */
        incompleteStatus: string;
    };
}

/** Miroir de `Application::TYPE_REINSCRIPTION`. */
const REINSCRIPTION = 'reinscription';

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

const formatDate = (value: string | null | undefined) =>
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

/**
 * Liste à cocher de ce qui est réclamé au candidat.
 *
 * Les entrées viennent du serveur, filtrées par le type de demande : proposer
 * ici une pièce qu'une réinscription ne dépose pas ferait promettre au candidat
 * un formulaire que la validation refuserait.
 */
const CheckList = ({
    legend,
    empty,
    choices,
    selected,
    disabled,
    onToggle,
}: {
    legend: string;
    empty: string;
    choices: Choice[];
    selected: string[];
    disabled: boolean;
    onToggle: (value: string) => void;
}) => (
    <fieldset>
        <legend className="admin-label">{legend}</legend>

        {choices.length === 0 ? (
            <p className="admin-meta mt-1.5">{empty}</p>
        ) : (
            <div className="mt-1.5 space-y-1.5">
                {choices.map((choice) => (
                    <label
                        key={choice.value}
                        className="text-foreground flex cursor-pointer items-start gap-2 text-sm"
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(choice.value)}
                            disabled={disabled}
                            onChange={() => onToggle(choice.value)}
                            className="accent-primary mt-0.5 size-4 shrink-0"
                        />
                        <span>{choice.label}</span>
                    </label>
                ))}
            </div>
        )}
    </fieldset>
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
    const isReinscription = application.type === REINSCRIPTION;

    const { data, setData, put, processing, errors } = useForm({
        status: application.status,
        admin_note: application.admin_note ?? '',
        completion_message: application.completion_message ?? '',
        requested_documents: application.requested_documents ?? [],
        requested_fields: application.requested_fields ?? [],
    });

    /* Le statut « à compléter » est le seul qui ouvre quelque chose au
       candidat : c'est donc le seul où l'écran demande *quoi* lui rouvrir. */
    const requesting = data.status === options.incompleteStatus;

    /** Coche ou décoche un élément réclamé, sans toucher au reste de la liste. */
    const toggle = (
        field: 'requested_documents' | 'requested_fields',
        value: string,
    ) =>
        setData(
            field,
            data[field].includes(value)
                ? data[field].filter((entry) => entry !== value)
                : [...data[field], value],
        );

    /* Une réclamation est en cours tant que le dossier est « à compléter » et
       que quelque chose y est effectivement demandé. */
    const requestedDocuments = application.requested_documents ?? [];
    const requestedFields = application.requested_fields ?? [];

    const pendingRequest =
        application.status === options.incompleteStatus &&
        (requestedDocuments.length > 0 || requestedFields.length > 0);

    const labelsOf = (values: string[], choices: Choice[]) =>
        values
            .map(
                (value) =>
                    choices.find((choice) => choice.value === value)?.label ??
                    value,
            )
            .join(', ');

    const requestedSummary = [
        requestedDocuments.length > 0
            ? `Pièces : ${labelsOf(requestedDocuments, options.requestableDocuments)}.`
            : null,
        requestedFields.length > 0
            ? `Informations : ${labelsOf(requestedFields, options.requestableFields)}.`
            : null,
    ]
        .filter(Boolean)
        .join(' ');

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
                title={application.display_name}
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

            {/* Ce que le dossier attend du candidat, en une ligne : c'est la
                question que se pose l'instructeur avant toute autre. */}
            {(pendingRequest || application.awaits_fees_receipt) && (
                <Card className="border-primary/50 py-0">
                    <CardContent className="flex items-start gap-3 p-4">
                        <Hourglass
                            className="text-primary mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                        />
                        <div className="min-w-0">
                            <p className="text-foreground text-sm font-medium">
                                {pendingRequest
                                    ? 'En attente du complément du candidat'
                                    : 'En attente du bordereau des frais généraux'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {pendingRequest
                                    ? `Réclamé le ${formatDate(application.completion_requested_at)}. ${requestedSummary}`
                                    : 'Le dossier est validé : le candidat peut déposer son bordereau depuis la page de suivi.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
                <div className="space-y-5">
                    {/* Une réinscription ne déclare que son matricule et son
                        adresse : afficher quatre blocs de tirets ferait croire
                        à un dossier incomplet. */}
                    {isReinscription ? (
                        <Card className="py-0">
                            <CardContent className="p-5">
                                <h2 className="admin-section-title">
                                    Identification
                                </h2>
                                <dl className="mt-3">
                                    <Row
                                        label="Numéro matricule"
                                        value={application.student_number}
                                    />
                                    <Row
                                        label="Adresse e-mail"
                                        value={application.email}
                                    />
                                </dl>
                                <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                                    État civil, carte d’identité, baccalauréat
                                    et parents figurent au dossier de première
                                    inscription de l’étudiant : la réinscription
                                    ne les redemande pas.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Block title="Informations personnelles">
                                <Row
                                    label="Nom"
                                    value={application.last_name}
                                />
                                <Row
                                    label="Prénom"
                                    value={application.first_name}
                                />
                                <Row
                                    label="Sexe"
                                    value={
                                        application.gender
                                            ? (GENDERS[application.gender] ??
                                              application.gender)
                                            : null
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
                                <Row
                                    label="Téléphone"
                                    value={application.phone}
                                />
                                <Row
                                    label="Adresse e-mail"
                                    value={application.email}
                                />
                                <Row
                                    label="Situation matrimoniale"
                                    value={application.marital_status_label}
                                />
                                {/* `religion_label` porte déjà la précision saisie
                            quand « Autre » a été retenu. */}
                                <Row
                                    label="Religion"
                                    value={application.religion_label}
                                />
                            </Block>

                            <Block title="Carte d’identité nationale">
                                <Row
                                    label="Numéro de CIN"
                                    value={application.cin_number}
                                />
                                <Row
                                    label="Fait à"
                                    value={application.cin_issued_place}
                                />
                                <Row
                                    label="Date de délivrance"
                                    value={formatDate(
                                        application.cin_issued_at,
                                    )}
                                />
                                <Row
                                    label="Date du duplicata"
                                    value={
                                        application.cin_duplicate_at
                                            ? formatDate(
                                                  application.cin_duplicate_at,
                                              )
                                            : null
                                    }
                                />
                                <Row
                                    label="CIN du conjoint"
                                    value={application.spouse_cin_number}
                                />
                            </Block>

                            <Block title="Baccalauréat">
                                <Row
                                    label="Année d’obtention"
                                    value={application.bac_year}
                                />
                                <Row
                                    label="Série"
                                    value={application.bac_series}
                                />
                                <Row
                                    label="Numéro"
                                    value={application.bac_number}
                                />
                                <Row
                                    label="Mention"
                                    value={
                                        application.bac_mention
                                            ? (BAC_MENTIONS[
                                                  application.bac_mention
                                              ] ?? application.bac_mention)
                                            : null
                                    }
                                />
                            </Block>

                            <Block title="Inscription demandée">
                                <Row
                                    label="Type de demande"
                                    value={application.type_label}
                                />
                                <Row label="Niveau" value={application.level} />
                                <Row
                                    label="Mention"
                                    value={application.mention_name}
                                />
                            </Block>

                            {/* Les colonnes restent `parent1_*`/`parent2_*` —
                                elles portent des dossiers déjà déposés — mais
                                le premier parent est le père, le second la
                                mère. */}
                            <Block title="Parents">
                                <Row
                                    label="Père"
                                    value={application.parent1_name}
                                />
                                <Row
                                    label="Téléphone du père"
                                    value={application.parent1_phone}
                                />
                                <Row
                                    label="Mère"
                                    value={application.parent2_name}
                                />
                                <Row
                                    label="Téléphone de la mère"
                                    value={application.parent2_phone}
                                />
                            </Block>
                        </>
                    )}
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

                                {/* Ce que le candidat pourra rouvrir. Visible
                                    au seul statut qui lui ouvre quelque chose :
                                    ailleurs, ces listes sont vidées à
                                    l'enregistrement. */}
                                {requesting && (
                                    <div className="border-border space-y-4 border-l-2 py-1 pl-4">
                                        <p className="admin-meta">
                                            Le candidat ne reverra que ce qui
                                            est coché ici, et recevra un e-mail
                                            avec le lien vers son dossier.
                                        </p>

                                        <CheckList
                                            legend="Pièces à fournir de nouveau"
                                            empty="Aucune pièce n’est déposée pour ce type de demande."
                                            choices={
                                                options.requestableDocuments
                                            }
                                            selected={data.requested_documents}
                                            disabled={processing}
                                            onToggle={(value) =>
                                                toggle(
                                                    'requested_documents',
                                                    value,
                                                )
                                            }
                                        />

                                        <CheckList
                                            legend="Informations à corriger"
                                            empty="Aucun champ n’est déclaré pour ce type de demande."
                                            choices={options.requestableFields}
                                            selected={data.requested_fields}
                                            disabled={processing}
                                            onToggle={(value) =>
                                                toggle(
                                                    'requested_fields',
                                                    value,
                                                )
                                            }
                                        />

                                        <div>
                                            <label
                                                htmlFor="completion_message"
                                                className="admin-label"
                                            >
                                                Message au candidat
                                            </label>
                                            <Textarea
                                                id="completion_message"
                                                rows={4}
                                                value={data.completion_message}
                                                placeholder="Votre photocopie de CIN est illisible : merci d’en redéposer une version nette, recto et verso."
                                                onChange={(event) =>
                                                    setData(
                                                        'completion_message',
                                                        event.target.value,
                                                    )
                                                }
                                                className="mt-1.5"
                                            />
                                            <p className="admin-meta mt-1.5">
                                                Repris tel quel dans l’e-mail et
                                                sur la page de suivi :
                                                écrivez-le pour le candidat.
                                            </p>
                                        </div>

                                        {errors.requested_documents && (
                                            <p
                                                role="alert"
                                                className="text-destructive text-sm font-medium"
                                            >
                                                {errors.requested_documents}
                                            </p>
                                        )}
                                    </div>
                                )}

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

                                {/* Les dates du suivi n'apparaissent que si
                                    l'étape a eu lieu : une ligne « — » ne dirait
                                    rien de plus que son absence. */}
                                {application.completion_requested_at && (
                                    <Row
                                        label="Complément réclamé le"
                                        value={formatDate(
                                            application.completion_requested_at,
                                        )}
                                    />
                                )}
                                {application.completed_at && (
                                    <Row
                                        label="Complété par le candidat le"
                                        value={formatDate(
                                            application.completed_at,
                                        )}
                                    />
                                )}
                                {application.fees_receipt_at && (
                                    <Row
                                        label="Bordereau des frais généraux reçu le"
                                        value={formatDate(
                                            application.fees_receipt_at,
                                        )}
                                    />
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
