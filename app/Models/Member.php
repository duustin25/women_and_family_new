<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin \Eloquent
 */
class Member extends Model
{
    public const STATUS_ACTIVE = 'Active';
    public const STATUS_INACTIVE = 'Inactive';

    protected $fillable = [
        'membership_application_id',
        'organization_id',
        'fullname',
        'email',
        'phone',
        'secure_token',
        'member_meta',
        'status',
        'last_accessed_at',
    ];

    protected $casts = [
        'member_meta' => 'array',
        'last_accessed_at' => 'datetime',
    ];

    /**
     * Normalize status values upon saving.
     */
    public function setStatusAttribute($value): void
    {
        if (!$value) {
            $this->attributes['status'] = self::STATUS_ACTIVE;
            return;
        }

        $lower = strtolower(trim($value));
        if ($lower === 'active') {
            $this->attributes['status'] = self::STATUS_ACTIVE;
        } else {
            $this->attributes['status'] = ucfirst($lower);
        }
    }

    /**
     * Scope for active members (handles case insensitivity).
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['Active', 'active']);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function application()
    {
        return $this->belongsTo(MembershipApplication::class, 'membership_application_id');
    }

    public function communications()
    {
        return $this->hasMany(MemberCommunication::class);
    }

    public function dispatches()
    {
        return $this->hasMany(BeneficiaryDispatch::class);
    }
}
