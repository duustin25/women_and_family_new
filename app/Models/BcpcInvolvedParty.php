<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BcpcInvolvedParty extends Model
{
    protected $fillable = [
        'bcpc_case_id',
        'role',
        'name',
        'age',
        'gender',
        'contact',
        'address',
    ];

    public function bcpcCase(): BelongsTo
    {
        return $this->belongsTo(BcpcCase::class);
    }
}
