import {
    MARRIED,
    REINSCRIPTION,
    RELIGION_OTHER,
    type ApplicationForm,
    type DocumentSpec,
    type FormOptions,
} from './types';

/**
 * Validation dans le navigateur.
 *
 * Elle ne remplace pas celle du serveur — `StoreApplicationRequest` reste seule
 * à faire foi — mais elle évite au candidat de découvrir à la dernière étape
 * qu'un champ de la deuxième est vide. Chaque règle reproduit son homologue
 * serveur ; les deux listes sont volontairement écrites dans le même ordre pour
 * qu'un écart se voie.
 */

export type Errors = Record<string, string>;

/**
 * Les étapes sont désignées par un nom, jamais par leur rang.
 *
 * Elles l'ont d'abord été par un indice, et insérer la carte d'identité entre
 * l'état civil et le baccalauréat décalait silencieusement toutes les règles
 * qui suivaient. Le nom, lui, survit à un déplacement.
 */
export type StepKey =
    | 'type'
    | 'identity'
    | 'student'
    | 'cin'
    | 'bac'
    | 'enrolment'
    | 'parents'
    | 'documents'
    | 'summary';

/** Parcours d'une première inscription : le dossier complet. */
const PREMIERE_STEPS: StepKey[] = [
    'type',
    'identity',
    'cin',
    'bac',
    'enrolment',
    'parents',
    'documents',
    'summary',
];

/**
 * Parcours d'une réinscription.
 *
 * L'étudiant est déjà au dossier : son état civil, sa CIN, son baccalauréat et
 * ses parents y sont depuis sa première inscription. Il ne reste qu'à le
 * retrouver — son matricule —, à savoir où lui répondre — son adresse e-mail —
 * et à recevoir les pièces de l'année. Reflet de `Application::FIELDS`, qui
 * refuse serveur tout ce qui n'est pas dans cette liste.
 */
const REINSCRIPTION_STEPS: StepKey[] = [
    'type',
    'student',
    'documents',
    'summary',
];

/**
 * Étapes du type de demande choisi.
 *
 * Tant qu'aucun type n'est retenu, le parcours le plus large est affiché :
 * le candidat voit ce qui l'attend avant de choisir.
 */
export function stepKeysFor(type: string): StepKey[] {
    return type === REINSCRIPTION ? REINSCRIPTION_STEPS : PREMIERE_STEPS;
}

/**
 * Champs réellement demandés pour ce type de demande.
 *
 * Le formulaire n'envoie que ceux-là : un champ resté en mémoire d'un autre
 * parcours — la nationalité, préremplie, ou la mention venue de l'adresse —
 * serait refusé par le serveur, qui ne l'a pas demandé.
 */
export function fieldsFor(type: string): string[] {
    return stepKeysFor(type).flatMap((step) => STEP_FIELDS[step]);
}

/** Champs portés par chaque étape : sert à y renvoyer sur erreur du serveur. */
export const STEP_FIELDS: Record<StepKey, string[]> = {
    type: ['type'],
    identity: [
        'last_name',
        'first_name',
        'gender',
        'nationality',
        'birth_date',
        'birth_place',
        'marital_status',
        'religion',
        'religion_other',
        'phone',
        'email',
    ],
    student: ['student_number', 'email'],
    cin: [
        'cin_number',
        'cin_issued_place',
        'cin_issued_at',
        'cin_duplicate_at',
        'spouse_cin_number',
    ],
    bac: ['bac_year', 'bac_series', 'bac_number', 'bac_mention'],
    enrolment: ['level', 'mention'],
    parents: ['parent1_name', 'parent1_phone', 'parent2_name', 'parent2_phone'],
    documents: ['documents'],
    summary: [],
};

