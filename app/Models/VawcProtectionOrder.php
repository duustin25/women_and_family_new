<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VawcProtectionOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vawc_case_id',
        'type',
        'status',
        'application_datetime',
        'issued_datetime',
        'is_sla_breached',
        'expiration_date',
        'issued_by_id',
    ];

    protected $casts = [
        'is_sla_breached' => 'boolean',
        'application_datetime' => 'datetime',
        'issued_datetime' => 'datetime',
        'expiration_date' => 'date',
    ];

    /**
     * The VAWC case this order belongs to.
     */
    public function vawcCase(): BelongsTo
    {
        return $this->belongsTo(VawcCase::class);
    }

    /**
     * Records of how this order was served to the respondent.
     */
    public function serviceRecords(): HasMany
    {
        return $this->hasMany(VawcBpoServiceRecord::class, 'protection_order_id');
    }

    /**
     * Records of transmission to external agencies (PNP).
     */
    public function transmittals(): HasMany
    {
        return $this->hasMany(VawcAgencyTransmittal::class, 'protection_order_id');
    }

    /**
     * The official who issued the order.
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by_id');
    }
}
