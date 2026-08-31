<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$dossiers = App\Models\VawcDossier::with(['cases.caseReport', 'cases.protectionOrders', 'cases.complianceLogs', 'cases.involvedParties'])->get();

foreach ($dossiers as $d) {
    echo "========================================================\n";
    echo "Dossier: {$d->dossier_number} | {$d->survivor_name} vs. {$d->respondent_name} ({$d->relationship_type})\n";
    echo "Threat: {$d->highest_threat_level} | Lifecycle: {$d->current_lifecycle} | Total Incidents: {$d->incident_count}\n";
    
    foreach ($d->cases as $c) {
        $incDate = $c->caseReport?->incident_date?->format('M d, Y h:i A') ?? 'N/A';
        echo "  - Case: {$c->sub_case_number} | Date: {$incDate} | Status: {$c->status}\n";
        
        foreach ($c->protectionOrders as $p) {
            $apply = $p->application_datetime?->format('M d, Y h:i A') ?? 'N/A';
            $issue = $p->issued_datetime?->format('M d, Y h:i A') ?? 'N/A';
            $expire = $p->expiration_date?->format('M d, Y h:i A') ?? 'N/A';
            echo "    * BPO: {$p->order_number} | Applied: {$apply} | Issued: {$issue} | Expires: {$expire}\n";
        }
        
        foreach ($c->complianceLogs as $cl) {
            $monDate = $cl->monitor_date?->format('M d, Y h:i A') ?? 'N/A';
            echo "    * Compliance Log: Date: {$monDate} | Compliant: " . ($cl->is_compliant ? 'YES' : 'NO') . "\n";
        }
    }
}
