<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SecureSensitiveUploads extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:secure-sensitive-uploads';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate sensitive BCPC child photos and membership documents from public storage to private storage';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting migration of sensitive uploads to private storage...');

        $directories = [
            'bcpc_children' => [
                'public'  => storage_path('app/public/bcpc_children'),
                'private' => storage_path('app/private/bcpc_children'),
            ],
            'requirements' => [
                'public'  => storage_path('app/public/uploads/requirements'),
                'private' => storage_path('app/private/uploads/requirements'),
            ],
            'appeals' => [
                'public'  => storage_path('app/public/uploads/appeals'),
                'private' => storage_path('app/private/uploads/appeals'),
            ],
        ];

        $totalMoved = 0;

        foreach ($directories as $label => $paths) {
            $publicDir = $paths['public'];
            $privateDir = $paths['private'];

            if (!File::exists($privateDir)) {
                File::makeDirectory($privateDir, 0755, true);
                $this->info("Created private directory: {$privateDir}");
            }

            if (!File::exists($publicDir)) {
                $this->line("No public directory found for [{$label}], skipping.");
                continue;
            }

            $files = File::files($publicDir);
            $count = count($files);
            $this->info("Found {$count} file(s) in public [{$label}]. Migrating...");

            foreach ($files as $file) {
                $filename = $file->getFilename();
                $targetPath = $privateDir . DIRECTORY_SEPARATOR . $filename;

                // Copy to private storage
                File::copy($file->getPathname(), $targetPath);

                // Remove from public storage to prevent web enumeration
                File::delete($file->getPathname());

                $totalMoved++;
                $this->line("  -> Moved and removed from public: {$filename}");
            }
        }

        $this->info("Successfully migrated {$totalMoved} sensitive file(s) to private storage.");

        return Command::SUCCESS;
    }
}
