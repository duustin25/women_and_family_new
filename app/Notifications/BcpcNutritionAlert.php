<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\BcpcChild;
use App\Models\BcpcAssessment;

class BcpcNutritionAlert extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public BcpcChild $child,
        public BcpcAssessment $assessment,
        public string $alertType // 'sfp_enrolled', 'sfp_graduated', or 'malnutrition_triage'
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
        $childName = $this->child->full_name;
        $wfa = $this->assessment->wfa_status;

        if ($this->alertType === 'sfp_graduated') {
            $title = '🎉 BCPC SFP Graduation';
            $message = "{$childName} has recovered to Normal weight status and successfully graduated from the Supplementary Feeding Program!";
        } elseif ($this->alertType === 'sfp_enrolled') {
            $title = '🚨 BCPC SFP Enrollment Alert';
            $message = "{$childName} was evaluated as {$wfa} and enrolled in the Supplementary Feeding Program (SFP).";
        } else {
            $title = '🚨 BCPC Malnutrition Alert';
            $message = "{$childName} has been evaluated as {$wfa}. Immediate nutrition intervention recommended.";
        }

        return [
            'type' => 'bcpc_nutrition_alert',
            'child_id' => $this->child->id,
            'title' => $title,
            'message' => $message,
            'link' => '/admin/bcpc'
        ];
    }
}
