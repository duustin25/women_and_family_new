<?php

namespace App\Services;

use App\Models\CaseReport;
use App\Models\VawcCase;
use App\Models\MembershipApplication;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Get statistics for the dashboard ribbon (official analytics view).
     */
    public function getRibbonStats(int $year): array
    {
        $totalVawc = VawcCase::whereYear('created_at', $year)->count();

        // BPO Stats from vawc_protection_orders
        $totalBpos = DB::table('vawc_protection_orders')
            ->where('type', 'BPO')
            ->whereYear('created_at', $year)
            ->count();

        $compliantBpos = DB::table('vawc_protection_orders')
            ->where('type', 'BPO')
            ->where('is_sla_breached', false)
            ->whereNotNull('issued_datetime')
            ->whereYear('created_at', $year)
            ->count();

        $slaRate = $totalBpos > 0 ? round(($compliantBpos / $totalBpos) * 100, 1) : 100.0;

        // Resolution Rate (Resolved + Closed / Total)
        $resolvedCount = VawcCase::whereYear('created_at', $year)
            ->whereIn('status', ['Resolved', 'Closed', 'Case Closed'])
            ->count();
        $resolutionRate = $totalVawc > 0 ? round(($resolvedCount / $totalVawc) * 100, 1) : 0.0;

        // Children Involved (Real-time: Child victims + recorded dependents)
        $childVictims = CaseReport::whereYear('created_at', $year)
            ->where('victim_age', '<', 18)
            ->count();

        $additionalChildren = VawcCase::whereYear('created_at', $year)
            ->sum('children_count') ?: 0;

        $childrenInvolved = $childVictims + $additionalChildren;

        return [
            'totalVawc'        => $totalVawc,
            'resolutionRate'   => $resolutionRate,
            'childrenInvolved' => (int) $childrenInvolved,
            'slaRate'          => $slaRate,
        ];
    }

    /**
     * Get high-level system counts for the general dashboard.
     */
    public function getSystemStats(?\App\Models\User $user = null): array
    {
        // 1. Calculations for Admin/Head
        $year = now()->year;

        // Children at Risk (Real-time: Reports < 18 + dependents)
        $childVictims = CaseReport::whereYear('created_at', $year)->where('victim_age', '<', 18)->count();
        $vawcCases = VawcCase::whereYear('created_at', $year)->get();
        $totalChildren = $childVictims + ($vawcCases->sum('children_count') ?: 0);

        // Case Resolution Rate
        $totalVawc = $vawcCases->count();
        $resolvedCount = $vawcCases->whereIn('status', ['Resolved', 'Closed'])->count();
        $resolutionRate = $totalVawc > 0 ? round(($resolvedCount / $totalVawc) * 100, 1) : 0.0;

        // SLA Compliance
        $totalBpos = DB::table('vawc_protection_orders')->where('type', 'BPO')->whereYear('created_at', $year)->count();
        $compliantBpos = DB::table('vawc_protection_orders')
            ->where('type', 'BPO')
            ->where('is_sla_breached', false)
            ->whereNotNull('issued_datetime')
            ->whereYear('created_at', $year)
            ->count();
        $slaRate = $totalBpos > 0 ? round(($compliantBpos / $totalBpos) * 100, 1) : 100;

        $baseStats = [
            'totalCases'        => CaseReport::count(),
            'totalOrgs'         => \App\Models\Organization::count(),
            'totalUsers'        => \App\Models\User::count(),
            'pendingApps'       => MembershipApplication::where('status', 'Pending')->count(),
            'slaRate'           => $slaRate,
            'childrenInvolved'  => (int) $totalChildren,
            'resolutionRate'    => $resolutionRate,
        ];

        // 2. RBAC: Presidents see stats only for their organization
        if ($user && $user->isPresident()) {
            return [
                'totalCases'        => 0, // Org Presidents don't see cases
                'totalOrgs'         => 1,
                'totalUsers'        => \App\Models\User::where('organization_id', $user->organization_id)->count(),
                'pendingApps'       => MembershipApplication::where('organization_id', $user->organization_id)
                    ->where('status', 'Pending')->count(),
                'verifiedMembers'   => \App\Models\User::where('organization_id', $user->organization_id)
                    ->whereNotNull('email_verified_at')->count(),
                'slaRate'           => null,
                'childrenInvolved'  => null,
                'resolutionRate'    => null,
            ];
        }

        return $baseStats;
    }

    /**
     * Get recent case reports.
     */
    public function getRecentCases(int $limit = 5, ?\App\Models\User $user = null): Collection
    {
        // RBAC: Org Presidents don't see cases
        if ($user && $user->isPresident()) {
            return collect([]);
        }

        return CaseReport::with(['abuseType', 'vawcCase'])
            ->orderByDesc('created_at')
            ->take($limit)
            ->get()
            ->map(fn($case) => [
                'id'          => $case->id,
                'case_number' => $case->case_number,
                'type'        => $case->type,
                'subType'     => $case->abuseType ? $case->abuseType->name : 'N/A',
                'status'      => $case->vawcCase ? $case->vawcCase->status : ($case->lifecycle_status ?: 'New'),
                'date'        => $case->incident_date ? $case->incident_date->format('M d, Y') : $case->created_at->format('M d, Y'),
            ]);
    }

    /**
     * Get recent membership applications.
     */
    public function getRecentApplications(int $limit = 5, ?\App\Models\User $user = null): Collection
    {
        $query = MembershipApplication::with(['organization']);

        // RBAC: President sees only their organization's applications
        if ($user && $user->isPresident()) {
            $query->where('organization_id', $user->organization_id);
        }

        return $query->orderByDesc('created_at')
            ->take($limit)
            ->get()
            ->map(fn($app) => [
                'id'           => $app->id,
                'name'         => $app->fullname,
                'organization' => $app->organization ? $app->organization->name : 'N/A',
                'status'       => $app->status,
                'date'         => $app->created_at->format('M d, Y'),
            ]);
    }

    /**
     * Get distribution of case resolution statuses.
     */
    public function getCaseResolutionStats(int $year, ?\App\Models\User $user = null): array
    {
        // RBAC: Org Presidents don't see case stats
        if ($user && $user->isPresident()) {
            return [];
        }

        $cases = CaseReport::with('vawcCase')
            ->whereYear('created_at', $year)
            ->get();

        $caseResolutionsRaw = $cases->groupBy(function ($case) {
            return $case->vawcCase ? $case->vawcCase->status : ($case->lifecycle_status ?: 'New');
        })->map(fn($group) => count($group));

        $statusColors = [
            'Intake'         => '#f59e0b',
            'BPO Processing' => '#a855f7',
            'Monitoring'     => '#0ea5e9',
            'Escalated'      => '#ef4444',
            'Resolved'       => '#10b981',
            'Closed'         => '#64748b',
        ];

        $stats = [];
        foreach ($caseResolutionsRaw as $statusName => $count) {
            $stats[] = [
                'name'  => $statusName,
                'value' => $count,
                'fill'  => $statusColors[$statusName] ?? '#94a3b8'
            ];
        }

        return $stats;
    }

    /**
     * Get VAWC-specific analytics for the VAWC command dashboard.
     */
    public function getVawcSpecificStats(int $year): array
    {
        $vawcCases = VawcCase::whereYear('created_at', $year)->get();

        $totalCases    = $vawcCases->count();

        // Children at Risk (Real-time: Child victims + recorded dependents)
        $childVictims = CaseReport::whereYear('created_at', $year)
            ->where('victim_age', '<', 18)
            ->count();
        $additionalChildren = $vawcCases->sum('children_count') ?: 0;
        $totalChildren = $childVictims + $additionalChildren;

        $repeatCases   = $vawcCases->where('is_repeat_offense', true)->count();

        // SLA Compliance: BPOs issued on the same day
        $totalBpos = DB::table('vawc_protection_orders')->where('type', 'BPO')->whereYear('created_at', $year)->count();
        $compliantBpos = DB::table('vawc_protection_orders')
            ->where('type', 'BPO')
            ->where('is_sla_breached', false)
            ->whereNotNull('issued_datetime')
            ->whereYear('created_at', $year)
            ->count();

        $slaRate = $totalBpos > 0 ? round(($compliantBpos / $totalBpos) * 100, 1) : 100;

        // Distributions (Use the raw collection for efficiency)
        $status_distribution = $vawcCases->groupBy('status')->map(fn($g) => ['status' => $g->first()->status, 'count' => $g->count()])->values();
        $intake_distribution = $vawcCases->groupBy('intake_type')->map(fn($g) => ['intake_type' => $g->first()->intake_type, 'count' => $g->count()])->values();

        // Join with CaseReports for Abuse Type and Zone stats
        $abuse_distribution = DB::table('vawc_cases')
            ->join('case_reports', 'vawc_cases.case_report_id', '=', 'case_reports.id')
            ->leftJoin('case_types', 'case_reports.abuse_type_id', '=', 'case_types.id')
            ->whereYear('vawc_cases.created_at', $year)
            ->select(DB::raw('COALESCE(case_types.name, "Uncategorized") as name'), DB::raw('count(*) as count'))
            ->groupBy('name')
            ->get();

        $zone_distribution = DB::table('vawc_cases')
            ->join('case_reports', 'vawc_cases.case_report_id', '=', 'case_reports.id')
            ->leftJoin('zones', 'case_reports.zone_id', '=', 'zones.id')
            ->whereYear('vawc_cases.created_at', $year)
            ->select(DB::raw('COALESCE(zones.name, "Unknown Zone") as name'), DB::raw('count(*) as count'))
            ->groupBy('name')
            ->get();

        return [
            'total_cases'         => $totalCases,
            'total_children'      => $totalChildren,
            'repeat_cases'        => $repeatCases,
            'status_distribution' => $status_distribution,
            'intake_distribution' => $intake_distribution,
            'abuse_distribution'  => $abuse_distribution,
            'zone_distribution'   => $zone_distribution,
            'sla_compliance'      => [
                'total'     => $totalBpos,
                'compliant' => $compliantBpos,
                'rate'      => $slaRate
            ]
        ];
    }

    /**
     * Get VAWC-specific chart configuration.
     */
    public function getVawcChartConfig(): Collection
    {
        return \App\Models\CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get()
            ->map(fn($t) => [
                'key'   => strtolower($t->name),
                'label' => $t->name,
                'color' => $t->color ?? '#ce1126'
            ]);
    }

    /**
     * Get case counts grouped by month and abuse type.
     */
    public function getMonthlyCaseAnalytics(string $type, int $year, Collection $abuseTypes): array
    {
        $reports = CaseReport::select('incident_date', 'created_at', 'abuse_type_id')
            ->where('type', $type)
            ->whereYear($type === 'VAWC' ? 'incident_date' : 'created_at', $year)
            ->whereNotNull('abuse_type_id')
            ->get()
            ->groupBy(function ($report) use ($type) {
                return Carbon::parse($type === 'VAWC' ? $report->incident_date : $report->created_at)->month;
            })
            ->map(fn($group) => $group->countBy('abuse_type_id'));

        return $this->formatMonthlyData($reports, $abuseTypes);
    }

    /**
     * Get simple monthly trend for VAWC cases.
     */
    public function getVawcMonthlyTrend(int $year): array
    {
        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        $trends = VawcCase::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('count(*) as count')
        )
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $data = [];
        foreach ($months as $index => $monthName) {
            $monthNum = $index + 1;
            $data[] = [
                'month' => $monthName,
                'count' => $trends->has($monthNum) ? $trends->get($monthNum)->count : 0
            ];
        }
        return $data;
    }

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
        return Zone::withCount(['caseReports' => function ($query) use ($year) {
            $query->whereYear('created_at', $year);
        }])
            ->get()
            ->map(fn($zone) => [
                'name'  => $zone->name,
                'count' => $zone->case_reports_count,
                'color' => $zone->color_code,
            ])
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
     * Get monthly BPO application and issuance trends.
     */
    public function getVawcBpoTrends(int $year): array
    {
        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $data = [];

        $applied = DB::table('vawc_protection_orders')
            ->select(DB::raw('MONTH(created_at) as month_num'), DB::raw('COUNT(*) as total'))
            ->where('type', 'BPO')
            ->whereYear('created_at', $year)
            ->groupBy('month_num')
            ->pluck('total', 'month_num');

        $issued = DB::table('vawc_protection_orders')
            ->select(DB::raw('MONTH(created_at) as month_num'), DB::raw('COUNT(*) as total'))
            ->where('type', 'BPO')
            ->whereNotNull('issued_datetime')
            ->whereYear('created_at', $year)
            ->groupBy('month_num')
            ->pluck('total', 'month_num');

        foreach ($months as $i => $name) {
            $m = $i + 1;
            $data[] = [
                'month'   => $name,
                'applied' => $applied->get($m, 0),
                'issued'  => $issued->get($m, 0),
            ];
        }

        return $data;
    }

    /**
     * Get VAWC case status distribution for a donut chart.
     */
    public function getVawcStatusBreakdown(int $year): array
    {
        $colors = [
            'Intake'         => '#f59e0b',
            'BPO Processing' => '#a855f7',
            'Monitoring'     => '#0ea5e9',
            'Escalated'      => '#ef4444',
            'Resolved'       => '#10b981',
            'Closed'         => '#64748b',
        ];

        return VawcCase::select('status', DB::raw('count(*) as total'))
            ->whereYear('created_at', $year)
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'name'  => $row->status,
                'value' => $row->total,
                'fill'  => $colors[$row->status] ?? '#94a3b8',
            ])
            ->values()
            ->toArray();
    }

    /**
     * Get membership application growth trends.
     */
    public function getMembershipTrends(int $year, ?\App\Models\User $user = null): array
    {
        $query = MembershipApplication::where('status', 'Approved')
            ->whereYear('created_at', $year);

        // RBAC: Scope for Presidents
        if ($user && $user->isPresident()) {
            $query->where('organization_id', $user->organization_id);
        }

        $memberships = $query->get()
            ->groupBy(fn($m) => Carbon::parse($m->created_at)->month)
            ->map(fn($group) => count($group));

        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $data = [];
        foreach ($months as $index => $monthName) {
            $data[] = [
                'month' => $monthName,
                'count' => $memberships->get($index + 1, 0),
            ];
        }

        $totalThisYear = MembershipApplication::where('status', 'Approved')->whereYear('created_at', $year)->count();
        $totalLastYear = MembershipApplication::where('status', 'Approved')->whereYear('created_at', $year - 1)->count();

        $growth = '+0%';
        if ($totalLastYear > 0) {
            $percent = (($totalThisYear - $totalLastYear) / $totalLastYear) * 100;
            $growth = ($percent >= 0 ? '+' : '') . number_format($percent, 1) . '%';
        } elseif ($totalThisYear > 0) {
            $growth = '+100%';
        }

        return [
            'total'   => $totalThisYear,
            'growth'  => $growth,
            'monthly' => $data,
        ];
    }

    /**
     * Format raw month/count data into the structure expected by the frontend charts.
     */
    private function formatMonthlyData(Collection $groupedReports, Collection $abuseTypes): array
    {
        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $formattedData = [];

        foreach ($months as $index => $monthName) {
            $monthNum = $index + 1;
            $monthData = ['month' => $monthName];

            foreach ($abuseTypes as $type) {
                $key = strtolower($type->name);
                $monthData[$key] = $groupedReports->has($monthNum) ? ($groupedReports->get($monthNum)->get($type->id) ?? 0) : 0;
            }
            $formattedData[] = $monthData;
        }

        return $formattedData;
    }
}
