<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VawcBpoServiceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'protection_order_id',
        'service_method',
        'served_datetime',
        'served_by_id',
        'receiver_name',
        'refused_to_sign',
        'serving_officer_name',
        'witness_tanod_name',
        'tender_notes',
    ];

    protected $casts = [
        'served_datetime' => 'datetime',
        'refused_to_sign' => 'boolean',
    ];

    /**
     * The protection order this service record belongs to.
     */
    public function protectionOrder(): BelongsTo
    {
        return $this->belongsTo(VawcProtectionOrder::class, 'protection_order_id');
    }

    /**
     * The official who served the order.
     */
    public function servedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'served_by_id');
    }
}
