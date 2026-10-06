<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DatabaseBackupService;
use Exception;

class DatabaseRestoreCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:restore 
                            {filename? : The backup file to restore (e.g. backup_wfps_latest_....sql.gz.enc)}
                            {--password= : Passphrase if restoring an encrypted ZIP file}
                            {--latest : Automatically select and restore the most recent backup}
                            {--force : Force the restoration without interactive confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore the Barangay database from an existing backup snapshot or ZIP file';

    /**
     * Execute the console command.
     */
    public function handle(DatabaseBackupService $backupService): int
    {
        $this->info('========================================================');
        $this->info('  Barangay WFP System - Emergency Database Restoration  ');
        $this->info('========================================================');

        $backups = $backupService->getBackups();
        if (empty($backups)) {
            $this->error('No backup files found in storage/app/private/backups.');
            return Command::FAILURE;
        }

        $filename = $this->argument('filename');

        if ($this->option('latest')) {
            $filename = $backups[0]['filename'];
            $this->line("Auto-selected latest backup: <comment>{$filename}</comment>");
        }

        if (!$filename) {
            $options = [];
            foreach ($backups as $index => $b) {
                $options[$b['filename']] = "{$b['filename']} ({$b['size']}) - {$b['created_at']}";
            }

            $filename = $this->choice(
                'Select a backup file to restore:',
                array_keys($options),
                0
            );
        }

        $password = $this->option('password') ?: '';

        if (!$this->option('force')) {
            $confirmed = $this->confirm(
                "WARNING: Restoring will overwrite existing database tables and records with '{$filename}'. Are you sure you want to proceed?",
                false
            );

            if (!$confirmed) {
                $this->warn('Database restoration cancelled by user.');
                return Command::SUCCESS;
            }
        }

        $this->line("Starting database restoration from <comment>{$filename}</comment>...");

        try {
            $backupService->restoreBackup($filename, $password);
            $this->info("✓ Database restored successfully from '{$filename}'!");
            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error("Database restoration failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
