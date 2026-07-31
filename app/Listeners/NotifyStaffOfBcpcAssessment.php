<?php

namespace App\Listeners;

use App\Events\BcpcAssessmentRecorded;
use App\Models\User;
use App\Notifications\BcpcNutritionAlert;
use Illuminate\Support\Facades\Notification;

class NotifyStaffOfBcpcAssessment
{
    /**
     * Handle the event.
     */
    public function handle(BcpcAssessmentRecorded $event): void
    {
        $child = $event->child;
        $assessment = $event->assessment;
        $wfa = $assessment->wfa_status;

        $alertType = null;

        // Determine if a notification trigger condition was met
        if ($child->sfp_status === 'Graduated' && $wfa === 'Normal') {
            $alertType = 'sfp_graduated';
        } elseif ($child->sfp_status === 'Enrolled' && in_array($wfa, ['Underweight', 'Severely Underweight'])) {
            $alertType = 'sfp_enrolled';
        } elseif (in_array($wfa, ['Underweight', 'Severely Underweight'])) {
            $alertType = 'malnutrition_triage';
        }

        if ($alertType) {
            // Target both Barangay Admin ('admin') and Committee Head / Desk Secretary ('head')
            $staff = User::whereIn('role', ['admin', 'head'])->get();

            if ($staff->isNotEmpty()) {
                Notification::send($staff, new BcpcNutritionAlert($child, $assessment, $alertType));
            }
        }
    }
}
