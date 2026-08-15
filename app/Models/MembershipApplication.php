<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipApplication extends Model
{
    public const STATUS_PENDING = 'Pending';
    public const STATUS_APPROVED = 'Approved';
    public const STATUS_DISAPPROVED = 'Disapproved';
    public const STATUS_REJECTED = 'Disapproved';
    public const STATUS_APPEALED = 'Appealed';
    public const STATUS_FINAL_DISAPPROVED = 'Final Disapproved';

    protected $fillable = [
        'organization_id',
        'fullname',
        'address',
        'email',
        'form_data',
        'status',
        'rejection_reason',
        'rejected_at',
        'appeal_reason',
        'appeal_docs',
        'appealed_at',
        'approval_type',
        'recommended_by',
        'approved_by',
        'actioned_at'
    ];

    protected $casts = [
        'form_data' => 'array',
        'appeal_docs' => 'array',
        'rejected_at' => 'datetime',
        'appealed_at' => 'datetime',
        'actioned_at' => 'datetime',
    ];

    /**
     * Normalize status values upon saving.
     */
    public function setStatusAttribute($value): void
    {
        if (!$value) {
            $this->attributes['status'] = self::STATUS_PENDING;
            return;
        }

        $lower = strtolower(trim($value));
        if ($lower === 'approved') {
            $this->attributes['status'] = self::STATUS_APPROVED;
        } elseif (in_array($lower, ['disapproved', 'rejected'])) {
            $this->attributes['status'] = self::STATUS_DISAPPROVED;
        } elseif ($lower === 'appealed') {
            $this->attributes['status'] = self::STATUS_APPEALED;
        } elseif (in_array($lower, ['final_disapproved', 'final disapproved'])) {
            $this->attributes['status'] = self::STATUS_FINAL_DISAPPROVED;
        } else {
            $this->attributes['status'] = ucfirst($lower);
        }
    }

    /**
     * Scope for approved applications (handles case insensitivity & variants).
     */
    public function scopeApproved($query)
    {
        return $query->whereIn('status', ['Approved', 'approved']);
    }

    /**
     * Scope for disapproved / rejected applications.
     */
    public function scopeDisapproved($query)
    {
        return $query->whereIn('status', ['Disapproved', 'disapproved', 'rejected', 'Final Disapproved', 'final_disapproved']);
    }

    /**
     * Scope for pending applications.
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['Pending', 'pending']);
    }

    /**
     * Each application belongs to one organization.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}