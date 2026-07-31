<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\MembershipApplication;

class NewMembershipApplication extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public MembershipApplication $application)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_application',
            'application_id' => $this->application->id,
            'title' => 'New Membership Application',
            'message' => "A new membership application from '{$this->application->fullname}' is pending approval.",
            'link' => '/admin/applications?status=Pending'
        ];
    }
}
