<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
{
    protected $fillable = ['name', 'color_code', 'description', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the case reports for the zone.
     */
    public function caseReports(): HasMany
    {
        return $this->hasMany(CaseReport::class);
    }
}
