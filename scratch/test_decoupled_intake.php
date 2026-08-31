<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\VawcCaseService;
use App\Models\VawcDossier;
use App\Models\VawcCase;
use App\Models\User;
use App\Models\Zone;
use App\Models\CaseAbuseType;
use Illuminate\Support\Facades\Auth;

$admin = User::where('role', 'admin')->first() ?? User::first();
Auth::login($admin);

$service = app(VawcCaseService::class);
$zone = Zone::first();
$abuse = CaseAbuseType::where('name', 'Psychological')->first() ?? CaseAbuseType::first();

echo "Testing Scenario A: New Survivor (Laurel Santo) vs Existing Perpetrator (Larry Dicki)\n";

$payload = [
    'intake_type' => 'Direct',
    'is_anonymous' => false,
    'zone_id' => $zone->id,
    'abuse_type' => $abuse->name,
    'incident_date' => '2026-09-01 10:00:00',
    'incident_location' => 'Zone 1, Sunflower St.',
    'description' => 'Perpetrator made repeated stalking attempts and threats.',
    'children_count' => 0,
    'is_repeat_offense' => true, // Flagged because Larry Dicki is a repeat offender
    'victim' => [
        'name' => 'Laurel Santo',
        'age' => 24,
        'gender' => 'Female',
        'contact' => '0917-000-9999',
        'address' => 'Zone 1, Sunflower St.',
        'civil_status' => 'Single',
        'educational_attainment' => 'College',
        'occupation' => 'Nurse',
    ],
    'complainant' => [
        'name' => 'Laurel Santo',
        'contact' => '0917-000-9999',
        'relation_to_victim' => 'Self (Victim)',
    ],
    'respondent' => [
        'name' => 'Larry Dicki', // Existing perpetrator from DOS-2026-0007!
        'age' => 54,
        'gender' => 'Male',
        'contact' => '0919-222-7788',
        'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
        'relationship' => 'Former Dating Partner',
        'civil_status' => 'Single',
        'physical_description' => '5\'6", heavy build, graying hair',
    ],
];

$vawcCase = $service->createVawcCase($payload);

echo "Created Sub-Case: " . $vawcCase->sub_case_number . "\n";
echo "Assigned Master Dossier: " . $vawcCase->dossier->dossier_number . "\n";
echo "Dossier Survivor: " . $vawcCase->dossier->survivor_name . " vs Respondent: " . $vawcCase->dossier->respondent_name . "\n";
echo "Dossier Incident Count: " . $vawcCase->dossier->incident_count . "\n";

// Verify Shane Miller vs Larry Dicki dossier still exists untouched
$shaneDossier = VawcDossier::where('survivor_name', 'Shane Miller')->where('respondent_name', 'Larry Dicki')->first();
echo "Original Shane Miller Dossier: " . ($shaneDossier ? $shaneDossier->dossier_number : 'NOT FOUND') . "\n";
