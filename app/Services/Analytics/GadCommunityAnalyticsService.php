<?php

namespace App\Services\Analytics;

use App\Models\GadEvent;
use App\Models\Organization;
use Carbon\Carbon;

class GadCommunityAnalyticsService
{
    /**
     * GAD Impact: Group events by status and calculate engagement.
     */
    public function getGadAnalytics(int $year): array
    {
        $events = GadEvent::whereYear('event_date', $year)->get();
        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $monthlyGad = [];
        $gadByMonth = $events->groupBy(fn($e) => Carbon::parse($e->event_date)->month);
        foreach ($months as $idx => $mName) {
            $mNum = $idx + 1;
            $monthGroup = $gadByMonth->get($mNum, collect());
            $monthlyGad[] = [
                'month' => $mName,
                'proposed' => $monthGroup->count(),
                'approved' => $monthGroup->where('status', 'approved')->count(),
            ];
        }

        return [
            'total_events' => $events->count(),
            'approved'     => $events->where('status', 'approved')->count(),
            'pending'      => $events->where('status', 'pending')->count(),
            'rejected'     => $events->where('status', 'rejected')->count(),
            'distribution' => [
                ['name' => 'Approved', 'value' => $events->where('status', 'approved')->count(), 'fill' => '#10b981'],
                ['name' => 'Pending',  'value' => $events->where('status', 'pending')->count(),  'fill' => '#f59e0b'],
                ['name' => 'Rejected', 'value' => $events->where('status', 'rejected')->count(), 'fill' => '#ef4444'],
            ],
            'monthly_trend' => $monthlyGad,
        ];
    }

    /**
     * Organizational Sector Distribution: Group by keywords.
     */
    public function getOrgSectorAnalysis(): array
    {
        $orgs = Organization::all();
        $sectors = [
            'Youth'     => 0,
            'Women'     => 0,
            'Seniors'   => 0,
            'Health'    => 0,
            'Community' => 0,
        ];

        foreach ($orgs as $org) {
            $name = strtolower($org->name);
            if (str_contains($name, 'youth') || str_contains($name, 'sk')) $sectors['Youth']++;
            elseif (str_contains($name, 'woman') || str_contains($name, 'women')) $sectors['Women']++;
            elseif (str_contains($name, 'senior')) $sectors['Seniors']++;
            elseif (str_contains($name, 'health') || str_contains($name, 'nutrition')) $sectors['Health']++;
            else $sectors['Community']++;
        }

        return collect($sectors)->map(fn($val, $key) => ['name' => $key, 'value' => $val])->values()->toArray();
    }

    /**
     * Get GAD events proposal metrics.
     */
    public function getGadEventsAnalytics(int $year, ?int $orgId = null): array
    {
        $gadQuery = GadEvent::whereYear('event_date', $year);
        if ($orgId) {
            $gadQuery->where('organization_id', $orgId);
        }
        $gadEvents = $gadQuery->get();

        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $monthlyGad = [];
        $gadByMonth = $gadEvents->groupBy(fn($e) => Carbon::parse($e->event_date)->month);
        foreach ($months as $idx => $mName) {
            $mNum = $idx + 1;
            $monthGroup = $gadByMonth->get($mNum, collect());
            $monthlyGad[] = [
                'month' => $mName,
                'proposed' => $monthGroup->count(),
                'approved' => $monthGroup->where('status', 'approved')->count(),
            ];
        }

        return [
            'total' => $gadEvents->count(),
            'approved' => $gadEvents->where('status', 'approved')->count(),
            'pending' => $gadEvents->where('status', 'pending')->count(),
            'rejected' => $gadEvents->where('status', 'rejected')->count(),
            'monthly_trend' => $monthlyGad,
        ];
    }
}
