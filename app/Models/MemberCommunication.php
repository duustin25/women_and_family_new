<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberCommunication extends Model
{
    protected $fillable = [
        'member_id',
        'sent_by',
        'subject',
        'body',
        'type',
        'status',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
