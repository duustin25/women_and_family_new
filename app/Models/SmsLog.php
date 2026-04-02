<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    protected $fillable = [
        'recipient',
        'message',
        'status',
        'gateway_response',
        'error_message'
    ];
}
