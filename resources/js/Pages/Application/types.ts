/**
 * Contrat de données du formulaire de candidature.
 *
 * Les listes de choix ne sont jamais écrites ici : elles arrivent du serveur
 * (`Application::formOptions()`), qui les tient lui-même de la table des
 * mentions. Le front ne connaît que la forme, pas le contenu.
 */

export interface Option {
    value: string;
    label: string;
}

export interface Mention {
    slug: string;
    name: string;
}

export interface DocumentSpec {
    type: string;
    label: string;
    hint: string;
    /** Types de demande auxquels la pièce s'applique ; ailleurs elle n'existe pas. */
    appliesTo: string[];
    /** Types de demande pour lesquels la pièce est obligatoire. */
    requiredFor: string[];
    /** Formats acceptés par cette pièce — une photo n'accepte pas le PDF. */
    extensions: string[];
}

/** Une ligne de frais, déjà mise en forme par le serveur : « 20 000 Ar ». */
export interface Fee {
    label: string;
    amount: number;
    formatted: string;
    /** `submission` ou `validation` : voir `Application::FEE_AT_SUBMISSION`. */
    when: string;
    /** Le même moment, écrit en français par le serveur. */
    moment: string;
}

/**
 * Frais dus, par type de demande.
 *
 * `dueAtSubmission` est le montant du bordereau à joindre ;
 * `dueAfterValidation` ce qui restera à verser si le dossier est retenu — nul
 * quand tout se règle au dépôt.
 */
export type Fees = Record<
    string,
    {
        lines: Fee[];
        dueAtSubmission: string | null;
        dueAfterValidation: string | null;
    }
>;

/** Compte sur lequel les frais sont versés. */
export interface BankAccount {
    bank: string;
    holder: string;
    number: string;
}

export interface FormOptions {
    types: Option[];
    genders: Option[];
    maritalStatuses: Option[];
    religions: Option[];
    /** Longueur exacte attendue pour un numéro de CIN. */
    cinLength: number;
    bacSeries: string[];
    bacMentions: Option[];
    levels: string[];
    mentions: Mention[];
    documents: DocumentSpec[];
    fees: Fees;
    bankAccount: BankAccount;
    maxFileSizeKb: number;
    acceptedExtensions: string[];
}

/** Pièces justificatives en attente d'envoi, indexées par nature. */
export type DocumentFiles = Record<string, File | null>;

export interface ApplicationForm {
    idempotency_key: string;
    type: string;

    last_name: string;
    first_name: string;
    gender: string;
    nationality: string;
    birth_date: string;
    birth_place: string;
    phone: string;
    email: string;
    marital_status: string;
    religion: string;
    religion_other: string;

    cin_number: string;
    cin_issued_place: string;
    cin_issued_at: string;
    cin_duplicate_at: string;
    spouse_cin_number: string;

    bac_year: string;
    bac_series: string;
    bac_number: string;
    bac_mention: string;

    level: string;
    mention: string;
    student_number: string;
    previous_level: string;

    parent1_name: string;
    parent1_phone: string;
    parent2_name: string;
    parent2_phone: string;

    documents: DocumentFiles;
}

export const REINSCRIPTION = 'reinscription';

/** Seule situation qui ouvre la saisie de la CIN du conjoint. */
export const MARRIED = 'marie';

/** Seule religion qui ouvre le champ de précision. */
export const RELIGION_OTHER = 'autre';
