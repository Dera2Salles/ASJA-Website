/**
 * Logos livrés avec le site, utilisés tant qu'aucun logo n'a été téléversé
 * pour la mention depuis l'administration.
 *
 * Ce sont des noms de masters, pas des imports : les déclinaisons WebP sont
 * résolues par <Img> (voir `lib/images`). Les fichiers d'origine font jusqu'à
 * 800 Ko pour un logo affiché en 64 px.
 */
const LOGOS: Record<string, string> = {
    agronomie: 'AGROLOGO-quality',
    informatique: 'INFOLOGO-quality',
    droit: 'DROITLOGO-quality',
    economie: 'ECOLOGO-quality',
    'sciences-de-la-terre': 'STLOGO-quality',
    'langues-etrangeres-appliquees': 'LEALOGO',
};

/** Nom du master à servir pour la mention, ou `undefined` si elle n'en a pas. */
export function departmentLogo(slug: string): string | undefined {
    // Full light mode : toujours le logo clair.
    return LOGOS[slug];
}
