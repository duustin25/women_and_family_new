<?php

namespace App\Services;

use App\Models\CaseReport;
use App\Models\VawcCase;
use App\Models\MembershipApplication;
use App\Models\Zone;
use App\Models\BcpcChild;
use App\Models\BcpcAssessment;
use App\Models\Announcement;
use App\Models\User;
use App\Models\GadEvent;
use App\Models\Organization;
use App\Models\VawcAssessment;
use App\Models\MemberCommunication;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Get Simplified Separate KPIs for the official reporting dashboard ribbon.
     */
    public function getRibbonStats(int $year): array
    {
        return [
            'total_vawc'  => VawcCase::whereYear('created_at', $year)->count(),
            'total_bcpc'  => BcpcChild::count(),
            'total_gad'   => GadEvent::whereYear('event_date', $year)->count(),
            'total_orgs'  => Organization::count(),
            // Maintain shared metrics for internal use
            'resolution_rate' => $this->calculateResolutionRate($year),
            'sla_rate'        => $this->calculateSlaRate($year),
        ];
    }

    /**
     * Helper for resolution rate calculation.
     */
    private function calculateResolutionRate(int $year): float
    {
        $total = VawcCase::whereYear('created_at', $year)->count();
        $resolved = VawcCase::whereYear('created_at', $year)
            ->whereIn('status', ['Resolved', 'Closed', 'Case Closed'])
            ->count();
        return $total > 0 ? round(($resolved / $total) * 100, 1) : 0.0;
    }

    /**
     * Helper for SLA calculation to keep getRibbonStats clean.
     */
    private function calculateSlaRate(int $year): float
    {
        $totalBpos = DB::table('vawc_protection_orders')->where('type', 'BPO')->whereYear('created_at', $year)->count();
        $compliantBpos = DB::table('vawc_protection_orders')
            ->where('type', 'BPO')
            ->where('is_sla_breached', false)
            ->whereNotNull('issued_datetime')
            ->whereYear('created_at', $year)
            ->count();
        return $totalBpos > 0 ? round(($compliantBpos / $totalBpos) * 100, 1) : 100.0;
    }

    /**
     * Get high-level system counts for the general dashboard.
     */
    public function getSystemStats(?User $user = null): array
    {
        // 1. Calculations for Admin/Head
        $year = now()->year;

        // GAD & System Vitality
        $gadEvents = GadEvent::whereYear('event_date', $year)->get();
        $recentActivityCount = DB::table('audit_logs')->where('created_at', '>=', now()->subDays(7))->count();

        $baseStats = [
            'totalVawcActive'     => VawcCase::where('status', '!=', 'Closed')->count(),
            'totalBcpcChildren'   => BcpcChild::count(),
            'pendingApps'         => MembershipApplication::pending()->count(),
            'totalOrgs'           => Organization::count(),
            'totalGadEvents'      => $gadEvents->count(),
            'gadApprovedCount'    => $gadEvents->where('status', 'approved')->count(),
            'totalSystemUsers'    => User::count(),
            'recentSystemActivity' => $recentActivityCount,
        ];

        // 2. RBAC: Presidents see stats only for their organization
        if ($user && $user->isPresident()) {
            return [
                'totalCases'        => 0,
                'totalOrgs'         => 1,
                'totalUsers'        => User::where('organization_id', $user->organization_id)->count(),
                'pendingApps'       => MembershipApplication::where('organization_id', $user->organization_id)
                    ->where('status', 'Pending')->count(),
                'verifiedMembers'   => User::where('organization_id', $user->organization_id)
                    ->whereNotNull('email_verified_at')->count(),
                'recentActivity'    => DB::table('audit_logs')->where('user_id', $user->id)->where('created_at', '>=', now()->subDays(7))->count(),
            ];
        }

        return $baseStats;
    }

    /**
     * Get recent case reports.
     */
    public function getRecentCases(int $limit = 5, ?User $user = null): Collection
    {
        // RBAC: Org Presidents don't see cases
        if ($user && $user->isPresident()) {
            return collect([]);
        }

        return CaseReport::with(['abuseType', 'vawcCase'])
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($case) => [
                'id'          => $case->id,
                'case_number' => $case->case_number,
                'type'        => $case->type,
                'subType'     => $case->abuseType ? $case->abuseType->name : 'General Intake',
                'status'      => $case->vawcCase ? $case->vawcCase->status : ($case->lifecycle_status ?: 'New'),
                'date'        => $case->created_at ? $case->created_at->diffForHumans() : 'Just now',
            ]);
    }

    /**
     * Get recent membership applications.
     */
    public function getRecentApplications(int $limit = 5, ?User $user = null): Collection
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
     * Get a strategic community snapshot for the dashboard.
     */
    public function getCommunitySnapshot(): array
    {
        $year = now()->year;
        $totalMembers = User::count();
        $newMembersThisMonth = User::whereMonth('created_at', now()->month)->count();

        return [
            'gadSummary' => $this->getGadAnalytics($year),
            'orgSummary' => $this->getOrgSectorAnalysis(),
            'memberTrend' => [
                'total' => $totalMembers,
                'new'   => $newMembersThisMonth,
                'growth' => $totalMembers > 0 ? round(($newMembersThisMonth / $totalMembers) * 100, 1) : 0,
            ]
        ];
    }

    /**
     * Get distribution of case resolution statuses.
     */
    public function getCaseResolutionStats(int $year, ?User $user = null): array
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
            'Intake'              => '#f59e0b',
            'Assessment'          => '#f97316',
            'Alternative Housing' => '#6366f1',
            'BPO Processing'      => '#a855f7',
            'Monitoring'          => '#0ea5e9',
            'Escalated'           => '#ef4444',
            'Resolved'            => '#10b981',
            'Closed'              => '#64748b',
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
        $activeBpos    = DB::table('vawc_protection_orders')->whereIn('status', ['Issued', 'Served'])->count();

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
            'active_bpos'         => $activeBpos,
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
            ->where('category', 'VAWC')
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
            'Intake'              => '#f59e0b',
            'Assessment'          => '#f97316',
            'Alternative Housing' => '#6366f1',
            'BPO Processing'      => '#a855f7',
            'Monitoring'          => '#0ea5e9',
            'Escalated'           => '#ef4444',
            'Resolved'            => '#10b981',
            'Closed'              => '#64748b',
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
     * Get distribution of risk levels (CRITICAL, HIGH, MODERATE, LOW).
     * This aggregates the VAWC-RAVE algorithm's output.
     */
    public function getRiskSeverityDistribution(int $year): array
    {
        $colors = [
            'CRITICAL' => '#ef4444', // Red 500
            'HIGH'     => '#f97316', // Orange 500
            'MODERATE' => '#eab308', // Yellow 500
            'LOW'      => '#3b82f6', // Blue 500
        ];

        return DB::table('vawc_assessments')
            ->whereYear('created_at', $year)
            ->select('risk_level', DB::raw('count(*) as total'))
            ->groupBy('risk_level')
            ->get()
            ->map(fn($row) => [
                'name'  => $row->risk_level ?: 'Incomplete',
                'value' => $row->total,
                'fill'  => $colors[$row->risk_level] ?? '#94a3b8',
            ])
            ->values()
            ->toArray();
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

    /**
     * Get membership application growth trends.
     */
    public function getMembershipTrends(int $year, ?User $user = null): array
    {
        $query = MembershipApplication::approved()
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

        $totalThisYear = MembershipApplication::approved()->whereYear('created_at', $year)->count();
        $totalLastYear = MembershipApplication::approved()->whereYear('created_at', $year - 1)->count();

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
     * Get BCPC nutrition status summary for the Strategic Analytics dashboard.
     */
    public function getBcpcNutritionSummary(): array
    {
        $total = BcpcChild::count();

        // Get the latest assessment for each child
        $latestAssessments = BcpcAssessment::whereIn('id', function ($query) {
            $query->select(DB::raw('MAX(id)'))
                ->from('bcpc_assessments')
                ->groupBy('bcpc_child_id');
        })->get();

        $normal      = $latestAssessments->where('wfa_status', 'Normal')->count();
        $sam         = $latestAssessments->where('wfa_status', 'Severely Underweight')->count();
        $mam         = $latestAssessments->where('wfa_status', 'Underweight')->count();
        $stunted     = $latestAssessments->where('hfa_status', 'Stunted')->count();
        $sevStunted  = $latestAssessments->where('hfa_status', 'Severely Stunted')->count();
        $normalHeight = $latestAssessments->where('hfa_status', 'Normal')->count();

        $malnutritionRate = $total > 0 ? round((($sam + $mam) / $total) * 100, 1) : 0.0;

        // SFP Breakdown
        $sfpBreakdown = [
            'Enrolled'   => BcpcChild::where('sfp_status', 'Enrolled')->count(),
            'Graduated'  => BcpcChild::where('sfp_status', 'Graduated')->count(),
            'Completed'  => BcpcChild::where('sfp_status', 'Completed')->count(),
            'Terminated' => BcpcChild::where('sfp_status', 'Terminated')->count(),
            'None'       => BcpcChild::where('sfp_status', 'None')->count(),
        ];

        // Zones Breakdown for Malnutrition Hotspots
        $zones = Zone::all();
        $zonesBreakdown = [];
        foreach ($zones as $zone) {
            $zoneChildrenIds = BcpcChild::where('zone_id', $zone->id)->pluck('id');
            $zoneTotal = $zoneChildrenIds->count();

            $zoneLatest = $latestAssessments->whereIn('bcpc_child_id', $zoneChildrenIds);
            $zoneMalnourished = $zoneLatest->whereIn('wfa_status', ['Underweight', 'Severely Underweight'])->count();
            $zoneStunted = $zoneLatest->whereIn('hfa_status', ['Stunted', 'Severely Stunted'])->count();

            $zonesBreakdown[] = [
                'name'         => $zone->name,
                'total'        => $zoneTotal,
                'malnourished' => $zoneMalnourished,
                'stunted'      => $zoneStunted,
                'rate'         => $zoneTotal > 0 ? round(($zoneMalnourished / $zoneTotal) * 100, 1) : 0.0,
            ];
        }

        // Sort zones by malnutrition count descending
        usort($zonesBreakdown, function ($a, $b) {
            return $b['malnourished'] <=> $a['malnourished'];
        });

        return [
            'total'              => $total,
            'normal'             => $normal,
            'sam'                => $sam,
            'mam'                => $mam,
            'stunted'            => $stunted,
            'severely_stunted'   => $sevStunted,
            'normal_height'      => $normalHeight,
            'malnutrition_rate'  => $malnutritionRate,
            'sfp_breakdown'      => $sfpBreakdown,
            'zones_breakdown'    => $zonesBreakdown,
            'distribution'       => [
                ['name' => 'Normal',              'value' => $normal, 'fill' => '#10b981'],
                ['name' => 'Underweight (MAM)',   'value' => $mam,    'fill' => '#f59e0b'],
                ['name' => 'Sev. Underweight (SAM)', 'value' => $sam, 'fill' => '#ef4444'],
            ],
            'height_distribution' => [
                ['name' => 'Normal Height',       'value' => $normalHeight, 'fill' => '#10b981'],
                ['name' => 'Stunted (MAM Height)', 'value' => $stunted,      'fill' => '#a855f7'],
                ['name' => 'Severely Stunted',    'value' => $sevStunted,   'fill' => '#6b21a8'],
            ]
        ];
    }

    /**
     * GAD Impact: Group events by status and calculate engagement.
     */
    public function getGadAnalytics(int $year): array
    {
        $events = GadEvent::whereYear('event_date', $year)->get();

        return [
            'total_events' => $events->count(),
            'approved'     => $events->where('status', 'approved')->count(),
            'pending'      => $events->where('status', 'pending')->count(),
            'rejected'     => $events->where('status', 'rejected')->count(),
            'distribution' => [
                ['name' => 'Approved', 'value' => $events->where('status', 'approved')->count(), 'fill' => '#10b981'],
                ['name' => 'Pending',  'value' => $events->where('status', 'pending')->count(),  'fill' => '#f59e0b'],
                ['name' => 'Rejected', 'value' => $events->where('status', 'rejected')->count(), 'fill' => '#ef4444'],
            ]
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
     * Strategic Threat Patterns: Aggregates risk factors from the VAWC-RAVE algorithm.
     * Helps identified the 'Nature' of the problems in the barangay.
     */
    public function getThreatIndicatorPatterns(int $year): array
    {
        $cases = VawcCase::whereYear('created_at', $year)->get();

        if ($cases->isEmpty()) return [];

        return [
            ['name' => 'Weapons Involved',     'value' => $cases->where('has_weapon_involved', true)->count(), 'color' => '#ef4444'],
            ['name' => 'Emergency Arrests',    'value' => $cases->where('warrantless_arrest_made', true)->count(), 'color' => '#ce1126'],
            ['name' => 'Repeat Offense',       'value' => $cases->where('is_repeat_offense', true)->count(), 'color' => '#f97316'],
            ['name' => 'Active Scene Threat',  'value' => $cases->where('perpetrator_present', true)->count(), 'color' => '#8b5cf6'],
        ];
    }

    /**
     * Administrative Intervention Gaps: Required services identified via algorithmic flags.
     */
    public function getInterventionGaps(int $year): array
    {
        $assessments = VawcAssessment::whereYear('created_at', $year)->get();

        if ($assessments->isEmpty()) return [];

        return [
            ['name' => 'Medical Referral',    'count' => $assessments->where('requires_medical', true)->count()],
            ['name' => 'Alternative Housing', 'count' => $assessments->where('requires_alternative_housing', true)->count()],
            ['name' => 'DSWD Referral',       'count' => $assessments->where('dswd_referral_made', true)->count()],
            ['name' => 'Legal Intervention',   'count' => DB::table('vawc_protection_orders')->whereYear('created_at', $year)->count()],
        ];
    }

    /**
     * Get detailed analytics for GAD Organizations & Membership.
     */
    public function getOrganizationAnalytics(int $year, ?int $orgId = null): array
    {
        $demographics = $this->extractMemberDemographics($orgId);

        return [
            'total_members'             => $demographics['total'],
            'age_distribution'          => $demographics['age'],
            'gender_distribution'       => $demographics['gender'],
            'civil_status_distribution' => $demographics['civil_status'],
            'purok_distribution'        => $demographics['purok'],
            'applications'              => $this->getApplicationsAnalytics($year, $orgId),
            'gad'                       => $this->getGadEventsAnalytics($year, $orgId),
            'communications'           => $this->getCommunicationsAnalytics($year, $orgId),
            'organizations_list'        => Organization::all()->map(fn($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'slug' => $o->slug,
                'members_count' => $o->membershipApplications()->approved()->count()
            ])->toArray(),
        ];
    }

    /**
     * Extract age, gender, civil status, and purok demographic profiles from members metadata.
     */
    private function extractMemberDemographics(?int $orgId = null): array
    {
        $membersQuery = Member::active();
        if ($orgId) {
            $membersQuery->where('organization_id', $orgId);
        }
        $members = $membersQuery->with(['organization', 'application'])->get();

        $ageCategories = [
            'Under 18 (Youth)' => 0,
            '18-30 (Young Adult)' => 0,
            '31-50 (Adult)' => 0,
            '51-64 (Middle-aged)' => 0,
            '65+ (Senior)' => 0,
            'Unknown' => 0
        ];

        $genderCategories = [
            'Male' => 0,
            'Female' => 0,
            'Other/Not Disclosed' => 0
        ];

        $civilStatusCategories = [
            'Single' => 0,
            'Married' => 0,
            'Widowed' => 0,
            'Separated' => 0,
            'Unknown' => 0
        ];

        $purokDistribution = [];

        foreach ($members as $member) {
            $meta = $member->member_meta ?: [];

            // Age extraction
            $age = null;
            foreach ($meta as $key => $val) {
                if (str_ends_with($key, '_age') || $key === 'age') {
                    if (is_numeric($val)) {
                        $age = (int)$val;
                        break;
                    }
                }
                if (str_ends_with($key, '_dob') || str_ends_with($key, '_date_of_birth') || $key === 'dob' || $key === 'date_of_birth') {
                    try {
                        $age = Carbon::parse($val)->age;
                        break;
                    } catch (\Throwable $e) {
                    }
                }
            }
            if ($age !== null) {
                if ($age < 18) $ageCategories['Under 18 (Youth)']++;
                elseif ($age <= 30) $ageCategories['18-30 (Young Adult)']++;
                elseif ($age <= 50) $ageCategories['31-50 (Adult)']++;
                elseif ($age <= 64) $ageCategories['51-64 (Middle-aged)']++;
                else $ageCategories['65+ (Senior)']++;
            } else {
                $ageCategories['Unknown']++;
            }

            // Gender extraction
            $gender = null;
            foreach ($meta as $key => $val) {
                if (str_ends_with($key, '_sex') || str_ends_with($key, '_gender') || $key === 'sex' || $key === 'gender') {
                    $gender = ucfirst(strtolower(trim($val)));
                    break;
                }
            }
            if (!$gender && $member->organization) {
                $orgSlug = $member->organization->slug;
                if (str_contains($orgSlug, 'erpat') || str_contains($orgSlug, 'father')) {
                    $gender = 'Male';
                } elseif (str_contains($orgSlug, 'kalipi') || str_contains($orgSlug, 'woman') || str_contains($orgSlug, 'women')) {
                    $gender = 'Female';
                }
            }
            if ($gender === 'Male' || $gender === 'M') {
                $genderCategories['Male']++;
            } elseif ($gender === 'Female' || $gender === 'F') {
                $genderCategories['Female']++;
            } else {
                $genderCategories['Other/Not Disclosed']++;
            }

            // Civil status extraction
            $civilStatus = null;
            foreach ($meta as $key => $val) {
                if (str_ends_with($key, '_civil_status') || str_ends_with($key, '_marital') || $key === 'civil_status' || $key === 'marital_status') {
                    $civilStatus = ucfirst(strtolower(trim($val)));
                    break;
                }
            }
            if ($civilStatus) {
                if (str_contains($civilStatus, 'Single')) $civilStatusCategories['Single']++;
                elseif (str_contains($civilStatus, 'Married')) $civilStatusCategories['Married']++;
                elseif (str_contains($civilStatus, 'Widow')) $civilStatusCategories['Widowed']++;
                elseif (str_contains($civilStatus, 'Separated') || str_contains($civilStatus, 'Divorced')) $civilStatusCategories['Separated']++;
                else $civilStatusCategories['Unknown']++;
            } else {
                $civilStatusCategories['Unknown']++;
            }

            // Purok/Zone extraction
            $purok = null;
            foreach ($meta as $key => $val) {
                if (str_ends_with($key, '_zone') || str_ends_with($key, '_purok') || $key === 'zone' || $key === 'purok') {
                    $purok = trim($val);
                    break;
                }
            }
            $address = $meta['address'] ?? ($member->application->address ?? null);
            if (!$purok && $address) {
                if (preg_match('/(Purok\s*\d+|Zone\s*\d+)/i', $address, $matches)) {
                    $purok = ucwords(strtolower($matches[0]));
                }
            }
            if (!$purok) {
                $purok = 'Not Disclosed';
            }
            $purokDistribution[$purok] = ($purokDistribution[$purok] ?? 0) + 1;
        }

        $purokData = [];
        foreach ($purokDistribution as $purokName => $count) {
            $purokData[] = ['name' => $purokName, 'count' => $count];
        }
        usort($purokData, fn($a, $b) => $b['count'] <=> $a['count']);

        $ageData = [];
        foreach ($ageCategories as $name => $count) {
            if ($count > 0 || $name === 'Unknown') {
                $ageData[] = ['name' => $name, 'value' => $count];
            }
        }
        $genderData = [];
        foreach ($genderCategories as $name => $count) {
            $genderData[] = ['name' => $name, 'value' => $count];
        }
        $civilStatusData = [];
        foreach ($civilStatusCategories as $name => $count) {
            if ($count > 0) {
                $civilStatusData[] = ['name' => $name, 'value' => $count];
            }
        }

        return [
            'total' => $members->count(),
            'age' => $ageData,
            'gender' => $genderData,
            'civil_status' => $civilStatusData,
            'purok' => $purokData,
        ];
    }

    /**
     * Get monthly membership applications metrics.
     */
    private function getApplicationsAnalytics(int $year, ?int $orgId = null): array
    {
        $appsQuery = MembershipApplication::whereYear('created_at', $year);
        if ($orgId) {
            $appsQuery->where('organization_id', $orgId);
        }
        $apps = $appsQuery->get();

        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $monthlyApps = [];
        $appsByMonth = $apps->groupBy(fn($a) => Carbon::parse($a->created_at)->month);
        foreach ($months as $idx => $mName) {
            $mNum = $idx + 1;
            $monthGroup = $appsByMonth->get($mNum, collect());
            $monthlyApps[] = [
                'month' => $mName,
                'submitted' => $monthGroup->count(),
                'approved' => $monthGroup->where('status', 'Approved')->count(),
                'disapproved' => $monthGroup->where('status', 'Disapproved')->count(),
            ];
        }

        return [
            'total' => $apps->count(),
            'approved' => $apps->where('status', 'Approved')->count(),
            'pending' => $apps->where('status', 'Pending')->count(),
            'disapproved' => $apps->where('status', 'Disapproved')->count(),
            'monthly_trend' => $monthlyApps,
        ];
    }

    /**
     * Get GAD events proposal metrics.
     */
    private function getGadEventsAnalytics(int $year, ?int $orgId = null): array
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

    /**
     * Get member communications messaging metrics.
     */
    private function getCommunicationsAnalytics(int $year, ?int $orgId = null): array
    {
        $commQuery = MemberCommunication::query()
            ->join('members', 'member_communications.member_id', '=', 'members.id')
            ->whereYear('member_communications.created_at', $year);
        if ($orgId) {
            $commQuery->where('members.organization_id', $orgId);
        }
        $commQuery->select('member_communications.*');
        $comms = $commQuery->get();

        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $monthlyComms = [];
        $commsByMonth = $comms->groupBy(fn($c) => Carbon::parse($c->created_at)->month);
        foreach ($months as $idx => $mName) {
            $mNum = $idx + 1;
            $monthGroup = $commsByMonth->get($mNum, collect());
            $monthlyComms[] = [
                'month' => $mName,
                'sent' => $monthGroup->count(),
            ];
        }

        return [
            'total' => $comms->count(),
            'sent' => $comms->where('status', 'Sent')->count(),
            'failed' => $comms->where('status', 'Failed')->count(),
            'monthly_trend' => $monthlyComms,
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
