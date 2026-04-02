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
        'recommended_by',
        'approved_by',
        'actioned_at'
    ];

    protected $casts = [
        'form_data' => 'array',
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