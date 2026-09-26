<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$allRepeat = \App\Models\VawcCase::with(['assessment', 'caseReport'])->where('is_repeat_offense', true)->get();
echo "Total is_repeat_offense in DB: " . $allRepeat->count() . "\n";
foreach ($allRepeat as $c) {
    echo "ID: {$c->id} | SubCase: {$c->sub_case_number} | Status: {$c->status} | Risk: " . ($c->assessment->risk_level ?? 'none') . "\n";
}

echo "\n--- Cases by Risk Level (status != 'Closed') ---\n";
$levels = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'];
foreach ($levels as $l) {
    $cnt = \App\Models\VawcCase::join('vawc_assessments', 'vawc_assessments.vawc_case_id', '=', 'vawc_cases.id')
        ->where('vawc_assessments.risk_level', $l)
        ->where('vawc_cases.status', '!=', 'Closed')
        ->count();
    echo "{$l} count: {$cnt}\n";
}

$unassessed = \App\Models\VawcCase::doesntHave('assessment')
    ->where('status', '!=', 'Closed')
    ->count();
echo "UNASSESSED count: {$unassessed}\n";

$kpis = $app->make(\App\Services\AnalyticsService::class)->getVawcSpecificStats(now()->year);
echo "\n--- AnalyticsService KPIs ---\n";
echo "total_cases: " . $kpis['total_cases'] . "\n";
echo "repeat_cases: " . $kpis['repeat_cases'] . "\n";
echo "active_bpos: " . $kpis['active_bpos'] . "\n";
