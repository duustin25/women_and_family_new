<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VawcCase;
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
     * Display a listing of VAWC cases.
     */
    public function index(Request $request)
    {
        $query = VawcCase::with(['caseReport.abuseType', 'involvedParties', 'assessment']);

        // Filter by Search (Case Number or Victim Name)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('caseReport', function ($cq) use ($search) {
                    $cq->where('case_number', 'LIKE', "%{$search}%")
                        ->orWhere('victim_name', 'LIKE', "%{$search}%");
                })->orWhereHas('involvedParties', function ($pq) use ($search) {
                    $pq->where('name', 'LIKE', "%{$search}%");
                });
            });
        }

        // Filter by Status (If an exact sub-status is chosen)
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // The "Archived vs Active" Strategy Pattern Separation
        if ($request->input('archived') === '1') {
            $query->where('status', 'Closed'); // Only show the Historical records
            $cases = $query->orderByDesc('created_at')->get();
        } else {
            $query->where('status', '!=', 'Closed'); // Only show Active Worklist
            
            // PRIORITY TRIAGE QUEUE: Sort by Risk Score first, then date
            $cases = $query->get()->sortByDesc(function ($case) {
                return $case->assessment ? $case->assessment->risk_score : 0;
            })->values();
        }

        return Inertia::render('Admin/Vawc/Index', [
            'cases' => $cases,
            'filters' => $request->only(['search', 'status', 'archived'])
        ]);
    }

    /**
     * Show the form for creating a new VAWC case (Wireframe).
     */
    public function create()
    {
        $abuseTypes = CaseAbuseType::where('is_active', true)
            ->where(function ($query) {
                $query->where('category', 'VAWC')
                    ->orWhere('category', 'Both');
            })->get();

        $zones = Zone::where('is_active', true)->get();

        return Inertia::render('Admin/Vawc/Create', [
            'abuseTypes' => $abuseTypes,
            'zones' => $zones
        ]);
    }

    /**
     * Store a newly created VAWC case.
     */
    public function store(Request $request)
    {
        // Validation for the specialized VAWC form
        $validated = $request->validate([
            'intake_type' => 'required|in:Direct,Third-Party',
            'victim.name' => 'required|string|max:255',
            'victim.age' => 'nullable|integer',
            'victim.gender' => 'nullable|string',
            'victim.contact' => 'nullable|string',
            'victim.address' => 'nullable|string',

            'complainant.name' => 'nullable|string|max:255',
            'complainant.contact' => 'nullable|string',

            'respondent.name' => 'nullable|string|max:255',
            'respondent.age' => 'nullable|integer',
            'respondent.gender' => 'nullable|string',
            'respondent.contact' => 'nullable|string',
            'respondent.address' => 'nullable|string',

            'incident_date' => 'required', // Relaxed to handle datetime-local string
            'incident_location' => 'required|string',
            'description' => 'required|string',
            'abuse_type' => 'required|string',
            'zone_id' => 'required|exists:zones,id',

            'children_count' => 'nullable|integer',
            'is_repeat_offense' => 'boolean',
            'has_weapon_involved' => 'boolean',
            'respondent.relationship' => 'nullable|string',

            'incident_veracity' => 'boolean',
            'perpetrator_present' => 'boolean',
            'warrantless_arrest_made' => 'boolean',
            'weapons_confiscated' => 'boolean',

            'requires_medical' => 'boolean',
            'requires_alternative_housing' => 'boolean',

            // New Risk Assessment Fields
            'abuse_frequency' => 'nullable|integer|min:1|max:3',
            'abuse_severity' => 'nullable|integer|min:1|max:3',
            'weapon_access' => 'nullable|integer|min:1|max:3',
            'life_threat_level' => 'nullable|integer|min:1|max:3',
        ]);

        $this->vawcService->createVawcCase($validated);

        return redirect()->route('admin.vawc.index')->with('success', 'VAWC Case recorded successfully.');
    }

    /**
     * Display the specified VAWC case (Wireframe).
     */
    public function show($id)
    {
        $case = VawcCase::with(['caseReport.abuseType', 'involvedParties', 'assessment', 'protectionOrders.issuedBy', 'complianceLogs', 'escalations'])
            ->findOrFail($id);

        return Inertia::render('Admin/Vawc/Show', [
            'case' => $case
        ]);
    }

    /**
     * File a BPO application for a case.
     */
    public function applyBpo($id, Request $request)
    {
        $case = VawcCase::findOrFail($id);
        $this->bpoService->fileApplication($case, $request->all());

        return redirect()->back()->with('success', 'BPO Application filed.');
    }

    /**
     * Issue the applied BPO (marks SLA).
     */
    public function issueBpo($id, Request $request)
    {
        $case = VawcCase::findOrFail($id);

        // Find the latest 'Applied' BPO
        $order = $case->protectionOrders()
            ->where('status', 'Applied')
            ->latest()
            ->firstOrFail();

        $this->bpoService->issueOrder($order, $request->all());

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

        return redirect()->back()->with('success', 'BPO Service recorded.');
    }

    /**
     * Generate a printable Barangay Protection Order document.
     */
    public function printBpo($id)
    {
        $case = VawcCase::with(['caseReport', 'involvedParties'])
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
        $case = VawcCase::with(['caseReport', 'involvedParties', 'protectionOrders'])
            ->findOrFail($id);

        /** @var \App\Models\VawcProtectionOrder $order */
        $order = $case->protectionOrders()
            ->whereIn('status', ['Issued', 'Served'])
            ->latest()
            ->firstOrFail();

        // Log the transmittal if it hasn't been logged yet
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

        return redirect()->back()->with('success', 'Case escalated to legal authorities.');
    }

    /**
     * Show a printable court complaint assistance form (Step 12).
     */
    public function complaintForm($id)
    {
        $case = VawcCase::with(['caseReport', 'involvedParties.vawcCase'])
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

        return redirect()->back()->with('success', 'Case safely closed and archived.');
    }


    /**
     * Display the VAWC Management Dashboard with Analytics.
     */
    public function dashboard()
    {
        $currentYear = now()->year;

        return Inertia::render('Admin/Vawc/Dashboard', [
            'stats' => array_merge(
                $this->analyticsService->getVawcSpecificStats($currentYear),
                [
                    'monthly_trends' => $this->analyticsService->getVawcMonthlyTrend($currentYear),
                    'bpoTrends'      => $this->analyticsService->getVawcBpoTrends($currentYear),
                    'analyticsData'  => $this->analyticsService->getMonthlyCaseAnalytics(
                        'VAWC',
                        $currentYear,
                        \App\Models\CaseAbuseType::where('is_active', true)->whereIn('category', ['VAWC', 'Both'])->get()
                    ),
                    'chartConfig'    => $this->analyticsService->getVawcChartConfig(),
                ]
            )
        ]);
    }
}
