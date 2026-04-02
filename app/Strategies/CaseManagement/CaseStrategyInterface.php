<?php

namespace App\Strategies\CaseManagement;

use App\Models\CaseReport;

interface CaseStrategyInterface
{
    /**
     * Get the display name for the case report based on its type and available data.
     *
     * @param CaseReport $case
     * @return string
     */
    public function getDisplayName(CaseReport $case): string;
}
