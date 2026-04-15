<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class VawcCase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'case_report_id',
        'intake_type',
        'children_count',
        'is_repeat_offense',
        'has_weapon_involved',
        'incident_veracity',
        'perpetrator_present',
        'warrantless_arrest_made',
        'weapons_confiscated',
        'status',
        'referral_status',
        'witness_info',
        'action_sought',
        'closure_reason',
        'closure_remarks',
        'closed_at',
    ];

    protected $casts = [
        'is_repeat_offense' => 'boolean',
        'has_weapon_involved' => 'boolean',
        'incident_veracity' => 'boolean',
        'perpetrator_present' => 'boolean',
        'warrantless_arrest_made' => 'boolean',
        'weapons_confiscated' => 'boolean',
        'closed_at' => 'datetime',
    ];

    /**
     * The core CaseReport this VAWC case belongs to.
     */
    public function caseReport(): BelongsTo
    {
        return $this->belongsTo(CaseReport::class);
    }

    /**
     * All parties involved (Victims, Respondents, etc.).
     */
    public function involvedParties(): HasMany
    {
        return $this->hasMany(VawcInvolvedParty::class);
    }

    /**
     * The medical/safety assessment for this case.
     */
    public function assessment(): HasOne
    {
        return $this->hasOne(VawcAssessment::class);
    }

    /**
     * Legal protection orders associated with this case (BPO, TPO, PPO).
     */
    public function protectionOrders(): HasMany
    {
        return $this->hasMany(VawcProtectionOrder::class);
    }

    /**
     * Monitoring logs for BPO compliance and counseling.
     */
    public function complianceLogs(): HasMany
    {
        return $this->hasMany(VawcComplianceLog::class);
    }

    /**
     * Legal escalation and court filings for BPO violations.
     */
    public function escalations(): HasMany
    {
        return $this->hasMany(VawcLegalEscalation::class);
    }
}
