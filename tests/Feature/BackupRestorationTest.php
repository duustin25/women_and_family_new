<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\DatabaseBackupService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Exception;

class BackupRestorationTest extends TestCase
{
    protected DatabaseBackupService $backupService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->backupService = new DatabaseBackupService();
    }

    /**
     * Conduct a controlled round-trip backup creation, encryption, data-loss simulation,
     * restoration, and record-matching verification in an isolated test environment.
     */
    public function test_controlled_backup_restoration_round_trip_matches_source_records(): void
    {
        // 1. Create an isolated test table with known records
        DB::statement('DROP TABLE IF EXISTS _test_isolated_records');
        DB::statement('
            CREATE TABLE _test_isolated_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                risk_score INTEGER NOT NULL,
                incident_notes TEXT,
                created_at DATETIME NOT NULL
            )
        ');

        $sourceRecords = [
            [
                'name' => 'Survivor Maria D.',
                'category' => 'VAWC_TRIAGE',
                'risk_score' => 9,
                'incident_notes' => 'Verified repeat incident with protective intervention.',
                'created_at' => '2026-10-01 10:15:00',
            ],
            [
                'name' => 'Child Carl D.',
                'category' => 'BCPC_SFP',
                'risk_score' => 7,
                'incident_notes' => 'SAM cohort monitoring and supplemental feeding enrolment.',
                'created_at' => '2026-10-01 11:30:00',
            ],
            [
                'name' => 'Resident Elena S.',
                'category' => 'BPO_SERVICE',
                'risk_score' => 11,
                'incident_notes' => '15-day statutory protection order served personally.',
                'created_at' => '2026-10-01 14:45:00',
            ],
        ];

        foreach ($sourceRecords as $record) {
            DB::table('_test_isolated_records')->insert($record);
        }

        $this->assertEquals(3, DB::table('_test_isolated_records')->count());

        // 2. Formulate source SQL dump
        $sqlDump = "DROP TABLE IF EXISTS _test_isolated_records;\n";
        $sqlDump .= "CREATE TABLE _test_isolated_records (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), category VARCHAR(100), risk_score INTEGER, incident_notes TEXT, created_at DATETIME);\n";
        foreach ($sourceRecords as $r) {
            $sqlDump .= sprintf(
                "INSERT INTO _test_isolated_records (name, category, risk_score, incident_notes, created_at) VALUES ('%s', '%s', %d, '%s', '%s');\n",
                addslashes($r['name']),
                addslashes($r['category']),
                $r['risk_score'],
                addslashes($r['incident_notes']),
                $r['created_at']
            );
        }

        // 3. Encrypt and compress using the exact DatabaseBackupService pipeline
        $compressed = gzencode($sqlDump, 9);
        $encryptedPayload = Crypt::encryptString($compressed);

        // 4. Extract and decrypt SQL using DatabaseBackupService
        $extractedSql = $this->backupService->extractSqlFromBackup(
            $encryptedPayload,
            'test_snapshot.sql.gz.enc'
        );

        $this->assertStringContainsString('CREATE TABLE _test_isolated_records', $extractedSql);
        $this->assertStringContainsString('Survivor Maria D.', $extractedSql);
        $this->assertStringContainsString('Child Carl D.', $extractedSql);
        $this->assertStringContainsString('Resident Elena S.', $extractedSql);

        // 5. Simulate catastrophic data loss (DROP table)
        DB::statement('DROP TABLE _test_isolated_records');

        // Confirm table is completely gone
        $tableExists = false;
        try {
            DB::table('_test_isolated_records')->count();
            $tableExists = true;
        } catch (\Throwable $e) {
            $tableExists = false;
        }
        $this->assertFalse($tableExists, 'Table must not exist after simulated data loss');

        // 6. Execute restoration from the decrypted backup snapshot
        DB::unprepared($extractedSql);

        // 7. Verify restored records match the source records with 100% precision
        $restoredRecords = DB::table('_test_isolated_records')->orderBy('id', 'asc')->get();
        $this->assertCount(3, $restoredRecords);

        foreach ($sourceRecords as $idx => $expected) {
            $actual = (array) $restoredRecords[$idx];
            $this->assertSame($expected['name'], $actual['name']);
            $this->assertSame($expected['category'], $actual['category']);
            $this->assertEquals($expected['risk_score'], $actual['risk_score']);
            $this->assertSame($expected['incident_notes'], $actual['incident_notes']);
            $this->assertSame($expected['created_at'], $actual['created_at']);
        }

        // Cleanup test table
        DB::statement('DROP TABLE IF EXISTS _test_isolated_records');
    }

    /**
     * Test verification and extraction of real encrypted backup file in storage.
     */
    public function test_existing_production_backup_snapshot_decrypts_and_verifies(): void
    {
        $snapshotFilename = 'backup_wfps_latest_2026-09-28_20-54-57.sql.gz.enc';
        $relativePath = "backups/{$snapshotFilename}";

        if (!Storage::disk('local')->exists($relativePath)) {
            $this->markTestSkipped("Snapshot {$snapshotFilename} not found in local backup directory.");
        }

        $rawEncrypted = Storage::disk('local')->get($relativePath);
        $this->assertNotEmpty($rawEncrypted);

        // Decrypt and decompress through backup service
        $extractedSql = $this->backupService->extractSqlFromBackup($rawEncrypted, $snapshotFilename);

        $this->assertNotEmpty($extractedSql);
        $this->assertStringContainsString('-- WFP Barangay System Database Dump', $extractedSql);
        $this->assertStringContainsString('CREATE TABLE', $extractedSql);
        $this->assertStringContainsString('INSERT INTO', $extractedSql);
        $this->assertStringContainsString('SET FOREIGN_KEY_CHECKS', $extractedSql);
    }

    /**
     * Test Password-Protected AES-256 ZIP Archive restoration and incorrect password rejection.
     */
    public function test_password_protected_zip_backup_extraction(): void
    {
        $testSql = "-- WFP Test Dump\nCREATE TABLE _zip_test (id INT);\nINSERT INTO _zip_test VALUES (42);\n";
        $password = 'Barangay183SecurePass!';

        $tempZipPath = tempnam(sys_get_temp_dir(), 'test_zip_');
        $zip = new \ZipArchive();
        $zip->open($tempZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        $zip->setPassword($password);
        $zip->addFromString('dump.sql', $testSql);
        $zip->setEncryptionName('dump.sql', \ZipArchive::EM_AES_256, $password);
        $zip->close();

        $rawZip = file_get_contents($tempZipPath);
        @unlink($tempZipPath);

        // 1. Correct password extraction
        $extracted = $this->backupService->extractSqlFromBackup($rawZip, 'dump.zip', $password);
        $this->assertStringContainsString('CREATE TABLE _zip_test', $extracted);
        $this->assertStringContainsString('INSERT INTO _zip_test VALUES (42)', $extracted);

        // 2. Incorrect password rejection
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Unable to extract password-protected ZIP archive. Incorrect password provided.');
        $this->backupService->extractSqlFromBackup($rawZip, 'dump.zip', 'WrongPassword123');
    }
}
