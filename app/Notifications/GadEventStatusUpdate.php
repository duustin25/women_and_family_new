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
            'rejected' => 'Disapproved',
            'reschedule_requested' => 'Reschedule Requested'
        ];

        $statusText = $statusMap[$this->event->status] ?? $this->event->status;

        $message = "Your event '{$this->event->title}' status is {$statusText}.";
        if ($this->event->status === 'approved') {
            $message = "Your event proposal '{$this->event->title}' has been approved and published to the public calendar.";
        } elseif ($this->event->status === 'rejected') {
            $message = "Your event proposal '{$this->event->title}' has been disapproved." . ($this->event->reject_reason ? " Reason: {$this->event->reject_reason}" : "");
        } elseif ($this->event->status === 'reschedule_requested') {
            $message = "A reschedule has been requested for your event proposal '{$this->event->title}'." . ($this->event->reject_reason ? " Reason: {$this->event->reject_reason}" : "");
        }

        return [
            'type' => 'status_update',
            'event_id' => $this->event->id,
            'title' => "Proposal {$statusText}",
            'message' => $message,
            'link' => '/admin/organization/events'
        ];
    }
}
