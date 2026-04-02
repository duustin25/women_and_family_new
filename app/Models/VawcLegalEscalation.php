<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VawcLegalEscalation extends Model
{
    protected $fillable = [
        'vawc_case_id',
        'violation_datetime',
        'referral_target',
        'escorted_by_pb',
        'status',
        'violation_description',
    ];

    protected $casts = [
        'violation_datetime' => 'datetime',
        'escorted_by_pb' => 'boolean',
    ];

    public function case()
    {
        return $this->belongsTo(VawcCase::class, 'vawc_case_id');
    }
}
