<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\MembershipApplication;
use App\Models\Member;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class OrganizationMemberImportService
{
    /**
     * Standard base column mappings.
     */
    protected array $baseAliases = [
        'full_name'          => 'fullname',
        'fullname'           => 'fullname',
        'name'               => 'fullname',
        'resident_name'      => 'fullname',
        'applicant_name'     => 'fullname',
        'member_name'        => 'fullname',

        'registered_address' => 'address',
        'address'            => 'address',
        'home_address'       => 'address',
        'residence'          => 'address',

        'email'              => 'email',
        'email_address'      => 'email',
    ];

    /**
     * Clean and normalize a string key (lowercase, alphanumeric + underscore).
     */
    protected function normalizeKey(string $key): string
    {
        $key = strtolower(trim($key));
        // Remove UTF-8 BOM if present
        $key = preg_replace('/^\xEF\xBB\xBF/', '', $key);
        // Replace spaces, dashes, periods, parentheses, slashes with underscores
        $key = preg_replace('/[\s\-\.\(\)\/\,]+/', '_', $key);
        return trim($key, '_');
    }

    /**
     * Extract active, importable field definitions from an organization's form_schema.
     * Skips layout blocks like 'section' and 'paragraph'.
     *
     * @return array<int, array{id: string, label: string, type: string, options?: array}>
     */
    public function getActiveFields(Organization $organization): array
    {
        $schema = $organization->form_schema;
        if (!is_array($schema)) {
            return [];
        }

        $fields = [];
        foreach ($schema as $item) {
            if (!is_array($item)) {
                continue;
            }

            $type = $item['type'] ?? 'text';
            // Skip layout dividers
            if (in_array($type, ['section', 'paragraph'])) {
                continue;
            }

            $id = $item['id'] ?? null;
            if (!$id) {
                continue;
            }

            // Core fields are handled as base columns
            if ($id === 'fullname' || $id === 'address' || $id === 'email') {
                continue;
            }

            $fields[] = [
                'id'      => $id,
                'label'   => $item['label'] ?? ucwords(str_replace('_', ' ', $id)),
                'type'    => $type,
                'options' => $item['options'] ?? [],
            ];
        }

        return $fields;
    }

    /**
     * Build a field mapping dictionary that maps normalized column names
     * (both human labels and raw field IDs) to the schema's canonical field ID.
     */
    public function buildFieldMapping(Organization $organization): array
    {
        $mapping = $this->baseAliases;
        $activeFields = $this->getActiveFields($organization);

        foreach ($activeFields as $field) {
            $canonicalId = $field['id'];
            $normalizedId = $this->normalizeKey($canonicalId);
            $normalizedLabel = $this->normalizeKey($field['label']);

            $mapping[$normalizedId] = $canonicalId;
            $mapping[$normalizedLabel] = $canonicalId;

            // Also map without prefixes like 'kalipi_', 'erpat_', 'solo_parent_'
            $stripped = preg_replace('/^(kalipi|erpat|solo_parent|vco)_/', '', $canonicalId);
            if ($stripped !== $canonicalId) {
                $mapping[$this->normalizeKey($stripped)] = $canonicalId;
            }
        }

        return $mapping;
    }

    /**
     * Generate a realistic sample value for a field based on type, label, or options.
     */
    protected function generateSampleValue(array $field, int $rowNum): string
    {
        $type = $field['type'] ?? 'text';
        $label = strtolower($field['label'] ?? '');
        $id = strtolower($field['id'] ?? '');

        if (!empty($field['options']) && is_array($field['options'])) {
            $optCount = count($field['options']);
            return (string)$field['options'][($rowNum - 1) % $optCount];
        }

        if (str_contains($label, 'birth') || str_contains($id, 'dob') || $type === 'date') {
            return $rowNum === 1 ? '1988-04-25' : '1995-10-12';
        }

        if (str_contains($label, 'age') || str_contains($id, 'age')) {
            return $rowNum === 1 ? '38' : '31';
        }

        if (str_contains($label, 'phone') || str_contains($label, 'cellphone') || str_contains($id, 'phone') || str_contains($id, 'cell')) {
            return $rowNum === 1 ? '09171234567' : '09189876543';
        }

        if (str_contains($label, 'religion')) {
            return $rowNum === 1 ? 'Roman Catholic' : 'Christian';
        }

        if (str_contains($label, 'civil status') || str_contains($id, 'civil')) {
            return $rowNum === 1 ? 'Married' : 'Single';
        }

        if (str_contains($label, 'attainment') || str_contains($label, 'education')) {
            return $rowNum === 1 ? 'College Graduate' : 'High School Graduate';
        }

        if (str_contains($label, 'occupation') || str_contains($id, 'occupation')) {
            return $rowNum === 1 ? 'Self-Employed / Vendor' : 'Office Clerk';
        }

        if (str_contains($label, 'income') || str_contains($id, 'income')) {
            return $rowNum === 1 ? '15000' : '22000';
        }

        if (str_contains($label, 'company') || str_contains($id, 'company')) {
            return $rowNum === 1 ? 'ABC Commercial Services' : 'N/A';
        }

        if (str_contains($label, 'skill') || str_contains($id, 'skill')) {
            return $rowNum === 1 ? 'Dressmaking, Cooking' : 'Computer Literacy';
        }

        if ($type === 'number') {
            return (string)($rowNum * 10);
        }

        if ($type === 'table') {
            return $rowNum === 1
                ? '[{"Name": "Juan Santos", "Relationship": "Child", "Age": 10}]'
                : '';
        }

        return 'Sample ' . ($field['label'] ?? 'Entry');
    }

    /**
     * Generate a sample CSV string formatted with the exact columns and sample data of this organization.
     * Includes UTF-8 BOM so Microsoft Excel automatically opens it in columns without Text Wizard.
     */
    public function generateSampleCsv(Organization $organization): string
    {
        $activeFields = $this->getActiveFields($organization);

        // Headers: Human readable labels matching exportMembers
        $headers = ['Full Name', 'Registered Address', 'Email Address'];
        foreach ($activeFields as $f) {
            $headers[] = $f['label'];
        }

        $output = fopen('php://temp', 'r+');

        // Write UTF-8 BOM for seamless Microsoft Excel opening
        fputs($output, "\xEF\xBB\xBF");
        fputcsv($output, $headers);

        // Sample Row 1
        $row1 = [
            'Maria Dela Cruz',
            'Zone 1, Brgy 183 Villamor, Pasay City',
            'maria.delacruz@example.com',
        ];
        foreach ($activeFields as $f) {
            $row1[] = $this->generateSampleValue($f, 1);
        }
        fputcsv($output, $row1);

        // Sample Row 2
        $row2 = [
            'Juan Santos',
            'Zone 3, Brgy 183 Villamor, Pasay City',
            'juan.santos@example.com',
        ];
        foreach ($activeFields as $f) {
            $row2[] = $this->generateSampleValue($f, 2);
        }
        fputcsv($output, $row2);

        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }

    /**
     * Detect CSV delimiter (comma, semicolon, or tab).
     */
    protected function detectDelimiter(string $filePath): string
    {
        $handle = fopen($filePath, 'r');
        if (!$handle) {
            return ',';
        }

        $firstLine = fgets($handle, 4096);
        fclose($handle);

        if (!$firstLine) {
            return ',';
        }

        $commaCount = substr_count($firstLine, ',');
        $semiCount  = substr_count($firstLine, ';');
        $tabCount   = substr_count($firstLine, "\t");

        if ($semiCount > $commaCount && $semiCount > $tabCount) {
            return ';';
        }
        if ($tabCount > $commaCount && $tabCount > $semiCount) {
            return "\t";
        }

        return ',';
    }

    /**
     * Import members from a CSV file into the database under the specified organization.
     * Intelligently maps column headers, creates new members, and updates existing members.
     */
    public function importCsv(Organization $organization, string $filePath): array
    {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            throw new Exception("CSV file cannot be read.");
        }

        $delimiter = $this->detectDelimiter($filePath);
        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            throw new Exception("Failed to open CSV file stream.");
        }

        $rawHeader = fgetcsv($handle, 0, $delimiter);
        if (!$rawHeader || empty(array_filter($rawHeader))) {
            fclose($handle);
            throw new Exception("CSV file is empty or does not contain header columns.");
        }

        // Clean UTF-8 BOM on the first column if present
        $rawHeader[0] = preg_replace('/^\xEF\xBB\xBF/', '', $rawHeader[0]);

        $fieldMapping = $this->buildFieldMapping($organization);

        // Map each CSV column index to its target key
        $columnTargets = [];
        foreach ($rawHeader as $index => $colHeader) {
            $normalized = $this->normalizeKey($colHeader);
            $target = $fieldMapping[$normalized] ?? $normalized;
            $columnTargets[$index] = $target;
        }

        $importedCount = 0;
        $updatedCount  = 0;
        $skippedCount  = 0;
        $errors        = [];
        $rowNum        = 1;

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                $rowNum++;

                // Skip completely empty lines
                if (empty(array_filter($row, fn($v) => trim($v) !== ''))) {
                    continue;
                }

                // Associate column targets with row values
                $extracted = [];
                foreach ($columnTargets as $index => $targetKey) {
                    $val = isset($row[$index]) ? trim($row[$index]) : '';
                    $extracted[$targetKey] = $val;
                }

                // Extract core fields
                $fullname = $extracted['fullname'] ?? null;
                if (!$fullname) {
                    $skippedCount++;
                    $errors[] = "Row {$rowNum}: Skipped because Full Name is empty.";
                    continue;
                }

                $address = $extracted['address'] ?? 'Barangay 183 Villamor, Pasay City';
                $email = !empty($extracted['email']) ? $extracted['email'] : null;

                // Build custom form_data payload (exclude core and metadata fields from JSON)
                $ignoredMeta = [
                    'fullname', 'full_name', 'name', 'address', 'registered_address',
                    'email', 'email_address', 'approval_date', 'status',
                    'imported_via', 'imported_at', 'created_at', 'updated_at',
                    'id', 'organization_id', 'consent'
                ];

                $customFormData = [];
                foreach ($extracted as $key => $value) {
                    $cleanKey = preg_replace('/_retired$/i', '', $key);
                    if (in_array($key, $ignoredMeta) || in_array($cleanKey, $ignoredMeta) || strlen($key) > 50) {
                        continue;
                    }

                    // Try to decode JSON for table or array fields if encoded
                    if (str_starts_with($value, '[') || str_starts_with($value, '{')) {
                        $decoded = json_decode($value, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            $customFormData[$cleanKey] = $decoded;
                            continue;
                        }
                    }

                    $customFormData[$cleanKey] = $value;
                }

                // Check for existing membership record
                $existing = MembershipApplication::where('organization_id', $organization->id)
                    ->where(function ($q) use ($fullname, $email) {
                        $q->where('fullname', $fullname);
                        if ($email) {
                            $q->orWhere('email', $email);
                        }
                    })
                    ->first();

                if ($existing) {
                    // Update existing member record
                    $updatePayload = [];
                    if (!empty($address) && $address !== 'Barangay 183 Villamor, Pasay City') {
                        $updatePayload['address'] = $address;
                    }
                    if ($email) {
                        $updatePayload['email'] = $email;
                    }

                    // Merge new non-empty custom values with existing form_data
                    $mergedFormData = array_merge(
                        $existing->form_data ?: [],
                        array_filter($customFormData, fn($v) => $v !== '' && $v !== null)
                    );
                    $updatePayload['form_data'] = $mergedFormData;

                    $existing->update($updatePayload);
                    $updatedCount++;

                    // Sync corresponding Member CRM record
                    $phone = $customFormData['contact_number'] ?? ($customFormData['contact'] ?? ($customFormData['phone'] ?? null));
                    $member = Member::firstOrNew(['membership_application_id' => $existing->id]);
                    $member->fill([
                        'organization_id' => $existing->organization_id,
                        'fullname'        => $existing->fullname,
                        'email'           => $existing->email,
                        'phone'           => $phone ?: $member->phone,
                        'member_meta'     => $existing->form_data,
                        'status'          => Member::STATUS_ACTIVE,
                    ]);
                    if (!$member->exists) {
                        $member->secure_token = (string) Str::uuid();
                    }
                    $member->save();
                } else {
                    // Create new member record
                    $newApp = MembershipApplication::create([
                        'organization_id' => $organization->id,
                        'fullname'        => $fullname,
                        'email'           => $email ?: strtolower(str_replace(' ', '', $fullname)) . '.' . rand(100, 999) . '@brgy183.temp',
                        'address'         => $address,
                        'form_data'       => $customFormData,
                        'status'          => MembershipApplication::STATUS_APPROVED,
                        'approved_by'     => 'Bulk CSV Import',
                        'actioned_at'     => now(),
                    ]);

                    // Sync corresponding Member CRM record
                    $phone = $customFormData['contact_number'] ?? ($customFormData['contact'] ?? ($customFormData['phone'] ?? null));
                    $member = Member::firstOrNew(['membership_application_id' => $newApp->id]);
                    $member->fill([
                        'organization_id' => $newApp->organization_id,
                        'fullname'        => $newApp->fullname,
                        'email'           => $newApp->email,
                        'phone'           => $phone,
                        'member_meta'     => $newApp->form_data,
                        'status'          => Member::STATUS_ACTIVE,
                    ]);
                    if (!$member->exists) {
                        $member->secure_token = (string) Str::uuid();
                    }
                    $member->save();

                    $importedCount++;
                }
            }

            DB::commit();
            fclose($handle);

            return [
                'success'         => true,
                'imported_count'  => $importedCount,
                'updated_count'   => $updatedCount,
                'skipped_count'   => $skippedCount,
                'total_processed' => $importedCount + $updatedCount + $skippedCount,
                'errors'          => $errors,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            fclose($handle);
            throw $e;
        }
    }
}
