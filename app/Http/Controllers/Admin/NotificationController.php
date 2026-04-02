<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(string $id)
    {
        $notification = \Illuminate\Support\Facades\Auth::user()->unreadNotifications->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return redirect()->back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        \Illuminate\Support\Facades\Auth::user()->unreadNotifications->markAsRead();
        
        return redirect()->back();
    }
}
