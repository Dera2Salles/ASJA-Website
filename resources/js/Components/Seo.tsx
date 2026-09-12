import { Head, usePage } from '@inertiajs/react';

/**
 * Métadonnées de la page, côté navigateur.
 *
 * Le document livré par le serveur porte déjà ces balises — la vue racine les
 * écrit depuis la même prop (`resources/views/partials/seo.blade.php`), car un
 * robot de partage ne lit que le HTML brut. Ce composant en reprend la main au
 * montage : Inertia repère les balises marquées `inertia`, les remplace par
 * les siennes, et les met à jour à chaque navigation interne — sans quoi une
 * page atteinte au clic garderait la description de la précédente.
 *
 * Les deux rendus lisent la même prop et doivent donc produire la même liste
 * de balises. Le titre fait exception : il reste porté par le `<Head title>`
 * de chaque page.
 */

export interface SeoProps {
    title: string;
    description: string;
    canonical: string;
    image: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
    type: string;
    siteName: string;
    locale: string;
    robots: string;
    twitterSite: string | null;
    schema: Record<string, unknown> | null;
}

export function Seo() {
    const { seo } = usePage().props as unknown as { seo?: SeoProps };

    if (!seo) return null;

    return (
        <Head>
            <meta
                head-key="description"
                name="description"
                content={seo.description}
            />
            <link head-key="canonical" rel="canonical" href={seo.canonical} />
            <meta head-key="robots" name="robots" content={seo.robots} />

            <meta head-key="og:type" property="og:type" content={seo.type} />
            <meta
                head-key="og:site_name"
                property="og:site_name"
                content={seo.siteName}
            />
            <meta
                head-key="og:locale"
                property="og:locale"
                content={seo.locale}
            />
            <meta head-key="og:title" property="og:title" content={seo.title} />
            <meta
                head-key="og:description"
                property="og:description"
                content={seo.description}
            />
            <meta head-key="og:url" property="og:url" content={seo.canonical} />

            {seo.image ? (
                <meta
                    head-key="og:image"
                    property="og:image"
                    content={seo.image}
                />
            ) : null}
            {seo.image && seo.imageWidth ? (
                <meta
                    head-key="og:image:width"
                    property="og:image:width"
                    content={String(seo.imageWidth)}
                />
            ) : null}
            {seo.image && seo.imageHeight ? (
                <meta
                    head-key="og:image:height"
                    property="og:image:height"
                    content={String(seo.imageHeight)}
                />
            ) : null}

            {/* `summary_large_image` n'est honoré qu'avec une image. */}
            <meta
                head-key="twitter:card"
                name="twitter:card"
                content={seo.image ? 'summary_large_image' : 'summary'}
            />
            <meta
                head-key="twitter:title"
                name="twitter:title"
                content={seo.title}
            />
            <meta
                head-key="twitter:description"
                name="twitter:description"
                content={seo.description}
            />
            {seo.image ? (
                <meta
                    head-key="twitter:image"
                    name="twitter:image"
                    content={seo.image}
                />
            ) : null}
            {seo.twitterSite ? (
                <meta
                    head-key="twitter:site"
                    name="twitter:site"
                    content={seo.twitterSite}
                />
            ) : null}

            {seo.schema ? (
                <script
                    head-key="schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(seo.schema),
                    }}
                />
            ) : null}
        </Head>
    );
}

export default Seo;
