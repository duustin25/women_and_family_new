<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BeneficiaryDispatch extends Model
{
    protected $fillable = [
        'member_id',
        'benefit_name',
        'reference_number',
        'status',
        'claimed_at',
    ];

    protected $casts = [
        'claimed_at' => 'datetime',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
