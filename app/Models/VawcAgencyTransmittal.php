<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VawcAgencyTransmittal extends Model
{
    use HasFactory;

    protected $fillable = [
        'protection_order_id',
        'agency',
        'transmittal_datetime',
        'document_path',
        'status',
    ];

    protected $casts = [
        'transmittal_datetime' => 'datetime',
    ];

    /**
     * The protection order this transmittal is for.
     */
    public function protectionOrder(): BelongsTo
    {
        return $this->belongsTo(VawcProtectionOrder::class, 'protection_order_id');
    }
}
