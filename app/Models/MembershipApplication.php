<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipApplication extends Model
{
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
     * Each application belongs to one organization.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}