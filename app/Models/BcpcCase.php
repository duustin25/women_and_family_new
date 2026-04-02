<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BcpcCase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'case_report_id',
        'cicl_age_during_offense',
        'acted_with_discernment',
        'is_victimless_crime',
        'diversion_program_type',
        'contract_signed_date',
        'status',
        'closure_reason',
    ];

    protected $casts = [
        'acted_with_discernment' => 'boolean',
        'is_victimless_crime' => 'boolean',
        'contract_signed_date' => 'date',
    ];

    public function caseReport(): BelongsTo
    {
        return $this->belongsTo(CaseReport::class);
    }

    public function involvedParties(): HasMany
    {
        return $this->hasMany(BcpcInvolvedParty::class);
    }

    public function complianceLogs(): HasMany
    {
        return $this->hasMany(BcpcComplianceLog::class);
    }
}
