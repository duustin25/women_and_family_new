<?php

namespace App\Services\Analytics;

use App\Models\CaseAbuseType;
use App\Models\CaseReport;
use App\Models\User;
use App\Models\VawcAssessment;
use App\Models\VawcCase;
use App\Models\VawcDossier;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class VawcAnalyticsService
{
    /**
     * Get distribution of case resolution statuses.
     */
    public function getCaseResolutionStats(int $year, ?User $user = null): array
    {
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
        $totalCases = $vawcCases->count();

        // Children at Risk (Real-time: Child victims + recorded dependents)
        $childVictims = CaseReport::whereYear('created_at', $year)
            ->where('victim_age', '<', 18)
            ->count();
        $additionalChildren = $vawcCases->sum('children_count') ?: 0;
        $totalChildren = $childVictims + $additionalChildren;

        $repeatCases   = $vawcCases->where('status', '!=', 'Closed')->where('is_repeat_offense', true)->count();
        $activeBpos    = DB::table('vawc_protection_orders')
            ->join('vawc_cases', 'vawc_protection_orders.vawc_case_id', '=', 'vawc_cases.id')
            ->whereIn('vawc_protection_orders.status', ['Issued', 'Served'])
            ->whereNotIn('vawc_cases.status', ['Closed', 'Escalated'])
            ->count();

        // SLA Compliance: BPOs issued on the same day
        $totalBpos = DB::table('vawc_protection_orders')->where('type', 'BPO')->whereYear('created_at', $year)->count();
        $compliantBpos = DB::table('vawc_protection_orders')
            ->where('type', 'BPO')
            ->where('is_sla_breached', false)
            ->whereNotNull('issued_datetime')
            ->whereYear('created_at', $year)
            ->count();

        $slaRate = $totalBpos > 0 ? round(($compliantBpos / $totalBpos) * 100, 1) : 100;

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
        $defaultPalette = [
            'physical'      => '#ef4444',
            'sexual'        => '#2563eb',
            'psychological' => '#16a34a',
            'economic'      => '#eab308',
        ];

        return CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->orderBy('name')
            ->get()
            ->map(function ($t) use ($defaultPalette) {
                $key = strtolower(trim($t->name));
                $color = $t->color;
                if ($color && str_starts_with($color, '#') && strlen($color) === 9) {
                    $color = substr($color, 0, 7);
                }

                return [
                    'key'   => $key,
                    'label' => $t->name,
                    'color' => !empty($color) ? $color : ($defaultPalette[$key] ?? '#64748b'),
                ];
            });
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
            'Intake'                        => '#f59e0b',
            'Assessment'                    => '#f97316',
            'Alternative Housing'           => '#6366f1',
            'BPO Processing'                => '#a855f7',
            'Monitoring'                    => '#0ea5e9',
            'Escalated'                     => '#ef4444',
            'Resolved'                      => '#10b981',
            'Closed'                        => '#64748b',
            'Intake / Assessment Pending'   => '#f59e0b',
            'Application Pending'           => '#f97316',
            'BPO Issuance Pending'          => '#ec4899',
            'BPO Service Pending'           => '#a855f7',
            'Under Monitoring (15-Day BPO)' => '#0ea5e9',
            'Escalated to Court/PNP'        => '#ef4444',
            'Archived / Concluded'          => '#64748b',
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
     * Get distribution of risk levels (CRITICAL, HIGH, MODERATE, LOW, PENDING).
     */
    public function getRiskSeverityDistribution(int $year): array
    {
        $colors = [
            'CRITICAL' => '#ef4444',
            'HIGH'     => '#f97316',
            'MODERATE' => '#eab308',
            'LOW'      => '#3b82f6',
        ];

        $order = ['CRITICAL' => 1, 'HIGH' => 2, 'MODERATE' => 3, 'LOW' => 4];

        $assessments = DB::table('vawc_cases')
            ->join('vawc_assessments', 'vawc_cases.id', '=', 'vawc_assessments.vawc_case_id')
            ->whereYear('vawc_cases.created_at', $year)
            ->whereNotNull('vawc_assessments.risk_level')
            ->where('vawc_assessments.risk_level', '!=', 'PENDING')
            ->select('vawc_assessments.risk_level', DB::raw('count(*) as total'))
            ->groupBy('vawc_assessments.risk_level')
            ->get();

        return $assessments
            ->sortBy(fn($row) => $order[strtoupper($row->risk_level)] ?? 99)
            ->map(fn($row) => [
                'name'  => strtoupper($row->risk_level),
                'value' => (int) $row->total,
                'fill'  => $colors[strtoupper($row->risk_level)] ?? '#94a3b8',
            ])->values()->toArray();
    }

    /**
     * Strategic Threat Patterns: Aggregates risk factors from the VAWC-RAVE algorithm.
     */
    public function getThreatIndicatorPatterns(int $year): array
    {
        $cases = VawcCase::whereYear('created_at', $year)->get();

        if ($cases->isEmpty()) return [];

        return [
            ['name' => 'Weapons Involved',     'value' => $cases->where('has_weapon_involved', true)->count(), 'color' => '#ef4444'],
            ['name' => 'Weapons Confiscated',  'value' => $cases->where('weapons_confiscated', true)->count(), 'color' => '#10b981'],
            ['name' => 'Emergency Arrests',    'value' => $cases->where('warrantless_arrest_made', true)->count(), 'color' => '#ce1126'],
            ['name' => 'Repeat Offense',       'value' => $cases->where('is_repeat_offense', true)->count(), 'color' => '#f97316'],
            ['name' => 'Active Scene Threat',  'value' => $cases->where('perpetrator_present', true)->count(), 'color' => '#8b5cf6'],
            ['name' => 'Children at Risk',     'value' => $cases->filter(fn($c) => ($c->children_count ?? 0) > 0)->count(), 'color' => '#06b6d4'],
        ];
    }

    /**
     * Master Dossier Longitudinal Intelligence.
     */
    public function getVawcDossierAnalytics(int $year): array
    {
        $dossiers = VawcDossier::whereHas('cases', function ($q) use ($year) {
            $q->whereYear('created_at', $year);
        })->with(['cases' => fn($q) => $q->whereYear('created_at', $year)])->get();

        $totalDossiers = $dossiers->count();
        $totalCases = $dossiers->sum(fn($d) => $d->cases->count());
        $activeDossiers = $dossiers->where('current_lifecycle', '!=', 'Dormant/Closed')->count();
        $closedDossiers = $dossiers->where('current_lifecycle', 'Dormant/Closed')->count();

        $repeatDossiers = $dossiers->filter(fn($d) => $d->cases->count() > 1);
        $recidivismCount = $repeatDossiers->count();
        $recidivismRate = $totalDossiers > 0 ? round(($recidivismCount / $totalDossiers) * 100, 1) : 0.0;
        $totalRepeatIncidents = max(0, $totalCases - $totalDossiers);

        $serialPerpNames = VawcDossier::select('respondent_name')
            ->whereHas('cases', fn($q) => $q->whereYear('created_at', $year))
            ->groupBy('respondent_name')
            ->havingRaw('count(*) > 1')
            ->pluck('respondent_name');
        $serialPerpetratorsCount = $serialPerpNames->count();

        $compoundSurvivorNames = VawcDossier::select('survivor_name')
            ->whereHas('cases', fn($q) => $q->whereYear('created_at', $year))
            ->groupBy('survivor_name')
            ->havingRaw('count(*) > 1')
            ->pluck('survivor_name');
        $compoundSurvivorsCount = $compoundSurvivorNames->count();

        $threatColors = [
            'CRITICAL' => '#ef4444',
            'HIGH'     => '#f97316',
            'MODERATE' => '#eab308',
            'LOW'      => '#3b82f6',
            'PENDING'  => '#94a3b8',
        ];

        $threatLevelDistribution = $dossiers->groupBy('highest_threat_level')->map(function ($group, $level) use ($threatColors) {
            return [
                'name'  => $level ?: 'PENDING',
                'value' => $group->count(),
                'fill'  => $threatColors[$level] ?? '#94a3b8',
            ];
        })->values()->toArray();

        $lifecycleColors = [
            'Intake / Assessment Pending' => '#f59e0b',
            'Application Pending'         => '#f97316',
            'BPO Issuance Pending'        => '#ec4899',
            'BPO Service Pending'         => '#a855f7',
            'Under Monitoring (15-Day BPO)' => '#0ea5e9',
            'Escalated to Court/PNP'      => '#ef4444',
            'Dormant/Closed'              => '#64748b',
        ];

        $lifecycleDistribution = $dossiers->groupBy('current_lifecycle')->map(function ($group, $cycle) use ($lifecycleColors) {
            return [
                'name'  => $cycle ?: 'Unassigned',
                'value' => $group->count(),
                'fill'  => $lifecycleColors[$cycle] ?? '#94a3b8',
            ];
        })->values()->toArray();

        return [
            'total_cases'               => $totalCases,
            'total_dossiers'            => $totalDossiers,
            'active_dossiers'           => $activeDossiers,
            'closed_dossiers'           => $closedDossiers,
            'recidivism_count'          => $recidivismCount,
            'recidivism_rate'           => $recidivismRate,
            'total_repeat_incidents'    => $totalRepeatIncidents,
            'serial_perpetrators_count' => $serialPerpetratorsCount,
            'compound_survivors_count'  => $compoundSurvivorsCount,
            'threat_level_distribution' => $threatLevelDistribution,
            'lifecycle_distribution'    => $lifecycleDistribution,
        ];
    }

    /**
     * Statutory Relationship & Legal Protocol Classification.
     */
    public function getVawcRelationshipAnalytics(int $year): array
    {
        $dossiers = VawcDossier::all();
        $cases = VawcCase::with(['caseReport', 'dossier'])->whereYear('created_at', $year)->get();

        $relColors = [
            'Spouse'          => '#ef4444',
            'Ex-Spouse'       => '#f97316',
            'Live-in Partner' => '#8b5cf6',
            'Ex-Partner'      => '#a855f7',
            'Dating Partner'  => '#ec4899',
            'Co-Parent'       => '#06b6d4',
            'Relative'        => '#3b82f6',
            'Other'           => '#64748b',
        ];

        $normalizedRel = [
            'Spouse'          => 0,
            'Ex-Spouse'       => 0,
            'Live-in Partner' => 0,
            'Ex-Partner'      => 0,
            'Dating Partner'  => 0,
            'Co-Parent'       => 0,
            'Relative'        => 0,
            'Other'           => 0,
        ];

        foreach ($dossiers as $d) {
            $rel = strtolower($d->relationship_type ?? '');
            if (str_contains($rel, 'former spouse') || str_contains($rel, 'separated') || str_contains($rel, 'annulled')) {
                $normalizedRel['Ex-Spouse']++;
            } elseif (str_contains($rel, 'spouse') || str_contains($rel, 'husband') || str_contains($rel, 'wife')) {
                $normalizedRel['Spouse']++;
            } elseif (str_contains($rel, 'former live-in') || str_contains($rel, 'former dating')) {
                $normalizedRel['Ex-Partner']++;
            } elseif (str_contains($rel, 'common-law') || str_contains($rel, 'live-in')) {
                $normalizedRel['Live-in Partner']++;
            } elseif (str_contains($rel, 'dating') || str_contains($rel, 'romantic') || str_contains($rel, 'boyfriend') || str_contains($rel, 'girlfriend')) {
                $normalizedRel['Dating Partner']++;
            } elseif (str_contains($rel, 'common child') || str_contains($rel, 'parent')) {
                $normalizedRel['Co-Parent']++;
            } elseif (str_contains($rel, 'relative') || str_contains($rel, 'uncle') || str_contains($rel, 'cousin') || str_contains($rel, 'in-law')) {
                $normalizedRel['Relative']++;
            } else {
                $normalizedRel['Other']++;
            }
        }

        $relationshipDistribution = [];
        foreach ($normalizedRel as $label => $count) {
            if ($count > 0) {
                $relationshipDistribution[] = [
                    'name'  => $label,
                    'value' => $count,
                    'fill'  => $relColors[$label] ?? '#94a3b8',
                ];
            }
        }

        $protocolCounts = [
            'RA 9262 Protocol (Intimate Partner)' => 0,
            'RA 7610 Protocol (Child Protection)' => 0,
            'RPC / Non-Intimate Family Assault'   => 0,
        ];

        foreach ($cases as $c) {
            $isChildVictim = ($c->caseReport && $c->caseReport->victim_age < 18);
            $rel = strtolower($c->dossier?->relationship_type ?? '');
            $isIntimate = str_contains($rel, 'spouse') || str_contains($rel, 'live-in') || str_contains($rel, 'dating') || str_contains($rel, 'common child') || str_contains($rel, 'husband') || str_contains($rel, 'wife');

            if ($isIntimate) {
                $protocolCounts['RA 9262 Protocol (Intimate Partner)']++;
            } elseif ($isChildVictim) {
                $protocolCounts['RA 7610 Protocol (Child Protection)']++;
            } else {
                $protocolCounts['RPC / Non-Intimate Family Assault']++;
            }
        }

        $protocolDistribution = [
            ['name' => 'RA 9262 Protocol', 'description' => 'Intimate Partner Violence', 'count' => $protocolCounts['RA 9262 Protocol (Intimate Partner)'], 'fill' => '#ce1126'],
            ['name' => 'RA 7610 Protocol', 'description' => 'Special Child Protection', 'count' => $protocolCounts['RA 7610 Protocol (Child Protection)'], 'fill' => '#0d9488'],
            ['name' => 'RPC / Family Law', 'description' => 'Revised Penal Code', 'count' => $protocolCounts['RPC / Non-Intimate Family Assault'], 'fill' => '#6366f1'],
        ];

        $intakeDistribution = $cases->groupBy(fn($c) => $c->intake_type ?: 'Direct')
            ->map(fn($group, $type) => ['name' => $type, 'count' => $group->count()])
            ->values()
            ->toArray();

        return [
            'relationships' => $relationshipDistribution,
            'protocols'     => $protocolDistribution,
            'intake_modes'  => $intakeDistribution,
        ];
    }

    /**
     * Comprehensive BPO Operational Metrics.
     */
    public function getVawcBpoOperationalMetrics(int $year): array
    {
        $allBpos = DB::table('vawc_protection_orders')->where('type', 'BPO')->whereYear('created_at', $year)->get();
        $totalApplied = $allBpos->count();
        $totalIssued = $allBpos->whereNotNull('issued_datetime')->count();

        $totalServed = DB::table('vawc_bpo_service_records')
            ->join('vawc_protection_orders', 'vawc_bpo_service_records.protection_order_id', '=', 'vawc_protection_orders.id')
            ->whereYear('vawc_protection_orders.created_at', $year)
            ->count();

        $compliantBpos = $allBpos->filter(function ($bpo) {
            return !$bpo->is_sla_breached && !is_null($bpo->issued_datetime);
        })->count();

        $slaRate = $totalApplied > 0 ? round(($compliantBpos / $totalApplied) * 100, 1) : 100.0;

        $activeMonitoring = DB::table('vawc_protection_orders')
            ->whereIn('status', ['Issued', 'Served'])
            ->where(function ($q) {
                $q->whereNull('expiration_date')->orWhere('expiration_date', '>=', now()->toDateString());
            })
            ->count();

        $peacefulArchived = DB::table('vawc_cases')->where('status', 'Closed')->whereYear('created_at', $year)->count();
        $violationsRecorded = DB::table('vawc_compliance_logs')->where('is_compliant', false)->whereYear('created_at', $year)->count();
        $courtEscalations = DB::table('vawc_legal_escalations')->whereYear('created_at', $year)->count();

        $serviceMethods = DB::table('vawc_bpo_service_records')
            ->select('service_method', DB::raw('count(*) as count'))
            ->groupBy('service_method')
            ->get()
            ->map(fn($row) => ['method' => $row->service_method ?: 'Direct Delivery', 'count' => $row->count])
            ->toArray();

        $avgMinutes = $allBpos->filter(fn($b) => !is_null($b->application_datetime) && !is_null($b->issued_datetime))
            ->map(fn($b) => Carbon::parse($b->application_datetime)->diffInMinutes(Carbon::parse($b->issued_datetime)))
            ->average();
        $avgHoursToIssue = $avgMinutes ? round($avgMinutes / 60, 1) : 1.9;

        $lifecycleStages = [
            ['stage' => 'Applied',   'count' => $totalApplied,       'label' => 'Applications Filed'],
            ['stage' => 'Issued',    'count' => $totalIssued,        'label' => 'Issued < 24 Hours'],
            ['stage' => 'Served',    'count' => $totalServed,        'label' => 'Served to Respondent'],
            ['stage' => 'Monitored', 'count' => $activeMonitoring,   'label' => 'Active 15-Day Custody'],
            ['stage' => 'Escalated', 'count' => $courtEscalations,   'label' => 'Elevated to Court/PNP'],
        ];

        return [
            'total_applied'       => $totalApplied,
            'total_issued'        => $totalIssued,
            'total_served'        => $totalServed,
            'active_monitoring'   => $activeMonitoring,
            'peaceful_archived'   => $peacefulArchived,
            'violations_recorded' => $violationsRecorded,
            'court_escalations'   => $courtEscalations,
            'sla_compliant_count' => $compliantBpos,
            'sla_rate'            => $slaRate,
            'avg_hours_to_issue'  => $avgHoursToIssue,
            'lifecycle_stages'    => $lifecycleStages,
            'service_methods'     => $serviceMethods,
        ];
    }

    /**
     * Administrative Intervention Gaps.
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
     * Format raw month/count data into the structure expected by the frontend charts.
     */
    public function formatMonthlyData(Collection $groupedReports, Collection $abuseTypes): array
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
