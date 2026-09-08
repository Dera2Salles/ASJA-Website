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
import { Requirements } from './Requirements';
import { Stepper, type Step } from './Stepper';
import {
    MARRIED,
    REINSCRIPTION,
    RELIGION_OTHER,
    type ApplicationForm,
    type FormOptions,
} from './types';
import {
    documentsFor,
    fieldsFor,
    firstInvalidStep,
    formatSize,
    requiredDocuments,
    stepKeysFor,
    stepOfFields,
    today,
    validateStep,
    type Errors,
    type StepKey,
} from './validation';

interface Props {
    options: FormOptions;
    /** Champs déjà décidés à l'arrivée : la mention, quand on vient de sa page. */
    prefill: { mention: string | null };
    cms: CmsContent;
}

/**
 * Les écrans du dossier.
 *
 * `key` est ce qui relie un écran à ses règles (`validation.ts`) : le rang
 * n'est qu'une position d'affichage, et il dépend désormais du type de
 * demande — une réinscription ne traverse ni l'état civil, ni la carte
 * d'identité, ni le baccalauréat, ni les parents, tous déjà à son dossier.
 * `stepKeysFor` dit, pour chaque type, lesquels de ces écrans sont parcourus.
 */
const STEP_DEFS: Record<StepKey, Step> = {
    type: {
        title: 'Type de demande',
        short: 'Type de demande',
        description:
            'Indiquez si vous rejoignez l’ASJA pour la première fois ou si vous poursuivez votre cursus.',
    },
    identity: {
        title: 'Informations personnelles',
        short: 'Informations personnelles',
        description:
            'Votre état civil, tel qu’il figure sur vos pièces officielles. L’adresse e-mail servira à vous envoyer l’accusé de réception.',
    },
    student: {
        title: 'Identification',
        short: 'Identification',
        description:
            'Votre matricule suffit à retrouver votre dossier : votre état civil y figure déjà. L’adresse e-mail servira à vous envoyer l’accusé de réception.',
    },
    cin: {
        title: 'Carte d’identité nationale',
        short: 'Carte d’identité',
        description:
            'Les mentions portées sur votre CIN. Recopiez-les exactement, elles serviront à établir votre dossier scolaire.',
    },
    bac: {
        title: 'Baccalauréat',
        short: 'Baccalauréat',
        description:
            'Les informations portées sur votre relevé de notes. Le relevé lui-même est à joindre à l’étape « Documents ».',
    },
    enrolment: {
        title: 'Informations d’inscription',
        short: 'Inscription',
        description:
            'Le niveau et la mention dans lesquels vous souhaitez vous inscrire cette année.',
    },
    parents: {
        title: 'Informations des parents',
        short: 'Parents',
        description:
            'Les personnes à contacter au sujet de votre scolarité. Le second parent est facultatif.',
    },
    documents: {
        title: 'Documents justificatifs',
        short: 'Documents',
        description:
            'Les pièces sont conservées de façon confidentielle et ne sont consultables que par le service de la scolarité.',
    },
    summary: {
        title: 'Récapitulatif',
        short: 'Récapitulatif',
        description:
            'Relisez votre dossier. Vous pouvez encore revenir sur chaque étape avant de l’envoyer.',
    },
};

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

/* Les cinq natures de pièces, quel que soit le type : l'étape « Documents »
   n'affiche que celles de son parcours, mais le formulaire garde une entrée
   par pièce pour que passer d'un type à l'autre n'en laisse aucune derrière. */
