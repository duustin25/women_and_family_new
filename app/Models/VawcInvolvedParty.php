<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VawcInvolvedParty extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vawc_case_id',
        'role',
        'relationship_to_victim',
        'name',
        'age',
        'gender',
        'contact_number',
        'address',
        'is_minor',
        'civil_status',
        'educational_attainment',
        'occupation',
        'physical_description',
    ];

    protected $casts = [
        'age' => 'integer',
        'is_minor' => 'boolean',
        'contact_number' => 'encrypted',
        'address' => 'encrypted',
    ];

    /**
     * The VAWC case this party is involved in.
     */
    public function vawcCase(): BelongsTo
    {
        return $this->belongsTo(VawcCase::class);
    }
}
