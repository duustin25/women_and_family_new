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
        $statusText = match ($this->status) {
            'Approved' => 'Approved',
            'Rejected' => 'Rejected',
            'Appealed' => 'Appealed & Escalated',
            default => $this->status,
        };

        $link = match ($this->status) {
            'Rejected', 'Appealed' => '/admin/applications/appeals',
            default => '/admin/applications',
        };

        $message = match ($this->status) {
            'Rejected' => "Application for '{$this->application->fullname}' was rejected by {$this->actionedBy} and placed in the Appeals Queue.",
            'Appealed' => "Resident '{$this->application->fullname}' submitted an appeal statement contesting rejection.",
            'Approved' => "Application for '{$this->application->fullname}' was approved ({$this->actionedBy}).",
            default => "Membership application for '{$this->application->fullname}' status updated to {$this->status}.",
        };

        return [
            'type' => 'application_status_changed',
            'application_id' => $this->application->id,
            'title' => "Application {$statusText}",
            'message' => $message,
            'link' => $link
        ];
    }
}
