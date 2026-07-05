<?php

namespace App\Console\Commands;

use App\Models\Member;
use App\Jobs\SendBulkMemberEmail;
use App\Mail\GeneralMessage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TestMailSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * php artisan mail:test                       → SMTP connection check
     * php artisan mail:test --send=you@test.com   → Send a single test email
     * php artisan mail:test --bulk                 → Dispatch a real bulk job to the queue
     * php artisan mail:test --bulk --org=1         → Bulk to a specific organization
     */
    protected $signature = 'mail:test
                            {--send= : Send a single test email to the given address}
                            {--bulk  : Dispatch a bulk email job for all active members}
                            {--org=  : Restrict bulk test to this organization ID}';

    /**
     * The console command description.
     */
    protected $description = 'Test the WFP email system: SMTP connectivity, individual send, and bulk dispatch';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('');
        $this->info('╔══════════════════════════════════════════╗');
        $this->info('║    WFP System — Email System Health Check ║');
        $this->info('╚══════════════════════════════════════════╝');
        $this->info('');

        // --- 1. Print current config ---
        $this->line('<fg=cyan>📧 Mail Configuration</>');
        $this->table(['Key', 'Value'], [
            ['Mailer',     config('mail.default')],
            ['Host',       config('mail.mailers.smtp.host')],
            ['Port',       config('mail.mailers.smtp.port')],
            ['Encryption', config('mail.mailers.smtp.encryption')],
            ['Username',   config('mail.mailers.smtp.username')],
            ['From',       config('mail.from.address')],
            ['Queue',      config('queue.default')],
        ]);

        // --- 2. SMTP connection test (raw send) ---
        $this->info('Testing SMTP connection...');
        try {
            Mail::raw('[WFP SMTP CHECK] Connection test at ' . now(), function ($m) {
                $m->to('smtp-check@inbox.mailtrap.io')
                  ->subject('[WFP] SMTP Connection Test');
            });
            $this->info('<fg=green>✅ SMTP connection: OK — Mailtrap received the test ping!</>');
        } catch (\Throwable $e) {
            $this->error('❌ SMTP connection FAILED: ' . $e->getMessage());
            return self::FAILURE;
        }

        // --- 3. Single email send test ---
        if ($address = $this->option('send')) {
            $this->info("Sending single test email to: {$address}");
            try {
                Mail::to($address)->send(new GeneralMessage(
                    '[WFP TEST] Individual Email Test',
                    "Hello! This is a test of the Barangay 183 WFP email system.\n\n" .
                    "Sent at: " . now() . "\n" .
                    "If you received this, individual email sending is working correctly! ✅"
                ));
                $this->info("<fg=green>✅ Individual email sent to {$address} successfully!</>");
            } catch (\Throwable $e) {
                $this->error("❌ Individual email FAILED: " . $e->getMessage());
                return self::FAILURE;
            }
        }

        // --- 4. Bulk job dispatch test ---
        if ($this->option('bulk')) {
            $orgId    = $this->option('org') ? (int) $this->option('org') : null;
            $orgLabel = $orgId ? "Organization #{$orgId}" : 'ALL organizations';

            // Count eligible members
            $count = Member::whereIn('status', ['Active', 'active'])
                ->whereNotNull('email')
                ->when($orgId, fn ($q) => $q->where('organization_id', $orgId))
                ->count();

            $this->info("Dispatching bulk email job → {$orgLabel} → {$count} eligible member(s).");

            if ($count === 0) {
                $this->warn('⚠ No eligible members found. Check that members have Active status and email addresses.');
                return self::SUCCESS;
            }

            // Use admin user ID 1 as sender for test
            $adminId = \App\Models\User::where('role', 'admin')->value('id') ?? 1;

            SendBulkMemberEmail::dispatch(
                '[WFP TEST] Bulk Email System Test — ' . now()->format('Y-m-d H:i'),
                "Hello,\n\nThis is a test bulk email dispatched from the Barangay 183 WFP System.\n\n" .
                "Sent at: " . now() . "\n\n" .
                "If you received this, the bulk email queue is working correctly! ✅",
                $adminId,
                $orgId
            );

            $this->info('<fg=green>✅ Bulk email job dispatched to the queue!</>');
            $this->newLine();
            $this->warn('⚡ Run the queue worker to process it:');
            $this->line('   php artisan queue:work --once --verbose');
            $this->newLine();
            $this->line('   Or keep it running persistently:');
            $this->line('   php artisan queue:work --verbose');
        }

        $this->newLine();
        $this->info('✅ All requested tests completed successfully.');

        return self::SUCCESS;
    }
}
