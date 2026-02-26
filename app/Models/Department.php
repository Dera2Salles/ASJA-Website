<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = [
        'slug', 'name', 'description', 'logo', 'hero_image',
        'color', 'is_visible', 'sort_order', 'parcours', 'events', 'stats',
    ];

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
