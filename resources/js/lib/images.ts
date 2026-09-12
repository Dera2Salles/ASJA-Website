import manifest from './image-manifest.json';

/**
 * Résolution des images livrées avec le site.
 *
 * `scripts/optimize-images.py` range sous `assets/optimized/` une déclinaison
 * WebP par palier de largeur, et note dans `image-manifest.json` les
 * dimensions du plus grand palier. Ce module recolle les deux : à partir du
 * nom d'un master (« Lieu_espace/Devant_asja »), il rend le `srcSet` complet
 * et les dimensions à réserver dans la page.
 *
 * Les URL viennent de Vite, qui empreinte chaque fichier : le cache du
 * navigateur peut donc être gardé un an sans risque de servir une image
 * périmée.
 */

type ManifestEntry = { width: number; height: number; widths: number[] };

const entries = manifest as Record<string, ManifestEntry>;

/* `eager` : seules les URL traversent le bundle, pas les images. Un glob
   paresseux rendrait des promesses, inutilisables dans un rendu synchrone. */
const files = import.meta.glob('../assets/optimized/**/*.webp', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

const urls = new Map<string, string>();

for (const [path, url] of Object.entries(files)) {
    const match = path.match(/\/assets\/optimized\/(.+)-(\d+)\.webp$/);
    if (match) {
        urls.set(`${match[1]}|${match[2]}`, url);
    }
}

export type OptimizedImage = {
    src: string;
    srcSet: string;
    width: number;
    height: number;
};

/** Retire l'extension éventuelle : « Logo/asja-logo.png » → « Logo/asja-logo ». */
function normalize(name: string): string {
    return name.replace(/\.(jpe?g|png|webp)$/i, '');
}

/**
 * Déclinaisons d'un master livré avec le site.
 * Rend `undefined` si le nom n'a pas été généré — au composant de retomber
 * sur l'image d'origine plutôt que d'afficher un trou.
 */
export function optimized(name: string): OptimizedImage | undefined {
    const key = normalize(name);
    const entry = entries[key];

    if (!entry) return undefined;

    const sources = entry.widths
        .map((width) => [width, urls.get(`${key}|${width}`)] as const)
        .filter((pair): pair is readonly [number, string] => Boolean(pair[1]));

    if (sources.length === 0) return undefined;

    return {
        /* Le plus large en `src` : c'est lui que prennent les navigateurs qui
           ignorent `srcSet`, et le repli quand `sizes` ne décrit rien. */
        src: sources[sources.length - 1][1],
        srcSet: sources.map(([width, url]) => `${url} ${width}w`).join(', '),
        width: entry.width,
        height: entry.height,
    };
}

/** Largeur du plus grand palier disponible, utile pour dimensionner un `sizes`. */
export function intrinsicSize(
    name: string,
): { width: number; height: number } | undefined {
    const entry = entries[normalize(name)];
    return entry ? { width: entry.width, height: entry.height } : undefined;
}

/**
 * Visuel de fond de la page d'accueil, tant qu'aucune photo n'a été téléversée.
 *
 * C'est l'élément LCP du site : la vue racine le précharge dans le document
 * pour que son téléchargement démarre avant l'exécution de React. Le même nom
 * est donc déclaré côté serveur, dans `config/seo.php` (`hero_image`) — les
 * deux doivent rester d'accord.
 */
export const HERO_IMAGE = 'Lieu_espace/Devant_asja';

/**
 * URL d'une seule déclinaison, pour les composants qui n'acceptent qu'une
 * chaîne (l'avatar de shadcn, une image de fond CSS...). `width` indique la
 * largeur d'affichage : le palier retenu est le premier qui la couvre.
 */
export function imageUrl(name: string, width: number): string | undefined {
    const key = normalize(name);
    const entry = entries[key];

    if (!entry) return undefined;

    const chosen = entry.widths.find((w) => w >= width) ?? entry.width;

    return urls.get(`${key}|${chosen}`);
}
