import { CmsProvider, type CmsContent } from '@/lib/cms';
import type { PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    Loader2,
    Save,
    Send,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { ThemeProvider } from '../../page/theme/useThemeProvider';
import { ChoiceField, SelectField, StepHeader, TextField } from './fields';
import { FileField, type UploadState } from './FileField';
import { Stepper, type Step } from './Stepper';
import { REINSCRIPTION, type ApplicationForm, type FormOptions } from './types';
import {
    firstInvalidStep,
    formatSize,
    requiredDocuments,
    STEP_FIELDS,
    validateStep,
    type Errors,
} from './validation';

interface Props {
    options: FormOptions;
    cms: CmsContent;
}

const STEPS: Step[] = [
    {
        title: 'Type de demande',
        short: 'Type de demande',
        description:
            'Indiquez si vous rejoignez l’ASJA pour la première fois ou si vous poursuivez votre cursus.',
    },
    {
        title: 'Informations personnelles',
        short: 'Informations personnelles',
        description:
            'Votre état civil, tel qu’il figure sur vos pièces officielles. L’adresse e-mail servira à vous envoyer l’accusé de réception.',
    },
    {
        title: 'Baccalauréat',
        short: 'Baccalauréat',
        description:
            'Les informations portées sur votre relevé de notes. Le relevé lui-même est à joindre à l’étape « Documents ».',
    },
    {
        title: 'Informations d’inscription',
        short: 'Inscription',
        description:
            'Le niveau et la mention dans lesquels vous souhaitez vous inscrire cette année.',
    },
    {
        title: 'Informations des parents',
        short: 'Parents',
        description:
            'Les personnes à contacter au sujet de votre scolarité. Le second parent est facultatif.',
    },
    {
        title: 'Documents justificatifs',
        short: 'Documents',
        description:
            'Les pièces sont conservées de façon confidentielle et ne sont consultables que par le service de la scolarité.',
    },
    {
        title: 'Récapitulatif',
        short: 'Récapitulatif',
        description:
            'Relisez votre dossier. Vous pouvez encore revenir sur chaque étape avant de l’envoyer.',
    },
];

const RECAP_STEP = STEPS.length - 1;

/** Clé du brouillon local — un candidat par navigateur. */
const DRAFT_KEY = 'asja.candidature.draft';

/**
 * Identifiant du dépôt.
 *
 * `crypto.randomUUID` n'existe pas hors contexte sécurisé (un site servi en
 * clair sur un réseau local, par exemple) : le repli engendre le même format,
 * la longueur étant contrôlée côté serveur.
 */
function newKey(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === 'x' ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}

const EMPTY_DOCUMENTS = {
    bac_transcript: null,
    cin: null,
    payment_receipt: null,
};

function blankForm(): ApplicationForm {
    return {
        idempotency_key: newKey(),
        type: '',
        last_name: '',
        first_name: '',
        gender: '',
        nationality: 'Malagasy',
        birth_date: '',
        birth_place: '',
        phone: '',
        email: '',
        religion: '',
        bac_year: '',
        bac_series: '',
        bac_number: '',
        bac_mention: '',
        level: '',
        mention: '',
        student_number: '',
        previous_level: '',
        parent1_name: '',
        parent1_phone: '',
        parent2_name: '',
        parent2_phone: '',
        documents: { ...EMPTY_DOCUMENTS },
    };
}

/**
 * Brouillon relu au chargement.
 *
 * Les pièces jointes en sont exclues : un `File` ne se sérialise pas, et le
 * navigateur n'autorise pas à en reconstruire un sans geste de l'utilisateur.
 * Le candidat les redésigne donc, ce que l'étape « Documents » lui indique.
 */
function readDraft(): Partial<ApplicationForm> | null {
    try {
        const stored = window.localStorage.getItem(DRAFT_KEY);
        return stored ? (JSON.parse(stored) as Partial<ApplicationForm>) : null;
    } catch {
        return null;
    }
}

function writeDraft(data: ApplicationForm): void {
    try {
        const { documents: _documents, ...rest } = data;
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch {
        /* Navigation privée, quota atteint : le brouillon est un confort,
           jamais une condition du dépôt. */
    }
}

function clearDraft(): void {
    try {
        window.localStorage.removeItem(DRAFT_KEY);
    } catch {
        /* idem */
    }
}

/** Une ligne du récapitulatif. */
const Recap = ({ label, value }: { label: string; value?: string }) => (
    <div className="border-border flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t py-3">
        <dt className="text-muted-foreground text-[12px] font-bold tracking-[0.12em] uppercase">
            {label}
        </dt>
        <dd className="text-foreground text-right text-[15px] font-semibold">
            {value?.trim() ? value : '—'}
        </dd>
    </div>
);

const RecapBlock = ({
    title,
    step,
    onEdit,
    children,
}: {
    title: string;
    step: number;
    onEdit: (step: number) => void;
    children: React.ReactNode;
}) => (
    <section className="border-border bg-card border p-5">
        <div className="flex items-center justify-between gap-3">
            <h3 className="text-foreground text-[15px] font-bold tracking-[0.06em] uppercase">
                {title}
            </h3>
            <button
                type="button"
                onClick={() => onEdit(step)}
                className="text-primary hover:text-foreground text-[13px] font-semibold underline underline-offset-4"
            >
                Modifier
            </button>
        </div>
        <dl className="mt-3">{children}</dl>
    </section>
);

/**
 * Dépôt d'une demande d'inscription ou de réinscription.
 *
 * Le dossier est découpé en sept étapes plutôt qu'en une page à dérouler :
 * chacune tient dans un écran, se valide seule, et le candidat sait toujours
 * où il en est. Rien ne part au serveur avant la dernière — l'envoi est unique,
 * pièces comprises.
 */
export default function ApplicationCreate({ options, cms }: Props) {
    const page = usePage<PageProps>();

    const [step, setStep] = useState(0);
    const [furthest, setFurthest] = useState(0);
    const [stepErrors, setStepErrors] = useState<Errors>({});
    const [progress, setProgress] = useState(0);
    const [draftSaved, setDraftSaved] = useState(false);

    const topRef = useRef<HTMLDivElement>(null);
    const restored = useRef(false);

    const { data, setData, post, processing, errors, transform } =
        useForm<ApplicationForm>(blankForm());

    /* Reprise du brouillon, une seule fois au montage. Le jeton d'idempotence
       en fait partie : un dossier déjà parti puis redéposé depuis le même
       brouillon renvoie vers sa confirmation au lieu de créer un doublon. */
    useEffect(() => {
        const draft = readDraft();

        if (draft) {
            setData((current) => ({
                ...current,
                ...draft,
                documents: current.documents,
            }));
        }

        restored.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* L'enregistrement attend la reprise : sans ce verrou, le formulaire vierge
       du premier rendu écrasait le brouillon avant même de l'avoir relu. */
    useEffect(() => {
        if (restored.current) writeDraft(data);
    }, [data]);

    /* Seules les pièces réellement choisies partent : une entrée nulle
       traverserait la requête en chaîne vide et n'apprendrait rien au
       serveur. */
    useEffect(() => {
        transform((form) => {
            const documents = Object.fromEntries(
                Object.entries(form.documents).filter(
                    ([, file]) => file instanceof File,
                ),
            );

            return { ...form, documents };
        });
    }, [transform]);

    const serverErrors = errors as unknown as Record<string, string>;

    /** Erreur affichée sur un champ : celle du serveur d'abord, sinon l'étape. */
    const errorFor = (field: string): string | undefined =>
        serverErrors[field] ?? stepErrors[field];

    const isReinscription = data.type === REINSCRIPTION;

    const required = useMemo(
        () => requiredDocuments(options, data.type),
        [options, data.type],
    );

    const uploadState: UploadState = !processing
        ? 'idle'
        : progress >= 100
          ? 'sent'
          : 'uploading';

    const goTo = (next: number) => {
        setStep(next);
        setStepErrors({});
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const next = () => {
        const found = validateStep(step, data, options);

        if (Object.keys(found).length > 0) {
            setStepErrors(found);
            return;
        }

        const target = Math.min(step + 1, RECAP_STEP);
        setFurthest((current) => Math.max(current, target));
        goTo(target);
    };

    const previous = () => goTo(Math.max(step - 1, 0));

    const saveDraft = () => {
        writeDraft(data);
        setDraftSaved(true);
        window.setTimeout(() => setDraftSaved(false), 2600);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        // Double garde : le bouton est déjà désactivé pendant l'envoi, mais un
        // « Entrée » répété dans un champ passerait à travers.
        if (processing) return;

        const invalid = firstInvalidStep(data, options);

        if (invalid !== null) {
            setStepErrors(validateStep(invalid, data, options));
            goTo(invalid);
            return;
        }

        setProgress(0);

        post(route('candidature.store'), {
            forceFormData: true,
            onProgress: (event) => setProgress(event?.percentage ?? 0),
            onSuccess: () => clearDraft(),
            onError: (received) => {
                setProgress(0);

                /* Le serveur a refusé quelque chose : on ramène le candidat à
                   la première étape concernée plutôt que de le laisser devant
                   un récapitulatif qui n'affiche pas le champ fautif. */
                const fields = Object.keys(received);
                const index = STEP_FIELDS.findIndex((stepFields) =>
                    stepFields.some((field) =>
                        fields.some(
                            (name) =>
                                name === field || name.startsWith(`${field}.`),
                        ),
                    ),
                );

                if (index >= 0) goTo(index);
            },
        });
    };

    const mentionName =
        options.mentions.find((mention) => mention.slug === data.mention)
            ?.name ?? '';

    const genderLabel =
        options.genders.find((gender) => gender.value === data.gender)?.label ??
        '';

    const bacMentionLabel =
        options.bacMentions.find(
            (mention) => mention.value === data.bac_mention,
        )?.label ?? '';

    const typeLabel =
        options.types.find((type) => type.value === data.type)?.label ?? '';

    const chosenDocuments = options.documents.filter(
        (spec) => data.documents[spec.type],
    );

    return (
        <CmsProvider content={cms}>
            <ThemeProvider>
                <Head title="Demande d'inscription" />

                <div className="square-corners flex min-h-screen flex-col overflow-x-clip">
                    <Navbar />

                    <main className="flex-1">
                        {/* Bandeau d'entrée, dans la continuité des pages du site. */}
                        <section className="band-dark pt-14 pb-12 sm:pt-16 sm:pb-14">
                            <div className="section-shell">
                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="eyebrow"
                                >
                                    Scolarité
                                </motion.p>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.08 }}
                                    className="font-display text-foreground mt-3 leading-[0.98] font-black tracking-[-0.03em] uppercase"
                                    style={{
                                        fontSize: 'clamp(30px, 6.6vw, 56px)',
                                    }}
                                >
                                    Demande d’inscription
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.16 }}
                                    className="text-muted-foreground mt-4 max-w-2xl text-[15px] leading-relaxed"
                                >
                                    Remplissez votre dossier en ligne, joignez
                                    vos pièces justificatives et recevez votre
                                    numéro de demande par e-mail. La
                                    finalisation se fait ensuite au bureau de la
                                    scolarité.
                                </motion.p>
                            </div>
                        </section>

                        <section className="band-light section-rhythm">
                            <div className="section-shell" ref={topRef}>
                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-14">
                                    <div className="lg:sticky lg:top-24 lg:self-start">
                                        <Stepper
                                            steps={STEPS}
                                            current={step}
                                            furthest={furthest}
                                            onSelect={goTo}
                                        />
                                    </div>

                                    <form onSubmit={submit} noValidate>
                                        {/* Panne côté serveur : le message reste
                                            en français courant, la trace part au
                                            journal. */}
                                        {page.props.flash?.error && (
                                            <p
                                                role="alert"
                                                className="border-destructive/60 bg-destructive/5 text-destructive mb-6 flex items-start gap-2 border p-4 text-[14px] font-semibold"
                                            >
                                                <AlertCircle
                                                    size={16}
                                                    className="mt-0.5 shrink-0"
                                                />
                                                {page.props.flash.error}
                                            </p>
                                        )}

                                        <StepHeader
                                            title={STEPS[step].title}
                                            description={
                                                STEPS[step].description
                                            }
                                            showRequiredHint={
                                                step !== RECAP_STEP
                                            }
                                        />

                                        <div className="mt-7 space-y-6">
                                            {/* ── 1. Type de demande ── */}
                                            {step === 0 && (
                                                <ChoiceField
                                                    name="type"
                                                    label="Type de demande"
                                                    required
                                                    value={data.type}
                                                    error={errorFor('type')}
                                                    onChange={(value) =>
                                                        setData('type', value)
                                                    }
                                                    options={options.types.map(
                                                        (type) => ({
                                                            ...type,
                                                            description:
                                                                type.value ===
                                                                REINSCRIPTION
                                                                    ? 'Vous êtes déjà étudiant à l’ASJA et poursuivez votre cursus.'
                                                                    : 'Vous rejoignez l’ASJA pour la première fois.',
                                                        }),
                                                    )}
                                                />
                                            )}

                                            {/* ── 2. Informations personnelles ── */}
                                            {step === 1 && (
                                                <>
                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <TextField
                                                            id="last_name"
                                                            label="Nom"
                                                            required
                                                            autoComplete="family-name"
                                                            value={
                                                                data.last_name
                                                            }
                                                            error={errorFor(
                                                                'last_name',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'last_name',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <TextField
                                                            id="first_name"
                                                            label="Prénom"
                                                            required
                                                            autoComplete="given-name"
                                                            value={
                                                                data.first_name
                                                            }
                                                            error={errorFor(
                                                                'first_name',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'first_name',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <ChoiceField
                                                        name="gender"
                                                        label="Sexe"
                                                        required
                                                        value={data.gender}
                                                        error={errorFor(
                                                            'gender',
                                                        )}
                                                        onChange={(value) =>
                                                            setData(
                                                                'gender',
                                                                value,
                                                            )
                                                        }
                                                        options={
                                                            options.genders
                                                        }
                                                    />

                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <TextField
                                                            id="nationality"
                                                            label="Nationalité"
                                                            required
                                                            value={
                                                                data.nationality
                                                            }
                                                            error={errorFor(
                                                                'nationality',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'nationality',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <TextField
                                                            id="birth_date"
                                                            label="Date de naissance"
                                                            required
                                                            type="date"
                                                            max={new Date()
                                                                .toISOString()
                                                                .slice(0, 10)}
                                                            value={
                                                                data.birth_date
                                                            }
                                                            error={errorFor(
                                                                'birth_date',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'birth_date',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <TextField
                                                        id="birth_place"
                                                        label="Lieu de naissance"
                                                        required
                                                        value={data.birth_place}
                                                        error={errorFor(
                                                            'birth_place',
                                                        )}
                                                        onChange={(value) =>
                                                            setData(
                                                                'birth_place',
                                                                value,
                                                            )
                                                        }
                                                    />

                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <TextField
                                                            id="phone"
                                                            label="Numéro de téléphone"
                                                            required
                                                            type="tel"
                                                            inputMode="tel"
                                                            autoComplete="tel"
                                                            placeholder="034 00 000 00"
                                                            value={data.phone}
                                                            error={errorFor(
                                                                'phone',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'phone',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <TextField
                                                            id="email"
                                                            label="Adresse e-mail"
                                                            required
                                                            type="email"
                                                            inputMode="email"
                                                            autoComplete="email"
                                                            placeholder="prenom.nom@example.com"
                                                            hint="L’accusé de réception de votre demande y sera envoyé."
                                                            value={data.email}
                                                            error={errorFor(
                                                                'email',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'email',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <TextField
                                                        id="religion"
                                                        label="Religion"
                                                        hint="Facultatif."
                                                        value={data.religion}
                                                        error={errorFor(
                                                            'religion',
                                                        )}
                                                        onChange={(value) =>
                                                            setData(
                                                                'religion',
                                                                value,
                                                            )
                                                        }
                                                    />
                                                </>
                                            )}

                                            {/* ── 3. Baccalauréat ── */}
                                            {step === 2 && (
                                                <>
                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <TextField
                                                            id="bac_year"
                                                            label="Année d’obtention"
                                                            required
                                                            type="number"
                                                            inputMode="numeric"
                                                            min="1960"
                                                            max={String(
                                                                new Date().getFullYear() +
                                                                    1,
                                                            )}
                                                            placeholder={String(
                                                                new Date().getFullYear(),
                                                            )}
                                                            value={
                                                                data.bac_year
                                                            }
                                                            error={errorFor(
                                                                'bac_year',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'bac_year',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <SelectField
                                                            id="bac_series"
                                                            label="Série"
                                                            required
                                                            value={
                                                                data.bac_series
                                                            }
                                                            error={errorFor(
                                                                'bac_series',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'bac_series',
                                                                    value,
                                                                )
                                                            }
                                                            options={options.bacSeries.map(
                                                                (serie) => ({
                                                                    value: serie,
                                                                    label: serie,
                                                                }),
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        {/* Clavier numérique sur
                                                            téléphone, mais champ
                                                            texte : `type="number"`
                                                            mangerait les zéros de
                                                            tête et ajouterait des
                                                            flèches d'incrément qui
                                                            n'ont aucun sens sur un
                                                            numéro. */}
                                                        <TextField
                                                            id="bac_number"
                                                            label="Numéro du baccalauréat"
                                                            required
                                                            inputMode="numeric"
                                                            placeholder="123456789"
                                                            hint="Chiffres uniquement."
                                                            value={
                                                                data.bac_number
                                                            }
                                                            error={errorFor(
                                                                'bac_number',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'bac_number',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <SelectField
                                                            id="bac_mention"
                                                            label="Mention obtenue"
                                                            required
                                                            value={
                                                                data.bac_mention
                                                            }
                                                            error={errorFor(
                                                                'bac_mention',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'bac_mention',
                                                                    value,
                                                                )
                                                            }
                                                            options={
                                                                options.bacMentions
                                                            }
                                                        />
                                                    </div>

                                                    <p className="border-border bg-card text-muted-foreground border p-4 text-[13.5px] leading-relaxed">
                                                        Le relevé de notes du
                                                        baccalauréat est demandé
                                                        à l’étape
                                                        «&nbsp;Documents
                                                        justificatifs&nbsp;»,
                                                        avec les autres pièces
                                                        du dossier.
                                                    </p>
                                                </>
                                            )}

                                            {/* ── 4. Inscription ── */}
                                            {step === 3 && (
                                                <>
                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <SelectField
                                                            id="level"
                                                            label="Niveau demandé"
                                                            required
                                                            value={data.level}
                                                            error={errorFor(
                                                                'level',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'level',
                                                                    value,
                                                                )
                                                            }
                                                            options={options.levels.map(
                                                                (level) => ({
                                                                    value: level,
                                                                    label: level,
                                                                }),
                                                            )}
                                                        />
                                                        <SelectField
                                                            id="mention"
                                                            label="Mention"
                                                            required
                                                            value={data.mention}
                                                            error={errorFor(
                                                                'mention',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'mention',
                                                                    value,
                                                                )
                                                            }
                                                            options={options.mentions.map(
                                                                (mention) => ({
                                                                    value: mention.slug,
                                                                    label: mention.name,
                                                                }),
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Propres à la réinscription : un
                                                        étudiant déjà inscrit a un
                                                        matricule, un candidat non. */}
                                                    {isReinscription && (
                                                        <div className="grid gap-6 sm:grid-cols-2">
                                                            <TextField
                                                                id="student_number"
                                                                label="Numéro matricule"
                                                                required
                                                                hint="Celui qui figure sur votre carte d’étudiant."
                                                                value={
                                                                    data.student_number
                                                                }
                                                                error={errorFor(
                                                                    'student_number',
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'student_number',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                            <SelectField
                                                                id="previous_level"
                                                                label="Niveau de l’année précédente"
                                                                value={
                                                                    data.previous_level
                                                                }
                                                                error={errorFor(
                                                                    'previous_level',
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'previous_level',
                                                                        value,
                                                                    )
                                                                }
                                                                options={options.levels.map(
                                                                    (
                                                                        level,
                                                                    ) => ({
                                                                        value: level,
                                                                        label: level,
                                                                    }),
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* ── 5. Parents ── */}
                                            {step === 4 && (
                                                <>
                                                    <fieldset className="border-border border p-5">
                                                        <legend className="text-foreground px-2 text-[13px] font-bold tracking-[0.12em] uppercase">
                                                            Parent 1
                                                        </legend>
                                                        <div className="grid gap-6 sm:grid-cols-2">
                                                            <TextField
                                                                id="parent1_name"
                                                                label="Nom et prénom"
                                                                required
                                                                value={
                                                                    data.parent1_name
                                                                }
                                                                error={errorFor(
                                                                    'parent1_name',
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'parent1_name',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                            <TextField
                                                                id="parent1_phone"
                                                                label="Numéro de téléphone"
                                                                required
                                                                type="tel"
                                                                inputMode="tel"
                                                                placeholder="034 00 000 00"
                                                                value={
                                                                    data.parent1_phone
                                                                }
                                                                error={errorFor(
                                                                    'parent1_phone',
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'parent1_phone',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </fieldset>

                                                    <fieldset className="border-border border p-5">
                                                        <legend className="text-muted-foreground px-2 text-[13px] font-bold tracking-[0.12em] uppercase">
                                                            Parent 2 —
                                                            facultatif
                                                        </legend>
                                                        <div className="grid gap-6 sm:grid-cols-2">
                                                            <TextField
                                                                id="parent2_name"
                                                                label="Nom et prénom"
                                                                value={
                                                                    data.parent2_name
                                                                }
                                                                error={errorFor(
                                                                    'parent2_name',
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'parent2_name',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                            <TextField
                                                                id="parent2_phone"
                                                                label="Numéro de téléphone"
                                                                type="tel"
                                                                inputMode="tel"
                                                                placeholder="033 00 000 00"
                                                                value={
                                                                    data.parent2_phone
                                                                }
                                                                error={errorFor(
                                                                    'parent2_phone',
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'parent2_phone',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </fieldset>
                                                </>
                                            )}

                                            {/* ── 6. Documents ── */}
                                            {step === 5 && (
                                                <div className="space-y-4">
                                                    {options.documents.map(
                                                        (spec) => (
                                                            <FileField
                                                                key={spec.type}
                                                                spec={spec}
                                                                options={
                                                                    options
                                                                }
                                                                file={
                                                                    data
                                                                        .documents[
                                                                        spec
                                                                            .type
                                                                    ] ?? null
                                                                }
                                                                required={required.includes(
                                                                    spec.type,
                                                                )}
                                                                state={
                                                                    uploadState
                                                                }
                                                                error={errorFor(
                                                                    `documents.${spec.type}`,
                                                                )}
                                                                onChange={(
                                                                    file,
                                                                ) =>
                                                                    setData(
                                                                        'documents',
                                                                        {
                                                                            ...data.documents,
                                                                            [spec.type]:
                                                                                file,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        ),
                                                    )}

                                                    {isReinscription && (
                                                        <p className="border-border bg-card text-muted-foreground border p-4 text-[13.5px] leading-relaxed">
                                                            En réinscription, le
                                                            relevé du
                                                            baccalauréat et la
                                                            CIN sont déjà à
                                                            votre dossier : seul
                                                            le bordereau de
                                                            versement est exigé.
                                                            Vous pouvez
                                                            néanmoins joindre
                                                            les autres pièces si
                                                            elles ont changé.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── 7. Récapitulatif ── */}
                                            {step === RECAP_STEP && (
                                                <div className="space-y-4">
                                                    <RecapBlock
                                                        title="Type de demande"
                                                        step={0}
                                                        onEdit={goTo}
                                                    >
                                                        <Recap
                                                            label="Demande"
                                                            value={typeLabel}
                                                        />
                                                        {isReinscription && (
                                                            <Recap
                                                                label="Numéro matricule"
                                                                value={
                                                                    data.student_number
                                                                }
                                                            />
                                                        )}
                                                    </RecapBlock>

                                                    <RecapBlock
                                                        title="Informations personnelles"
                                                        step={1}
                                                        onEdit={goTo}
                                                    >
                                                        <Recap
                                                            label="Nom"
                                                            value={
                                                                data.last_name
                                                            }
                                                        />
                                                        <Recap
                                                            label="Prénom"
                                                            value={
                                                                data.first_name
                                                            }
                                                        />
                                                        <Recap
                                                            label="Sexe"
                                                            value={genderLabel}
                                                        />
                                                        <Recap
                                                            label="Nationalité"
                                                            value={
                                                                data.nationality
                                                            }
                                                        />
                                                        <Recap
                                                            label="Date de naissance"
                                                            value={
                                                                data.birth_date
                                                            }
                                                        />
                                                        <Recap
                                                            label="Lieu de naissance"
                                                            value={
                                                                data.birth_place
                                                            }
                                                        />
                                                        <Recap
                                                            label="Téléphone"
                                                            value={data.phone}
                                                        />
                                                        <Recap
                                                            label="Adresse e-mail"
                                                            value={data.email}
                                                        />
                                                        <Recap
                                                            label="Religion"
                                                            value={
                                                                data.religion
                                                            }
                                                        />
                                                    </RecapBlock>

                                                    <RecapBlock
                                                        title="Baccalauréat"
                                                        step={2}
                                                        onEdit={goTo}
                                                    >
                                                        <Recap
                                                            label="Année d’obtention"
                                                            value={
                                                                data.bac_year
                                                            }
                                                        />
                                                        <Recap
                                                            label="Série"
                                                            value={
                                                                data.bac_series
                                                            }
                                                        />
                                                        <Recap
                                                            label="Numéro"
                                                            value={
                                                                data.bac_number
                                                            }
                                                        />
                                                        <Recap
                                                            label="Mention"
                                                            value={
                                                                bacMentionLabel
                                                            }
                                                        />
                                                    </RecapBlock>

                                                    <RecapBlock
                                                        title="Inscription demandée"
                                                        step={3}
                                                        onEdit={goTo}
                                                    >
                                                        <Recap
                                                            label="Niveau"
                                                            value={data.level}
                                                        />
                                                        <Recap
                                                            label="Mention"
                                                            value={mentionName}
                                                        />
                                                        {isReinscription && (
                                                            <Recap
                                                                label="Niveau précédent"
                                                                value={
                                                                    data.previous_level
                                                                }
                                                            />
                                                        )}
                                                    </RecapBlock>

                                                    <RecapBlock
                                                        title="Parents"
                                                        step={4}
                                                        onEdit={goTo}
                                                    >
                                                        <Recap
                                                            label="Parent 1"
                                                            value={
                                                                data.parent1_name
                                                            }
                                                        />
                                                        <Recap
                                                            label="Téléphone 1"
                                                            value={
                                                                data.parent1_phone
                                                            }
                                                        />
                                                        <Recap
                                                            label="Parent 2"
                                                            value={
                                                                data.parent2_name
                                                            }
                                                        />
                                                        <Recap
                                                            label="Téléphone 2"
                                                            value={
                                                                data.parent2_phone
                                                            }
                                                        />
                                                    </RecapBlock>

                                                    <RecapBlock
                                                        title="Documents joints"
                                                        step={5}
                                                        onEdit={goTo}
                                                    >
                                                        {chosenDocuments.length ===
                                                        0 ? (
                                                            <Recap
                                                                label="Pièces"
                                                                value="Aucune"
                                                            />
                                                        ) : (
                                                            chosenDocuments.map(
                                                                (spec) => {
                                                                    const file =
                                                                        data
                                                                            .documents[
                                                                            spec
                                                                                .type
                                                                        ];
                                                                    return (
                                                                        <Recap
                                                                            key={
                                                                                spec.type
                                                                            }
                                                                            label={
                                                                                spec.label
                                                                            }
                                                                            value={
                                                                                file
                                                                                    ? `${file.name} (${formatSize(file.size)})`
                                                                                    : undefined
                                                                            }
                                                                        />
                                                                    );
                                                                },
                                                            )
                                                        )}
                                                    </RecapBlock>

                                                    <p className="border-primary/50 bg-primary/5 text-foreground border-l-2 p-4 text-[13.5px] leading-relaxed">
                                                        Après l’envoi, un accusé
                                                        de réception partira à{' '}
                                                        <strong>
                                                            {data.email}
                                                        </strong>{' '}
                                                        avec votre numéro de
                                                        demande. Le dépôt en
                                                        ligne ne finalise pas
                                                        l’inscription : vous
                                                        devrez vous présenter au
                                                        bureau de la scolarité
                                                        avec les documents
                                                        originaux et deux photos
                                                        d’identité identiques au
                                                        format 4×4, en buste.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Barre d'envoi : progression réelle du
                                            téléversement, pièces comprises. */}
                                        {processing && (
                                            <div className="mt-8">
                                                <div className="text-muted-foreground flex items-center justify-between text-[12.5px] font-semibold">
                                                    <span>
                                                        Envoi du dossier…
                                                    </span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="bg-border mt-2 h-1 w-full">
                                                    <div
                                                        className="bg-primary h-full transition-[width] duration-200"
                                                        style={{
                                                            width: `${progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Navigation */}
                                        <div className="border-border mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center">
                                            <button
                                                type="button"
                                                onClick={previous}
                                                disabled={
                                                    step === 0 || processing
                                                }
                                                className="border-border text-foreground hover:border-primary hover:text-primary inline-flex min-h-[48px] items-center justify-center gap-2 border px-5 text-[14px] font-semibold disabled:opacity-40"
                                            >
                                                <ArrowLeft size={15} />
                                                Précédent
                                            </button>

                                            <button
                                                type="button"
                                                onClick={saveDraft}
                                                disabled={processing}
                                                className="text-muted-foreground hover:text-foreground inline-flex min-h-[48px] items-center justify-center gap-2 px-2 text-[13.5px] font-semibold disabled:opacity-40"
                                            >
                                                {draftSaved ? (
                                                    <>
                                                        <Check
                                                            size={15}
                                                            className="text-primary"
                                                        />
                                                        Brouillon enregistré
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={15} />
                                                        Enregistrer le brouillon
                                                    </>
                                                )}
                                            </button>

                                            <div className="sm:ml-auto">
                                                {step < RECAP_STEP ? (
                                                    <button
                                                        type="button"
                                                        onClick={next}
                                                        className="bg-primary text-primary-foreground inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-7 text-[14px] font-bold hover:bg-white hover:text-black sm:w-auto"
                                                    >
                                                        Suivant
                                                        <ArrowRight size={15} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="bg-primary text-primary-foreground inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-7 text-[14px] font-bold hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                                    >
                                                        {processing ? (
                                                            <>
                                                                <Loader2
                                                                    size={15}
                                                                    className="animate-spin"
                                                                />
                                                                Envoi en cours…
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send
                                                                    size={15}
                                                                />
                                                                Soumettre la
                                                                demande
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-muted-foreground mt-4 text-[12.5px] leading-relaxed">
                                            Vos données et vos pièces
                                            justificatives ne sont consultables
                                            que par le service de la scolarité
                                            de l’ASJA.
                                        </p>
                                    </form>
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
