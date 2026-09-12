<?php

namespace App\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Vite;
use Throwable;

/**
 * Côté serveur, l'accès aux déclinaisons WebP fabriquées par
 * `scripts/optimize-images.py`.
 *
 * Une seule chose en dépend, mais elle compte : le préchargement de l'image de
 * bannière. Inertia rend les pages côté navigateur, donc la bannière n'apparaît
 * dans le document qu'après le téléchargement, l'analyse et l'exécution du
 * JavaScript — le scanner de préchargement du navigateur ne la voit jamais, et
 * son téléchargement ne commence qu'à la toute fin. C'est exactement le chemin
 * critique du LCP. Un `<link rel="preload">` écrit dans le document rend cette
 * image visible dès la première ligne de HTML, et son téléchargement part en
 * parallèle du bundle au lieu de l'attendre.
 *
 * Le pendant côté React est `resources/js/lib/images.ts`.
 */
class Images
{
    private static ?array $manifest = null;

    /** Dimensions et paliers d'un master, tels que notés par le script. */
    public static function entry(string $name): ?array
    {
        return static::manifest()[$name] ?? null;
    }

    /**
     * De quoi précharger une image : son URL, son jeu de déclinaisons et ses
     * dimensions. Rend `null` si le master est inconnu ou si le build n'a pas
     * encore émis les fichiers — la page se charge alors sans préchargement,
     * ce qui la ralentit mais ne la casse pas.
     */
    public static function preload(string $name, string $sizes = '100vw'): ?array
    {
        $entry = static::entry($name);

        if ($entry === null) {
            return null;
        }

        $sources = [];
        $largest = null;

        foreach ($entry['widths'] as $width) {
            $url = static::assetUrl("resources/js/assets/optimized/{$name}-{$width}.webp");

            if ($url === null) {
                return null;
            }

            $sources[] = "{$url} {$width}w";
            $largest = $url;
        }

        if ($sources === []) {
            return null;
        }

        return [
            'href' => $largest,
            'srcset' => implode(', ', $sources),
            'sizes' => $sizes,
        ];
    }

    /**
     * Préchargement de l'image de bannière d'une page.
     *
     * Une photo téléversée depuis l'administration n'a pas de déclinaisons :
     * elle est préchargée telle quelle. Sinon, on prend les paliers du visuel
     * livré avec le site.
     */
    public static function preloadHero(
        ?string $uploaded,
        ?string $fallback,
        string $sizes = '100vw',
    ): ?array {
        $uploaded = trim((string) $uploaded);

        if ($uploaded !== '') {
            return ['href' => $uploaded, 'srcset' => null, 'sizes' => null];
        }

        return $fallback === null ? null : static::preload($fallback, $sizes);
    }

    /**
     * Adresse publique d'un asset du build.
     *
     * `Vite::asset()` lève une exception quand le manifeste est absent ou
     * incomplet — au premier déploiement, ou entre deux builds. Le
     * préchargement est un bonus : il ne doit jamais empêcher une page de
     * s'afficher.
     */
    private static function assetUrl(string $path): ?string
    {
        try {
            return Vite::asset($path);
        } catch (Throwable) {
            return null;
        }
    }

    private static function manifest(): array
    {
        if (static::$manifest !== null) {
            return static::$manifest;
        }

        $path = resource_path('js/lib/image-manifest.json');

        if (! is_file($path)) {
            return static::$manifest = [];
        }

        $decoded = json_decode(File::get($path), true);

        return static::$manifest = is_array($decoded) ? $decoded : [];
    }
}
