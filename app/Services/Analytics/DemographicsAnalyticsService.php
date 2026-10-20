<?php

namespace App\Services\Analytics;

use App\Models\CaseReport;
use App\Models\Zone;
use Illuminate\Support\Facades\DB;

class DemographicsAnalyticsService
{
    /**
     * Get demographic breakdown by age.
     */
    public function getAgeDemographics(int $year): array
    {
        $casesWithAge = CaseReport::select('victim_age')
            ->whereNotNull('victim_age')
            ->whereYear('created_at', $year)
            ->get();

        $ageCategories = [
            '0-12 yrs (Child)'        => 0,
            '13-17 yrs (Teen)'        => 0,
            '18-35 yrs (Young Adult)' => 0,
            '36-50 yrs (Adult)'       => 0,
            '51+ yrs (Senior)'        => 0,
        ];

        foreach ($casesWithAge as $case) {
            $age = (int) $case->victim_age;
            if ($age <= 12) $ageCategories['0-12 yrs (Child)']++;
            elseif ($age <= 17) $ageCategories['13-17 yrs (Teen)']++;
            elseif ($age <= 35) $ageCategories['18-35 yrs (Young Adult)']++;
            elseif ($age <= 50) $ageCategories['36-50 yrs (Adult)']++;
            else $ageCategories['51+ yrs (Senior)']++;
        }

        return collect($ageCategories)->map(fn($count, $name) => ['name' => $name, 'count' => $count])->values()->toArray();
    }

    /**
     * Get distribution of cases by Zone.
     */
    public function getZoneDistribution(int $year): array
    {
        return Zone::with([
            'caseReports' => function ($query) use ($year) {
                $query->whereYear('created_at', $year)
                    ->with(['vawcCase' => function ($vQuery) {
                        $vQuery->select('id', 'case_report_id', 'uuid')
                            ->with('assessment:id,vawc_case_id,risk_level,risk_score');
                    }]);
            },
            'children' => function ($query) {
                $query->where('status', 'Active')
                    ->with('latestAssessment');
            }
        ])
            ->withCount(['caseReports' => function ($query) use ($year) {
                $query->whereYear('created_at', $year);
            }])
            ->get()
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->map(function ($zone) {
                $vawcCases = $zone->caseReports->map(function ($cr) {
                    return [
                        'id' => $cr->vawcCase?->id,
                        'uuid' => $cr->vawcCase?->uuid,
                        'case_number' => $cr->case_number,
                        'location' => $cr->incident_location ?: 'Barangay 183',
                        'risk_level' => $cr->vawcCase?->assessment?->risk_level ?? 'MODERATE',
                        'risk_score' => $cr->vawcCase?->assessment?->risk_score ?? 0,
                    ];
                })->filter(fn($c) => !empty($c['id']))->values()->toArray();

                $bcpcChildren = $zone->children ? $zone->children->map(function ($ch) {
                    $latest = $ch->latestAssessment;
                    $isMalnourished = $latest && (
                        in_array($latest->wfa_status, ['Underweight', 'Severely Underweight']) ||
                        in_array($latest->wflh_status ?? '', ['Wasted', 'Severely Wasted'])
                    );
                    return [
                        'id' => $ch->id,
                        'name' => $ch->full_name,
                        'address' => $ch->address ?: 'Barangay 183',
                        'is_malnourished' => $isMalnourished,
                        'status' => $latest ? ($latest->wflh_status ?: $latest->wfa_status) : 'Active',
                    ];
                })->values()->toArray() : [];

                return [
                    'id'       => $zone->id,
                    'name'     => $zone->name,
                    'count'    => $zone->case_reports_count,
                    'color'    => $zone->color_code,
                    'cases'    => $vawcCases,
                    'children' => $bcpcChildren,
                ];
            })
            ->toArray();
    }

    /**
     * Get distribution of cases by Location (Raw String).
     */
    public function getLocationDemographics(int $year, int $limit = 8): array
    {
        $locationRaw = CaseReport::select('incident_location')
            ->whereNotNull('incident_location')
            ->whereYear('created_at', $year)
            ->get()
            ->groupBy('incident_location')
            ->map(fn($group) => count($group))
            ->sortByDesc(fn($count) => $count)
            ->take($limit);

        $locationDemographics = [];
        foreach ($locationRaw as $location => $count) {
            $shortLoc = strlen($location) > 20 ? substr($location, 0, 20) . '...' : $location;
            $locationDemographics[] = [
                'name' => $shortLoc,
                'count' => $count,
                'fullName' => $location
            ];
        }
        return $locationDemographics;
    }

    /**
     * Get average risk scores per Zone to identify hotspots.
     */
    public function getZoneRiskImpact(int $year): array
    {
        return DB::table('vawc_assessments')
            ->join('vawc_cases', 'vawc_assessments.vawc_case_id', '=', 'vawc_cases.id')
            ->join('case_reports', 'vawc_cases.case_report_id', '=', 'case_reports.id')
            ->join('zones', 'case_reports.zone_id', '=', 'zones.id')
            ->whereYear('vawc_assessments.created_at', $year)
            ->select('zones.name', DB::raw('AVG(vawc_assessments.risk_score) as avg_score'))
            ->groupBy('zones.name')
            ->orderByDesc('avg_score')
            ->get()
            ->map(fn($row) => [
                'name'  => $row->name,
                'score' => (float) round($row->avg_score, 2),
            ])
            ->toArray();
    }
}
