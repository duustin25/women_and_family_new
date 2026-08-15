<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\MembershipApplication;
use Illuminate\Support\Facades\DB;
use Exception;

class OrganizationMemberImportService
{
    /**
     * Standard base columns required for all membership applications.
     */
    protected array $baseColumns = [
        'fullname',
        'email',
        'address',
        'phone',
        'gender',
        'birthdate',
        'civil_status',
        'monthly_income',
    ];

    /**
     * Extract dynamic custom field keys from an organization's form_schema JSON.
     */
    public function getCustomFields(Organization $organization): array
    {
        $schema = $organization->form_schema;
        if (!is_array($schema)) {
            return [];
        }

        $fields = [];
        foreach ($schema as $section) {
            if (isset($section['fields']) && is_array($section['fields'])) {
                foreach ($section['fields'] as $field) {
                    if (isset($field['name'])) {
                        $fields[] = $field['name'];
                    }
                }
            } elseif (isset($section['name'])) {
                $fields[] = $section['name'];
            }
        }

        return array_values(array_unique($fields));
    }

    /**
     * Generate a sample CSV string formatted for a specific organization's schema.
     */
    public function generateSampleCsv(Organization $organization): string
    {
        $customFields = $this->getCustomFields($organization);
        $allHeaders = array_merge($this->baseColumns, $customFields);

        // Build CSV output in memory
        $output = fopen('php://temp', 'r+');
        fputcsv($output, $allHeaders);

        // Row 1 Sample Data
        $sampleRow1 = [
            'Maria Dela Cruz',
            'maria.delacruz@example.com',
            'Zone 1, Brgy 183, Pasay City',
            '09171234567',
            'Female',
            '1985-05-15',
            'Married',
            '15000',
        ];

        // Fill custom sample values based on field names
        foreach ($customFields as $field) {
            if (str_contains($field, 'id') || str_contains($field, 'number')) {
                $sampleRow1[] = 'ID-2026-001';
            } elseif (str_contains($field, 'status') || str_contains($field, 'type')) {
                $sampleRow1[] = 'Active / Standard';
            } else {
                $sampleRow1[] = 'Sample ' . ucfirst($field);
            }
        }

        fputcsv($output, $sampleRow1);

        // Row 2 Sample Data
        $sampleRow2 = [
            'Juan Santos',
            'juan.santos@example.com',
            'Zone 3, Brgy 183, Pasay City',
            '09189876543',
            'Male',
            '1970-11-20',
            'Single',
            '20000',
        ];

        foreach ($customFields as $field) {
            if (str_contains($field, 'id') || str_contains($field, 'number')) {
                $sampleRow2[] = 'ID-2026-002';
            } else {
                $sampleRow2[] = 'Sample ' . ucfirst($field);
            }
        }

        fputcsv($output, $sampleRow2);

        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }

    /**
     * Import members from a CSV file into the database under the specified organization.
     */
    public function importCsv(Organization $organization, string $filePath): array
    {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            throw new Exception("CSV file cannot be read.");
        }

        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            throw new Exception("Failed to open CSV file stream.");
        }

        $header = fgetcsv($handle, 1000, ',');
        if (!$header) {
            fclose($handle);
            throw new Exception("CSV file is empty or invalid.");
        }

        // Normalize header names to lowercase snake_case
        $normalizedHeaders = array_map(function ($h) {
            return strtolower(trim(str_replace([' ', '-'], '_', $h)));
        }, $header);

        $importedCount = 0;
        $skippedCount = 0;
        $errors = [];
        $rowNum = 1;

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle, 2000, ',')) !== false) {
                $rowNum++;

                // Skip empty lines
                if (empty(array_filter($row))) {
                    continue;
                }

                // Combine headers with values
                $rowData = [];
                foreach ($normalizedHeaders as $index => $colName) {
                    $rowData[$colName] = isset($row[$index]) ? trim($row[$index]) : '';
                }

                // Validate required fullname
                $fullname = $rowData['fullname'] ?? $rowData['full_name'] ?? $rowData['name'] ?? null;
                if (!$fullname) {
                    $skippedCount++;
                    $errors[] = "Row {$rowNum}: Missing mandatory 'fullname' field.";
                    continue;
                }

                $email = $rowData['email'] ?? null;
                $address = $rowData['address'] ?? 'Barangay 183, Pasay City';

                // Duplicate Check: Check if resident already applied/enrolled in this organization
                $existing = MembershipApplication::where('organization_id', $organization->id)
                    ->where(function ($q) use ($fullname, $email) {
                        $q->where('fullname', $fullname);
                        if ($email) {
                            $q->orWhere('email', $email);
                        }
                    })
                    ->first();

                if ($existing) {
                    $skippedCount++;
                    $errors[] = "Row {$rowNum}: Member '{$fullname}' is already registered in {$organization->name}.";
                    continue;
                }

                // Build form_data JSON containing all fields (base + custom)
                $formData = $rowData;
                $formData['imported_via'] = 'bulk_csv';
                $formData['imported_at'] = now()->toDateTimeString();

                $app = MembershipApplication::create([
                    'organization_id' => $organization->id,
                    'fullname'        => $fullname,
                    'email'           => $email ?: strtolower(str_replace(' ', '', $fullname)) . '.' . rand(100, 999) . '@brgy183.temp',
                    'address'         => $address,
                    'form_data'       => $formData,
                    'status'          => MembershipApplication::STATUS_APPROVED,
                    'approved_by'     => 'Bulk CSV Import',
                    'actioned_at'     => now(),
                ]);

                $importedCount++;
            }

            DB::commit();
            fclose($handle);

            return [
                'success' => true,
                'imported_count' => $importedCount,
                'skipped_count' => $skippedCount,
                'total_processed' => $importedCount + $skippedCount,
                'errors' => $errors,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            fclose($handle);
            throw $e;
        }
    }
}
