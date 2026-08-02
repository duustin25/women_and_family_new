<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DatabaseBackupService;
use Exception;

class DatabaseBackupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a point-in-time SQL snapshot backup of the Barangay WFP database';

    /**
     * Execute the console command.
     */
    public function handle(DatabaseBackupService $backupService): int
    {
        $this->info('Starting automated Barangay Database Backup...');

        try {
            $result = $backupService->createBackup();
            $this->info("Database Backup Created Successfully!");
            $this->table(['Filename', 'Size', 'Created At'], [
                [$result['filename'], $result['size'], $result['created_at']]
            ]);
            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error("Database Backup Failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
