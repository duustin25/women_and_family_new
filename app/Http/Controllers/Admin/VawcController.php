<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VawcCase;
use App\Models\VawcDossier;
use App\Models\CaseAbuseType;
use App\Models\Zone;
use App\Services\VawcCaseService;
use App\Services\VawcBpoService;
use App\Services\VawcComplianceService;
use App\Services\VawcLegalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class VawcController extends Controller
{
    protected $vawcService;
    protected $bpoService;
    protected $complianceService;
    protected $legalService;
    protected $analyticsService;

    public function __construct(
        VawcCaseService $vawcService,
        VawcBpoService $bpoService,
        VawcComplianceService $complianceService,
        VawcLegalService $legalService,
        \App\Services\AnalyticsService $analyticsService
    ) {
        $this->vawcService = $vawcService;
        $this->bpoService = $bpoService;
        $this->complianceService = $complianceService;
        $this->legalService = $legalService;
        $this->analyticsService = $analyticsService;
    }

    /**
     * Display a listing of VAWC cases grouped by Master Dossiers.
     */
    public function index(Request $request)
    {
        $query = VawcDossier::with([
            'cases' => function ($q) {
                $q->with(['caseReport.abuseType', 'involvedParties', 'assessment', 'protectionOrders.issuedBy'])
                  ->orderBy('incident_sequence', 'desc');
            }
        ]);

        // Filter by Search (Dossier #, Survivor Name, Respondent Name, or Sub-Case #)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('dossier_number', 'LIKE', "%{$search}%")
                  ->orWhere('survivor_name', 'LIKE', "%{$search}%")
                  ->orWhere('respondent_name', 'LIKE', "%{$search}%")
                  ->orWhereHas('cases.caseReport', function ($cq) use ($search) {
                      $cq->where('case_number', 'LIKE', "%{$search}%");
                  })
                  ->orWhereHas('cases', function ($sq) use ($search) {
                      $sq->where('sub_case_number', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Filter by Status
        if ($request->filled('status') && $request->status !== 'all') {
            $statusFilter = $request->status;
            $query->where(function ($q) use ($statusFilter) {
                $q->where('current_lifecycle', $statusFilter)
                  ->orWhereHas('cases', function ($cq) use ($statusFilter) {
                      $cq->where('status', $statusFilter)
                         ->orWhereHas('protectionOrders', function ($poq) use ($statusFilter) {
                             $poq->where('status', $statusFilter);
                         });
                  });
            });
        }

        // Active Worklist vs Dormant/Archived Dossiers
        if ($request->input('archived') === '1') {
            $query->where('current_lifecycle', 'Dormant/Closed');
            $dossiers = $query->orderByDesc('last_incident_at')->paginate(15)->withQueryString();
        } else {
            $query->where('current_lifecycle', '!=', 'Dormant/Closed');

            // PRIORITY TRIAGE: Sort by highest threat level, then last incident timestamp
            $dossiers = $query->orderByRaw("FIELD(highest_threat_level, 'CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'PENDING')")
                ->orderByDesc('last_incident_at')
                ->orderByDesc('created_at')
                ->paginate(15)->withQueryString();
        }

        return Inertia::render('Admin/Vawc/Index', [
            'dossiers' => $dossiers,
            'filters' => $request->only(['search', 'status', 'archived'])
        ]);
    }

    /**
     * Search existing dossiers for the "Search First, Encode Second" Intake Gateway.
     */
    public function searchDossiers(Request $request)
    {
        $query = $request->query('query', '');
        if (empty($query) || strlen(trim($query)) < 2) {
            return response()->json([]);
        }

        $search = trim($query);
        $dossiers = VawcDossier::with([
            'cases' => function ($q) {
                $q->with(['caseReport.abuseType', 'assessment', 'protectionOrders'])->latest();
            }
        ])
        ->where(function ($q) use ($search) {
            $q->where('dossier_number', 'LIKE', "%{$search}%")
              ->orWhere('survivor_name', 'LIKE', "%{$search}%")
              ->orWhere('respondent_name', 'LIKE', "%{$search}%");
        })
        ->take(8)
        ->get()
        ->map(function ($d) {
            $latestCase = $d->cases->first();
            $activeBpo = $latestCase?->protectionOrders?->first(fn($p) => in_array($p->status, ['Applied', 'Issued', 'Served']));

            return [
                'id' => $d->id,
                'dossier_number' => $d->dossier_number,
                'survivor_name' => $d->survivor_name,
                'respondent_name' => $d->respondent_name,
                'relationship_type' => $d->relationship_type,
                'incident_count' => $d->incident_count,
                'highest_threat_level' => $d->highest_threat_level,
                'current_lifecycle' => $d->current_lifecycle,
                'last_incident_at' => $d->last_incident_at ? $d->last_incident_at->format('M d, Y') : 'N/A',
                'survivor_demographics' => $d->survivor_demographics,
                'respondent_demographics' => $d->respondent_demographics,
                'active_bpo_status' => $activeBpo?->status ?? null,
                'latest_case' => $latestCase ? [
                    'id' => $latestCase->id,
                    'sub_case_number' => $latestCase->sub_case_number,
                    'status' => $latestCase->status,
                    'abuse_type' => $latestCase->caseReport?->abuseType?->name ?? 'VAWC',
                    'risk_level' => $latestCase->assessment?->risk_level ?? 'PENDING',
                    'risk_score' => $latestCase->assessment?->risk_score ?? null,
                ] : null,
            ];
        });

        return response()->json($dossiers);
    }

    /**
     * Search existing survivors across all master dossiers.
     */
    public function searchSurvivors(Request $request)
    {
        $query = trim($request->get('query', ''));
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $dossiers = VawcDossier::with(['cases.assessment'])
            ->where('survivor_name', 'LIKE', "%{$query}%")
            ->get();

        $grouped = $dossiers->groupBy(fn($d) => strtolower(trim($d->survivor_name)));

        $results = [];
        foreach ($grouped as $normalizedName => $groupDossiers) {
            $first = $groupDossiers->first();
            $totalIncidents = (int) $groupDossiers->sum('incident_count');
            $dossierNumbers = $groupDossiers->pluck('dossier_number')->all();
            $respondentNames = $groupDossiers->pluck('respondent_name')->all();

            $results[] = [
                'survivor_name' => $first->survivor_name,
                'survivor_demographics' => $first->survivor_demographics,
                'total_dossiers_count' => $groupDossiers->count(),
                'total_incidents_count' => $totalIncidents,
                'dossier_numbers' => $dossierNumbers,
                'respondent_names' => $respondentNames,
                'is_compound_victim' => $groupDossiers->count() > 1,
            ];
        }

        return response()->json($results);
    }

    /**
     * Search existing respondents/perpetrators across all master dossiers.
     */
    public function searchRespondents(Request $request)
    {
        $query = trim($request->get('query', ''));
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $dossiers = VawcDossier::with(['cases.assessment'])
            ->where('respondent_name', 'LIKE', "%{$query}%")
            ->get();

        $grouped = $dossiers->groupBy(fn($d) => strtolower(trim($d->respondent_name)));

        $results = [];
        foreach ($grouped as $normalizedName => $groupDossiers) {
            $first = $groupDossiers->first();
            $totalIncidents = (int) $groupDossiers->sum('incident_count');
            $dossierNumbers = $groupDossiers->pluck('dossier_number')->all();
            $survivorNames = $groupDossiers->pluck('survivor_name')->all();

            $highestThreat = 'LOW';
            $threatOrder = ['CRITICAL' => 4, 'HIGH' => 3, 'MODERATE' => 2, 'LOW' => 1, 'PENDING' => 0];
            $maxWeight = 0;
            foreach ($groupDossiers as $d) {
                $w = $threatOrder[$d->highest_threat_level] ?? 0;
                if ($w >= $maxWeight) {
                    $maxWeight = $w;
                    $highestThreat = $d->highest_threat_level;
                }
            }

            $results[] = [
                'respondent_name' => $first->respondent_name,
                'respondent_demographics' => $first->respondent_demographics,
                'total_dossiers_count' => $groupDossiers->count(),
                'total_incidents_count' => $totalIncidents,
                'dossier_numbers' => $dossierNumbers,
                'survivor_names' => $survivorNames,
                'highest_threat_level' => $highestThreat,
                'is_serial_perpetrator' => $groupDossiers->count() > 1 || $totalIncidents > 1,
            ];
        }

        return response()->json($results);
    }

    /**
     * Show the form for creating a new VAWC case.
     */
    public function create(Request $request)
    {
        $abuseTypes = CaseAbuseType::where('is_active', true)
            ->where(function ($query) {
                $query->where('category', 'VAWC')
                    ->orWhere('category', 'Both');
            })->get();

        $zones = Zone::where('is_active', true)->get();

        // Optional pre-selected dossier from quick link
        $preselectedDossier = null;
        if ($request->filled('dossier_id')) {
            $dossier = VawcDossier::with(['cases.caseReport.abuseType', 'cases.assessment', 'cases.protectionOrders'])->find($request->dossier_id);
            if ($dossier) {
                $latestCase = $dossier->cases->first();
                $activeBpo = $latestCase?->protectionOrders?->first(fn($p) => in_array($p->status, ['Applied', 'Issued', 'Served']));
                $preselectedDossier = [
                    'id' => $dossier->id,
                    'dossier_number' => $dossier->dossier_number,
                    'survivor_name' => $dossier->survivor_name,
                    'respondent_name' => $dossier->respondent_name,
                    'relationship_type' => $dossier->relationship_type,
                    'incident_count' => $dossier->incident_count,
                    'highest_threat_level' => $dossier->highest_threat_level,
                    'current_lifecycle' => $dossier->current_lifecycle,
                    'last_incident_at' => $dossier->last_incident_at ? $dossier->last_incident_at->format('M d, Y') : 'N/A',
                    'survivor_demographics' => $dossier->survivor_demographics,
                    'respondent_demographics' => $dossier->respondent_demographics,
                    'active_bpo_status' => $activeBpo?->status ?? null,
                ];
            }
        }

        return Inertia::render('Admin/Vawc/Create', [
            'abuseTypes' => $abuseTypes,
            'zones' => $zones,
            'preselectedDossier' => $preselectedDossier,
        ]);
    }

    /**
     * Store a newly created VAWC case.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dossier_id' => 'nullable|exists:vawc_dossiers,id',
            'intake_type' => 'required|in:Direct,Third-Party',
            'victim.name' => 'required|string|max:255',
            'victim.age' => 'nullable|integer',
            'victim.gender' => 'nullable|string',
            'victim.contact' => 'nullable|string',
            'victim.address' => 'nullable|string',

            'complainant.name' => 'nullable|string|max:255',
            'complainant.contact' => 'nullable|string',
            'complainant.relation_to_victim' => 'nullable|string|max:255',
            'is_anonymous' => 'boolean',

            'respondent.name' => 'required|string|max:255',
            'respondent.age' => 'nullable|integer',
            'respondent.gender' => 'nullable|string',
            'respondent.contact' => 'nullable|string',
            'respondent.address' => 'nullable|string',

            'incident_date' => 'required',
            'incident_location' => 'required|string',
            'description' => 'required|string',
            'abuse_type' => 'required|string',
            'zone_id' => 'required|exists:zones,id',

            'children_count' => 'nullable|integer',
            'is_repeat_offense' => 'boolean',
            'has_weapon_involved' => 'boolean',
            'respondent.relationship' => 'required|string|max:255',

            'incident_veracity' => 'boolean',
            'perpetrator_present' => 'boolean',
            'warrantless_arrest_made' => 'boolean',
            'weapons_confiscated' => 'boolean',

            'requires_medical' => 'boolean',
            'requires_alternative_housing' => 'boolean',

            'victim.civil_status' => 'nullable|string',
            'victim.educational_attainment' => 'nullable|string',
            'victim.occupation' => 'nullable|string',

            'respondent.civil_status' => 'nullable|string',
            'respondent.educational_attainment' => 'nullable|string',
            'respondent.occupation' => 'nullable|string',
            'respondent.physical_description' => 'nullable|string',

            'referral_status' => 'nullable|array',
            'witness_info' => 'nullable|string',
            'action_sought' => 'nullable|array',
        ]);

        $vawcCase = $this->vawcService->createVawcCase($validated);

        return redirect()->route('admin.vawc.show', $vawcCase->id)->with('success', 'VAWC Case incident recorded under Master Dossier.');
    }

    /**
     * Display the specified VAWC case and Master Dossier Incident History.
     */
    public function show($id)
    {
        $case = VawcCase::with([
            'dossier.cases' => function ($q) {
                $q->with(['caseReport.abuseType', 'assessment', 'protectionOrders.issuedBy'])
                  ->orderBy('incident_sequence', 'desc');
            },
            'caseReport.abuseType',
            'involvedParties',
            'assessment',
            'protectionOrders.issuedBy',
            'complianceLogs',
            'escalations'
        ])->findOrFail($id);

        $respParty = $case->involvedParties->firstWhere('role', 'Respondent');
        $respName = $respParty?->name ?? $case->dossier?->respondent_name;

        $crossDossiers = collect();
        if ($respName) {
            $crossDossiers = VawcDossier::where('respondent_name', 'LIKE', $respName)
                ->where('id', '!=', $case->dossier_id)
                ->with(['cases'])
                ->get();
        }

        $crossStats = [
            'has_other_dossiers' => $crossDossiers->isNotEmpty(),
            'other_dossiers_count' => $crossDossiers->count(),
            'total_linked_dossiers' => $crossDossiers->count() + 1,
            'other_incidents_count' => (int) $crossDossiers->sum('incident_count'),
            'total_perpetrator_incidents' => (int) $crossDossiers->sum('incident_count') + ($case->dossier?->incident_count ?? 1),
            'is_serial_recidivist' => $crossDossiers->isNotEmpty() || ($case->dossier?->incident_count ?? 1) > 1,
            'linked_dossier_numbers' => $crossDossiers->pluck('dossier_number')->all(),
            'linked_survivor_count' => $crossDossiers->count() + 1,
        ];

        // Multi-Dossier Survivor Compound Risk
        $victimParty = $case->involvedParties->firstWhere('role', 'Victim');
        $victimName = $victimParty?->name ?? $case->dossier?->survivor_name;

        $survivorOtherDossiers = collect();
        if ($victimName) {
            $survivorOtherDossiers = VawcDossier::where('survivor_name', 'LIKE', $victimName)
                ->where('id', '!=', $case->dossier_id)
                ->with(['cases'])
                ->get();
        }

        $survivorStats = [
            'has_other_dossiers' => $survivorOtherDossiers->isNotEmpty(),
            'other_dossiers_count' => $survivorOtherDossiers->count(),
            'total_active_dossiers' => $survivorOtherDossiers->count() + 1,
            'is_compound_victimization' => $survivorOtherDossiers->isNotEmpty(),
            'other_dossiers' => $survivorOtherDossiers->map(fn($d) => [
                'id' => $d->id,
                'dossier_number' => $d->dossier_number,
                'respondent_name' => $d->respondent_name,
                'relationship_type' => $d->relationship_type,
                'highest_threat_level' => $d->highest_threat_level,
                'latest_case_id' => $d->cases->first()?->id,
            ])->values()->all(),
        ];

        return Inertia::render('Admin/Vawc/Show', [
            'case' => $case,
            'crossStats' => $crossStats,
            'survivorStats' => $survivorStats,
        ]);
    }

    /**
     * Submit late triage assessment for a pending case.
     */
    public function assessCase(Request $request, $id)
    {
        $case = VawcCase::findOrFail($id);

        if ($case->assessment()->exists()) {
            return redirect()->back()->with('error', 'Case has already been triaged.');
        }

        $request->validate([
            'requires_medical' => 'boolean',
            'requires_alternative_housing' => 'boolean',
            'is_repeat_offense' => 'boolean',
            'has_weapon_involved' => 'boolean',
            'weapons_confiscated' => 'boolean',
            'perpetrator_present' => 'boolean',
            'incident_veracity' => 'boolean',
            'warrantless_arrest_made' => 'boolean',
        ]);

        DB::transaction(function () use ($case, $request) {
            $case->update([
                'is_repeat_offense' => $request->boolean('is_repeat_offense'),
                'has_weapon_involved' => $request->boolean('has_weapon_involved'),
                'weapons_confiscated' => $request->boolean('weapons_confiscated'),
                'perpetrator_present' => $request->boolean('perpetrator_present'),
                'incident_veracity' => $request->boolean('incident_veracity'),
                'warrantless_arrest_made' => $request->boolean('warrantless_arrest_made'),
                'status' => $request->boolean('requires_alternative_housing') ? 'Alternative Housing' : 'Assessment',
            ]);

            $case->assessment()->create([
                'requires_medical' => $request->boolean('requires_medical'),
                'requires_alternative_housing' => $request->boolean('requires_alternative_housing'),
                'abuse_frequency' => 0,
                'abuse_severity' => 0,
                'weapon_access' => 0,
                'life_threat_level' => 0,
            ]);

            $case->dossier?->syncDossierAggregates();
        });

        return redirect()->back()->with('success', 'Triage assessment recorded successfully.');
    }

    /**
     * File a BPO application for a case.
     */
    public function applyBpo($id, Request $request)
    {
        $case = VawcCase::findOrFail($id);
        $this->bpoService->fileApplication($case, $request->all());
        $case->dossier?->syncDossierAggregates();

        return redirect()->back()->with('success', 'BPO Application filed.');
    }

    /**
     * Issue the applied BPO (marks SLA).
     */
    public function issueBpo($id, Request $request)
    {
        $case = VawcCase::findOrFail($id);

        $order = $case->protectionOrders()
            ->where('status', 'Applied')
            ->latest()
            ->firstOrFail();

        $this->bpoService->issueOrder($order, $request->all());
        $case->dossier?->syncDossierAggregates();

        return redirect()->back()->with('success', 'BPO Issued successfully.');
    }

    /**
     * Record how the BPO was served (Personally vs Residence).
     */
    public function recordBpoService($id, Request $request)
    {
        $case = VawcCase::findOrFail($id);
        $order = $case->protectionOrders()
            ->where('status', 'Issued')
            ->latest()
            ->firstOrFail();

        $request->validate([
            'service_method' => 'required|string',
            'served_datetime' => 'required',
            'receiver_name' => 'nullable|string'
        ]);

        $this->bpoService->recordService($order, $request->all());
        $case->dossier?->syncDossierAggregates();

        return redirect()->back()->with('success', 'BPO Service recorded.');
    }

    /**
     * Generate a printable Barangay Protection Order document.
     */
    public function printBpo($id)
    {
        $case = VawcCase::with(['caseReport', 'involvedParties', 'dossier'])
            ->findOrFail($id);

        /** @var \App\Models\VawcProtectionOrder $order */
        $order = $case->protectionOrders()
            ->whereIn('status', ['Issued', 'Served'])
            ->latest()
            ->firstOrFail();

        return Inertia::render('Admin/Vawc/PrintBpo', [
            'case' => $case,
            'order' => $order,
            'officer' => \Illuminate\Support\Facades\Auth::user()
        ]);
    }

    /**
     * Show a printable transmittal letter for the PNP (Step 7).
     */
    public function pnpTransmittal($id)
    {
        $case = VawcCase::with(['caseReport', 'involvedParties', 'protectionOrders', 'dossier.cases.caseReport'])
            ->findOrFail($id);

        /** @var \App\Models\VawcProtectionOrder $order */
        $order = $case->protectionOrders()
            ->whereIn('status', ['Issued', 'Served'])
            ->latest()
            ->firstOrFail();

        if ($order->transmittals()->where('agency', 'PNP Women and Children Protection')->count() === 0) {
            $this->bpoService->recordTransmittal($order);
        }

        return Inertia::render('Admin/Vawc/PnpTransmittal', [
            'case' => $case,
            'order' => $order,
            'officer' => \Illuminate\Support\Facades\Auth::user()
        ]);
    }

    /**
     * Log a compliance monitoring entry (RA 9262 Steps 8-11).
     */
    public function logCompliance($id, Request $request)
    {
        $case = VawcCase::findOrFail($id);

        $request->validate([
            'monitor_date' => 'required',
            'is_compliant' => 'required|boolean',
            'notes' => 'required|string',
            'needs_counseling' => 'boolean',
            'referral_type' => 'nullable|string',
            'referral_details' => 'nullable|string',
        ]);

        $this->complianceService->logMonitoring($case, $request->all());
        $case->dossier?->syncDossierAggregates();

        return redirect()->back()->with('success', 'Compliance log recorded.');
    }

    /**
     * Escalate a BPO violation (RA 9262 Step 12).
     */
    public function escalate($id, Request $request)
    {
        $case = VawcCase::findOrFail($id);

        $request->validate([
            'referral_target' => 'required|string',
            'violation_datetime' => 'required',
            'escorted_by_pb' => 'boolean',
            'violation_description' => 'required|string',
        ]);

        $this->legalService->escalateCase($case, $request->all());
        $case->dossier?->syncDossierAggregates();

        return redirect()->back()->with('success', 'Case escalated to legal authorities.');
    }

    /**
     * Show a printable court complaint assistance form (Step 12).
     */
    public function complaintForm($id)
    {
        $case = VawcCase::with(['caseReport', 'involvedParties.vawcCase', 'dossier'])
            ->findOrFail($id);

        return Inertia::render('Admin/Vawc/ComplaintForm', [
            'case' => $case,
            'officer' => \Illuminate\Support\Facades\Auth::user()
        ]);
    }

    /**
     * Closes/Archives a VAWC Case.
     */
    public function closeCase($id, Request $request)
    {
        $case = VawcCase::findOrFail($id);

        $request->validate([
            'closure_reason' => 'required|string',
            'closure_remarks' => 'nullable|string'
        ]);

        $this->legalService->closeCase($case, $request->all());
        $case->dossier?->syncDossierAggregates();

        return redirect()->back()->with('success', 'Case safely closed and archived.');
    }

    /**
     * Display the Barangay VAWC Desk Triage & Action Center.
     */
    public function dashboard()
    {
        $currentYear = now()->year;

        // Base queries for total counts & capped priority queues
        $criticalQuery = VawcCase::select('vawc_cases.*')
            ->with(['caseReport.abuseType', 'assessment', 'dossier'])
            ->join('vawc_assessments', 'vawc_assessments.vawc_case_id', '=', 'vawc_cases.id')
            ->whereIn('vawc_assessments.risk_level', ['CRITICAL', 'HIGH'])
            ->where('vawc_cases.status', '!=', 'Closed');

        $criticalTotal = (clone $criticalQuery)->count();
        $criticalQueue = (clone $criticalQuery)
            ->orderByDesc('vawc_assessments.risk_score')
            ->orderByDesc('vawc_cases.created_at')
            ->take(7)
            ->get()
            ->map(fn($c) => [
                'id'            => $c->id,
                'case_number'   => $c->sub_case_number ?? $c->caseReport?->case_number ?? 'N/A',
                'victim_name'   => $c->caseReport?->victim_name ?? 'Unknown',
                'status'        => $c->status,
                'risk_level'    => $c->assessment?->risk_level ?? 'UNKNOWN',
                'risk_score'    => $c->assessment?->risk_score ?? 0,
                'abuse_type'    => $c->caseReport?->abuseType?->name ?? 'Unclassified',
                'intake_date'   => $c->created_at->format('M d, Y'),
                'is_repeat'     => $c->is_repeat_offense ?? false,
                'has_weapon'    => $c->has_weapon_involved ?? false,
                'children_count' => $c->children_count ?? 0,
            ]);

        // 2. Moderate Risk Queue
        $moderateQuery = VawcCase::select('vawc_cases.*')
            ->with(['caseReport.abuseType', 'assessment', 'dossier'])
            ->join('vawc_assessments', 'vawc_assessments.vawc_case_id', '=', 'vawc_cases.id')
            ->whereIn('vawc_assessments.risk_level', ['MODERATE'])
            ->where('vawc_cases.status', '!=', 'Closed');

        $moderateTotal = (clone $moderateQuery)->count();
        $moderateQueue = (clone $moderateQuery)
            ->orderByDesc('vawc_assessments.risk_score')
            ->orderByDesc('vawc_cases.created_at')
            ->take(7)
            ->get()
            ->map(fn($c) => [
                'id'            => $c->id,
                'case_number'   => $c->sub_case_number ?? $c->caseReport?->case_number ?? 'N/A',
                'victim_name'   => $c->caseReport?->victim_name ?? 'Unknown',
                'status'        => $c->status,
                'risk_level'    => $c->assessment?->risk_level ?? 'UNKNOWN',
                'risk_score'    => $c->assessment?->risk_score ?? 0,
                'abuse_type'    => $c->caseReport?->abuseType?->name ?? 'Unclassified',
                'intake_date'   => $c->created_at->format('M d, Y'),
                'is_repeat'     => $c->is_repeat_offense ?? false,
                'has_weapon'    => $c->has_weapon_involved ?? false,
                'children_count' => $c->children_count ?? 0,
            ]);

        // 2.5. Low Risk Queue
        $lowQuery = VawcCase::select('vawc_cases.*')
            ->with(['caseReport.abuseType', 'assessment', 'dossier'])
            ->join('vawc_assessments', 'vawc_assessments.vawc_case_id', '=', 'vawc_cases.id')
            ->whereIn('vawc_assessments.risk_level', ['LOW'])
            ->where('vawc_cases.status', '!=', 'Closed');

        $lowTotal = (clone $lowQuery)->count();
        $lowQueue = (clone $lowQuery)
            ->orderByDesc('vawc_assessments.risk_score')
            ->orderByDesc('vawc_cases.created_at')
            ->take(7)
            ->get()
            ->map(fn($c) => [
                'id'            => $c->id,
                'case_number'   => $c->sub_case_number ?? $c->caseReport?->case_number ?? 'N/A',
                'victim_name'   => $c->caseReport?->victim_name ?? 'Unknown',
                'status'        => $c->status,
                'risk_level'    => $c->assessment?->risk_level ?? 'UNKNOWN',
                'risk_score'    => $c->assessment?->risk_score ?? 0,
                'abuse_type'    => $c->caseReport?->abuseType?->name ?? 'Unclassified',
                'intake_date'   => $c->created_at->format('M d, Y'),
                'is_repeat'     => $c->is_repeat_offense ?? false,
                'has_weapon'    => $c->has_weapon_involved ?? false,
                'children_count' => $c->children_count ?? 0,
            ]);

        // 3. Active cases with no assessment yet
        $unassessedQuery = VawcCase::with(['caseReport.abuseType', 'dossier'])
            ->doesntHave('assessment')
            ->where('status', '!=', 'Closed');

        $unassessedTotal = (clone $unassessedQuery)->count();
        $unassessedQueue = (clone $unassessedQuery)
            ->latest()
            ->take(7)
            ->get()
            ->map(fn($c) => [
                'id'            => $c->id,
                'case_number'   => $c->sub_case_number ?? $c->caseReport?->case_number ?? 'N/A',
                'victim_name'   => $c->caseReport?->victim_name ?? 'Unknown',
                'status'        => $c->status,
                'risk_level'    => 'PENDING',
                'risk_score'    => null,
                'abuse_type'    => $c->caseReport?->abuseType?->name ?? 'Unclassified',
                'intake_date'   => $c->created_at->format('M d, Y'),
                'is_repeat'     => $c->is_repeat_offense ?? false,
                'has_weapon'    => $c->has_weapon_involved ?? false,
                'children_count' => $c->children_count ?? 0,
            ]);

        // 4. KPI Metrics
        $kpis = $this->analyticsService->getVawcSpecificStats($currentYear);

        return Inertia::render('Admin/Vawc/Dashboard', [
            'criticalQueue'   => $criticalQueue,
            'criticalTotal'   => $criticalTotal,
            'moderateQueue'   => $moderateQueue,
            'moderateTotal'   => $moderateTotal,
            'lowQueue'        => $lowQueue,
            'lowTotal'        => $lowTotal,
            'unassessedQueue' => $unassessedQueue,
            'unassessedTotal' => $unassessedTotal,
            'kpis'            => $kpis,
            'currentYear'     => $currentYear,
        ]);
    }
}
