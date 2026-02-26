<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComponentData extends Model
{
    protected $fillable = [
        'section',
        'key',
        'value',
    ];

    /**
     * Get all data for a given section as a flat key => value array.
     */
    public static function forSection(string $section): array
    {
        return static::where('section', $section)
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * Upsert a value for a section/key pair.
     */
    public static function setValue(string $section, string $key, mixed $value): static
    {
        return static::updateOrCreate(
            ['section' => $section, 'key' => $key],
            ['value' => $value]
        );
    }
}
