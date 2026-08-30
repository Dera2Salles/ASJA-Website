<?php

namespace App\Support;

use App\Models\ComponentData;

/**
 * Point d'accès unique au contenu éditable.
 *
 * Le schéma (config/cms.php) fournit la structure et les valeurs par défaut ;
 * la table `component_data` fournit les valeurs saisies par l'administrateur.
 * Toute lecture passe par ici, ce qui garantit qu'une section jamais éditée
 * s'affiche quand même avec son contenu par défaut.
 */
class Cms
{
    /** Types de champ dont la valeur est stockée en JSON. */
    private const JSON_TYPES = ['list'];

    /** Le schéma complet, tel que déclaré dans config/cms.php. */
    public static function schema(): array
    {
        return config('cms', []);
    }

    public static function sectionSchema(string $section): ?array
    {
        return static::schema()[$section] ?? null;
    }

    /**
     * Contenu résolu d'une section : les valeurs enregistrées, complétées par
     * les valeurs par défaut du schéma pour tout ce qui n'a jamais été édité.
     */
    public static function section(string $section): array
    {
        $schema = static::sectionSchema($section);

        if ($schema === null) {
            return [];
        }

        $stored = ComponentData::where('section', $section)->get()->keyBy('key');

        $resolved = [];

        foreach ($schema['fields'] as $key => $field) {
            $default = $field['default'] ?? static::emptyValueFor($field);

            if (! $stored->has($key)) {
                $resolved[$key] = $default;
                continue;
            }

            $value = $stored[$key]->value;

            if (static::isJsonType($field['type'] ?? 'text')) {
                $decoded = json_decode((string) $value, true);
                $resolved[$key] = is_array($decoded) ? $decoded : $default;
                continue;
            }

            // Une chaîne vide signifie « pas de valeur saisie » : on retombe sur
            // le défaut plutôt que d'afficher un blanc dans la page.
            $resolved[$key] = ($value === null || $value === '') ? $default : $value;
        }

        return $resolved;
    }

    /** Contenu résolu de toutes les sections, prêt à être envoyé à Inertia. */
    public static function all(): array
    {
        $data = [];

        foreach (array_keys(static::schema()) as $section) {
            $data[$section] = static::section($section);
        }

        return $data;
    }

    /** Enregistre les valeurs d'une section, en encodant les champs répétables. */
    public static function put(string $section, array $values): void
    {
        $schema = static::sectionSchema($section);

        if ($schema === null) {
            return;
        }

        foreach ($values as $key => $value) {
            $field = $schema['fields'][$key] ?? null;

            if ($field === null) {
                continue; // clé inconnue du schéma : ignorée
            }

            $type = $field['type'] ?? 'text';

            ComponentData::updateOrCreate(
                ['section' => $section, 'key' => $key],
                [
                    'type' => $type,
                    'value' => static::isJsonType($type)
                        ? json_encode(array_values((array) $value), JSON_UNESCAPED_UNICODE)
                        : (string) $value,
                ]
            );
        }
    }

    public static function isJsonType(string $type): bool
    {
        return in_array($type, self::JSON_TYPES, true);
    }

    private static function emptyValueFor(array $field): mixed
    {
        return static::isJsonType($field['type'] ?? 'text') ? [] : '';
    }
}