const PHONE = /^[0-9+\s().-]{8,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Un nom de personne : des lettres, et rien d'autre que ce qui sépare deux
   mots d'un nom. Copie exacte de `StoreApplicationRequest::NAME_PATTERN` —
   `\p{L}` couvre les lettres accentuées, `\p{M}` les diacritiques composés. */
const NAME = /^\p{L}[\p{L}\p{M}\s'’-]*$/u;

/** Le numéro du baccalauréat : des chiffres, zéros de tête compris. */
const DIGITS = /^\d+$/;

const required = (value: string, label: string) =>
    value.trim() === '' ? `Le champ « ${label} » est obligatoire.` : undefined;

/** Obligatoire d'abord, forme ensuite : une seule erreur affichée à la fois. */
const requiredName = (value: string, label: string, message: string) =>
    required(value, label) ?? (NAME.test(value.trim()) ? undefined : message);

/**
 * L'adresse de l'accusé de réception, demandée dans les deux parcours : à
 * l'état civil en première inscription, à l'identification en réinscription.
 */
const emailError = (value: string): string | undefined => {
    if (!value.trim()) return 'Le champ « adresse e-mail » est obligatoire.';

    return EMAIL.test(value.trim())
        ? undefined
        : 'Indiquez une adresse e-mail valide : l’accusé de réception y sera envoyé.';
};

/** Un numéro de CIN : exactement le nombre de chiffres attendu. */
const cinPattern = (length: number) => new RegExp(`^\\d{${length}}$`);

/** Date du jour au format d'un champ `date`, pour borner les saisies. */
export const today = (): string => new Date().toISOString().slice(0, 10);

/** Extension d'un nom de fichier, en minuscules et sans le point. */
export const extensionOf = (name: string): string =>
    name.slice(((name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();

/**
 * Contrôle d'une pièce au moment où elle est choisie : format et poids, les
 * deux seules choses vérifiables sans quitter le navigateur. Les formats sont
 * ceux de la pièce, pas une liste globale — une photo d'identité n'accepte pas
 * le PDF. Le serveur revérifie l'un et l'autre, et lit en plus le contenu réel
 * du fichier.
 */
export function validateFile(
    file: File,
    spec: DocumentSpec,
    options: FormOptions,
): string | undefined {
    const extension = extensionOf(file.name);

    if (!spec.extensions.includes(extension)) {
        return `Format non accepté. Formats autorisés : ${spec.extensions
            .join(', ')
            .toUpperCase()}.`;
    }

    if (file.size > options.maxFileSizeKb * 1024) {
        return `Fichier trop volumineux (${formatSize(file.size)}). Maximum : ${Math.round(
            options.maxFileSizeKb / 1024,
        )} Mo.`;
    }

    return undefined;
}

/** Poids d'un fichier, arrondi comme un système de fichiers l'afficherait. */
export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Pièces demandées pour ce type de demande, obligatoires ou non. */
export function documentsFor(
    options: FormOptions,
    type: string,
): DocumentSpec[] {
    return options.documents.filter((document) =>
        document.appliesTo.includes(type),
    );
}

/** Pièces obligatoires pour le type de demande choisi. */
export function requiredDocuments(
    options: FormOptions,
    type: string,
): string[] {
    return options.documents
        .filter((document) => document.requiredFor.includes(type))
        .map((document) => document.type);
}

/** Erreurs de l'étape demandée, vides si elle est complète. */
export function validateStep(
    step: StepKey,
    data: ApplicationForm,
    options: FormOptions,
): Errors {
    const errors: Errors = {};
    const set = (field: string, message?: string) => {
        if (message) errors[field] = message;
    };

    switch (step) {
        case 'type':
            set('type', required(data.type, 'type de demande'));
            break;

        case 'identity': {
            set(
                'last_name',
                requiredName(
                    data.last_name,
                    'nom',
                    'Le nom ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
                ),
            );
            set(
                'first_name',
                requiredName(
                    data.first_name,
                    'prénom',
                    'Le prénom ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
                ),
            );
            set('gender', required(data.gender, 'sexe'));
            set('nationality', required(data.nationality, 'nationalité'));
            set('birth_place', required(data.birth_place, 'lieu de naissance'));
            set(
                'marital_status',
                required(data.marital_status, 'situation matrimoniale'),
            );
            set('religion', required(data.religion, 'religion'));

            // « Autre » sans précision ne dit rien : le champ devient exigé.
            if (data.religion === RELIGION_OTHER) {
                set(
                    'religion_other',
                    data.religion_other.trim() === ''
                        ? 'Précisez votre religion.'
                        : undefined,
                );
            }

            if (!data.birth_date) {
                set(
                    'birth_date',
                    'Le champ « date de naissance » est obligatoire.',
                );
            } else if (new Date(data.birth_date) >= new Date()) {
                set(
                    'birth_date',
                    'La date de naissance doit être antérieure à aujourd’hui.',
                );
            }

            if (!data.phone.trim()) {
                set(
                    'phone',
                    'Le champ « numéro de téléphone » est obligatoire.',
                );
            } else if (!PHONE.test(data.phone.trim())) {
                set(
                    'phone',
                    'Indiquez un numéro de téléphone valide (au moins 8 chiffres).',
                );
            }

            set('email', emailError(data.email));
            break;
        }

        /* Réinscription : le matricule retrouve l'étudiant au dossier,
           l'adresse dit où lui envoyer l'accusé de réception. */
        case 'student':
            set(
                'student_number',
                data.student_number.trim() === ''
                    ? 'Le numéro matricule est obligatoire pour une réinscription.'
                    : undefined,
            );
            set('email', emailError(data.email));
            break;

        case 'cin': {
            const cin = cinPattern(options.cinLength);
            const digits = `Le numéro de CIN doit comporter exactement ${options.cinLength} chiffres.`;

            if (!data.cin_number.trim()) {
                set(
                    'cin_number',
                    'Le champ « numéro de CIN » est obligatoire.',
                );
            } else if (!cin.test(data.cin_number.trim())) {
                set('cin_number', digits);
            }

            set(
                'cin_issued_place',
                required(data.cin_issued_place, 'lieu de délivrance'),
            );

            if (!data.cin_issued_at) {
                set(
                    'cin_issued_at',
                    'Le champ « date de délivrance » est obligatoire.',
                );
            } else if (data.cin_issued_at > today()) {
                set(
                    'cin_issued_at',
                    'La date de délivrance ne peut pas être dans le futur.',
                );
            }

            // Le duplicata est facultatif, mais il vient forcément après la
            // délivrance et jamais après aujourd'hui.
            if (data.cin_duplicate_at) {
                if (data.cin_duplicate_at > today()) {
                    set(
                        'cin_duplicate_at',
                        'La date du duplicata ne peut pas être dans le futur.',
                    );
                } else if (
                    data.cin_issued_at &&
                    data.cin_duplicate_at < data.cin_issued_at
                ) {
                    set(
                        'cin_duplicate_at',
                        'Le duplicata ne peut pas précéder la délivrance de la CIN.',
                    );
                }
            }

            if (data.marital_status === MARRIED) {
                if (!data.spouse_cin_number.trim()) {
                    set(
                        'spouse_cin_number',
                        'Le numéro de CIN du conjoint est obligatoire pour un candidat marié.',
                    );
                } else if (!cin.test(data.spouse_cin_number.trim())) {
                    set(
                        'spouse_cin_number',
                        `Le numéro de CIN du conjoint doit comporter exactement ${options.cinLength} chiffres.`,
                    );
                }
            }
            break;
        }

        case 'bac': {
            const year = Number(data.bac_year);
            const max = new Date().getFullYear() + 1;

            if (!data.bac_year.trim()) {
                set(
                    'bac_year',
                    'Le champ « année d’obtention » est obligatoire.',
                );
            } else if (!Number.isInteger(year) || year < 1960 || year > max) {
                set(
                    'bac_year',
                    `Indiquez une année comprise entre 1960 et ${max}.`,
                );
            }

            set('bac_series', required(data.bac_series, 'série'));

            if (!data.bac_number.trim()) {
                set(
                    'bac_number',
                    'Le champ « numéro du baccalauréat » est obligatoire.',
                );
            } else if (!DIGITS.test(data.bac_number.trim())) {
                set(
                    'bac_number',
                    'Le numéro du baccalauréat ne doit contenir que des chiffres.',
                );
            }

            set('bac_mention', required(data.bac_mention, 'mention'));
            break;
        }

        case 'enrolment':
            set('level', required(data.level, 'niveau'));
            set('mention', required(data.mention, 'mention'));
            break;

        case 'parents': {
            set(
                'parent1_name',
                requiredName(
                    data.parent1_name,
                    'nom et prénom du père',
                    'Le nom du père ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
                ),
            );

            if (!data.parent1_phone.trim()) {
                set(
                    'parent1_phone',
                    'Le champ « téléphone du père » est obligatoire.',
                );
            } else if (!PHONE.test(data.parent1_phone.trim())) {
                set('parent1_phone', 'Indiquez un numéro de téléphone valide.');
            }

            // La mère est facultative — mais si elle est renseignée, son
            // nom et son numéro suivent les règles du père.
            if (
                data.parent2_name.trim() &&
                !NAME.test(data.parent2_name.trim())
            ) {
                set(
                    'parent2_name',
                    'Le nom de la mère ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
                );
            }

            if (
                data.parent2_phone.trim() &&
                !PHONE.test(data.parent2_phone.trim())
            ) {
                set('parent2_phone', 'Indiquez un numéro de téléphone valide.');
            }
            break;
        }

        case 'documents':
            requiredDocuments(options, data.type).forEach((type) => {
                if (!data.documents[type]) {
                    const spec = options.documents.find((d) => d.type === type);
                    set(
                        `documents.${type}`,
                        `La pièce « ${spec?.label ?? type} » est obligatoire.`,
                    );
                }
            });
            break;

        default:
            break;
    }

    return errors;
}

/** Rang de la première étape en défaut, ou `null` si le dossier est complet. */
export function firstInvalidStep(
    data: ApplicationForm,
    options: FormOptions,
): number | null {
    const index = stepKeysFor(data.type).findIndex(
        (step) => Object.keys(validateStep(step, data, options)).length > 0,
    );

    return index >= 0 ? index : null;
}

/** Rang de la première étape qui porte l'un des champs nommés. */
export function stepOfFields(fields: string[], type: string): number {
    return stepKeysFor(type).findIndex((step) =>
        STEP_FIELDS[step].some((field) =>
            fields.some(
                (name) => name === field || name.startsWith(`${field}.`),
            ),
        ),
    );
}
