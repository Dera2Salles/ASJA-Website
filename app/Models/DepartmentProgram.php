<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepartmentProgram extends Model
{
    protected $fillable = [
        'department_id', 'title', 'description', 'competences', 'debouches', 'sort_order',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
