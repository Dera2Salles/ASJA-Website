import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link } from '@inertiajs/react';

export type Crumb = {
    label: string;
    /** Absent sur le dernier maillon : c'est la page affichée. */
    href?: string;
};

/**
 * Fil d'Ariane des pages intérieures.
 *
 * Il dit où l'on se trouve et par où remonter — utile quand on arrive d'un
 * moteur de recherche ou d'un lien partagé, donc sans être passé par
 * l'accueil. La page d'accueil n'en porte pas : on y est déjà à la racine.
 *
 * Le pendant en données structurées (`BreadcrumbList`) est produit côté
 * serveur par App\Support\Seo : les deux décrivent le même chemin, et c'est
 * la condition pour que Google affiche le fil dans ses résultats.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
    if (items.length < 2) return null;

    return (
        <Breadcrumb aria-label="Fil d'Ariane">
            {/* Le fil défile au doigt plutôt que de se replier sur trois
                lignes : un titre d'article dépasse largement la largeur d'un
                téléphone. La gouttière est rendue à la piste pour que le
                dernier maillon ne colle pas au bord. */}
            <BreadcrumbList className="flex-nowrap overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((item, index) => {
                    const last = index === items.length - 1;

                    return (
                        <BreadcrumbItem key={`${item.label}-${index}`}>
                            {last || !item.href ? (
                                <BreadcrumbPage className="max-w-[46vw] truncate font-medium sm:max-w-none">
                                    {item.label}
                                </BreadcrumbPage>
                            ) : (
                                <>
                                    <BreadcrumbLink asChild>
                                        <Link
                                            href={item.href}
                                            className="hover:text-primary rounded-xs underline-offset-4 hover:underline focus-visible:underline"
                                        >
                                            {item.label}
                                        </Link>
                                    </BreadcrumbLink>
                                    <BreadcrumbSeparator />
                                </>
                            )}
                        </BreadcrumbItem>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default Breadcrumbs;
