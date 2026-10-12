<?php

namespace App\Services\Analytics;

use App\Models\Announcement;
use App\Models\BcpcAssessment;
use App\Models\BcpcChild;
use App\Models\CaseReport;
use App\Models\GadEvent;
use App\Models\Member;
use App\Models\MembershipApplication;
use App\Models\Organization;
use App\Models\User;
use App\Models\VawcCase;
use App\Models\VawcDossier;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DashboardOperationalService
{
    /**
     * Get Simplified Separate KPIs for the official reporting dashboard ribbon.
     */
    public function getRibbonStats(int $year): array
    {
        $totalCases = VawcCase::whereYear('created_at', $year)->count();
        $totalDossiers = VawcDossier::whereHas('cases', function ($q) use ($year) {
            $q->whereYear('created_at', $year);
        })->count();
        $activeBpos = DB::table('vawc_protection_orders')
            ->join('vawc_cases', 'vawc_protection_orders.vawc_case_id', '=', 'vawc_cases.id')
            ->whereIn('vawc_protection_orders.status', ['Issued', 'Served'])
            ->whereNotIn('vawc_cases.status', ['Closed', 'Escalated'])
            ->whereYear('vawc_protection_orders.created_at', $year)
            ->count();
        $repeatDossiers = VawcDossier::whereHas('cases', function ($q) use ($year) {
            $q->whereYear('created_at', $year);
        })->where('incident_count', '>', 1)->count();
        $recidivismRate = $totalDossiers > 0 ? round(($repeatDossiers / $totalDossiers) * 100, 1) : 0.0;

        return [
            'total_vawc'       => $totalCases,
            'total_dossiers'   => $totalDossiers,
            'active_bpos'      => $activeBpos,
            'recidivism_rate'  => $recidivismRate,
            'total_bcpc'       => BcpcChild::count(),
            'total_gad'        => GadEvent::whereYear('event_date', $year)->count(),
            'total_orgs'       => Organization::count(),
            'resolution_rate'  => $this->calculateResolutionRate($year),
            'sla_rate'         => $this->calculateSlaRate($year),
        ];
    }

    /**
     * Helper for resolution rate calculation.
     */
    public function calculateResolutionRate(int $year): float
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
    public function calculateSlaRate(int $year): float
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
     * Get high-level system counts for the operational dashboard.
     */
    public function getSystemStats(?User $user = null): array
    {
        // 1. RBAC: Presidents see stats only for their organization
        if ($user && $user->isPresident()) {
            $orgId = $user->organization_id;
            return [
                'myOrgName'         => $user->organization?->name ?? 'Organization',
                'verifiedMembers'   => Member::where('organization_id', $orgId)->where('status', 'Active')->count(),
                'pendingApps'       => MembershipApplication::where('organization_id', $orgId)->where('status', 'Pending')->count(),
                'totalEvents'       => GadEvent::where('organization_id', $orgId)->count(),
                'upcomingEvents'    => GadEvent::where('organization_id', $orgId)->where('event_date', '>=', now()->startOfDay())->count(),
            ];
        }

        // 2. Calculations for Admin / Committee Head
        $latestAssessmentIds = BcpcAssessment::select(DB::raw('MAX(id)'))
            ->groupBy('bcpc_child_id');

        $samCount = BcpcAssessment::whereIn('id', $latestAssessmentIds)
            ->where(function ($q) {
                $q->where('wflh_status', 'Severely Wasted')
                    ->orWhere('wfa_status', 'Severely Underweight');
            })->count();

        $mamCount = BcpcAssessment::whereIn('id', $latestAssessmentIds)
            ->where(function ($q) {
                $q->where(function ($sub) {
                    $sub->where('wflh_status', 'Wasted')
                        ->orWhere('wfa_status', 'Underweight');
                })->where(function ($sub) {
                    $sub->where('wflh_status', '!=', 'Severely Wasted')
                        ->where('wfa_status', '!=', 'Severely Underweight');
                });
            })->count();

        $overdueCount = BcpcChild::with('latestAssessment')
            ->where('status', 'Active')
            ->get()
            ->filter(function ($c) {
                $l = $c->latestAssessment;
                if (!$l || !$l->date_of_weighing) return false;
                return Carbon::parse($l->date_of_weighing)->diffInDays(now()) > 30;
            })->count();

        $criticalCount = VawcCase::where('status', '!=', 'Closed')
            ->whereHas('assessment', fn($sub) => $sub->where('risk_level', 'CRITICAL'))
            ->count();

        $highCount = VawcCase::where('status', '!=', 'Closed')
            ->whereHas('assessment', fn($sub) => $sub->where('risk_level', 'HIGH'))
            ->count();

        $activeBpos = DB::table('vawc_protection_orders')
            ->join('vawc_cases', 'vawc_protection_orders.vawc_case_id', '=', 'vawc_cases.id')
            ->whereIn('vawc_protection_orders.status', ['Issued', 'Served', 'Applied'])
            ->whereNotIn('vawc_cases.status', ['Closed', 'Escalated'])
            ->count();

        $nextGadEvent = GadEvent::where('event_date', '>=', now()->startOfDay())
            ->where('status', 'approved')
            ->orderBy('event_date', 'asc')
            ->first();

        return [
            'pendingApps'           => MembershipApplication::where('status', 'Pending')->count(),
            'pendingAppeals'        => MembershipApplication::whereIn('status', [
                MembershipApplication::STATUS_APPEALED,
                'Appealed',
                'appealed',
            ])->count(),
            'totalVawcActive'       => VawcCase::where('status', '!=', 'Closed')->count(),
            'vawcCriticalCount'     => $criticalCount,
            'vawcHighCount'         => $highCount,
            'vawcHighCriticalCount' => $criticalCount + $highCount,
            'vawcActiveBpos'        => $activeBpos,
            'totalBcpcChildren'     => BcpcChild::where('status', 'Active')->count(),
            'bcpcSamCount'          => $samCount,
            'bcpcMamCount'          => $mamCount,
            'bcpcOverdueCount'      => $overdueCount,
            'totalOrgs'             => Organization::count(),
            'totalMembers'          => Member::where('status', 'Active')->count(),
            'totalUpcomingEvents'   => GadEvent::where('event_date', '>=', now()->startOfDay())->where('status', 'approved')->count(),
            'nextGadEvent'          => $nextGadEvent ? [
                'id'         => $nextGadEvent->id,
                'title'      => $nextGadEvent->title,
                'date_short' => $nextGadEvent->event_date?->format('M d'),
                'date_full'  => $nextGadEvent->event_date?->format('M d, Y'),
            ] : null,
        ];
    }

    /**
     * Get operational action queue grouped under short plain headers.
     * Modules: VAWC, BPO Monitoring, Nutrition, Overdue Weighing, Applications, GAD Proposals.
     */
    public function getActionQueue(?User $user = null): array
    {
        $now = Carbon::now();
        $groups = [];

        // ── ROLE: ORGANIZATION PRESIDENT (Strictly isolated to their organization) ──
        if ($user && $user->isPresident()) {
            $orgId = $user->organization_id;

            // Applications Group
            $appQuery = MembershipApplication::where('organization_id', $orgId)
                ->where('status', 'Pending')
                ->oldest('created_at');

            $totalApps = $appQuery->count();
            if ($totalApps > 0) {
                $appItems = $appQuery->take(3)->get()->map(function ($app) use ($now) {
                    $created = Carbon::parse($app->created_at);
                    $hours = $created->isFuture() ? 0 : max(0, (int) $created->diffInHours($now));
                    $days = $created->isFuture() ? 0 : max(0, (int) $created->diffInDays($now));

                    return [
                        'id'                => 'app-' . $app->id,
                        'title'             => $app->fullname,
                        'reason'            => 'Membership intake review',
                        'time_label'        => $days > 0 ? "Waiting {$days} " . Str::plural('day', $days) : "Waiting {$hours} " . Str::plural('hour', $hours),
                        'is_past_threshold' => $hours >= 48,
                        'action_word'       => 'Review',
                        'url'               => route('admin.applications.show', $app->id),
                    ];
                })->toArray();

                $groups[] = [
                    'key'           => 'applications',
                    'title'         => 'Applications',
                    'total_count'   => $totalApps,
                    'showing_count' => count($appItems),
                    'view_all_url'  => route('admin.applications.index'),
                    'items'         => $appItems,
                ];
            }

            // GAD Proposals Group
            $gadQuery = GadEvent::where('organization_id', $orgId)
                ->where('status', 'pending')
                ->oldest('created_at');

            $totalGad = $gadQuery->count();
            if ($totalGad > 0) {
                $gadItems = $gadQuery->take(3)->get()->map(function ($event) use ($now) {
                    $created = Carbon::parse($event->created_at);
                    $days = $created->isFuture() ? 0 : max(0, (int) $created->diffInDays($now));

                    return [
                        'id'                => 'event-' . $event->id,
                        'title'             => $event->title,
                        'reason'            => 'Proposal clearance',
                        'time_label'        => $days === 0 ? 'Submitted today' : "Waiting {$days} " . Str::plural('day', $days),
                        'is_past_threshold' => false,
                        'action_word'       => 'View',
                        'url'               => route('admin.organization.events.index'),
                    ];
                })->toArray();

                $groups[] = [
                    'key'           => 'gad',
                    'title'         => 'GAD Proposals',
                    'total_count'   => $totalGad,
                    'showing_count' => count($gadItems),
                    'view_all_url'  => route('admin.organization.events.index'),
                    'items'         => $gadItems,
                ];
            }

            return $groups;
        }

        // ── ROLE: HEAD COMMITTEE (MAIN WORKING USER) ──
        if ($user && $user->isHead()) {
            // 1. VAWC High Risk Group
            $vawcQuery = VawcCase::with(['caseReport.abuseType', 'assessment'])
                ->where('status', '!=', 'Closed')
                ->whereHas('assessment', fn($sub) => $sub->whereIn('risk_level', ['CRITICAL', 'HIGH']))
                ->oldest('updated_at');

            $totalVawc = $vawcQuery->count();
            if ($totalVawc > 0) {
                $vawcItems = $vawcQuery->take(3)->get()->map(function ($c) use ($now) {
                    $updated = Carbon::parse($c->updated_at);
                    $days = $updated->isFuture() ? 0 : max(0, (int) $updated->diffInDays($now));
                    $caseNum = $c->caseReport?->case_number ?? $c->sub_case_number ?? "VAWC-{$c->id}";
                    $risk = $c->assessment?->risk_level === 'CRITICAL' ? 'Critical risk' : 'High risk';

                    return [
                        'id'                => 'vawc-' . $c->id,
                        'title'             => "Case {$caseNum}",
                        'reason'            => $risk,
                        'time_label'        => $days >= 3
                            ? "No update in {$days} " . Str::plural('day', $days)
                            : ($days === 0 ? 'Updated today' : "Updated {$days} " . Str::plural('day', $days) . ' ago'),
                        'is_past_threshold' => $days >= 3,
                        'action_word'       => 'Open case',
                        'url'               => route('admin.vawc.dashboard') . '?tab=HIGH',
                    ];
                })->toArray();

                $groups[] = [
                    'key'           => 'vawc',
                    'title'         => 'VAWC',
                    'total_count'   => $totalVawc,
                    'showing_count' => count($vawcItems),
                    'view_all_url'  => route('admin.vawc.dashboard') . '?tab=HIGH',
                    'items'         => $vawcItems,
                ];
            }

            // 2. BPO Monitoring Group
            $bpoQuery = DB::table('vawc_protection_orders')
                ->join('vawc_cases', 'vawc_protection_orders.vawc_case_id', '=', 'vawc_cases.id')
                ->whereIn('vawc_protection_orders.status', ['Issued', 'Served', 'Applied'])
                ->whereNotIn('vawc_cases.status', ['Closed', 'Escalated'])
                ->select(
                    'vawc_protection_orders.id',
                    'vawc_protection_orders.order_number',
                    'vawc_protection_orders.status',
                    'vawc_protection_orders.created_at',
                    'vawc_protection_orders.issued_datetime',
                    'vawc_protection_orders.expiration_date',
                    'vawc_cases.uuid as case_uuid'
                )
                ->orderBy('vawc_protection_orders.created_at', 'asc');

            $totalBpos = $bpoQuery->count();
            if ($totalBpos > 0) {
                $bpoItems = $bpoQuery->take(3)->get()->map(function ($po) use ($now) {
                    $created = Carbon::parse($po->created_at);
                    $days = $created->isFuture() ? 0 : max(0, (int) $created->diffInDays($now));

                    return [
                        'id'                => 'bpo-' . $po->id,
                        'title'             => "Order {$po->order_number}",
                        'reason'            => "BPO {$po->status} monitoring",
                        'time_label'        => $days === 0 ? 'Served today' : "Active for {$days} " . Str::plural('day', $days),
                        'is_past_threshold' => false,
                        'action_word'       => 'Monitor',
                        'url'               => route('admin.vawc.dashboard') . '?tab=BPOS',
                    ];
                })->toArray();

                $groups[] = [
                    'key'           => 'bpos',
                    'title'         => 'BPO Monitoring',
                    'total_count'   => $totalBpos,
                    'showing_count' => count($bpoItems),
                    'view_all_url'  => route('admin.vawc.dashboard') . '?tab=BPOS',
                    'items'         => $bpoItems,
                ];
            }

            // 3. Nutrition Group (SAM Children)
            $latestAssessmentIds = BcpcAssessment::select(DB::raw('MAX(id)'))
                ->groupBy('bcpc_child_id');

            $nutritionQuery = BcpcAssessment::with('child')
                ->whereIn('id', $latestAssessmentIds)
                ->where(function ($q) {
                    $q->where('wflh_status', 'Severely Wasted')
                        ->orWhere('wfa_status', 'Severely Underweight');
                })
                ->oldest('date_of_weighing');

            $totalNutrition = $nutritionQuery->count();
            if ($totalNutrition > 0) {
                $nutritionItems = $nutritionQuery->take(3)->get()->map(function ($ass) use ($now) {
                    $weighed = $ass->date_of_weighing ? Carbon::parse($ass->date_of_weighing) : $now;
                    $days = $weighed->isFuture() ? 0 : max(0, (int) $weighed->diffInDays($now));

                    return [
                        'id'                => 'bcpc-' . $ass->id,
                        'title'             => "Child: " . ($ass->child?->full_name ?? 'Child #' . $ass->bcpc_child_id),
                        'reason'            => 'Severe wasting (SAM)',
                        'time_label'        => $days === 0 ? 'Weighed today' : "Weighed {$days} " . Str::plural('day', $days) . ' ago',
                        'is_past_threshold' => false,
                        'action_word'       => 'Refer',
                        'url'               => route('admin.bcpc.dashboard') . '?tab=sam',
                    ];
                })->toArray();

                $groups[] = [
                    'key'           => 'nutrition',
                    'title'         => 'Nutrition',
                    'total_count'   => $totalNutrition,
                    'showing_count' => count($nutritionItems),
                    'view_all_url'  => route('admin.bcpc.dashboard') . '?tab=sam',
                    'items'         => $nutritionItems,
                ];
            }

            // 4. Overdue Weighing Group
            $allActiveChildren = BcpcChild::with('latestAssessment')->where('status', 'Active')->get();
            $overdueList = $allActiveChildren->filter(function ($c) use ($now) {
                $l = $c->latestAssessment;
                if (!$l || !$l->date_of_weighing) return false;
                return Carbon::parse($l->date_of_weighing)->diffInDays($now) > 30;
            })->sortByDesc(function ($c) use ($now) {
                return Carbon::parse($c->latestAssessment->date_of_weighing)->diffInDays($now);
            })->values();

            $totalOverdue = $overdueList->count();
            if ($totalOverdue > 0) {
                $overdueItems = $overdueList->take(3)->map(function ($c) use ($now) {
                    $weighed = Carbon::parse($c->latestAssessment->date_of_weighing);
                    $days = max(0, (int) $weighed->diffInDays($now));

                    return [
                        'id'                => 'overdue-' . $c->id,
                        'title'             => "Child: {$c->full_name}",
                        'reason'            => 'Growth monitoring overdue (>30 days)',
                        'time_label'        => "Overdue {$days} " . Str::plural('day', $days),
                        'is_past_threshold' => true,
                        'action_word'       => 'Weigh',
                        'url'               => route('admin.bcpc.dashboard') . '?tab=overdue',
                    ];
                })->toArray();

                $groups[] = [
                    'key'           => 'overdue',
                    'title'         => 'Overdue Weighing',
                    'total_count'   => $totalOverdue,
                    'showing_count' => count($overdueItems),
                    'view_all_url'  => route('admin.bcpc.dashboard') . '?tab=overdue',
                    'items'         => $overdueItems,
                ];
            }

            // 5. Applications Group
            $appQuery = MembershipApplication::with('organization')
                ->where('status', 'Pending')
                ->oldest('created_at');

            $totalApps = $appQuery->count();
            if ($totalApps > 0) {
                $appItems = $appQuery->take(3)->get()->map(function ($app) use ($now) {
                    $created = Carbon::parse($app->created_at);
                    $hours = $created->isFuture() ? 0 : max(0, (int) $created->diffInHours($now));
                    $days = $created->isFuture() ? 0 : max(0, (int) $created->diffInDays($now));

                    return [
                        'id'                => 'app-' . $app->id,
                        'title'             => "Applicant: {$app->fullname}",
                        'reason'            => $app->organization?->name ?? 'Community Org',
                        'time_label'        => $days > 0 ? "Waiting {$days} " . Str::plural('day', $days) : "Waiting {$hours} " . Str::plural('hour', $hours),
                        'is_past_threshold' => $hours >= 48,
                        'action_word'       => 'Review',
                        'url'               => route('admin.applications.show', $app->id),
                    ];
                })->toArray();

                $groups[] = [
                    'key'           => 'applications',
                    'title'         => 'Applications',
                    'total_count'   => $totalApps,
                    'showing_count' => count($appItems),
                    'view_all_url'  => route('admin.applications.index'),
                    'items'         => $appItems,
                ];
            }

            // 6. GAD Proposals Group
            $gadQuery = GadEvent::with('organization')
                ->where('status', 'pending')
                ->oldest('created_at');

            $totalGad = $gadQuery->count();
            if ($totalGad > 0) {
                $gadItems = $gadQuery->take(3)->get()->map(function ($g) use ($now) {
                    $created = Carbon::parse($g->created_at);
                    $days = $created->isFuture() ? 0 : max(0, (int) $created->diffInDays($now));

                    return [
                        'id'                => 'gad-' . $g->id,
                        'title'             => "Proposal: {$g->title}",
                        'reason'            => $g->organization?->name ?? 'Organization',
                        'time_label'        => $days === 0 ? 'Submitted today' : "Waiting {$days} " . Str::plural('day', $days),
                        'is_past_threshold' => false,
                        'action_word'       => 'Approve',
                        'url'               => route('admin.gad.events.index'),
                    ];
                })->toArray();

                $groups[] = [
                    'key'           => 'gad',
                    'title'         => 'GAD Proposals',
                    'total_count'   => $totalGad,
                    'showing_count' => count($gadItems),
                    'view_all_url'  => route('admin.gad.events.index'),
                    'items'         => $gadItems,
                ];
            }

            return $groups;
        }

        // ── ROLE: ADMIN (OPERATIONAL COUNTS, NO INDIVIDUAL VICTIM OR CHILD IDENTIFIERS) ──
        // 1. VAWC Summary Group
        $urgentVawcCount = VawcCase::where('status', '!=', 'Closed')
            ->whereHas('assessment', fn($sub) => $sub->whereIn('risk_level', ['CRITICAL', 'HIGH']))
            ->count();

        if ($urgentVawcCount > 0) {
            $groups[] = [
                'key'           => 'vawc',
                'title'         => 'VAWC',
                'total_count'   => $urgentVawcCount,
                'showing_count' => 1,
                'view_all_url'  => route('admin.vawc.dashboard') . '?tab=HIGH',
                'items'         => [
                    [
                        'id'                => 'vawc-summary',
                        'title'             => 'VAWC Desk',
                        'reason'            => "{$urgentVawcCount} high or critical cases active",
                        'time_label'        => 'Action center triage required',
                        'is_past_threshold' => true,
                        'action_word'       => 'View action center',
                        'url'               => route('admin.vawc.dashboard') . '?tab=HIGH',
                    ]
                ],
            ];
        }

        // 2. BPO Monitoring Summary Group
        $activeBpoCount = DB::table('vawc_protection_orders')
            ->join('vawc_cases', 'vawc_protection_orders.vawc_case_id', '=', 'vawc_cases.id')
            ->whereIn('vawc_protection_orders.status', ['Issued', 'Served', 'Applied'])
            ->whereNotIn('vawc_cases.status', ['Closed', 'Escalated'])
            ->count();

        if ($activeBpoCount > 0) {
            $groups[] = [
                'key'           => 'bpos',
                'title'         => 'BPO Monitoring',
                'total_count'   => $activeBpoCount,
                'showing_count' => 1,
                'view_all_url'  => route('admin.vawc.dashboard') . '?tab=BPOS',
                'items'         => [
                    [
                        'id'                => 'bpo-summary',
                        'title'             => 'BPO Protection Desk',
                        'reason'            => "{$activeBpoCount} active protection orders in effect",
                        'time_label'        => 'Compliance monitoring',
                        'is_past_threshold' => false,
                        'action_word'       => 'View orders',
                        'url'               => route('admin.vawc.dashboard') . '?tab=BPOS',
                    ]
                ],
            ];
        }

        // 3. Nutrition Summary Group
        $latestAssessmentIds = BcpcAssessment::select(DB::raw('MAX(id)'))
            ->groupBy('bcpc_child_id');
        $samCount = BcpcAssessment::whereIn('id', $latestAssessmentIds)
            ->where(function ($q) {
                $q->where('wflh_status', 'Severely Wasted')
                    ->orWhere('wfa_status', 'Severely Underweight');
            })->count();

        if ($samCount > 0) {
            $groups[] = [
                'key'           => 'nutrition',
                'title'         => 'Nutrition',
                'total_count'   => $samCount,
                'showing_count' => 1,
                'view_all_url'  => route('admin.bcpc.dashboard') . '?tab=sam',
                'items'         => [
                    [
                        'id'                => 'bcpc-summary',
                        'title'             => 'BCPC Child Nutrition',
                        'reason'            => "{$samCount} severe wasting (SAM) cases",
                        'time_label'        => 'Clinical referral needed',
                        'is_past_threshold' => false,
                        'action_word'       => 'View triage',
                        'url'               => route('admin.bcpc.dashboard') . '?tab=sam',
                    ]
                ],
            ];
        }

        // 4. Overdue Weighing Summary Group
        $allActiveChildren = BcpcChild::with('latestAssessment')->where('status', 'Active')->get();
        $overdueCount = $allActiveChildren->filter(function ($c) use ($now) {
            $l = $c->latestAssessment;
            if (!$l || !$l->date_of_weighing) return false;
            return Carbon::parse($l->date_of_weighing)->diffInDays($now) > 30;
        })->count();

        if ($overdueCount > 0) {
            $groups[] = [
                'key'           => 'overdue',
                'title'         => 'Overdue Weighing',
                'total_count'   => $overdueCount,
                'showing_count' => 1,
                'view_all_url'  => route('admin.bcpc.dashboard') . '?tab=overdue',
                'items'         => [
                    [
                        'id'                => 'overdue-summary',
                        'title'             => 'Growth Monitoring',
                        'reason'            => "{$overdueCount} children overdue for monthly weighing",
                        'time_label'        => 'BNS follow-up required',
                        'is_past_threshold' => true,
                        'action_word'       => 'View overdue',
                        'url'               => route('admin.bcpc.dashboard') . '?tab=overdue',
                    ]
                ],
            ];
        }

        // 5. Applications Group
        $appQuery = MembershipApplication::with('organization')
            ->where('status', 'Pending')
            ->oldest('created_at');

        $totalApps = $appQuery->count();
        if ($totalApps > 0) {
            $appItems = $appQuery->take(3)->get()->map(function ($app) use ($now) {
                $created = Carbon::parse($app->created_at);
                $hours = $created->isFuture() ? 0 : max(0, (int) $created->diffInHours($now));
                $days = $created->isFuture() ? 0 : max(0, (int) $created->diffInDays($now));

                return [
                    'id'                => 'app-' . $app->id,
                    'title'             => "Applicant: {$app->fullname}",
                    'reason'            => $app->organization?->name ?? 'Community Org',
                    'time_label'        => $days > 0 ? "Waiting {$days} " . Str::plural('day', $days) : "Waiting {$hours} " . Str::plural('hour', $hours),
                    'is_past_threshold' => $hours >= 48,
                    'action_word'       => 'Review',
                    'url'               => route('admin.applications.show', $app->id),
                ];
            })->toArray();

            $groups[] = [
                'key'           => 'applications',
                'title'         => 'Applications',
                'total_count'   => $totalApps,
                'showing_count' => count($appItems),
                'view_all_url'  => route('admin.applications.index'),
                'items'         => $appItems,
            ];
        }

        // 6. GAD Proposals Group
        $gadQuery = GadEvent::with('organization')
            ->where('status', 'pending')
            ->oldest('created_at');

        $totalGad = $gadQuery->count();
        if ($totalGad > 0) {
            $gadItems = $gadQuery->take(3)->get()->map(function ($g) use ($now) {
                $created = Carbon::parse($g->created_at);
                $days = $created->isFuture() ? 0 : max(0, (int) $created->diffInDays($now));

                return [
                    'id'                => 'gad-' . $g->id,
                    'title'             => "Proposal: {$g->title}",
                    'reason'            => $g->organization?->name ?? 'Organization',
                    'time_label'        => $days === 0 ? 'Submitted today' : "Waiting {$days} " . Str::plural('day', $days),
                    'is_past_threshold' => false,
                    'action_word'       => 'Approve',
                    'url'               => route('admin.gad.events.index'),
                ];
            })->toArray();

            $groups[] = [
                'key'           => 'gad',
                'title'         => 'GAD Proposals',
                'total_count'   => $totalGad,
                'showing_count' => count($gadItems),
                'view_all_url'  => route('admin.gad.events.index'),
                'items'         => $gadItems,
            ];
        }

        return $groups;
    }

    /**
     * Get multi-module recent operational activity.
     */
    public function getOperationalActivity(int $limit = 5, ?User $user = null): array
    {
        $activities = [];
        $now = Carbon::now();

        // ── ROLE: PRESIDENT ──
        if ($user && $user->isPresident()) {
            $orgId = $user->organization_id;

            $apps = MembershipApplication::where('organization_id', $orgId)
                ->latest('updated_at')
                ->take($limit)
                ->get();

            foreach ($apps as $app) {
                $updated = Carbon::parse($app->updated_at);
                $days = $updated->isFuture() ? 0 : max(0, (int) $updated->diffInDays($now));
                $daysText = $days === 0 ? 'Today' : "{$days} " . Str::plural('day', $days);

                $activities[] = [
                    'id'          => 'app-' . $app->id,
                    'module'      => 'Membership',
                    'title'       => $app->fullname,
                    'description' => 'Membership application (' . $app->status . ')',
                    'status'      => $app->status,
                    'updated_at'  => $app->updated_at,
                    'days_since'  => $daysText,
                    'url'         => route('admin.applications.show', $app->id),
                ];
            }

            return $activities;
        }

        // ── ROLE: HEAD COMMITTEE (FULL MULTI-MODULE) ──
        if ($user && $user->isHead()) {
            // 1. VAWC cases
            $cases = CaseReport::with(['abuseType', 'vawcCase'])
                ->latest('updated_at')
                ->take($limit)
                ->get();

            foreach ($cases as $c) {
                $updated = Carbon::parse($c->updated_at);
                $days = $updated->isFuture() ? 0 : max(0, (int) $updated->diffInDays($now));
                $daysText = $days === 0 ? 'Today' : "{$days} " . Str::plural('day', $days);

                $activities[] = [
                    'id'          => 'vawc-' . $c->id,
                    'module'      => 'VAWC',
                    'title'       => "Case " . $c->case_number,
                    'description' => $c->abuseType ? $c->abuseType->name : ($c->type ?? 'Protection Case'),
                    'status'      => $c->vawcCase ? $c->vawcCase->status : ($c->lifecycle_status ?: 'New'),
                    'updated_at'  => $c->updated_at,
                    'days_since'  => $daysText,
                    'url'         => route('admin.vawc.show', $c->vawcCase?->uuid ?? $c->vawcCase?->id ?? $c->id),
                ];
            }

            // 2. BCPC assessments
            $assessments = BcpcAssessment::with('child')
                ->latest('updated_at')
                ->take($limit)
                ->get();

            foreach ($assessments as $a) {
                if ($a->child) {
                    $updated = Carbon::parse($a->updated_at);
                    $days = $updated->isFuture() ? 0 : max(0, (int) $updated->diffInDays($now));
                    $daysText = $days === 0 ? 'Today' : "{$days} " . Str::plural('day', $days);

                    $activities[] = [
                        'id'          => 'bcpc-' . $a->id,
                        'module'      => 'Nutrition',
                        'title'       => "Child: " . $a->child->full_name,
                        'description' => $a->wfa_status ?? 'Nutritional Assessment',
                        'status'      => $a->wfa_status ?? 'Monitored',
                        'updated_at'  => $a->updated_at,
                        'days_since'  => $daysText,
                        'url'         => route('admin.bcpc.show', $a->bcpc_child_id),
                    ];
                }
            }

            // 3. Applications
            $apps = MembershipApplication::with('organization')
                ->latest('updated_at')
                ->take($limit)
                ->get();

            foreach ($apps as $app) {
                $updated = Carbon::parse($app->updated_at);
                $days = $updated->isFuture() ? 0 : max(0, (int) $updated->diffInDays($now));
                $daysText = $days === 0 ? 'Today' : "{$days} " . Str::plural('day', $days);

                $activities[] = [
                    'id'          => 'app-' . $app->id,
                    'module'      => 'Membership',
                    'title'       => $app->fullname,
                    'description' => $app->organization?->name ?? 'Community Org',
                    'status'      => $app->status,
                    'updated_at'  => $app->updated_at,
                    'days_since'  => $daysText,
                    'url'         => route('admin.applications.show', $app->id),
                ];
            }

            usort($activities, function ($a, $b) {
                $tA = $a['updated_at'] ? strtotime((string) $a['updated_at']) : 0;
                $tB = $b['updated_at'] ? strtotime((string) $b['updated_at']) : 0;
                return $tB <=> $tA;
            });

            return array_slice($activities, 0, $limit);
        }

        // ── ROLE: ADMIN (MEMBERSHIP & GENERAL NOTICES - NO VICTIM IDENTIFIERS) ──
        $apps = MembershipApplication::with('organization')
            ->latest('updated_at')
            ->take($limit)
            ->get();

        foreach ($apps as $app) {
            $updated = Carbon::parse($app->updated_at);
            $days = $updated->isFuture() ? 0 : max(0, (int) $updated->diffInDays($now));
            $daysText = $days === 0 ? 'Today' : "{$days} " . Str::plural('day', $days);

            $activities[] = [
                'id'          => 'app-' . $app->id,
                'module'      => 'Membership',
                'title'       => $app->fullname,
                'description' => $app->organization?->name ?? 'Community Org',
                'status'      => $app->status,
                'updated_at'  => $app->updated_at,
                'days_since'  => $daysText,
                'url'         => route('admin.applications.show', $app->id),
            ];
        }

        $events = GadEvent::with('organization')
            ->latest('updated_at')
            ->take($limit)
            ->get();

        foreach ($events as $e) {
            $updated = Carbon::parse($e->updated_at);
            $days = $updated->isFuture() ? 0 : max(0, (int) $updated->diffInDays($now));
            $daysText = $days === 0 ? 'Today' : "{$days} " . Str::plural('day', $days);

            $activities[] = [
                'id'          => 'gad-' . $e->id,
                'module'      => 'GAD',
                'title'       => $e->title,
                'description' => $e->organization?->name ?? 'Barangay GAD',
                'status'      => ucfirst($e->status),
                'updated_at'  => $e->updated_at,
                'days_since'  => $daysText,
                'url'         => route('admin.gad.events.index'),
            ];
        }

        usort($activities, function ($a, $b) {
            $tA = $a['updated_at'] ? strtotime((string) $a['updated_at']) : 0;
            $tB = $b['updated_at'] ? strtotime((string) $b['updated_at']) : 0;
            return $tB <=> $tA;
        });

        return array_slice($activities, 0, $limit);
    }

    /**
     * Get latest 2 to 3 announcements preview.
     */
    public function getLatestAnnouncements(?User $user = null): array
    {
        $query = Announcement::with('organization')->latest('created_at');

        if ($user && $user->isPresident()) {
            $query->where(function ($q) use ($user) {
                $q->whereNull('organization_id')
                    ->orWhere('organization_id', $user->organization_id);
            });
        }

        return $query->take(3)->get()->map(function ($a) {
            return [
                'id'       => $a->id,
                'slug'     => $a->slug,
                'title'    => $a->title,
                'date'     => $a->created_at ? Carbon::parse($a->created_at)->format('M d, Y') : '',
                'audience' => $a->organization ? $a->organization->name : 'All Organizations',
                'url'      => route('admin.announcements.show', $a->slug ?? $a->id),
            ];
        })->toArray();
    }

    /**
     * Get strategic community and GAD snapshot for the dashboard.
     */
    public function getCommunitySnapshot(?User $user = null): ?array
    {
        if ($user && $user->isPresident()) {
            return null;
        }

        $orgs = Organization::withCount([
            'members as active_members_count' => fn($q) => $q->where('status', 'Active'),
            'membershipApplications as pending_apps_count' => fn($q) => $q->where('status', 'Pending')
        ])->orderByDesc('pending_apps_count')->orderBy('name')->get();

        $orgSummary = $orgs->map(fn($o) => [
            'id'            => $o->id,
            'name'          => $o->name,
            'slug'          => $o->slug,
            'members_count' => $o->active_members_count ?? 0,
            'pending_count' => $o->pending_apps_count ?? 0,
        ])->toArray();

        $upcomingEvents = GadEvent::with('organization')
            ->where('event_date', '>=', now()->startOfDay())
            ->orderBy('event_date', 'asc')
            ->take(3)
            ->get()
            ->map(fn($e) => [
                'id'           => $e->id,
                'title'        => $e->title,
                'date_short'   => $e->event_date?->format('M d'),
                'date_full'    => $e->event_date?->format('M d, Y'),
                'location'     => $e->location ?: 'Barangay Hall',
                'organization' => $e->organization?->name ?? 'Barangay GAD',
                'status'       => ucfirst($e->status),
            ])->toArray();

        return [
            'organizations'  => $orgSummary,
            'upcomingEvents' => $upcomingEvents,
            'totalMembers'   => Member::where('status', 'Active')->count(),
        ];
    }
}
