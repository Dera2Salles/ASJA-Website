import { createContext, useContext, type ReactNode } from 'react';
import { uploadUrl } from './uploads';

/**
 * Accès au contenu éditable côté React.
 *
 * Le serveur (App\Support\Cms) envoie déjà le contenu fusionné avec les
 * valeurs par défaut de config/cms.php : un champ jamais édité arrive donc
 * rempli. Les composants n'ont plus à porter de texte en dur.
 */

export type CmsValue = string | number | Record<string, unknown>[];
export type CmsSection = Record<string, CmsValue>;
export type CmsContent = Record<string, CmsSection>;

const CmsContext = createContext<CmsContent>({});

export function CmsProvider({
    content,
    children,
}: {
    content: CmsContent;
    children: ReactNode;
}) {
    return (
        <CmsContext.Provider value={content ?? {}}>
            {children}
        </CmsContext.Provider>
    );
}

/** Contenu résolu d'une section, ex. `useSection('faq')`. */
export function useSection<T extends CmsSection = CmsSection>(
    section: string,
): Partial<T> {
    const content = useContext(CmsContext);
    return (content[section] ?? {}) as Partial<T>;
}

/**
 * Résout le chemin d'une image gérée par le CMS.
 * Renvoie `fallback` tant qu'aucune image n'a été téléversée, ce qui permet
 * de conserver les visuels livrés avec le site.
 */
export function cmsImage(
    value: unknown,
    fallback: string | undefined = undefined,
): string | undefined {
    return uploadUrl(value, fallback);
}

/** Liste répétable typée, avec repli sur un tableau vide. */
export function cmsList<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}
