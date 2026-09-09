import { CmsProvider, type CmsContent } from '@/lib/cms';
import type { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Send,
    Upload,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { ThemeProvider } from '../../page/theme/useThemeProvider';
import { extensionOf, formatSize } from './validation';

/** Une pièce que l'administration réclame, ou qu'elle attend à cette étape. */
interface DocumentRequest {
    type: string;
    label: string;
    hint: string;
    extensions: string[];
}

/** De quoi dessiner un champ rouvert à la correction (voir `FIELD_SPECS`). */
interface FieldSpec {
    name: string;
    label: string;
    input: string;
    options: { value: string; label: string }[] | null;
}

interface TimelineStep {
    key: string;
    label: string;
    description: string;
    /** `done`, `current`, `todo`, `rejected` ou `blocked` — décidé par le serveur. */
    state: string;
}

interface FollowUpApplication {
    reference: string;
    display_name: string;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    email: string;
    level: string | null;
    mention_name: string | null;
    student_number: string | null;
    submitted_at: string | null;
    completed_at: string | null;
    fees_receipt_at: string | null;
    timeline: TimelineStep[];
    /** Seule action ouverte : `complete`, `fees`, ou aucune. */
    action: 'complete' | 'fees' | null;
    completion_message: string | null;
    requested_documents: DocumentRequest[];
    requested_fields: FieldSpec[];
    values: Record<string, string>;
    documents: {
        type: string;
        label: string;
        original_name: string;
        received_at: string | null;
    }[];
    fees: {
        document: DocumentRequest;
        amount: string | null;
        account: { bank: string; holder: string; number: string };
        received: boolean;
    } | null;
    maxFileSizeKb: number;
}

interface Props {
    application: FollowUpApplication;
    cms: CmsContent;
}

/**
 * Données du formulaire de complétion : les champs rouverts, dont on n'apprend
 * les noms qu'à l'exécution, et les pièces réclamées. La forme est donc décrite
 * par un index plutôt que champ par champ — c'est le serveur qui dit lesquels
 * existent, et lui seul qui les validera.
 */
type CompletionData = Record<string, string | Record<string, File | null>>;

const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          })
        : null;

/**
 * Contrôle d'un fichier au moment où il est choisi : format et poids, les deux
 * seules choses vérifiables sans quitter le navigateur. Le serveur revérifie
 * l'un et l'autre, et lit en plus le contenu réel du fichier — c'est lui qui
 * fait foi, ceci n'épargne qu'un aller-retour.
 */
const fileError = (
    file: File,
    extensions: string[],
    maxKb: number,
): string | undefined => {
    if (!extensions.includes(extensionOf(file.name))) {
        return `Format non accepté. Formats autorisés : ${extensions
            .join(', ')
            .toUpperCase()}.`;
    }

    if (file.size > maxKb * 1024) {
        return `Fichier trop volumineux (${formatSize(file.size)}). Maximum : ${Math.round(
            maxKb / 1024,
        )} Mo.`;
    }

    return undefined;
};

const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="border-border flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t py-3">
        <dt className="text-muted-foreground text-[12px] font-bold tracking-[0.12em] uppercase">
            {label}
        </dt>
        <dd className="text-foreground text-right text-[15px] font-semibold">
            {value?.trim() ? value : '—'}
        </dd>
    </div>
);

/**
 * Le parcours du dossier, du dépôt à la finalisation.
 *
 * L'état de chaque étape est décidé côté serveur : l'écran ne déduit rien d'un
 * statut qu'il interpréterait à sa façon, il affiche ce qui lui est dit.
 */
