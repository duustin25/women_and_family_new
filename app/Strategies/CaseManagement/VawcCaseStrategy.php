<?php

namespace App\Strategies\CaseManagement;

use App\Models\CaseReport;

class VawcCaseStrategy implements CaseStrategyInterface
{
    /**
     * Get the display name for VAWC cases.
     */
    public function getDisplayName(CaseReport $case): string
    {
        return $case->victim_name ?? 'Anonymous';
    }
}
