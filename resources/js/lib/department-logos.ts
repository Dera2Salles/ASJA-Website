import agroLogo from '@/assets/AGROLOGO-quality.png';
import agroLogoDark from '@/assets/AGROLOGODARK-quality.png';
import droitLogo from '@/assets/DROITLOGO-quality.png';
import droitLogoDark from '@/assets/DROITLOGODARK.png';
import ecoLogo from '@/assets/ECOLOGO-quality.png';
import ecoLogoDark from '@/assets/ECOLOGODARK-quality.png';
import infoLogo from '@/assets/INFOLOGO-quality.png';
import infoLogoDark from '@/assets/INFOLOGODARK.png';
import leaLogoDark from '@/assets/LCLOGODARK-quality.png';
import leaLogo from '@/assets/LEALOGO.png';
import stLogo from '@/assets/STLOGO-quality.png';
import stLogoDark from '@/assets/STLOGODARK-quality.png';

/**
 * Logos livrés avec le site, utilisés tant qu'aucun logo n'a été téléversé
 * pour la mention depuis l'administration. Partagés par la section « Mentions »
 * de l'accueil et par la page de chaque mention.
 */
const LOGOS: Record<string, { light: string; dark: string }> = {
    agronomie: { light: agroLogo, dark: agroLogoDark },
    informatique: { light: infoLogo, dark: infoLogoDark },
    droit: { light: droitLogo, dark: droitLogoDark },
    economie: { light: ecoLogo, dark: ecoLogoDark },
    'sciences-de-la-terre': { light: stLogo, dark: stLogoDark },
    'langues-etrangeres-appliquees': { light: leaLogo, dark: leaLogoDark },
};

export function departmentLogo(
    slug: string,
    isDark: boolean,
): string | undefined {
    const entry = LOGOS[slug];
    if (!entry) return undefined;
    return isDark ? entry.dark : entry.light;
}
