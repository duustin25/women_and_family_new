<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BcpcComplianceLog extends Model
{
    protected $fillable = [
        'bcpc_case_id',
        'logged_by_id',
        'monitor_date',
        'is_compliant',
        'notes',
        'attachment_path',
    ];

    protected $casts = [
        'monitor_date' => 'date',
        'is_compliant' => 'boolean',
    ];

    public function bcpcCase(): BelongsTo
    {
        return $this->belongsTo(BcpcCase::class);
    }

    public function logger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logged_by_id');
    }
}
