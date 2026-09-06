<?php

namespace App\Support;

use App\Models\Department;
use Illuminate\Validation\Rule;

/**
 * La fiche scolaire d'un étudiant, partagée par l'inscription et l'espace
 * étudiant.
 *
 * Les deux écrans écrivent exactement les mêmes colonnes de `users` : la
 * réinscription n'est rien d'autre que la mise à jour de cette fiche pour la
 * nouvelle année. Les règles vivent donc ici plutôt qu'en double dans les deux
 * contrôleurs, où elles auraient fini par diverger.
 */
class StudentFile
{
    /** Niveaux du système LMD proposés au choix, dans l'ordre du cursus. */
    public const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];

    /**
     * Règles de validation de la fiche.
     *
     * La mention est contrainte aux slugs réellement en base : une liste
     * écrite en dur se serait désynchronisée dès la première mention ajoutée
     * depuis l'administration.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'contact'   => ['nullable', 'string', 'max:50'],
            'mention'   => ['nullable', 'string', Rule::in(static::mentionSlugs())],
            'level'     => ['nullable', 'string', Rule::in(static::LEVELS)],
            'branche'   => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Mentions proposées au choix : slug (valeur stockée) et nom (affiché).
     *
     * @return array<int, array{slug: string, name: string}>
     */
    public static function mentions(): array
    {
        return Department::where('is_visible', true)
            ->orderBy('sort_order')
            ->get(['slug', 'name'])
            ->map(fn (Department $department) => [
                'slug' => $department->slug,
                'name' => $department->name,
            ])
            ->all();
    }

    /** @return array<int, string> */
    private static function mentionSlugs(): array
    {
        return array_column(static::mentions(), 'slug');
    }
}
