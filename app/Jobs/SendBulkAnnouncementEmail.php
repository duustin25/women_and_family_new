<?php

namespace App\Jobs;

use App\Models\Member;
use App\Models\MemberCommunication;
use App\Models\Announcement;
use App\Mail\AnnouncementBroadcast;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendBulkAnnouncementEmail implements ShouldQueue
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
        public readonly Announcement $announcement,
        public readonly int $sentById
    ) {}

    /**
     * Execute the job: Send the announcement email to all active members.
     * Gmail SMTP handles high throughput reliably — no artificial delays needed.
     */
    public function handle(): void
    {
        $query = Member::active()
            ->whereNotNull('email')
            ->select(['id', 'email', 'fullname', 'organization_id']);

        // Target organization members if organization_id exists, otherwise global broadcast
        if ($this->announcement->organization_id) {
            $query->where('organization_id', $this->announcement->organization_id);
        }

        $totalSent   = 0;
        $totalFailed = 0;
        $communications = [];

        $subjectPrefix = $this->announcement->organization_id
            ? 'Organization Update: '
            : 'Brgy. 183 Official Announcement: ';

        $query->chunk(50, function ($members) use (&$totalSent, &$totalFailed, &$communications, $subjectPrefix) {
            foreach ($members as $member) {
                $status = 'Sent';

                try {
                    Mail::to($member->email)->send(new AnnouncementBroadcast($this->announcement));
                    $totalSent++;
                } catch (\Throwable $e) {
                    $status = 'Failed';
                    $totalFailed++;
                    Log::error("Failed to broadcast announcement to member {$member->id}", [
                        'exception'       => $e->getMessage(),
                        'announcement_id' => $this->announcement->id,
                    ]);
                }

                $communications[] = [
                    'member_id'  => $member->id,
                    'sent_by'    => $this->sentById,
                    'subject'    => $subjectPrefix . $this->announcement->title,
                    'body'       => $this->announcement->excerpt,
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

        Log::info("Bulk Announcement email job completed.", [
            'announcement_id' => $this->announcement->id,
            'title'           => $this->announcement->title,
            'org_id'          => $this->announcement->organization_id ?? 'ALL',
            'sent'            => $totalSent,
            'failed'          => $totalFailed,
        ]);
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical("SendBulkAnnouncementEmail job FAILED entirely.", [
            'announcement_id' => $this->announcement->id,
            'exception'       => $exception->getMessage(),
        ]);
    }
}
