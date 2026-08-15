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
     * The number of seconds to wait before retrying on failure.
     *
     * @var array<int>
     */
    public array $backoff = [30, 60];

    /**
     * The maximum number of seconds the job may run before it is killed.
     */
    public int $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly GadEvent $event,
        public readonly int $sentById
    ) {}

    /**
     * Execute the job: Send the GAD event invitation email to all active members.
     * Gmail SMTP handles high throughput reliably — no artificial delays needed.
     */
    public function handle(): void
    {
        $query = Member::active()
            ->whereNotNull('email')
            ->select(['id', 'email', 'fullname', 'organization_id']);

        // Target organization members if organization_id exists, otherwise global broadcast
        if ($this->event->organization_id) {
            $query->where('organization_id', $this->event->organization_id);
        }

        $totalSent   = 0;
        $totalFailed = 0;
        $communications = [];

        $query->chunk(50, function ($members) use (&$totalSent, &$totalFailed, &$communications) {
            foreach ($members as $member) {
                $status = 'Sent';

                try {
                    Mail::to($member->email)->send(new EventInvitation($this->event));
                    $totalSent++;
                } catch (\Throwable $e) {
                    $status = 'Failed';
                    $totalFailed++;
                    Log::error("Failed to broadcast GAD Event to member {$member->id}", [
                        'exception' => $e->getMessage(),
                        'event_id'  => $this->event->id,
                    ]);
                }

                $communications[] = [
                    'member_id'  => $member->id,
                    'sent_by'    => $this->sentById,
                    'subject'    => 'Official Event Invitation: ' . $this->event->title,
                    'body'       => $this->event->description,
                    'type'       => 'Bulk',
                    'status'     => $status,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                if (count($communications) >= 50) {
                    MemberCommunication::insert($communications);
                    $communications = [];
                }
            }
        });

        if (!empty($communications)) {
            MemberCommunication::insert($communications);
        }

        Log::info("Bulk GAD event email job completed.", [
            'event_id' => $this->event->id,
            'title'    => $this->event->title,
            'org_id'   => $this->event->organization_id ?? 'ALL',
            'sent'     => $totalSent,
            'failed'   => $totalFailed,
        ]);
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical("SendBulkGadEventEmail job FAILED entirely.", [
            'event_id'  => $this->event->id,
            'exception' => $exception->getMessage(),
        ]);
    }
}
