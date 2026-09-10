<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DatabaseBackupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Exception;

class DatabaseBackupController extends Controller
{
    protected DatabaseBackupService $backupService;

    public function __construct(DatabaseBackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    /**
     * Display Database Backup & Recovery Dashboard
     */
    public function index(): Response
    {
        $backups = $this->backupService->getBackups();

        return Inertia::render('Admin/BackupRecovery/Index', [
            'backups' => $backups,
        ]);
    }

    /**
     * Trigger Instant Database Backup
     */
    public function store(Request $request)
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(300);
        }
        @ini_set('max_execution_time', '300');

        try {
            $backup = $this->backupService->createBackup();
            
            // Audit Trail: Record Snapshot Creation
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'DATABASE_BACKUP_CREATED',
                'auditable_type' => 'DatabaseBackup',
                'auditable_id' => 0,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'new_values' => [
                    'filename' => $backup['filename'],
                    'size' => $backup['size'],
                    'triggered_by' => $request->user()->name,
                ],
            ]);

            return redirect()->back()->with('success', "Database backup '{$backup['filename']}' ({$backup['size']}) created successfully!");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Backup failed: " . $e->getMessage());
        }
    }

    /**
     * Download Backup File
     * If a password parameter is supplied, it streams a Password-Protected AES-256 encrypted ZIP archive.
     */
    public function download(Request $request, string $filename): SymfonyResponse
    {
        try {
            $user = $request->user();
            $archivePassword = $request->input('password');

            // Audit Trail: Critical Data Exfiltration Accountability
            if ($user) {
                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'DATABASE_BACKUP_DOWNLOADED',
                    'auditable_type' => 'DatabaseBackup',
                    'auditable_id' => 0,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'new_values' => [
                        'filename' => $filename,
                        'downloaded_by' => $user->name,
                        'role' => $user->role,
                        'protected_with_aes256_zip' => !empty($archivePassword),
                    ],
                ]);
            }

            if (!empty($archivePassword)) {
                return $this->backupService->downloadPasswordProtectedZip($filename, $archivePassword);
            }

            return $this->backupService->downloadBackup($filename);
        } catch (Exception $e) {
            abort(404, "Backup file not found: " . $e->getMessage());
        }
    }

    /**
     * Upload an external backup snapshot file (.sql, .sql.gz, .enc, or .zip)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'backup_file' => ['required', 'file'],
        ]);

        try {
            $file = $request->file('backup_file');
            $filename = $file->getClientOriginalName();

            // Validate extension
            $validExtensions = ['.sql', '.sql.gz', '.enc', '.zip'];
            $isValid = false;
            foreach ($validExtensions as $ext) {
                if (str_ends_with(strtolower($filename), $ext)) {
                    $isValid = true;
                    break;
                }
            }

            if (!$isValid) {
                return redirect()->back()->with('error', "Invalid backup file format. Supported formats: .sql, .sql.gz, .enc, and .zip (AES-256).");
            }

            $file->storeAs('backups', $filename, 'local');

            // Audit Trail: Record Snapshot Upload
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'DATABASE_BACKUP_UPLOADED',
                'auditable_type' => 'DatabaseBackup',
                'auditable_id' => 0,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'new_values' => [
                    'filename' => $filename,
                    'uploaded_by' => $request->user()->name,
                ],
            ]);

            return redirect()->back()->with('success', "Backup file '{$filename}' uploaded successfully! It is now available in the archives list for 1-click restoration.");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Backup upload failed: " . $e->getMessage());
        }
    }

    /**
     * Restore Database from Backup Snapshot
     */
    public function restore(Request $request, string $filename)
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(300);
        }
        @ini_set('max_execution_time', '300');

        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            return redirect()->back()->withErrors(['password' => 'Incorrect admin password authorization.']);
        }

        $user = $request->user();
        $userId = $user->id;
        $userName = $user->name;
        $userRole = $user->role;
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        try {
            // Pass authorization password in case snapshot is a password-protected ZIP
            $this->backupService->restoreBackup($filename, $request->password);

            // Re-authenticate admin so their session persists smoothly
            Auth::loginUsingId($userId);

            // Audit Trail: Log restoration event into the freshly restored database
            AuditLog::create([
                'user_id' => $userId,
                'action' => 'DATABASE_RESTORED',
                'auditable_type' => 'DatabaseBackup',
                'auditable_id' => 0,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'new_values' => [
                    'filename' => $filename,
                    'restored_by' => $userName,
                    'role' => $userRole,
                    'status' => 'SUCCESS',
                    'restored_at' => now()->toDateTimeString(),
                ],
            ]);

            return redirect()->back()->with('success', "Database successfully restored from snapshot '{$filename}'!");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Database restoration failed: " . $e->getMessage());
        }
    }

    /**
     * Delete Backup File
     */
    public function destroy(Request $request, string $filename)
    {
        try {
            $deleted = $this->backupService->deleteBackup($filename);
            if ($deleted) {
                // Audit Trail: Record Snapshot Deletion
                $user = $request->user();
                if ($user) {
                    AuditLog::create([
                        'user_id' => $user->id,
                        'action' => 'DATABASE_BACKUP_DELETED',
                        'auditable_type' => 'DatabaseBackup',
                        'auditable_id' => 0,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'new_values' => [
                            'filename' => $filename,
                            'deleted_by' => $user->name,
                        ],
                    ]);
                }

                return redirect()->back()->with('success', "Backup file '{$filename}' deleted successfully.");
            }
            return redirect()->back()->with('error', "File not found or already deleted.");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Deletion failed: " . $e->getMessage());
        }
    }
}
