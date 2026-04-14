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
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 120;

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
     * Execute the job: Send the email to all eligible members.
     */
    public function handle(): void
    {
        $query = Member::query()->whereNotNull('email');

        // Scope to a specific organization if provided (President RBAC)
        if ($this->organizationId) {
            $query->where('organization_id', $this->organizationId);
        }

        $members = $query->get();

        foreach ($members as $member) {
            try {
                Mail::to($member->email)->send(new GeneralMessage($this->subject, $this->body));

                MemberCommunication::create([
                    'member_id' => $member->id,
                    'sent_by'   => $this->sentById,
                    'subject'   => $this->subject,
                    'body'      => $this->body,
                    'type'      => 'Bulk',
                    'status'    => 'Sent',
                ]);
            } catch (\Throwable $e) {
                Log::error("BulkEmail failed for member ID {$member->id}: " . $e->getMessage());
            }
        }

        Log::info("Bulk email dispatched to {$members->count()} members.");
    }
}
