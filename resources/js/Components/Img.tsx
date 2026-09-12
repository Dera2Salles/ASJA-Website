import { optimized } from '@/lib/images';
import type { ImgHTMLAttributes } from 'react';

type NativeImg = Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'srcSet' | 'width' | 'height' | 'loading'
>;

export interface ImgProps extends NativeImg {
    /**
     * Nom du master livré avec le site, sans extension ni dossier `assets`,
     * ex. `Lieu_espace/Devant_asja`. Ses déclinaisons WebP sont résolues par
     * `lib/images`.
     */
    source?: string;

    /**
     * URL d'exécution — image téléversée depuis l'administration. Elle prime
     * sur `source`, qui joue alors le rôle de visuel livré par défaut.
     */
    src?: string;

    /**
     * Description de l'image. Vide pour une image décorative, dont le sens est
     * déjà porté par le texte voisin.
     */
    alt: string;

    /** Décrit la largeur d'affichage au navigateur, qui choisit le palier. */
    sizes?: string;

    /**
     * Image critique du premier écran : chargée sans attendre, jamais
     * différée. Réservé à l'élément LCP — au-delà d'une image par page, la
     * priorité ne veut plus rien dire.
     */
    priority?: boolean;

    /** Dimensions imposées quand l'image ne vient pas du manifeste. */
    width?: number;
    height?: number;
}

/**
 * Image responsive.
 *
 * Trois choses qu'un `<img>` nu ne fait pas et qui coûtent cher :
 * servir au téléphone la définition du téléphone (`srcSet` + `sizes`),
 * réserver la place avant l'arrivée du fichier (`width`/`height`, donc pas de
 * saut de mise en page), et ne pas télécharger ce qui est hors de l'écran
 * (`loading="lazy"`). Le composant les pose par défaut, une fois pour toutes.
 */
export function Img({
    source,
    src,
    alt,
    sizes = '100vw',
    priority = false,
    width,
    height,
    ...rest
}: ImgProps) {
    const set = source ? optimized(source) : undefined;

    /* Une image téléversée n'a pas de déclinaisons : elle part telle quelle,
       mais garde le chargement différé et les dimensions qu'on lui donne. */
    const resolved = src ?? set?.src;

    if (!resolved) return null;

    const useSet = !src && set;

    return (
        <img
            src={resolved}
            srcSet={useSet ? set.srcSet : undefined}
            sizes={useSet ? sizes : undefined}
            width={width ?? (useSet ? set.width : undefined)}
            height={height ?? (useSet ? set.height : undefined)}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : undefined}
            {...rest}
        />
    );
}

export default Img;
