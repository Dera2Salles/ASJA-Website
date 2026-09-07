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
    /** Types de demande pour lesquels la pièce est obligatoire. */
    requiredFor: string[];
}

export interface FormOptions {
    types: Option[];
    genders: Option[];
    bacSeries: string[];
    bacMentions: Option[];
    levels: string[];
    mentions: Mention[];
    documents: DocumentSpec[];
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
    religion: string;

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
