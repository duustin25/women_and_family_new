<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BcpcCase;
use App\Models\CaseAbuseType;
use App\Models\Zone;
use App\Services\BcpcCaseService;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BcpcController extends Controller
{
    protected $bcpcService;
    protected $analyticsService;

    public function __construct(
        BcpcCaseService $bcpcService,
        AnalyticsService $analyticsService
    ) {
        $this->bcpcService = $bcpcService;
        $this->analyticsService = $analyticsService;
    }

    public function index(Request $request)
    {
        $query = BcpcCase::with(['caseReport.abuseType', 'involvedParties']);

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

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->input('archived') === '1') {
            $query->whereIn('status', ['Terminated', 'Forwarded to Prosecutor']); 
        } else {
            $query->whereNotIn('status', ['Terminated', 'Forwarded to Prosecutor']); 
        }

        $cases = $query->orderByDesc('created_at')->get();

        return Inertia::render('Admin/Bcpc/Index', [
            'cases' => $cases,
            'filters' => $request->only(['search', 'status', 'archived'])
        ]);
    }

    public function create()
    {
        $abuseTypes = CaseAbuseType::where('is_active', true)
            ->where(function ($query) {
                $query->where('category', 'BCPC')
                    ->orWhere('category', 'Both');
            })->get();

        $zones = Zone::where('is_active', true)->get();

        return Inertia::render('Admin/Bcpc/Create', [
            'abuseTypes' => $abuseTypes,
            'zones' => $zones
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parties' => 'required|array',
            'parties.*.role' => 'required|string',
            'parties.*.name' => 'required|string|max:255',
            'parties.*.age' => 'nullable|integer',
            'parties.*.gender' => 'nullable|string',
            'parties.*.contact' => 'nullable|string',
            'parties.*.address' => 'nullable|string',

            'complainant.name' => 'nullable|string|max:255',
            'complainant.contact' => 'nullable|string',

            'incident_date' => 'required',
            'incident_location' => 'required|string',
            'description' => 'required|string',
            'abuse_type' => 'required|numeric',
            'zone_id' => 'required|exists:zones,id',

            'acted_with_discernment' => 'boolean',
            'is_victimless_crime' => 'boolean',
        ]);

        $this->bcpcService->createBcpcCase($validated);

        return redirect()->route('admin.bcpc.index')->with('success', 'BCPC Case recorded successfully.');
    }

    public function show($id)
    {
        $case = BcpcCase::with(['caseReport.abuseType', 'caseReport.handler', 'involvedParties', 'complianceLogs.logger'])
            ->findOrFail($id);

        return Inertia::render('Admin/Bcpc/Show', [
            'case' => $case
        ]);
    }

    public function startProceeding($id)
    {
        $case = BcpcCase::findOrFail($id);
        $this->bcpcService->startProceeding($case);

        return redirect()->back()->with('success', 'Diversion proceedings started.');
    }

    public function implementProgram($id, Request $request)
    {
        $case = BcpcCase::findOrFail($id);
        
        $validated = $request->validate([
            'program_type' => 'required|string',
            'contract_signed_date' => 'required|date'
        ]);

        $this->bcpcService->implementProgram($case, $validated);

        return redirect()->back()->with('success', 'Diversion program implemented and contract signed.');
    }

    public function logCompliance($id, Request $request)
    {
        $case = BcpcCase::findOrFail($id);

        $validated = $request->validate([
            'monitor_date' => 'required',
            'is_compliant' => 'required|boolean',
            'notes' => 'required|string',
            'attachment_path' => 'nullable|string',
        ]);

        $this->bcpcService->logCompliance($case, $validated);

        return redirect()->back()->with('success', 'Compliance log recorded.');
    }

    public function terminate($id, Request $request)
    {
        $case = BcpcCase::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string'
        ]);

        $this->bcpcService->terminateCase($case, $validated['reason']);

        return redirect()->back()->with('success', 'Case terminated successfully.');
    }

    public function forward($id, Request $request)
    {
        $case = BcpcCase::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string'
        ]);

        $this->bcpcService->forwardCase($case, $validated['reason']);

        return redirect()->back()->with('success', 'Case forwarded to prosecutor.');
    }
}
