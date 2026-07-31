<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\MembershipApplication;

class MembershipApplicationStatusChanged extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public MembershipApplication $application,
        public string $status,
        public string $actionedBy
    ) {
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
        $statusText = $this->status === 'Approved' ? 'Approved' : 'Disapproved';

        return [
            'type' => 'application_status_changed',
            'application_id' => $this->application->id,
            'title' => "Application {$statusText}",
            'message' => "The membership application for '{$this->application->fullname}' has been {$statusText} by {$this->actionedBy}.",
            'link' => '/admin/applications'
        ];
    }
}
