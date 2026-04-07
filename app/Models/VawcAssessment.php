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
        'abuse_frequency',
        'abuse_severity',
        'weapon_access',
        'life_threat_level',
        'risk_score',
        'risk_level',
    ];

    protected $casts = [
        'requires_medical' => 'boolean',
        'requires_alternative_housing' => 'boolean',
        'lswo_referral_made' => 'boolean',
        'dswd_referral_made' => 'boolean',
        'medical_notes' => 'encrypted',
        'housing_notes' => 'encrypted',
        'risk_score' => 'float',
    ];

    /**
     * The model's boot method.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($assessment) {
            $service = new \App\Services\RiskAssessmentService();
            $result = $service->calculateVawcRisk($assessment);
            
            $assessment->risk_score = $result['score'];
            $assessment->risk_level = $result['level'];
        });
    }

    /**
     * The VAWC case this assessment belongs to.
     */
    public function vawcCase(): BelongsTo
    {
        return $this->belongsTo(VawcCase::class);
    }
}
