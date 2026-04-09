<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationalMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'position',
        'committee',
        'level',
        'image_path',
        'display_order',
        'is_active'
    ];

    /**
     * Relationship with the System User (Head Official).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
