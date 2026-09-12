<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Métadonnées d'une page : titre, description, adresse canonique, vignette de
 * partage, données structurées.
 *
 * Inertia rend les pages côté navigateur : une balise posée par React n'existe
 * qu'après l'exécution du JavaScript, donc trop tard pour les robots de
 * partage (Facebook, WhatsApp, X) qui ne l'exécutent pas. Ces métadonnées
 * partent donc dans les props de la page, et la vue racine les écrit dans le
 * document lui-même — voir `resources/views/partials/seo.blade.php`.
 *
 * Un contrôleur décrit sa page en quelques lignes :
 *
 *     'seo' => Seo::make(
 *         title: $post->title,
 *         description: $post->excerpt,
 *         image: $post->cover_image,
 *     )->article($post->published_at)->toArray(),
 *
 * Tout ce qui n'est pas dit retombe sur `config/seo.php`.
 */
class Seo
{
    private array $schemas = [];

    private function __construct(
        private ?string $title = null,
        private ?string $description = null,
        private ?string $image = null,
        private ?string $url = null,
        private string $type = 'website',
        private bool $indexable = true,
    ) {}

    public static function make(
        ?string $title = null,
        ?string $description = null,
        ?string $image = null,
        ?string $url = null,
    ): self {
        return new self($title, $description, $image, $url);
    }

    /** Page tenue hors des index : formulaires de suivi, écrans de confirmation. */
    public function noindex(): self
    {
        $this->indexable = false;

        return $this;
    }

    /** Marque la page comme un article et joint le schéma correspondant. */
    public function article(?string $publishedAt = null, ?string $modifiedAt = null): self
    {
        $this->type = 'article';

        $this->schemas[] = array_filter([
            '@type' => 'Article',
            'headline' => $this->title,
            'description' => $this->description,
            'image' => $this->image ? static::absolute($this->image) : null,
            'datePublished' => $publishedAt,
            'dateModified' => $modifiedAt ?? $publishedAt,
            'mainEntityOfPage' => $this->resolvedUrl(),
            'publisher' => ['@type' => 'Organization', 'name' => config('seo.legal_name')],
        ]);

        return $this;
    }

    /**
     * Fil d'Ariane, sous la forme `['Accueil' => '/', 'Actualités' => '/actualites']`.
     * Le dernier maillon est la page courante et n'a pas besoin d'adresse.
     */
    public function breadcrumb(array $trail): self
    {
        $items = [];
        $position = 1;

        foreach ($trail as $name => $url) {
            $items[] = array_filter([
                '@type' => 'ListItem',
                'position' => $position++,
                'name' => $name,
                'item' => $url ? static::absolute($url) : null,
            ]);
        }

        $this->schemas[] = ['@type' => 'BreadcrumbList', 'itemListElement' => $items];

        return $this;
    }

    /** Joint un schéma déjà construit (Event, EducationalOrganization...). */
    public function schema(array $schema): self
    {
        $this->schemas[] = $schema;

        return $this;
    }

    /**
     * Fiche de l'établissement, bâtie sur les coordonnées saisies dans
     * l'administration. Rien n'est inventé : un champ vide disparaît du
     * schéma plutôt que d'y figurer au jugé.
     */
    public static function organization(): array
    {
        $contact = Cms::section('contact');

        $address = trim((string) ($contact['address'] ?? ''));
        $latitude = static::number($contact['latitude'] ?? null);
        $longitude = static::number($contact['longitude'] ?? null);

        return array_filter([
            '@type' => 'CollegeOrUniversity',
            '@id' => url('/') . '#organisation',
            'name' => config('seo.legal_name'),
            'alternateName' => config('seo.site_name'),
            'description' => trim((string) ($contact['tagline'] ?? '')) ?: config('seo.description'),
            'url' => url('/'),
            'logo' => static::absolute('/icon-512.png'),
            'image' => static::absolute(config('seo.image')),
            'telephone' => trim((string) ($contact['phone'] ?? '')) ?: null,
            'email' => trim((string) ($contact['email'] ?? '')) ?: null,
            'address' => $address === '' ? null : [
                '@type' => 'PostalAddress',
                'streetAddress' => $address,
                'addressLocality' => 'Antsirabe',
                'addressCountry' => 'MG',
            ],
            'geo' => ($latitude === null || $longitude === null) ? null : [
                '@type' => 'GeoCoordinates',
                'latitude' => $latitude,
                'longitude' => $longitude,
            ],
            'sameAs' => array_values(array_filter([
                trim((string) ($contact['facebook'] ?? '')) ?: null,
            ])),
        ], fn ($value) => $value !== null && $value !== []);
    }

    /** Forme envoyée à la vue racine et à la page Inertia. */
    public function toArray(): array
    {
        $title = $this->title
            ? $this->title . ' — ' . config('seo.site_name')
            : config('seo.site_name');

        $description = static::trim(
            $this->description ?: config('seo.description'),
        );

        $image = static::absolute($this->image ?: config('seo.image'));

        return [
            'title' => $title,
            'description' => $description,
            'canonical' => $this->resolvedUrl(),
            'image' => $image,
            'imageWidth' => $this->image ? null : config('seo.image_width'),
            'imageHeight' => $this->image ? null : config('seo.image_height'),
            'type' => $this->type,
            'siteName' => config('seo.site_name'),
            'locale' => config('seo.og_locale'),
            'robots' => $this->indexable ? 'index, follow' : 'noindex, follow',
            'twitterSite' => config('seo.twitter_site'),
            'schema' => $this->schemas === [] ? null : $this->graph(),
        ];
    }

    /**
     * Les schémas d'une page tiennent dans un seul graphe : un lecteur
     * automatique y retrouve l'établissement une fois, référencé par les
     * autres blocs plutôt que recopié.
     */
    private function graph(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => array_values($this->schemas),
        ];
    }

    private function resolvedUrl(): string
    {
        /* L'adresse canonique ignore la chaîne de requête : une même page
           atteinte avec un paramètre de campagne ne doit pas compter pour une
           seconde page. */
        return $this->url
            ? static::absolute($this->url)
            : url(request()->getPathInfo());
    }

    /** Une description de partage dépasse rarement 160 caractères utiles. */
    private static function trim(string $text): string
    {
        return Str::limit(trim(preg_replace('/\s+/u', ' ', strip_tags($text)) ?? ''), 157);
    }

    /** Chemin de site ou adresse complète, toujours rendue absolue. */
    public static function absolute(?string $path): ?string
    {
        if ($path === null || trim($path) === '') {
            return null;
        }

        return Str::startsWith($path, ['http://', 'https://'])
            ? $path
            : url($path);
    }

    private static function number(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }
}
