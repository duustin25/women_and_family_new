<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class VawcCase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'dossier_id',
        'incident_sequence',
        'sub_case_number',
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
        'incident_sequence' => 'integer',
        'is_repeat_offense' => 'boolean',
        'has_weapon_involved' => 'boolean',
        'incident_veracity' => 'boolean',
        'perpetrator_present' => 'boolean',
        'warrantless_arrest_made' => 'boolean',
        'weapons_confiscated' => 'boolean',
        'closed_at' => 'datetime',
        'referral_status' => 'array',
        'action_sought' => 'array',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Retrieve the model for a bound value (supports both UUID and legacy ID).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('uuid', $value)
            ->orWhere('id', is_numeric($value) ? (int)$value : 0)
            ->firstOrFail();
    }

    /**
     * Resilient accessor for referral_status ensuring clean array output.
     */
    public function getReferralStatusAttribute($value)
    {
        if (is_array($value)) return $value;
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_string($decoded)) {
                $decoded = json_decode($decoded, true);
            }
            return is_array($decoded) ? $decoded : [];
        }
        return [];
    }

    /**
     * Resilient accessor for action_sought ensuring clean array output.
     */
    public function getActionSoughtAttribute($value)
    {
        if (is_array($value)) return $value;
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_string($decoded)) {
                $decoded = json_decode($decoded, true);
            }
            return is_array($decoded) ? $decoded : [];
        }
        return [];
    }

    /**
     * The Master Dossier this VAWC incident belongs to.
     */
    public function dossier(): BelongsTo
    {
        return $this->belongsTo(VawcDossier::class, 'dossier_id');
    }

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
