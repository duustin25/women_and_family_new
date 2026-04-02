<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VawcAssessment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vawc_case_id',
        'requires_medical',
        'medical_notes',
        'requires_alternative_housing',
        'housing_notes',
        'lswo_referral_made',
        'dswd_referral_made',
    ];

    protected $casts = [
        'requires_medical' => 'boolean',
        'requires_alternative_housing' => 'boolean',
        'lswo_referral_made' => 'boolean',
        'dswd_referral_made' => 'boolean',
        'medical_notes' => 'encrypted',
        'housing_notes' => 'encrypted',
    ];

    /**
     * The VAWC case this assessment belongs to.
     */
    public function vawcCase(): BelongsTo
    {
        return $this->belongsTo(VawcCase::class);
    }
}
