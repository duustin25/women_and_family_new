<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VawcComplianceLog extends Model
{
    protected $fillable = [
        'vawc_case_id',
        'monitor_date',
        'is_compliant',
        'notes',
        'referral_type',
        'referral_details',
    ];

    protected $casts = [
        'monitor_date' => 'datetime',
        'is_compliant' => 'boolean',
    ];

    public function case()
    {
        return $this->belongsTo(VawcCase::class, 'vawc_case_id');
    }
}
