<?php

namespace App\Jobs;

use App\Models\Member;
use App\Models\MemberCommunication;
use App\Mail\GeneralMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendBulkMemberEmail implements ShouldQueue
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
        public readonly string $subject,
        public readonly string $body,
        public readonly int $sentById,
        public readonly ?int $organizationId = null
    ) {}

    /**
     * Execute the job: Send emails to all eligible members using chunked processing.
     * Gmail SMTP handles high throughput reliably — no artificial delays needed.
     */
    public function handle(): void
    {
        $query = Member::query()
            ->whereIn('status', ['Active', 'active'])
            ->whereNotNull('email')
            ->select(['id', 'email', 'fullname', 'organization_id']);

        // Scope to a specific organization if provided (President RBAC)
        if ($this->organizationId) {
            $query->where('organization_id', $this->organizationId);
        }

        $totalSent    = 0;
        $totalFailed  = 0;
        $communications = [];

        // Chunk through members to avoid loading all records into memory at once
        $query->chunk(50, function ($members) use (&$totalSent, &$totalFailed, &$communications) {
            foreach ($members as $member) {
                $status = 'Sent';

                try {
                    Mail::to($member->email)->send(new GeneralMessage($this->subject, $this->body));
                    $totalSent++;
                } catch (\Throwable $e) {
                    $status = 'Failed';
                    $totalFailed++;
                    Log::error("BulkEmail failed for Member ID {$member->id} ({$member->email})", [
                        'exception' => $e->getMessage(),
                        'subject'   => $this->subject,
                    ]);
                }

                // Buffer audit log entries and insert in batches for performance
                $communications[] = [
                    'member_id'  => $member->id,
                    'sent_by'    => $this->sentById,
                    'subject'    => $this->subject,
                    'body'       => $this->body,
                    'type'       => 'Bulk',
                    'status'     => $status,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Flush to database every 50 records
                if (count($communications) >= 50) {
                    MemberCommunication::insert($communications);
                    $communications = [];
                }
            }
        });

        // Flush any remaining buffered communications
        if (!empty($communications)) {
            MemberCommunication::insert($communications);
        }

        Log::info("Bulk Member email job completed.", [
            'subject' => $this->subject,
            'org_id'  => $this->organizationId ?? 'ALL',
            'sent'    => $totalSent,
            'failed'  => $totalFailed,
        ]);
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical("SendBulkMemberEmail job FAILED entirely.", [
            'subject'   => $this->subject,
            'org_id'    => $this->organizationId ?? 'ALL',
            'exception' => $exception->getMessage(),
        ]);
    }
}
