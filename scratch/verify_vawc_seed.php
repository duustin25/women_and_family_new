<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\VawcDossier;
use App\Models\VawcCase;
use App\Models\CaseReport;

echo "=== VAWC SEED VERIFICATION ===\n";
echo "Total Master Dossiers: " . VawcDossier::count() . "\n";
echo "Total VAWC Cases: " . VawcCase::count() . "\n";
echo "Total Case Reports (VAWC): " . CaseReport::where('type', 'VAWC')->count() . "\n\n";

foreach (VawcDossier::with(['cases.caseReport', 'cases.assessment'])->get() as $d) {
    echo "Dossier {$d->dossier_number}: {$d->survivor_name} vs {$d->respondent_name} [{$d->current_lifecycle} | Risk: {$d->highest_threat_level}]\n";
    foreach ($d->cases as $c) {
        $anon = $c->caseReport->is_anonymous ? ' [CONFIDENTIAL INFORMANT]' : '';
        $assessed = $c->assessment ? "Risk: {$c->assessment->risk_level} (Score: {$c->assessment->risk_score})" : "NO ASSESSMENT (Pending Step 1)";
        $refCount = is_array($c->referral_status) ? count($c->referral_status) : 0;
        $actCount = is_array($c->action_sought) ? count($c->action_sought) : 0;
        echo "  - SubCase {$c->sub_case_number} (Seq {$c->incident_sequence}) Status: {$c->status} | {$assessed}{$anon}\n";
        echo "    Referrals ({$refCount}): " . json_encode($c->referral_status) . "\n";
        echo "    Actions ({$actCount}): " . json_encode($c->action_sought) . "\n";
        echo "    Witness: " . ($c->witness_info ?: 'None') . "\n";
        if ($c->closure_reason) {
            echo "    Closure: {$c->closure_reason}\n";
        }
    }
    echo "\n";
}
