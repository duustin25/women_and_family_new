<?php

namespace App\Strategies\CaseManagement;

use App\Models\CaseReport;

class BcpcCaseStrategy implements CaseStrategyInterface
{
    /**
     * Get the display name for BCPC cases.
     */
    public function getDisplayName(CaseReport $case): string
    {
        return $case->victim_name ?? $case->complainant_name ?? 'Anonymous';
    }
}
