<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class DatabaseBackupService
{
    protected string $disk = 'local';
    protected string $backupDir = 'backups';

    public function __construct()
    {
        // Ensure storage/app/backups directory exists
        if (!Storage::disk($this->disk)->exists($this->backupDir)) {
            Storage::disk($this->disk)->makeDirectory($this->backupDir);
        }
    }

    /**
     * Generate a full database point-in-time SQL snapshot
     */
    public function createBackup(): array
    {
        $timestamp = date('Y-m-d_H-i-s');
        $dbName = config('database.connections.mysql.database', 'forge');
        $filename = "backup_{$dbName}_{$timestamp}.sql";
        $compressedFilename = "{$filename}.gz";

        $relativePath = "{$this->backupDir}/{$filename}";
        $relativeGzPath = "{$this->backupDir}/{$compressedFilename}";

        $fullPath = Storage::disk($this->disk)->path($relativePath);
        $fullGzPath = Storage::disk($this->disk)->path($relativeGzPath);

        try {
            $sqlContent = $this->generateSqlDump();
            
            // Write raw SQL file
            Storage::disk($this->disk)->put($relativePath, $sqlContent);

            // Compress to gzip if zlib functions available
            if (function_exists('gzencode')) {
                $gzData = gzenable_compress($sqlContent);
                Storage::disk($this->disk)->put($relativeGzPath, $gzData);
                Storage::disk($this->disk)->delete($relativePath);
                $finalFilename = $compressedFilename;
                $finalPath = $fullGzPath;
            } else {
                $finalFilename = $filename;
                $finalPath = $fullPath;
            }

            $bytes = Storage::disk($this->disk)->size("{$this->backupDir}/{$finalFilename}");

            // Auto-prune old backup snapshots older than 30 days
            $this->pruneOldBackups(30);

            return [
                'success' => true,
                'filename' => $finalFilename,
                'size' => $this->formatBytes($bytes),
                'bytes' => $bytes,
                'path' => $finalPath,
                'created_at' => date('Y-m-d H:i:s'),
            ];

        } catch (Exception $e) {
            Log::error("Database Backup Failed: " . $e->getMessage());
            throw new Exception("Backup Generation Failed: " . $e->getMessage());
        }
    }

    /**
     * Generate full SQL dump using PDO schema inspection
     */
    protected function generateSqlDump(): string
    {
        $tables = DB::select('SHOW TABLES');
        $dbName = config('database.connections.mysql.database', 'forge');
        $tableKey = "Tables_in_{$dbName}";

        $out = "-- WFP Barangay System Database Dump\n";
        $out .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
        $out .= "-- Host: " . config('database.connections.mysql.host') . "\n";
        $out .= "-- Database: {$dbName}\n\n";
        $out .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableObj) {
            $tableName = $tableObj->$tableKey ?? current((array)$tableObj);

            // Structure
            $createTableStmt = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $createSql = $createTableStmt[0]->{'Create Table'} ?? '';

            $out .= "-- --------------------------------------------------------\n";
            $out .= "-- Table structure for `{$tableName}`\n";
            $out .= "-- --------------------------------------------------------\n";
            $out .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $out .= $createSql . ";\n\n";

            // Data Rows
            $rows = DB::table($tableName)->get();
            if ($rows->count() > 0) {
                $out .= "-- Dumping data for table `{$tableName}`\n";
                foreach ($rows as $row) {
                    $rowArray = (array)$row;
                    $values = array_map(function ($val) {
                        if ($val === null) return 'NULL';
                        return DB::getPdo()->quote((string)$val);
                    }, array_values($rowArray));

                    $out .= "INSERT INTO `{$tableName}` (`" . implode("`, `", array_keys($rowArray)) . "`) VALUES (" . implode(", ", $values) . ");\n";
                }
                $out .= "\n";
            }
        }

        $out .= "SET FOREIGN_KEY_CHECKS=1;\n";
        return $out;
    }

    /**
     * List all backup snapshots in storage
     */
    public function getBackups(): array
    {
        $files = Storage::disk($this->disk)->files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);
            if (str_ends_with($filename, '.sql') || str_ends_with($filename, '.sql.gz')) {
                $bytes = Storage::disk($this->disk)->size($file);
                $lastModified = Storage::disk($this->disk)->lastModified($file);

                $backups[] = [
                    'filename' => $filename,
                    'size' => $this->formatBytes($bytes),
                    'bytes' => $bytes,
                    'created_at' => date('Y-m-d H:i:s', $lastModified),
                    'timestamp' => $lastModified,
                ];
            }
        }

        // Sort latest backups first
        usort($backups, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);
        return $backups;
    }

    /**
     * Get absolute path for file download
     */
    public function getBackupPath(string $filename): string
    {
        $relativePath = "{$this->backupDir}/{$filename}";
        if (!Storage::disk($this->disk)->exists($relativePath)) {
            throw new Exception("Backup file not found.");
        }
        return Storage::disk($this->disk)->path($relativePath);
    }

    /**
     * Delete a backup file
     */
    public function deleteBackup(string $filename): bool
    {
        $relativePath = "{$this->backupDir}/{$filename}";
        if (Storage::disk($this->disk)->exists($relativePath)) {
            return Storage::disk($this->disk)->delete($relativePath);
        }
        return false;
    }

    /**
     * Restore database from snapshot file
     */
    public function restoreBackup(string $filename): bool
    {
        $relativePath = "{$this->backupDir}/{$filename}";
        if (!Storage::disk($this->disk)->exists($relativePath)) {
            throw new Exception("Backup snapshot file does not exist.");
        }

        $rawContent = Storage::disk($this->disk)->get($relativePath);

        // Decompress if gzip
        if (str_ends_with($filename, '.gz') && function_exists('gzdecode')) {
            $sqlContent = @gzdecode($rawContent);
            if ($sqlContent === false) {
                $sqlContent = $rawContent;
            }
        } else {
            $sqlContent = $rawContent;
        }

        // Execute raw SQL statements using DB unprepared
        DB::transaction(function () use ($sqlContent) {
            DB::unprepared($sqlContent);
        });

        return true;
    }

    /**
     * Automatically delete backup snapshots older than $days (Retention Policy)
     */
    public function pruneOldBackups(int $days = 30): int
    {
        $files = Storage::disk($this->disk)->files($this->backupDir);
        $cutoff = time() - ($days * 86400);
        $prunedCount = 0;

        foreach ($files as $file) {
            $lastModified = Storage::disk($this->disk)->lastModified($file);
            if ($lastModified < $cutoff) {
                Storage::disk($this->disk)->delete($file);
                $prunedCount++;
            }
        }

        return $prunedCount;
    }

    protected function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }
}

// Helper compression function if gzencode is used
if (!function_exists('gzenable_compress')) {
    function gzenable_compress(string $data): string {
        return gzencode($data, 9);
    }
}
