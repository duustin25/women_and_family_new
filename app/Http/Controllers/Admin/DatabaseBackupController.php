<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DatabaseBackupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
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
        try {
            $backup = $this->backupService->createBackup();
            
            return redirect()->back()->with('success', "Database backup '{$backup['filename']}' ({$backup['size']}) created successfully!");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Backup failed: " . $e->getMessage());
        }
    }

    /**
     * Download Backup File
     */
    public function download(string $filename): BinaryFileResponse
    {
        try {
            $filePath = $this->backupService->getBackupPath($filename);
            return response()->download($filePath);
        } catch (Exception $e) {
            abort(404, "Backup file not found.");
        }
    }

    /**
     * Upload an external backup snapshot file (.sql or .sql.gz)
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
            if (!str_ends_with($filename, '.sql') && !str_ends_with($filename, '.sql.gz')) {
                return redirect()->back()->with('error', "Invalid backup file format. Only .sql and .sql.gz files are supported.");
            }

            $file->storeAs('backups', $filename, 'local');

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
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            return redirect()->back()->withErrors(['password' => 'Incorrect admin password authorization.']);
        }

        try {
            $this->backupService->restoreBackup($filename);

            return redirect()->back()->with('success', "Database successfully restored from snapshot '{$filename}'!");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Database restoration failed: " . $e->getMessage());
        }
    }

    /**
     * Delete Backup File
     */
    public function destroy(string $filename)
    {
        try {
            $deleted = $this->backupService->deleteBackup($filename);
            if ($deleted) {
                return redirect()->back()->with('success', "Backup file '{$filename}' deleted successfully.");
            }
            return redirect()->back()->with('error', "File not found or already deleted.");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Deletion failed: " . $e->getMessage());
        }
    }
}
