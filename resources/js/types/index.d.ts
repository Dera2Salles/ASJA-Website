export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    /** « Admin » ou « Student » : décide de la page d'arrivée après connexion. */
    role?: string;
    /* Fiche scolaire, renseignée à l'inscription puis à chaque réinscription. */
    last_name?: string | null;
    contact?: string | null;
    mention?: string | null;
    level?: string | null;
    branche?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    /** Sommaire des sections éditables (clé => libellé), partagé par Inertia. */
    cmsSections?: Record<string, string>;
};
