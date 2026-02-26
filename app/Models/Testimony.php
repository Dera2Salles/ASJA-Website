<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimony extends Model
{
    protected $fillable = [
        'name',
        'role',
        'content',
        'avatar',
        'is_visible',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
    ];
}
