<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\OrganizationMemberImportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Exception;

class OrganizationImportController extends Controller
{
    protected OrganizationMemberImportService $importService;

    public function __construct(OrganizationMemberImportService $importService)
    {
        $this->importService = $importService;
    }

    /**
     * Download dynamic CSV sample template customized for the specific Organization.
     */
    public function downloadSample(Organization $organization): StreamedResponse
    {
        $csvContent = $this->importService->generateSampleCsv($organization);
        $filename = "sample_import_" . $organization->slug . ".csv";

        return response()->streamDownload(function () use ($csvContent) {
            echo $csvContent;
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Import bulk members from an uploaded CSV file.
     */
    public function import(Request $request, Organization $organization)
    {
        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'], // Max 5MB
        ]);

        try {
            $file = $request->file('csv_file');
            $result = $this->importService->importCsv($organization, $file->getRealPath());

            $parts = [];
            if ($result['imported_count'] > 0) {
                $parts[] = "{$result['imported_count']} new member(s) enrolled";
            }
            if ($result['updated_count'] > 0) {
                $parts[] = "{$result['updated_count']} existing member(s) updated";
            }
            if ($result['skipped_count'] > 0) {
                $parts[] = "{$result['skipped_count']} row(s) skipped";
            }

            $msg = "Bulk import completed! " . (empty($parts) ? "No member rows found." : implode(', ', $parts) . ".");

            return redirect()->back()->with('success', $msg)->with('import_errors', $result['errors']);
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Bulk import failed: " . $e->getMessage());
        }
    }
}
