<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailOtp extends Model
{
    // Action Constants
    const ACTION_ACTIVATION = 'ACCOUNT_ACTIVATION';
    const ACTION_EMAIL_CHANGE = 'EMAIL_CHANGE';
    const ACTION_PASSWORD_CHANGE = 'PASSWORD_CHANGE';
    const ACTION_ACCOUNT_DELETION = 'ACCOUNT_DELETION';

    protected $fillable = [
        'user_id',
        'action',
        'target_value',
        'otp_hash',
        'panic_token_hash',
        'attempts',
        'is_used',
        'expires_at',
    ];

    protected $casts = [
        'attempts' => 'integer',
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
    ];

    /**
     * The user this OTP belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Unused, valid and unexpired tokens.
     */
    public function scopeActive($query)
    {
        return $query->where('is_used', false)
                     ->where('expires_at', '>', now());
    }
}
