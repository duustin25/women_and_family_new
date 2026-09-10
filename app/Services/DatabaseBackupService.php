<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
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
        if (function_exists('set_time_limit')) {
            @set_time_limit(300);
        }
        @ini_set('max_execution_time', '300');
        @ini_set('memory_limit', '512M');

        $timestamp = date('Y-m-d_H-i-s');
        $dbName = config('database.connections.mysql.database', 'forge');
        $filename = "backup_{$dbName}_{$timestamp}.sql";
        $compressedFilename = "{$filename}.gz";

        try {
            $sqlContent = $this->generateSqlDump();
            
            // Gzip compression if zlib available
            $dataToStore = $sqlContent;
            $extension = '.sql';
            if (function_exists('gzencode')) {
                $dataToStore = gzencode($sqlContent, 9);
                $extension = '.sql.gz';
            }

            // Encrypt using application AES-256 cipher before writing to disk
            $encryptedData = Crypt::encryptString($dataToStore);
            $finalFilename = "backup_{$dbName}_{$timestamp}{$extension}.enc";
            $finalRelativePath = "{$this->backupDir}/{$finalFilename}";
            $finalPath = Storage::disk($this->disk)->path($finalRelativePath);

            Storage::disk($this->disk)->put($finalRelativePath, $encryptedData);

            $bytes = Storage::disk($this->disk)->size($finalRelativePath);

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
     * Generate full SQL dump using PDO schema inspection with high-performance batched inserts
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
        $out .= "SET FOREIGN_KEY_CHECKS=0;\n";
        $out .= "SET UNIQUE_CHECKS=0;\n";
        $out .= "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\n\n";

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

            // High-performance batched insert dumping (chunks of 200 rows)
            $totalCount = DB::table($tableName)->count();
            if ($totalCount > 0) {
                $out .= "-- Dumping data for table `{$tableName}` ({$totalCount} rows)\n";

                DB::table($tableName)->orderBy(DB::raw('1'))->chunk(200, function ($rows) use (&$out, $tableName) {
                    if ($rows->isEmpty()) return;

                    $first = (array)$rows->first();
                    $cols = '`' . implode('`, `', array_keys($first)) . '`';

                    $valueSets = [];
                    foreach ($rows as $row) {
                        $rowArray = (array)$row;
                        $vals = array_map(function ($val) {
                            if ($val === null) return 'NULL';
                            return DB::getPdo()->quote((string)$val);
                        }, array_values($rowArray));
                        $valueSets[] = '(' . implode(', ', $vals) . ')';
                    }

                    $out .= "INSERT INTO `{$tableName}` ({$cols}) VALUES\n" . implode(",\n", $valueSets) . ";\n\n";
                });
            }
        }

        $out .= "SET FOREIGN_KEY_CHECKS=1;\n";
        $out .= "SET UNIQUE_CHECKS=1;\n";
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
            if (str_ends_with($filename, '.sql') || str_ends_with($filename, '.sql.gz') || str_ends_with($filename, '.enc') || str_ends_with($filename, '.zip')) {
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
     * Download backup file as a Password-Protected AES-256 Encrypted ZIP Archive.
     * When opened in Windows, Mac, WinRAR, or 7-Zip, the user will be prompted for this password.
     */
    public function downloadPasswordProtectedZip(string $filename, string $password)
    {
        $relativePath = "{$this->backupDir}/{$filename}";
        if (!Storage::disk($this->disk)->exists($relativePath)) {
            throw new Exception("Backup file not found.");
        }

        $rawContent = Storage::disk($this->disk)->get($relativePath);
        // Extract raw SQL text regardless of underlying server format (.enc, .gz, or raw)
        $sqlContent = $this->extractSqlFromBackup($rawContent, $filename);

        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            @mkdir($tempDir, 0755, true);
        }

        $cleanBase = preg_replace('/(\.sql|\.gz|\.enc|\.zip)+$/i', '', $filename);
        $zipFilename = "{$cleanBase}_protected.zip";
        $tempZipPath = "{$tempDir}/{$zipFilename}";

        if (file_exists($tempZipPath)) {
            @unlink($tempZipPath);
        }

        $zip = new \ZipArchive();
        if ($zip->open($tempZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new Exception("Could not initialize AES-256 ZIP generator.");
        }

        $internalSqlFilename = "{$cleanBase}.sql";
        $zip->setPassword($password);
        $zip->addFromString($internalSqlFilename, $sqlContent);
        $zip->setEncryptionName($internalSqlFilename, \ZipArchive::EM_AES_256, $password);
        $zip->close();

        return response()->download($tempZipPath, $zipFilename, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Download backup file (automatically decrypts encrypted snapshots for download)
     */
    public function downloadBackup(string $filename)
    {
        $relativePath = "{$this->backupDir}/{$filename}";
        if (!Storage::disk($this->disk)->exists($relativePath)) {
            throw new Exception("Backup file not found.");
        }

        $rawContent = Storage::disk($this->disk)->get($relativePath);

        // If file is encrypted on disk, decrypt it so admin gets a ready-to-use database archive
        $wasEncrypted = false;
        try {
            $decrypted = Crypt::decryptString($rawContent);
            $rawContent = $decrypted;
            $wasEncrypted = true;
        } catch (\Throwable $e) {
            // Not encrypted
        }

        if ($wasEncrypted || str_ends_with($filename, '.enc')) {
            $downloadName = preg_replace('/\.enc$/', '', $filename);
            $isGzip = str_starts_with($rawContent, "\x1f\x8b") || str_contains($downloadName, '.gz');
            $contentType = $isGzip ? 'application/gzip' : 'application/sql';

            return response()->streamDownload(function () use ($rawContent) {
                echo $rawContent;
            }, $downloadName, [
                'Content-Type' => $contentType,
            ]);
        }

        return response()->download(Storage::disk($this->disk)->path($relativePath));
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
     * Restore database from snapshot file.
     * Content-aware: automatically detects AES-256 encryption, ZIP archives, and GZIP compression
     * via magic bytes and payloads, regardless of custom or renamed filenames.
     */
    public function restoreBackup(string $filename, string $password = ''): bool
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(300);
        }
        @ini_set('max_execution_time', '300');
        @ini_set('memory_limit', '512M');

        $relativePath = "{$this->backupDir}/{$filename}";
        if (!Storage::disk($this->disk)->exists($relativePath)) {
            throw new Exception("Backup snapshot file '{$filename}' does not exist on disk.");
        }

        $rawContent = Storage::disk($this->disk)->get($relativePath);
        $sqlContent = $this->extractSqlFromBackup($rawContent, $filename, $password);

        // Execute raw SQL statements directly (MySQL DDL DROP/CREATE TABLE triggers implicit commits, so DB::transaction must not wrap DDL statements)
        DB::unprepared($sqlContent);

        return true;
    }

    /**
     * Extract and validate SQL content from any backup file regardless of filename or extension.
     * Automatically handles AES-256 ZIP archives, AES-256 Crypt decryption, and GZIP decompression.
     */
    public function extractSqlFromBackup(string $rawContent, string $filename = '', string $password = ''): string
    {
        // 1. Smart ZIP Archive Detection (Magic bytes PK\x03\x04 or .zip)
        if (str_starts_with($rawContent, "PK\x03\x04") || str_ends_with($filename, '.zip')) {
            $tempZip = tempnam(sys_get_temp_dir(), 'wfp_zip_');
            file_put_contents($tempZip, $rawContent);

            $zip = new \ZipArchive();
            if ($zip->open($tempZip) === true) {
                if (!empty($password)) {
                    $zip->setPassword($password);
                }

                $sqlName = null;
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $entryName = $zip->getNameIndex($i);
                    if (str_ends_with(strtolower($entryName), '.sql')) {
                        $sqlName = $entryName;
                        break;
                    }
                }
                if (!$sqlName && $zip->numFiles > 0) {
                    $sqlName = $zip->getNameIndex(0);
                }

                if ($sqlName) {
                    $extracted = @$zip->getFromName($sqlName);
                    $zip->close();
                    @unlink($tempZip);

                    if ($extracted === false) {
                        throw new Exception("Unable to extract password-protected ZIP archive. Incorrect password provided.");
                    }
                    $rawContent = $extracted;
                } else {
                    $zip->close();
                    @unlink($tempZip);
                    throw new Exception("No valid SQL file found inside the uploaded ZIP archive.");
                }
            } else {
                @unlink($tempZip);
                throw new Exception("Corrupted or unreadable ZIP archive.");
            }
        }

        // 2. Smart Encryption Detection (Laravel Crypt payload test)
        try {
            $decrypted = Crypt::decryptString($rawContent);
            $rawContent = $decrypted;
        } catch (\Throwable $e) {
            if (str_ends_with($filename, '.enc')) {
                throw new Exception("Unable to decrypt backup snapshot. The application APP_KEY may have changed or the file is corrupted.");
            }
        }

        // 3. Smart GZIP Magic Byte Detection (\x1f\x8b) or .gz extension
        $isGzip = str_starts_with($rawContent, "\x1f\x8b") || str_contains($filename, '.gz');
        if ($isGzip && function_exists('gzdecode')) {
            $uncompressed = @gzdecode($rawContent);
            if ($uncompressed !== false) {
                $rawContent = $uncompressed;
            }
        }

        // 4. SQL Integrity Verification
        $hasSqlKeywords = str_contains($rawContent, 'CREATE TABLE') 
            || str_contains($rawContent, 'INSERT INTO') 
            || str_contains($rawContent, 'SET FOREIGN_KEY_CHECKS')
            || str_contains($rawContent, 'DROP TABLE');

        if (!$hasSqlKeywords) {
            throw new Exception("The selected backup file does not contain valid SQL database dump statements. Please ensure the uploaded snapshot is a valid database backup.");
        }

        return $rawContent;
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
