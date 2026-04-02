<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\GadEvent;

class GadEventStatusUpdate extends Notification
{
    use Queueable;

    public $event;

    /**
     * Create a new notification instance.
     */
    public function __construct(GadEvent $event)
    {
        $this->event = $event;
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
        $statusMap = [
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'reschedule_requested' => 'Reschedule Requested'
        ];

        $statusText = $statusMap[$this->event->status] ?? $this->event->status;

        return [
            'type' => 'status_update',
            'event_id' => $this->event->id,
            'title' => "Proposal {$statusText}",
            'message' => "Your event '{$this->event->title}' has been {$this->event->status}.",
            'link' => '/admin/organization/events'
        ];
    }
}
