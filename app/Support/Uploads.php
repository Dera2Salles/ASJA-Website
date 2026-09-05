<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Stockage des fichiers téléversés, calqué sur ce que sert réellement
 * l'hébergement cPanel.
 *
 * Le disque `public` de Laravel écrit dans `storage/app/public` et suppose un
 * lien symbolique `public/storage` : un hébergement mutualisé ne permet pas
 * toujours de le créer, et il ne survit pas à un redéploiement par copie de
 * fichiers. Tout passe donc par le dossier `uploads/` à la racine du dépôt,
 * qui est aussi la racine web en production (le dépôt est déployé tel quel
 * dans `public_html`) : Apache y sert les fichiers en direct.
 *
 * En développement la racine web est `public/`, où ce dossier n'apparaît pas :
 * c'est la route de repli `uploads.show` (routes/web.php) qui sert alors les
 * mêmes URL `/uploads/...`.
 *
 * La base de données ne stocke plus une clé de disque (`posts/x.jpg`) mais le
 * chemin web définitif (`/uploads/posts/x.jpg`) : le front n'a plus rien à
 * préfixer, et une valeur déjà absolue (URL externe) traverse la chaîne
 * inchangée.
 */
class Uploads
{
    /** Dossier racine des téléversements, relatif à la racine web. */
    public const DIRECTORY = 'uploads';

    /** Chemin disque du dossier de téléversement, ex. `.../uploads/posts`. */
    public static function path(string $relative = ''): string
    {
        $relative = trim(str_replace('\\', '/', $relative), '/');

        return rtrim(base_path(self::DIRECTORY . '/' . $relative), '/');
    }

    /**
     * Déplace le fichier sous `uploads/{$folder}` et renvoie le chemin web à
     * enregistrer en base. Le nom fourni par le client n'est jamais
     * réutilisé : il est remplacé par un identifiant généré.
     */
    public static function store(UploadedFile $file, string $folder): string
    {
        $extension = $file->extension() ?: $file->getClientOriginalExtension();

        return static::storeAs($file, $folder, Str::uuid() . ($extension ? '.' . $extension : ''));
    }

    /** Variante à nom imposé, pour les cas où le nom de fichier porte du sens. */
    public static function storeAs(UploadedFile $file, string $folder, string $name): string
    {
        $folder = trim(str_replace('\\', '/', $folder), '/');
        $name = basename($name);
        $destination = static::path($folder);

        if (! is_dir($destination)) {
            mkdir($destination, 0755, true);
        }

        $file->move($destination, $name);

        return '/' . self::DIRECTORY . '/' . ($folder === '' ? '' : $folder . '/') . $name;
    }

    /**
     * Supprime un fichier précédemment téléversé. Toute valeur qui ne désigne
     * pas un fichier du dossier `uploads` (URL externe, chemin remonté par
     * `..`, image livrée avec le site) est ignorée sans erreur.
     */
    public static function delete(?string $value): void
    {
        $path = static::file($value);

        if ($path !== null) {
            @unlink($path);
        }
    }

    /**
     * Chemin disque d'un fichier téléversé existant, ou `null`. Sert à la route
     * de repli qui remplace Apache en développement.
     */
    public static function file(?string $value): ?string
    {
        $path = static::diskPath($value);

        return $path !== null && is_file($path) ? $path : null;
    }

    /**
     * Chemin web d'une valeur stockée. Sert de garde-fou pour les valeurs
     * héritées du disque `public` (`posts/x.jpg`), toujours servies par le
     * lien symbolique `public/storage` là où il existe.
     */
    public static function url(?string $value): ?string
    {
        $value = is_string($value) ? trim($value) : '';

        if ($value === '') {
            return null;
        }

        if (Str::startsWith($value, ['http://', 'https://', '//', '/'])) {
            return $value;
        }

        return '/storage/' . $value;
    }

    /**
     * Chemin disque d'une valeur stockée, ou `null` si elle sort du dossier
     * `uploads`. Le `realpath` du dossier parent ferme la traversée de chemin.
     */
    private static function diskPath(?string $value): ?string
    {
        $value = is_string($value) ? trim($value) : '';

        if ($value === '' || ! Str::startsWith($value, '/' . self::DIRECTORY . '/')) {
            return null;
        }

        $root = realpath(static::path());

        if ($root === false) {
            return null;
        }

        $path = realpath(base_path(ltrim($value, '/')));

        return $path !== false && Str::startsWith($path, $root . DIRECTORY_SEPARATOR)
            ? $path
            : null;
    }
}
