<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\OrganizationGovernanceService;

class SlaAutoApprovalCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orgs:auto-approve {--days=14 : Number of pending days threshold}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically approves organization membership applications that have remained pending past the SLA days threshold (default: 14 days).';

    /**
     * Execute the console command.
     */
    public function handle(OrganizationGovernanceService $governanceService): int
    {
        $days = (int) $this->option('days');
        $this->info("Scanning pending organization applications older than {$days} days...");

        $count = $governanceService->autoApproveExpiredSla($days);

        if ($count > 0) {
            $this->info("Successfully auto-approved {$count} neglected application(s).");
        } else {
            $this->info("No SLA-expired pending applications found.");
        }

        return Command::SUCCESS;
    }
}
