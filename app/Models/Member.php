<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
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
