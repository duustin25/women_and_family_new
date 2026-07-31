<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\GadEvent;

class GadEventProposalUpdated extends Notification
{
    use Queueable;

    public $event;
    public $isResubmission;

    /**
     * Create a new notification instance.
     */
    public function __construct(GadEvent $event, bool $isResubmission = false)
    {
        $this->event = $event;
        $this->isResubmission = $isResubmission;
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
        $title = $this->isResubmission ? 'Event Proposal Resubmitted' : 'Event Proposal Updated';
        $message = $this->isResubmission 
            ? "The rescheduled event '{$this->event->title}' has been resubmitted for approval."
            : "The event proposal '{$this->event->title}' has been updated.";

        return [
            'type' => 'proposal_updated',
            'event_id' => $this->event->id,
            'title' => $title,
            'message' => $message,
            'link' => '/admin/gad/events?status=pending'
        ];
    }
}
