<?php

namespace App\Jobs;

use App\Models\Member;
use App\Models\MemberCommunication;
use App\Models\GadEvent;
use App\Mail\EventInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendBulkGadEventEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly GadEvent $event,
        public readonly int $sentById
    ) {}

    /**
     * Execute the job: Send the GAD event invitation email to all active members.
     */
    public function handle(): void
    {
        $query = Member::where('status', 'Active')->whereNotNull('email');

        // Target organization members if organization_id exists, otherwise global broadcast
        if ($this->event->organization_id) {
            $query->where('organization_id', $this->event->organization_id);
        }

        $members = $query->get();

        set_time_limit(120); // Prevent PHP timeout in sync queue

        foreach ($members as $member) {
            $status = 'Sent';
            try {
                Mail::to($member->email)->send(new EventInvitation($this->event));
            } catch (\Throwable $e) {
                $status = 'Failed';
                Log::error("Failed to broadcast GAD Event to member {$member->id}", ['exception' => $e]);
            }

            // Audit Trail
            MemberCommunication::create([
                'member_id' => $member->id,
                'sent_by'   => $this->sentById,
                'subject'   => 'Official Event Invitation: ' . $this->event->title,
                'body'      => $this->event->description,
                'type'      => 'Bulk',
                'status'    => $status,
            ]);
        }

        Log::info("Bulk GAD event email dispatched to {$members->count()} members.");
    }
}
