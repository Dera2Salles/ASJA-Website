import { REINSCRIPTION, type ApplicationForm, type FormOptions } from './types';

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

/** Champs contrôlés à chaque étape, dans l'ordre du formulaire. */
export const STEP_FIELDS: string[][] = [
    ['type'],
    [
        'last_name',
        'first_name',
        'gender',
        'nationality',
        'birth_date',
        'birth_place',
        'phone',
        'email',
    ],
    ['bac_year', 'bac_series', 'bac_number', 'bac_mention'],
    ['level', 'mention', 'student_number'],
    ['parent1_name', 'parent1_phone', 'parent2_name', 'parent2_phone'],
    ['documents'],
    [],
];

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

/** Extension d'un nom de fichier, en minuscules et sans le point. */
export const extensionOf = (name: string): string =>
    name.slice(((name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();

/**
 * Contrôle d'une pièce au moment où elle est choisie : format et poids, les
 * deux seules choses vérifiables sans quitter le navigateur. Le serveur
 * revérifie l'un et l'autre, et lit en plus le contenu réel du fichier.
 */
export function validateFile(
    file: File,
    options: FormOptions,
): string | undefined {
    const extension = extensionOf(file.name);

    if (!options.acceptedExtensions.includes(extension)) {
        return `Format non accepté. Formats autorisés : ${options.acceptedExtensions
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
    step: number,
    data: ApplicationForm,
    options: FormOptions,
): Errors {
    const errors: Errors = {};
    const set = (field: string, message?: string) => {
        if (message) errors[field] = message;
    };

    switch (step) {
        case 0:
            set('type', required(data.type, 'type de demande'));
            break;

        case 1: {
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

            if (!data.email.trim()) {
                set('email', 'Le champ « adresse e-mail » est obligatoire.');
            } else if (!EMAIL.test(data.email.trim())) {
                set(
                    'email',
                    'Indiquez une adresse e-mail valide : l’accusé de réception y sera envoyé.',
                );
            }
            break;
        }

        case 2: {
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

        case 3:
            set('level', required(data.level, 'niveau'));
            set('mention', required(data.mention, 'mention'));

            if (data.type === REINSCRIPTION) {
                set(
                    'student_number',
                    data.student_number.trim() === ''
                        ? 'Le numéro matricule est obligatoire pour une réinscription.'
                        : undefined,
                );
            }
            break;

        case 4: {
            set(
                'parent1_name',
                requiredName(
                    data.parent1_name,
                    'nom et prénom du parent 1',
                    'Le nom du premier parent ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
                ),
            );

            if (!data.parent1_phone.trim()) {
                set(
                    'parent1_phone',
                    'Le champ « téléphone du parent 1 » est obligatoire.',
                );
            } else if (!PHONE.test(data.parent1_phone.trim())) {
                set('parent1_phone', 'Indiquez un numéro de téléphone valide.');
            }

            // Le second parent est facultatif — mais s'il est renseigné, son
            // nom et son numéro suivent les règles du premier.
            if (
                data.parent2_name.trim() &&
                !NAME.test(data.parent2_name.trim())
            ) {
                set(
                    'parent2_name',
                    'Le nom du second parent ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
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

        case 5:
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

/** Première étape en défaut, ou `null` si le dossier est complet. */
export function firstInvalidStep(
    data: ApplicationForm,
    options: FormOptions,
): number | null {
    for (let step = 0; step < STEP_FIELDS.length; step++) {
        if (Object.keys(validateStep(step, data, options)).length > 0) {
            return step;
        }
    }

    return null;
}