const EMPTY_DOCUMENTS = {
    bac_transcript: null,
    cin: null,
    report_card: null,
    photo: null,
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
        marital_status: '',
        religion: '',
        religion_other: '',
        cin_number: '',
        cin_issued_place: '',
        cin_issued_at: '',
        cin_duplicate_at: '',
        spouse_cin_number: '',
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
export default function ApplicationCreate({ options, prefill, cms }: Props) {
    const page = usePage<PageProps>();

    const [step, setStep] = useState(0);
    const [furthest, setFurthest] = useState(0);
    const [stepErrors, setStepErrors] = useState<Errors>({});
    const [progress, setProgress] = useState(0);
    const [draftSaved, setDraftSaved] = useState(false);

    const topRef = useRef<HTMLDivElement>(null);
    const restored = useRef(false);

    /* La mention retenue sur la page d'où l'on vient est déjà en place : le
       serveur l'a confrontée aux mentions visibles, une valeur inventée dans
       l'adresse arrive donc nulle. */
    const { data, setData, post, processing, errors, transform } =
        useForm<ApplicationForm>({
            ...blankForm(),
            mention: prefill.mention ?? '',
        });

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
                // Le lien suivi à l'instant l'emporte sur un brouillon
                // vieux de plusieurs jours.
                mention: prefill.mention ?? draft.mention ?? current.mention,
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

    /* Ce qui part au serveur : les seuls champs du parcours suivi, et les
       seules pièces réellement choisies.

       Le formulaire garde en mémoire tous les champs — passer d'un type à
       l'autre ne doit rien effacer — mais le serveur refuse ce qu'il n'a pas
       demandé : une nationalité préremplie ou une mention venue de l'adresse
       feraient échouer une réinscription qui ne les déclare pas. Une entrée de
       pièce restée nulle, elle, traverserait la requête en chaîne vide sans
       rien lui apprendre. */
    useEffect(() => {
        transform((form) => {
            const kept = new Set([...fieldsFor(form.type), 'idempotency_key']);

            const fields = Object.fromEntries(
                Object.entries(form).filter(([name]) => kept.has(name)),
            );

            const documents = Object.fromEntries(
                Object.entries(form.documents).filter(
                    ([, file]) => file instanceof File,
                ),
            );

            return { ...fields, documents };
        });
    }, [transform]);

    const serverErrors = errors as unknown as Record<string, string>;

    /** Erreur affichée sur un champ : celle du serveur d'abord, sinon l'étape. */
    const errorFor = (field: string): string | undefined =>
        serverErrors[field] ?? stepErrors[field];

    /* Le parcours suit le type de demande : les écrans d'une réinscription ne
       sont pas ceux d'une première inscription, et le rang d'un écran n'a de
       sens que dans son propre parcours. */
    const steps = useMemo(
        () => stepKeysFor(data.type).map((key) => ({ ...STEP_DEFS[key], key })),
        [data.type],
    );

    const recapStep = steps.length - 1;
    const current = steps[Math.min(step, recapStep)];
    const stepKey = current.key;

    /** Rang d'affichage d'une étape du parcours en cours. */
    const stepIndex = (key: StepKey): number =>
        steps.findIndex((entry) => entry.key === key);

    /** L'étape appartient-elle au parcours suivi ? Le récapitulatif s'y règle. */
    const shows = (key: StepKey): boolean => stepIndex(key) >= 0;

    const isMarried = data.marital_status === MARRIED;

    /* Les pièces suivent le type de demande : une réinscription ne dépose ni
       relevé de baccalauréat ni CIN — l'un et l'autre sont déjà au dossier —
       mais un bulletin de notes et une photo d'identité. Le serveur refuse
       d'ailleurs toute pièce hors de cette liste. */
    const documents = useMemo(
        () => documentsFor(options, data.type),
        [options, data.type],
    );

    const required = useMemo(
        () => requiredDocuments(options, data.type),
        [options, data.type],
    );

    /** Frais du type choisi : ils viennent du serveur, déjà mis en forme. */
    const fees = options.fees[data.type];

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
        const found = validateStep(stepKey, data, options);

        if (Object.keys(found).length > 0) {
            setStepErrors(found);
            return;
        }

        const target = Math.min(step + 1, recapStep);
        setFurthest((current) => Math.max(current, target));
        goTo(target);
    };

    const previous = () => goTo(Math.max(step - 1, 0));

    /* Changer de type change le parcours : les écrans déjà franchis ne sont
       plus les mêmes, et le sommaire ne doit plus laisser sauter en avant. */
    const chooseType = (value: string) => {
        setData('type', value);
        setFurthest(0);
        setStepErrors({});
    };

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
            setStepErrors(validateStep(steps[invalid].key, data, options));
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
                const index = stepOfFields(Object.keys(received), data.type);

                if (index >= 0) goTo(index);
            },
        });
    };

    const mentionName =
        options.mentions.find((mention) => mention.slug === data.mention)
            ?.name ?? '';

    const maritalLabel =
        options.maritalStatuses.find(
            (status) => status.value === data.marital_status,
        )?.label ?? '';

    /* « Autre » cède la place à la précision saisie : c'est elle que le
       candidat doit relire, pas le mot « Autre ». */
    const religionLabel =
        data.religion === RELIGION_OTHER
            ? data.religion_other
            : (options.religions.find(
                  (religion) => religion.value === data.religion,
              )?.label ?? '');

    const genderLabel =
        options.genders.find((gender) => gender.value === data.gender)?.label ??
        '';

    const bacMentionLabel =
        options.bacMentions.find(
            (mention) => mention.value === data.bac_mention,
        )?.label ?? '';

    const typeLabel =
        options.types.find((type) => type.value === data.type)?.label ?? '';

    const chosenDocuments = documents.filter(
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
                        <section className="band-light pt-14 pb-12 sm:pt-16 sm:pb-14">
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
                                            steps={steps}
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
                                            title={current.title}
                                            description={current.description}
                                            showRequiredHint={
                                                step !== recapStep
                                            }
                                        />

                                        <div className="mt-7 space-y-6">
                                            {/* ── 1. Type de demande ── */}
                                            {stepKey === 'type' && (
                                                <>
                                                    <ChoiceField
                                                        name="type"
                                                        label="Type de demande"
                                                        required
                                                        value={data.type}
                                                        error={errorFor('type')}
                                                        onChange={chooseType}
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

                                                    {/* Pièces et frais annoncés
                                                        d'emblée : le candidat sait
                                                        ce qu'il doit réunir avant
                                                        de commencer sa saisie. */}
                                                    <Requirements
                                                        options={options}
                                                        type={data.type}
                                                    />
                                                </>
                                            )}

                                            {/* ── 2. Informations personnelles ── */}
                                            {/* ── Réinscription : identification ── */}
                                            {stepKey === 'student' && (
                                                <>
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
                                                            onChange={(value) =>
                                                                setData(
                                                                    'student_number',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <TextField
                                                            id="email"
                                                            label="Adresse e-mail"
                                                            type="email"
                                                            inputMode="email"
                                                            autoComplete="email"
                                                            required
                                                            hint="L’accusé de réception y sera envoyé."
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

                                                    <p className="border-border bg-card text-muted-foreground border p-4 text-[13.5px] leading-relaxed">
                                                        Votre état civil, votre
                                                        CIN, votre baccalauréat
                                                        et les coordonnées de
                                                        vos parents sont déjà à
                                                        votre dossier depuis
                                                        votre première
                                                        inscription&nbsp;: ils
                                                        ne vous sont pas
                                                        redemandés. Signalez
                                                        tout changement au
                                                        bureau de la scolarité.
                                                    </p>
                                                </>
                                            )}

                                            {stepKey === 'identity' && (
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

                                                    <ChoiceField
                                                        name="marital_status"
                                                        label="Situation matrimoniale"
                                                        required
                                                        value={
                                                            data.marital_status
                                                        }
                                                        error={errorFor(
                                                            'marital_status',
                                                        )}
                                                        onChange={(value) =>
                                                            setData(
                                                                'marital_status',
                                                                value,
                                                            )
                                                        }
                                                        options={
                                                            options.maritalStatuses
                                                        }
                                                    />

                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <SelectField
                                                            id="religion"
                                                            label="Religion"
                                                            required
                                                            value={
                                                                data.religion
                                                            }
                                                            error={errorFor(
                                                                'religion',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'religion',
                                                                    value,
                                                                )
                                                            }
                                                            options={
                                                                options.religions
                                                            }
                                                        />

                                                        {/* « Autre » sans
                                                            précision n'apprend
                                                            rien : le champ
                                                            n'apparaît que dans
                                                            ce cas, et devient
                                                            alors obligatoire. */}
                                                        {data.religion ===
                                                            RELIGION_OTHER && (
                                                            <TextField
                                                                id="religion_other"
                                                                label="Précisez"
                                                                required
                                                                value={
                                                                    data.religion_other
                                                                }
                                                                error={errorFor(
                                                                    'religion_other',
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'religion_other',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {/* ── 3. Carte d'identité nationale ── */}
                                            {stepKey === 'cin' && (
                                                <>
                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <TextField
                                                            id="cin_number"
                                                            label="Numéro de CIN"
                                                            required
                                                            inputMode="numeric"
                                                            placeholder="123456789012"
                                                            hint={`${options.cinLength} chiffres, sans espace.`}
                                                            value={
                                                                data.cin_number
                                                            }
                                                            error={errorFor(
                                                                'cin_number',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'cin_number',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <TextField
                                                            id="cin_issued_place"
                                                            label="Fait à"
                                                            required
                                                            placeholder="Antananarivo"
                                                            hint="Le lieu de délivrance porté sur la carte."
                                                            value={
                                                                data.cin_issued_place
                                                            }
                                                            error={errorFor(
                                                                'cin_issued_place',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'cin_issued_place',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <TextField
                                                            id="cin_issued_at"
                                                            label="Date de délivrance"
                                                            required
                                                            type="date"
                                                            max={today()}
                                                            value={
                                                                data.cin_issued_at
                                                            }
                                                            error={errorFor(
                                                                'cin_issued_at',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'cin_issued_at',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <TextField
                                                            id="cin_duplicate_at"
                                                            label="Date du duplicata"
                                                            type="date"
                                                            max={today()}
                                                            hint="À ne remplir que si votre carte est un duplicata."
                                                            value={
                                                                data.cin_duplicate_at
                                                            }
                                                            error={errorFor(
                                                                'cin_duplicate_at',
                                                            )}
                                                            onChange={(value) =>
                                                                setData(
                                                                    'cin_duplicate_at',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {/* La CIN du conjoint ne
                                                        concerne que les
                                                        candidats mariés : le
                                                        champ n'existe pas pour
                                                        les autres, et le
                                                        serveur le refuse s'il
                                                        arrive quand même. */}
                                                    {isMarried && (
                                                        <fieldset className="border-border border p-5">
                                                            <legend className="text-foreground px-2 text-[13px] font-bold tracking-[0.12em] uppercase">
                                                                Conjoint
                                                            </legend>
                                                            <TextField
                                                                id="spouse_cin_number"
                                                                label="Numéro de CIN du conjoint"
                                                                required
                                                                inputMode="numeric"
                                                                placeholder="123456789012"
                                                                hint={`${options.cinLength} chiffres, sans espace.`}
                                                                value={
                                                                    data.spouse_cin_number
                                                                }
                                                                error={errorFor(
                                                                    'spouse_cin_number',
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'spouse_cin_number',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                        </fieldset>
                                                    )}
                                                </>
                                            )}

                                            {/* ── 4. Baccalauréat ── */}
                                            {stepKey === 'bac' && (
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

                                            {/* ── 5. Inscription ── */}
                                            {stepKey === 'enrolment' && (
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
                                            )}

                                            {/* ── 6. Parents ── */}
                                            {stepKey === 'parents' && (
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

                                            {/* ── 7. Documents ── */}
                                            {stepKey === 'documents' && (
                                                <div className="space-y-4">
                                                    {documents.map((spec) => (
                                                        <FileField
                                                            key={spec.type}
                                                            spec={spec}
                                                            options={options}
                                                            file={
                                                                data.documents[
                                                                    spec.type
                                                                ] ?? null
                                                            }
                                                            required={required.includes(
                                                                spec.type,
                                                            )}
                                                            state={uploadState}
                                                            error={errorFor(
                                                                `documents.${spec.type}`,
                                                            )}
                                                            onChange={(file) =>
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
                                                    ))}

                                                    {/* Rappel au moment de joindre
                                                        le bordereau : ce qu'il
                                                        doit porter, et sur quel
                                                        compte. */}
                                                    {fees?.dueAtSubmission && (
                                                        <p className="border-border bg-card text-muted-foreground border p-4 text-[13.5px] leading-relaxed">
                                                            Le bordereau à
                                                            joindre est celui du
                                                            versement de{' '}
                                                            <strong className="text-foreground">
                                                                {
                                                                    fees.dueAtSubmission
                                                                }
                                                            </strong>{' '}
                                                            sur le compte{' '}
                                                            {
                                                                options
                                                                    .bankAccount
                                                                    .bank
                                                            }{' '}
                                                            {
                                                                options
                                                                    .bankAccount
                                                                    .holder
                                                            }{' '}
                                                            n<sup>o</sup>&nbsp;
                                                            <strong className="text-foreground whitespace-nowrap">
                                                                {
                                                                    options
                                                                        .bankAccount
                                                                        .number
                                                                }
                                                            </strong>
                                                            {fees.dueAfterValidation && (
                                                                <>
                                                                    . Les{' '}
                                                                    <strong className="text-foreground">
                                                                        {
                                                                            fees.dueAfterValidation
                                                                        }
                                                                    </strong>{' '}
                                                                    de frais
                                                                    généraux ne
                                                                    se versent
                                                                    qu’après
                                                                    validation
                                                                    de votre
                                                                    dossier
                                                                </>
                                                            )}
                                                            .
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── 8. Récapitulatif ── */}
                                            {stepKey === 'summary' && (
                                                <div className="space-y-4">
                                                    <RecapBlock
                                                        title="Type de demande"
                                                        step={stepIndex('type')}
                                                        onEdit={goTo}
                                                    >
                                                        <Recap
                                                            label="Demande"
                                                            value={typeLabel}
                                                        />
                                                    </RecapBlock>

                                                    {shows('student') && (
                                                        <RecapBlock
                                                            title="Identification"
                                                            step={stepIndex(
                                                                'student',
                                                            )}
                                                            onEdit={goTo}
                                                        >
                                                            <Recap
                                                                label="Numéro matricule"
                                                                value={
                                                                    data.student_number
                                                                }
                                                            />
                                                            <Recap
                                                                label="Adresse e-mail"
                                                                value={
                                                                    data.email
                                                                }
                                                            />
                                                        </RecapBlock>
                                                    )}

                                                    {shows('identity') && (
                                                        <RecapBlock
                                                            title="Informations personnelles"
                                                            step={stepIndex(
                                                                'identity',
                                                            )}
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
                                                                value={
                                                                    genderLabel
                                                                }
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
                                                                value={
                                                                    data.phone
                                                                }
                                                            />
                                                            <Recap
                                                                label="Adresse e-mail"
                                                                value={
                                                                    data.email
                                                                }
                                                            />
                                                            <Recap
                                                                label="Situation matrimoniale"
                                                                value={
                                                                    maritalLabel
                                                                }
                                                            />
                                                            <Recap
                                                                label="Religion"
                                                                value={
                                                                    religionLabel
                                                                }
                                                            />
                                                        </RecapBlock>
                                                    )}

                                                    {shows('cin') && (
                                                        <RecapBlock
                                                            title="Carte d’identité nationale"
                                                            step={stepIndex(
                                                                'cin',
                                                            )}
                                                            onEdit={goTo}
                                                        >
                                                            <Recap
                                                                label="Numéro de CIN"
                                                                value={
                                                                    data.cin_number
                                                                }
                                                            />
                                                            <Recap
                                                                label="Fait à"
                                                                value={
                                                                    data.cin_issued_place
                                                                }
                                                            />
                                                            <Recap
                                                                label="Date de délivrance"
                                                                value={
                                                                    data.cin_issued_at
                                                                }
                                                            />
                                                            <Recap
                                                                label="Date du duplicata"
                                                                value={
                                                                    data.cin_duplicate_at
                                                                }
                                                            />
                                                            {isMarried && (
                                                                <Recap
                                                                    label="CIN du conjoint"
                                                                    value={
                                                                        data.spouse_cin_number
                                                                    }
                                                                />
                                                            )}
                                                        </RecapBlock>
                                                    )}

                                                    {shows('bac') && (
                                                        <RecapBlock
                                                            title="Baccalauréat"
                                                            step={stepIndex(
                                                                'bac',
                                                            )}
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
                                                    )}

                                                    {shows('enrolment') && (
                                                        <RecapBlock
                                                            title="Inscription demandée"
                                                            step={stepIndex(
                                                                'enrolment',
                                                            )}
                                                            onEdit={goTo}
                                                        >
                                                            <Recap
                                                                label="Niveau"
                                                                value={
                                                                    data.level
                                                                }
                                                            />
                                                            <Recap
                                                                label="Mention"
                                                                value={
                                                                    mentionName
                                                                }
                                                            />
                                                        </RecapBlock>
                                                    )}

                                                    {shows('parents') && (
                                                        <RecapBlock
                                                            title="Parents"
                                                            step={stepIndex(
                                                                'parents',
                                                            )}
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
                                                    )}

                                                    <RecapBlock
                                                        title="Documents joints"
                                                        step={stepIndex(
                                                            'documents',
                                                        )}
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
                                                {step < recapStep ? (
                                                    <button
                                                        type="button"
                                                        onClick={next}
                                                        className="bg-primary text-primary-foreground inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-7 text-[14px] font-bold hover:bg-[#08542c] hover:text-white sm:w-auto"
                                                    >
                                                        Suivant
                                                        <ArrowRight size={15} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="bg-primary text-primary-foreground inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-7 text-[14px] font-bold hover:bg-[#08542c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
