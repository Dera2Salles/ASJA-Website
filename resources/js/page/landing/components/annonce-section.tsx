import type { Post } from '@/lib/posts';
import { Link, usePage } from '@inertiajs/react';
import { BellRing, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Bandeau d'annonce affiché au-dessus de la navigation.
 *
 * Alimenté par les publications de type « annonce ». Auparavant, il dépendait
 * d'une API Strapi dont l'adresse était invalide : le bandeau ne s'affichait
 * donc jamais.
 */
export const AnnonceSection = () => {
    const { announcements } = usePage().props as unknown as {
        announcements?: Post[];
    };

    const [dismissed, setDismissed] = useState(false);

    const annonce = announcements?.[0];

    if (!annonce || dismissed) return null;

    return (
        <div className="bg-primary text-primary-foreground">
            <div className="section-shell flex items-center gap-3 py-2.5">
                <BellRing className="h-4 w-4 shrink-0" aria-hidden="true" />

                <Link
                    href={`/actualites/${annonce.slug}`}
                    className="-my-2.5 flex flex-1 items-center truncate py-2.5 text-sm font-medium hover:underline"
                >
                    {annonce.title}
                </Link>

                <button
                    onClick={() => setDismissed(true)}
                    aria-label="Masquer l'annonce"
                    className="-my-1 -mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/15"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
