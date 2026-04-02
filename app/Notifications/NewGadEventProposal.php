<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\GadEvent;

class NewGadEventProposal extends Notification
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
        return [
            'type' => 'new_proposal',
            'event_id' => $this->event->id,
            'title' => 'New Event Proposal',
            'message' => "A new event '{$this->event->title}' is pending approval.",
            'link' => '/admin/gad/events?status=pending'
        ];
    }
}
