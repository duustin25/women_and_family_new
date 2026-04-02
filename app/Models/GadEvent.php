<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GadEvent extends Model
{
    protected $fillable = [
        'title',
        'description',
        'event_date',
        'event_time',
        'location',
        'image_path',
        'organization_id',
        'status',
        'reject_reason',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];

    /**
     * RELATIONSHIP: An event belongs to an organization.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