const Timeline = ({ steps }: { steps: TimelineStep[] }) => (
    <ol className="space-y-1">
        {steps.map((step) => {
            const done = step.state === 'done';
            const current = step.state === 'current';
            const rejected = step.state === 'rejected';

            return (
                <li key={step.key}>
                    <div
                        className={`flex items-start gap-3 border-l-2 py-3 pl-4 ${
                            current || rejected
                                ? rejected
                                    ? 'border-destructive'
                                    : 'border-primary'
                                : 'border-border'
                        }`}
                    >
                        <span
                            className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center border ${
                                done
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : rejected
                                      ? 'border-destructive text-destructive'
                                      : current
                                        ? 'border-primary text-primary'
                                        : 'border-border text-muted-foreground'
                            }`}
                        >
                            {done ? (
                                <Check size={13} />
                            ) : rejected ? (
                                <XCircle size={13} />
                            ) : current ? (
                                <Clock size={13} />
                            ) : (
                                <span className="size-1.5 bg-current" />
                            )}
                        </span>

                        <span className="min-w-0">
                            <span
                                className={`block text-[14.5px] leading-snug font-semibold ${
                                    step.state === 'todo' ||
                                    step.state === 'blocked'
                                        ? 'text-muted-foreground'
                                        : 'text-foreground'
                                }`}
                            >
                                {step.label}
                            </span>
                            <span className="text-muted-foreground mt-0.5 block text-[13px] leading-relaxed">
                                {step.description}
                            </span>
                        </span>
                    </div>
                </li>
            );
        })}
    </ol>
);

/**
 * Choix d'un fichier, pour une pièce réclamée.
 *
 * Le fichier reste dans le navigateur jusqu'à l'envoi : rien ne part sur un
 * simple choix de fichier, ici pas plus qu'au dépôt initial.
 */
const FilePicker = ({
    id,
    spec,
    file,
    error,
    maxFileSizeKb,
    disabled,
    onChange,
}: {
    id: string;
    spec: DocumentRequest;
    file: File | null;
    error?: string;
    maxFileSizeKb: number;
    disabled: boolean;
    onChange: (file: File | null) => void;
}) => {
    const [localError, setLocalError] = useState<string | undefined>();

    const select = (chosen: File | undefined) => {
        if (!chosen) return;

        const message = fileError(chosen, spec.extensions, maxFileSizeKb);
        setLocalError(message);

        // Un fichier refusé ne remplace pas celui déjà choisi.
        if (!message) onChange(chosen);
    };

    const shown = localError ?? error;

    return (
        <div
            className={`border p-4 sm:p-5 ${
                shown
                    ? 'border-destructive/60 bg-destructive/5'
                    : file
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border bg-card'
            }`}
        >
            <p className="text-foreground text-[15px] font-semibold">
                {spec.label}
            </p>
            <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">
                {spec.hint}
            </p>
            <p className="text-muted-foreground mt-2 text-[12px]">
                Formats acceptés : {spec.extensions.join(', ').toUpperCase()} —
                taille maximale : {Math.round(maxFileSizeKb / 1024)} Mo.
            </p>

            <input
                id={id}
                type="file"
                className="sr-only"
                disabled={disabled}
                accept={spec.extensions
                    .map((extension) => `.${extension}`)
                    .join(',')}
                onChange={(event) => select(event.target.files?.[0])}
            />

            {file ? (
                <div className="border-border bg-background mt-4 flex flex-wrap items-center gap-3 border p-3">
                    <FileText
                        className="text-muted-foreground size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-[14px] font-semibold">
                            {file.name}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[12px] font-semibold">
                            {formatSize(file.size)} · Prêt à être envoyé
                        </p>
                    </div>
                    <label
                        htmlFor={id}
                        className="border-border text-foreground hover:border-primary hover:text-primary inline-flex h-9 cursor-pointer items-center gap-1.5 border px-3 text-[12.5px] font-semibold"
                    >
                        Remplacer
                    </label>
                </div>
            ) : (
                <label
                    htmlFor={id}
                    className="border-border hover:border-primary/60 mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-7 text-center transition-colors"
                >
                    <Upload
                        className="text-muted-foreground size-5"
                        aria-hidden="true"
                    />
                    <span className="text-foreground text-[13.5px] font-semibold">
                        Choisir un fichier
                    </span>
                </label>
            )}

            {shown && (
                <p
                    role="alert"
                    className="text-destructive mt-2 text-[13px] font-semibold"
                >
                    {shown}
                </p>
            )}
        </div>
    );
};

/**
 * Suivi d'un dossier déposé, et dépôts qui viennent après lui.
 *
 * La page ne décide de rien : le serveur a déjà dit quelle action est ouverte
 * — compléter le dossier, transmettre le bordereau des frais généraux, ou
 * simplement attendre — et l'écran s'y règle. Il revérifie de toute façon à
 * chaque envoi : un formulaire laissé ouvert dans un onglet ne doit pas pouvoir
 * déposer une pièce sur un dossier qui n'en attend plus.
 */
export default function ApplicationFollowUp({ application, cms }: Props) {
    const page = usePage<PageProps>();

    const completing = application.action === 'complete';
    const payingFees = application.action === 'fees';

    /* Deux formulaires distincts plutôt qu'un seul à géométrie variable : ils
       n'envoient ni au même endroit, ni les mêmes données, et jamais tous les
       deux — le dossier n'est pas à la fois à compléter et validé. */
    const completion = useForm<CompletionData>({
        ...application.values,
        documents: Object.fromEntries(
            application.requested_documents.map((document) => [
                document.type,
                null,
            ]),
        ),
    });

    const fees = useForm<{ document: File | null }>({ document: null });

    const [missing, setMissing] = useState<string | undefined>();

    const completionErrors = completion.errors as unknown as Record<
        string,
        string
    >;

    const chosenFiles = completion.data.documents as Record<
        string,
        File | null
    >;

    const submitCompletion = (event: React.FormEvent) => {
        event.preventDefault();
        if (completion.processing) return;

        /* Une pièce réclamée et non jointe partirait en 422 : autant le dire
           tout de suite, le serveur la refuserait de toute façon. */
        const absent = application.requested_documents.filter(
            (document) => !chosenFiles[document.type],
        );

        if (absent.length > 0) {
            setMissing(
                `Joignez ${absent.length > 1 ? 'les pièces suivantes' : 'la pièce suivante'} : ${absent
                    .map((document) => document.label)
                    .join(', ')}.`,
            );
            return;
        }

        setMissing(undefined);

        completion.post(
            route('candidature.suivi.complete', application.reference),
            { forceFormData: true },
        );
    };

    const submitFees = (event: React.FormEvent) => {
        event.preventDefault();
        if (fees.processing) return;

        if (!fees.data.document) {
            setMissing(
                'Choisissez le fichier de votre bordereau de versement.',
            );
            return;
        }

        setMissing(undefined);

        fees.post(route('candidature.suivi.fees', application.reference), {
            forceFormData: true,
        });
    };

    /** Un champ rouvert à la correction, dessiné d'après sa description. */
    const renderField = (spec: FieldSpec) => {
        const value = (completion.data[spec.name] as string) ?? '';
        const error = completionErrors[spec.name];
        const className = `bg-background text-foreground mt-2 h-12 w-full border px-3 text-[15px] ${
            error ? 'border-destructive' : 'border-border focus:border-primary'
        }`;

        return (
            <div key={spec.name}>
                <label
                    htmlFor={`field-${spec.name}`}
                    className="text-foreground block text-[13px] font-bold tracking-[0.1em] uppercase"
                >
                    {spec.label}
                </label>

                {spec.options ? (
                    <select
                        id={`field-${spec.name}`}
                        value={value}
                        disabled={completion.processing}
                        onChange={(event) =>
                            completion.setData(spec.name, event.target.value)
                        }
                        className={className}
                    >
                        <option value="">Choisir…</option>
                        {spec.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        id={`field-${spec.name}`}
                        type={spec.input}
                        value={value}
                        disabled={completion.processing}
                        onChange={(event) =>
                            completion.setData(spec.name, event.target.value)
                        }
                        className={className}
                    />
                )}

                {error && (
                    <p
                        role="alert"
                        className="text-destructive mt-2 text-[13px] font-semibold"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    };

    /**
     * Ce que le dossier dit au candidat quand il n'a rien à faire.
     *
     * Chaque statut a sa phrase : « rien à faire » sans explication laisse
     * croire à une page cassée.
     */
    const idleMessage = () => {
        if (application.status === 'rejected') {
            return {
                tone: 'danger' as const,
                title: 'Votre demande n’a pas été retenue',
                body: 'Le bureau de la scolarité peut vous en indiquer les motifs et les suites possibles.',
            };
        }

        if (application.status === 'fees_submitted') {
            return {
                tone: 'success' as const,
                title: 'Votre bordereau a bien été reçu',
                body: 'Le service de la scolarité vérifie votre versement. Vous n’avez plus rien à déposer en ligne.',
            };
        }

        if (application.status === 'finalized') {
            return {
                tone: 'success' as const,
                title: 'Votre inscription est finalisée',
                body: 'Votre dossier est complet et enregistré par le bureau de la scolarité.',
            };
        }

        if (application.status === 'accepted') {
            return {
                tone: 'success' as const,
                title: 'Votre dossier a été validé',
                body: 'Présentez-vous au bureau de la scolarité avec vos documents originaux pour finaliser votre inscription.',
            };
        }

        return {
            tone: 'neutral' as const,
            title:
                application.status === 'processing'
                    ? 'Votre dossier est en cours d’examen'
                    : 'Votre demande a bien été soumise',
            body: 'Aucune action n’est attendue de votre part pour l’instant. Vous serez prévenu par e-mail si le service de la scolarité a besoin d’un complément.',
        };
    };

    const idle = idleMessage();
    const processing = completion.processing || fees.processing;

    return (
        <CmsProvider content={cms}>
            <ThemeProvider>
                <Head title={`Dossier ${application.reference} — ASJA`} />

                <div className="square-corners flex min-h-screen flex-col overflow-x-clip">
                    <Navbar />

                    <main className="flex-1">
                        <section className="band-light pt-14 pb-12 sm:pt-16 sm:pb-14">
                            <div className="section-shell">
                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="eyebrow"
                                >
                                    Suivi de dossier
                                </motion.p>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.08 }}
                                    className="font-display text-foreground mt-3 leading-[0.98] font-black tracking-[-0.03em] uppercase"
                                    style={{
                                        fontSize: 'clamp(28px, 6vw, 52px)',
                                    }}
                                >
                                    {application.reference}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.16 }}
                                    className="text-muted-foreground mt-4 max-w-2xl text-[15px] leading-relaxed"
                                >
                                    {application.display_name} —{' '}
                                    {application.type_label}. Statut actuel :{' '}
                                    <strong className="text-foreground">
                                        {application.status_label}
                                    </strong>
                                    .
                                </motion.p>
                            </div>
                        </section>

                        <section className="band-light section-rhythm">
                            <div className="section-shell">
                                {/* Retour d'une action : le message vient du
                                    serveur, jamais d'une supposition de l'écran. */}
                                {page.props.flash?.success && (
                                    <p
                                        role="status"
                                        className="border-primary/60 bg-primary/5 text-foreground mb-8 flex items-start gap-2 border p-4 text-[14px] font-semibold"
                                    >
                                        <CheckCircle2
                                            size={16}
                                            className="text-primary mt-0.5 shrink-0"
                                        />
                                        {page.props.flash.success}
                                    </p>
                                )}

                                {page.props.flash?.error && (
                                    <p
                                        role="alert"
                                        className="border-destructive/60 bg-destructive/5 text-destructive mb-8 flex items-start gap-2 border p-4 text-[14px] font-semibold"
                                    >
                                        <AlertCircle
                                            size={16}
                                            className="mt-0.5 shrink-0"
                                        />
                                        {page.props.flash.error}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
                                    <div>
                                        {/* ── Action attendue, ou son absence ── */}
                                        {completing && (
                                            <form
                                                onSubmit={submitCompletion}
                                                noValidate
                                                className="border-primary/50 bg-primary/5 border p-6 sm:p-7"
                                            >
                                                <h2 className="text-foreground text-[17px] font-bold">
                                                    Votre dossier doit être
                                                    complété
                                                </h2>
                                                <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
                                                    Vous n’avez pas à refaire
                                                    votre candidature : seuls
                                                    les éléments ci-dessous vous
                                                    sont demandés. Tout le reste
                                                    de votre dossier est
                                                    conservé.
                                                </p>

                                                {application.completion_message && (
                                                    <p className="border-border bg-background text-foreground mt-4 border p-4 text-[14px] leading-relaxed whitespace-pre-line">
                                                        {
                                                            application.completion_message
                                                        }
                                                    </p>
                                                )}

                                                {application.requested_fields
                                                    .length > 0 && (
                                                    <div className="mt-6">
                                                        <h3 className="text-muted-foreground text-[12px] font-bold tracking-[0.14em] uppercase">
                                                            Informations à
                                                            corriger
                                                        </h3>
                                                        <div className="mt-4 grid gap-5 sm:grid-cols-2">
                                                            {application.requested_fields.map(
                                                                renderField,
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {application.requested_documents
                                                    .length > 0 && (
                                                    <div className="mt-6">
                                                        <h3 className="text-muted-foreground text-[12px] font-bold tracking-[0.14em] uppercase">
                                                            Pièces à fournir de
                                                            nouveau
                                                        </h3>
                                                        <div className="mt-4 space-y-4">
                                                            {application.requested_documents.map(
                                                                (document) => (
                                                                    <FilePicker
                                                                        key={
                                                                            document.type
                                                                        }
                                                                        id={`document-${document.type}`}
                                                                        spec={
                                                                            document
                                                                        }
                                                                        file={
                                                                            chosenFiles[
                                                                                document
                                                                                    .type
                                                                            ]
                                                                        }
                                                                        error={
                                                                            completionErrors[
                                                                                `documents.${document.type}`
                                                                            ]
                                                                        }
                                                                        maxFileSizeKb={
                                                                            application.maxFileSizeKb
                                                                        }
                                                                        disabled={
                                                                            completion.processing
                                                                        }
                                                                        onChange={(
                                                                            file,
                                                                        ) =>
                                                                            completion.setData(
                                                                                'documents',
                                                                                {
                                                                                    ...chosenFiles,
                                                                                    [document.type]:
                                                                                        file,
                                                                                },
                                                                            )
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {missing && (
                                                    <p
                                                        role="alert"
                                                        className="border-destructive/60 bg-destructive/5 text-destructive mt-5 flex items-start gap-2 border p-4 text-[13.5px] font-semibold"
                                                    >
                                                        <AlertCircle
                                                            size={16}
                                                            className="mt-0.5 shrink-0"
                                                        />
                                                        {missing}
                                                    </p>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        completion.processing
                                                    }
                                                    className="bg-primary text-primary-foreground mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-7 text-[14px] font-bold hover:bg-[#08542c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                                >
                                                    {completion.processing ? (
                                                        <>
                                                            <Loader2
                                                                size={15}
                                                                className="animate-spin"
                                                            />
                                                            Envoi en cours…
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={15} />
                                                            Envoyer mon
                                                            complément
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        )}

                                        {payingFees && application.fees && (
                                            <form
                                                onSubmit={submitFees}
                                                noValidate
                                                className="border-primary/50 bg-primary/5 border p-6 sm:p-7"
                                            >
                                                <h2 className="text-foreground text-[17px] font-bold">
                                                    Transmettez votre bordereau
                                                    de versement
                                                </h2>
                                                <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
                                                    Votre dossier est validé. Il
                                                    reste à verser les frais
                                                    généraux, puis à déposer ici
                                                    votre bordereau. Rien
                                                    d’autre ne vous est demandé.
                                                </p>

                                                <dl className="mt-5">
                                                    {application.fees
                                                        .amount && (
                                                        <Row
                                                            label="Montant à verser"
                                                            value={
                                                                application.fees
                                                                    .amount
                                                            }
                                                        />
                                                    )}
                                                    <Row
                                                        label="Banque"
                                                        value={`${application.fees.account.bank} — ${application.fees.account.holder}`}
                                                    />
                                                    <Row
                                                        label="Numéro de compte"
                                                        value={
                                                            application.fees
                                                                .account.number
                                                        }
                                                    />
                                                </dl>

                                                <div className="mt-6">
                                                    <FilePicker
                                                        id="fees-document"
                                                        spec={
                                                            application.fees
                                                                .document
                                                        }
                                                        file={
                                                            fees.data.document
                                                        }
                                                        error={
                                                            fees.errors.document
                                                        }
                                                        maxFileSizeKb={
                                                            application.maxFileSizeKb
                                                        }
                                                        disabled={
                                                            fees.processing
                                                        }
                                                        onChange={(file) =>
                                                            fees.setData(
                                                                'document',
                                                                file,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {missing && (
                                                    <p
                                                        role="alert"
                                                        className="border-destructive/60 bg-destructive/5 text-destructive mt-5 flex items-start gap-2 border p-4 text-[13.5px] font-semibold"
                                                    >
                                                        <AlertCircle
                                                            size={16}
                                                            className="mt-0.5 shrink-0"
                                                        />
                                                        {missing}
                                                    </p>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={fees.processing}
                                                    className="bg-primary text-primary-foreground mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-7 text-[14px] font-bold hover:bg-[#08542c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                                >
                                                    {fees.processing ? (
                                                        <>
                                                            <Loader2
                                                                size={15}
                                                                className="animate-spin"
                                                            />
                                                            Envoi en cours…
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={15} />
                                                            Envoyer mon
                                                            bordereau
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        )}

                                        {!completing && !payingFees && (
                                            <div
                                                className={`border p-6 sm:p-7 ${
                                                    idle.tone === 'danger'
                                                        ? 'border-destructive/50 bg-destructive/5'
                                                        : idle.tone ===
                                                            'success'
                                                          ? 'border-primary/50 bg-primary/5'
                                                          : 'border-border bg-card'
                                                }`}
                                            >
                                                <h2 className="text-foreground text-[17px] font-bold">
                                                    {idle.title}
                                                </h2>
                                                <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
                                                    {idle.body}
                                                </p>
                                            </div>
                                        )}

                                        {/* ── Le dossier, tel qu'il est enregistré ── */}
                                        <div className="mt-10">
                                            <h2 className="text-muted-foreground text-[12px] font-bold tracking-[0.14em] uppercase">
                                                Votre dossier
                                            </h2>
                                            <dl className="mt-3">
                                                <Row
                                                    label="Candidat"
                                                    value={
                                                        application.display_name
                                                    }
                                                />
                                                <Row
                                                    label="Type de demande"
                                                    value={
                                                        application.type_label
                                                    }
                                                />
                                                {application.student_number && (
                                                    <Row
                                                        label="Numéro matricule"
                                                        value={
                                                            application.student_number
                                                        }
                                                    />
                                                )}
                                                {application.level && (
                                                    <Row
                                                        label="Niveau"
                                                        value={
                                                            application.level
                                                        }
                                                    />
                                                )}
                                                {application.mention_name && (
                                                    <Row
                                                        label="Mention"
                                                        value={
                                                            application.mention_name
                                                        }
                                                    />
                                                )}
                                                <Row
                                                    label="Adresse e-mail"
                                                    value={application.email}
                                                />
                                                <Row
                                                    label="Déposé le"
                                                    value={formatDate(
                                                        application.submitted_at,
                                                    )}
                                                />
                                                {application.completed_at && (
                                                    <Row
                                                        label="Complété le"
                                                        value={formatDate(
                                                            application.completed_at,
                                                        )}
                                                    />
                                                )}
                                                {application.fees_receipt_at && (
                                                    <Row
                                                        label="Bordereau reçu le"
                                                        value={formatDate(
                                                            application.fees_receipt_at,
                                                        )}
                                                    />
                                                )}
                                            </dl>
                                        </div>

                                        {application.documents.length > 0 && (
                                            <div className="mt-10">
                                                <h2 className="text-muted-foreground text-[12px] font-bold tracking-[0.14em] uppercase">
                                                    Pièces reçues par
                                                    l’établissement
                                                </h2>
                                                <ul className="mt-3 space-y-2">
                                                    {application.documents.map(
                                                        (document) => (
                                                            <li
                                                                key={
                                                                    document.type
                                                                }
                                                                className="border-border flex items-start gap-3 border p-3"
                                                            >
                                                                <FileText
                                                                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                                                                    aria-hidden="true"
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className="text-foreground text-[14px] font-semibold">
                                                                        {
                                                                            document.label
                                                                        }
                                                                    </p>
                                                                    <p className="text-muted-foreground truncate text-[12.5px]">
                                                                        {
                                                                            document.original_name
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                                <p className="text-muted-foreground mt-3 text-[12.5px] leading-relaxed">
                                                    Vos pièces ne sont
                                                    consultables que par le
                                                    service de la scolarité.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <aside className="lg:sticky lg:top-24 lg:self-start">
                                        <h2 className="text-muted-foreground text-[12px] font-bold tracking-[0.14em] uppercase">
                                            Où en est votre dossier
                                        </h2>
                                        <div className="mt-4">
                                            <Timeline
                                                steps={application.timeline}
                                            />
                                        </div>

                                        {processing && (
                                            <p className="text-muted-foreground mt-6 flex items-center gap-2 text-[13px] font-semibold">
                                                <Loader2
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                                Envoi en cours, ne fermez pas
                                                cette page…
                                            </p>
                                        )}

                                        <div className="border-border mt-8 border-t pt-6">
                                            <p className="text-muted-foreground text-[13.5px] leading-relaxed">
                                                Une question sur votre dossier ?
                                                Le bureau de la scolarité vous
                                                répond du lundi au vendredi.
                                            </p>
                                            <Link
                                                href={route(
                                                    'candidature.suivi.create',
                                                )}
                                                className="text-primary hover:text-foreground mt-3 inline-flex items-center gap-2 text-[13.5px] font-semibold underline underline-offset-4"
                                            >
                                                Rechercher un autre dossier
                                                <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </aside>
                                </div>
                            </div>
                        </section>
                    </main>

                    <Footer />
                </div>
            </ThemeProvider>
        </CmsProvider>
    );
}
