<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MembershipSynchronizationService;

class SyncApprovedMembersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'members:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize all approved membership applications into active member records in the master ledger';

    /**
     * Execute the console command.
     */
    public function handle(MembershipSynchronizationService $service): int
    {
        $this->info('Starting membership synchronization scan...');

        $results = $service->syncAllApprovedApplications();

        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Approved Applications', $results['total_approved_applications']],
                ['Synced Active Member Records', $results['synced_members_count']],
            ]
        );

        $this->info('Membership synchronization complete! All approved resident profiles are active in the Master Ledger.');

        return Command::SUCCESS;
    }
}
