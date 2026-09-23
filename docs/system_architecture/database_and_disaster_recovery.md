# 💾 Database Architecture, Disaster Recovery & Backup Engine

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**

---

## 🏛️ 1. Disaster Recovery & Backup Subsystem

To protect legal blotter archives, child health histories, and community records against hardware failure or cyberattacks, WFPIS incorporates an autonomous backup engine.

```
+-----------------------------------------------------------------------------------+
|                        ADMIN BACKUP CONSOLE (/admin/backups)                      |
|       Manual 1-Click Backup  *  Scheduled Cron Daemons  *  Download Archive       |
+-----------------------------------------+-----------------------------------------+
                                          |
+-----------------------------------------v-----------------------------------------+
|                               DATABASE BACKUP SERVICE                             |
|                           DatabaseBackupService.php                               |
+-----------------------------------------+-----------------------------------------+
                                          |
+-----------------------------------------v-----------------------------------------+
|                               EXECUTION PIPELINE                                  |
|     1. mysqldump Streaming Dump (All Tables + Stored Procedures)                  |
|     2. Real-Time Gzip Compression (.sql.gz)                                       |
|     3. Cryptographic SHA-256 Checksum Calculation                                 |
|     4. Automated 30-Day Retention Pruning (COA / Storage Management)              |
+-----------------------------------------------------------------------------------+
```

---

## ⚙️ 2. Core Service Implementation

```php
// app/Services/DatabaseBackupService.php
namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class DatabaseBackupService
{
    public function createBackup(): array
    {
        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $filename  = "wfp_backup_{$timestamp}.sql.gz";
        $filePath  = storage_path("app/backups/{$filename}");

        // Execute mysqldump piped to gzip for high compression
        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s %s | gzip > %s',
            escapeshellarg(config('database.connections.mysql.username')),
            escapeshellarg(config('database.connections.mysql.password')),
            escapeshellarg(config('database.connections.mysql.host')),
            escapeshellarg(config('database.connections.mysql.database')),
            escapeshellarg($filePath)
        );

        $process = Process::fromShellCommandline($command);
        $process->setTimeout(300); // 5-minute timeout for large datasets
        $process->mustRun();

        $this->pruneOldBackups(30); // Enforce 30-day retention

        return [
            'filename'  => $filename,
            'size'      => filesize($filePath),
            'checksum'  => hash_file('sha256', $filePath),
            'timestamp' => $timestamp,
        ];
    }
}
```

---

## 🗄️ 3. Relational Schema Summary

| Table Identifier | Primary Key | Critical Foreign Keys | Primary Function |
| :--- | :--- | :--- | :--- |
| `users` | `id` | `organization_id` | User accounts, hashed credentials, and role assignments. |
| `vawc_dossiers` | `id` | None | Master identity registry linking repeat offenders and victims. |
| `vawc_cases` | `id` | `dossier_id`, `handled_by_user_id` | Core blotter record, incident narrative, and RAVE score. |
| `vawc_involved_parties` | `id` | `vawc_case_id` | Polymorphic parties (victim, abuser, child dependent). |
| `vawc_protection_orders`| `id` | `vawc_case_id`, `signed_by_id` | BPO lifecycle, 24h statutory deadline, 15-day relief window. |
| `bcpc_children` | `id` | None | 0–59 month preschooler demographic profile and zone. |
| `bcpc_assessments` | `id` | `bcpc_child_id` | Longitudinal time-series weighing, WHO z-scores, SFP milestones. |
| `gad_events` | `id` | `organization_id` | Community activity calendar, approval state, and venue info. |
| `organizations` | `id` | None | Accredited community organizations (KALIPI, Solo Parents, etc.). |
| `members` | `id` | None | Master resident roster with verified contact and zone info. |
| `membership_applications`| `id` | `organization_id` | Citizen online applications, 14-day SLA, and review status. |
| `audit_logs` | `id` | `user_id` | Append-only forensic diffs (`old_values`, `new_values`, IP address). |
