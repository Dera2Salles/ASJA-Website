<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = [
        'slug', 'name', 'description', 'logo', 'hero_image',
        'is_visible', 'sort_order', 'parcours', 'events', 'stats',
    ];

    /**
     * La couleur propre à chaque mention n'est plus utilisée : les pages de
     * mention suivent le thème unique du site. La colonne subsiste en base
     * (aucune donnée n'est détruite) mais n'est plus exposée au front.
     */
    protected $hidden = ['color'];

    protected $casts = [
        'is_visible' => 'boolean',
        'parcours'   => 'array',
        'events'     => 'array',
        'stats'      => 'array',
    ];

    public function programs(): HasMany
    {
        return $this->hasMany(DepartmentProgram::class)->orderBy('sort_order');
    }
}
