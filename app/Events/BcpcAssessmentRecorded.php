<?php

namespace App\Events;

use App\Models\BcpcChild;
use App\Models\BcpcAssessment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BcpcAssessmentRecorded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public BcpcChild $child,
        public BcpcAssessment $assessment
    ) {
        //
    }
}
