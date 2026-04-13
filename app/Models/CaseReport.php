<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CaseReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'zone_id',
        'abuse_type_id',
        'type',
        'case_number',
        'victim_name',
        'victim_age',
        'victim_gender',
        'complainant_name',
        'complainant_contact',
        'relation_to_victim',
        'incident_date',
        'incident_location',
        'description',
        'is_anonymous',
        'lifecycle_status',
        'handled_by_id'
    ];

    protected $casts = [
        'incident_date' => 'datetime',
        'is_anonymous' => 'boolean',
    ];

    /**
     * The Official Abuse Type categorization.
     */
    public function abuseType(): BelongsTo
    {
        return $this->belongsTo(CaseAbuseType::class, 'abuse_type_id');
    }

    /**
     * Relationship with the Zone where incident occurred.
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Specialized VAWC data if this is a VAWC case.
     */
    public function vawcCase(): HasOne
    {
        return $this->hasOne(VawcCase::class, 'case_report_id');
    }



    /**
     * Accountability: Staff who handled this case.
     */
    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by_id');
    }
}
