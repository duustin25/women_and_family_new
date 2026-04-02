<?php

namespace App\Strategies\CaseManagement;

class CaseStrategyFactory
{
    /**
     * Create a strategy instance based on the case type.
     *
     * @param string $type
     * @return CaseStrategyInterface
     */
    public static function make(string $type): CaseStrategyInterface
    {
        return match (strtoupper($type)) {
            'VAWC' => new VawcCaseStrategy(),
            'BCPC' => new BcpcCaseStrategy(),
            default => throw new \InvalidArgumentException("Invalid case type provided: {$type}")
        };
    }
}
