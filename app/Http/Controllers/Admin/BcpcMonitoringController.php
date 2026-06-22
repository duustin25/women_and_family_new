<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BcpcChild;
use App\Models\BcpcAssessment;
use App\Models\Member;
use App\Models\Zone;
use App\Services\NutritionCalculatorService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class BcpcMonitoringController extends Controller
{
    protected NutritionCalculatorService $nutritionService;

    public function __construct(NutritionCalculatorService $nutritionService)
    {
        $this->nutritionService = $nutritionService;
    }

    /**
     * Display the BCPC Monitoring Dashboard.
     */
    public function index(Request $request)
    {
        $this->ensureZonesExist();
        $query = BcpcChild::with(['latestAssessment', 'zone', 'member']);

        // 1. Apply Search Filter (Child, Guardian, or BNS Name)
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('child_first_name', 'like', "%{$search}%")
                    ->orWhere('child_last_name', 'like', "%{$search}%")
                    ->orWhere('guardian_name', 'like', "%{$search}%")
                    ->orWhere('bns_name', 'like', "%{$search}%");
            });
        }

        // 2. Apply Status Filter (Targeting the Latest Assessment WFA)
        if ($request->has('status') && $request->status !== 'all') {
            $query->whereHas('latestAssessment', function ($q) use ($request) {
                $q->where('wfa_status', $request->status);
            });
        }

        // 3. Apply SFP Status Filter
        if ($request->has('sfp_status') && $request->sfp_status !== 'all') {
            $query->where('sfp_status', $request->sfp_status);
        }

        $children = $query->get()->sortByDesc(function ($child) {
            return $child->latestAssessment ? $child->latestAssessment->date_of_weighing : $child->created_at;
        })->values();

        return Inertia::render('Admin/Bcpc/Index', [
            'monitoredChildren' => $children,
            'filters' => $request->only(['search', 'status', 'sfp_status']),
            'metrics' => [
                'total_monitored' => BcpcChild::count(),
                'active_sfp' => BcpcChild::where('sfp_status', 'Enrolled')->count(),
                'severely_underweight' => BcpcAssessment::whereIn('id', function ($query) {
                    $query->select(DB::raw('max(id)'))
                        ->from('bcpc_assessments')
                        ->groupBy('bcpc_child_id');
                })->where('wfa_status', 'Severely Underweight')->count(),
                'underweight' => BcpcAssessment::whereIn('id', function ($query) {
                    $query->select(DB::raw('max(id)'))
                        ->from('bcpc_assessments')
                        ->groupBy('bcpc_child_id');
                })->where('wfa_status', 'Underweight')->count(),
            ]
        ]);
    }

    /**
     * Optional Analytics Dashboard view.
     */
    public function dashboard()
    {
        $this->ensureZonesExist();
        $children = BcpcChild::with(['latestAssessment', 'zone'])
            ->where('status', 'Active')
            ->get();

        // 1. Triage Top Priority (SAM)
        $topPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            return in_array($latest->wfa_status, ['Severely Underweight']) || in_array($latest->hfa_status, ['Severely Stunted']);
        })->values();

        // 2. Second Priority (MAM / Underweight)
        $secondPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            return in_array($latest->wfa_status, ['Underweight']) && !in_array($latest->wfa_status, ['Severely Underweight']);
        })->values();

        // 3. Third Priority (Stunted/Height focus)
        $thirdPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            return in_array($latest->hfa_status, ['Stunted']) && !in_array($latest->hfa_status, ['Severely Stunted']);
        })->values();

        // 4. SFP Active List
        $activeSfp = $children->filter(function ($child) {
            return $child->sfp_status === 'Enrolled';
        })->values();

        // 5. Overdue Weighing Check-ins (At-risk children last weighed > 30 days ago)
        $overdueWeighings = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;

            $isAtRisk = in_array($latest->wfa_status, ['Underweight', 'Severely Underweight'])
                || in_array($latest->hfa_status, ['Stunted', 'Severely Stunted'])
                || $child->sfp_status === 'Enrolled';

            if (!$isAtRisk) return false;

            return Carbon::parse($latest->date_of_weighing)->diffInDays(Carbon::now()) > 30;
        })->values();

        // 6. Upcoming Birthdays (Next 30 Days)
        $today = Carbon::now();
        $upcomingBirthdays = $children->filter(function ($child) use ($today) {
            if (!$child->date_of_birth) return false;
            $birthdayThisYear = $child->date_of_birth->copy()->year($today->year);
            if ($birthdayThisYear->isPast()) {
                $birthdayThisYear->addYear();
            }
            return $today->diffInDays($birthdayThisYear) <= 30;
        })->sortBy(function ($child) use ($today) {
            $birthdayThisYear = $child->date_of_birth->copy()->year($today->year);
            if ($birthdayThisYear->isPast()) {
                $birthdayThisYear->addYear();
            }
            return $birthdayThisYear->timestamp;
        })->values();

        // 7. Zone Malnutrition Breakdown (Malnutrition Hotspots in Barangay 183)
        $zonesBreakdown = Zone::query()->get()->map(function ($zone) use ($children) {
            $zoneChildren = $children->filter(function ($c) use ($zone) {
                return $c->zone_id === $zone->id;
            });

            $samCount = $zoneChildren->filter(function ($c) {
                return $c->latestAssessment && $c->latestAssessment->wfa_status === 'Severely Underweight';
            })->count();

            $mamCount = $zoneChildren->filter(function ($c) {
                return $c->latestAssessment && $c->latestAssessment->wfa_status === 'Underweight';
            })->count();

            return [
                'id' => $zone->id,
                'name' => $zone->name,
                'sam' => $samCount,
                'mam' => $mamCount,
                'total_malnourished' => $samCount + $mamCount,
                'total_monitored' => $zoneChildren->count(),
            ];
        })->sortByDesc('total_malnourished')->values();

        return Inertia::render('Admin/Bcpc/Dashboard', [
            'monitoredChildren' => $children,
            'topPriority' => $topPriority,
            'secondPriority' => $secondPriority,
            'thirdPriority' => $thirdPriority,
            'activeSfp' => $activeSfp,
            'overdueWeighings' => $overdueWeighings,
            'upcomingBirthdays' => $upcomingBirthdays,
            'zonesBreakdown' => $zonesBreakdown,
            'metrics' => [
                'total_monitored' => $children->count(),
                'active_sfp' => $activeSfp->count(),
                'graduated_sfp' => BcpcChild::where('sfp_status', 'Graduated')->count(),
                'overdue_weighing' => $overdueWeighings->count(),
                'severely_underweight' => $topPriority->count(),
                'underweight' => $secondPriority->count(),
                'stunted' => $thirdPriority->count()
            ]
        ]);
    }

    /**
     * Render the form for registering a child.
     */
    public function create()
    {
        $this->ensureZonesExist();
        return Inertia::render('Admin/Bcpc/Create', [
            'members' => Member::query()->select('id', 'fullname')->where('status', 'Active')->get(),
            'zones' => Zone::query()->get(),
        ]);
    }


    /**
     * Store a new registry and evaluate thresholds automatically.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'nullable|exists:members,id',
            'zone_id' => 'nullable|exists:zones,id',
            'guardian_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'bns_name' => 'nullable|string|max:255',
            'child_first_name' => 'required|string|max:255',
            'child_last_name' => 'required|string|max:255',
            'child_middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date|before_or_equal:today',
            'sex' => 'required|in:Male,Female',
            'date_of_weighing' => 'required|date|after_or_equal:date_of_birth|before_or_equal:today',
            'weight_kg' => 'required|numeric|min:0.5|max:100',
            'height_cm' => 'required|numeric|min:30|max:200',
            'intervention_logs' => 'nullable|array',
            'remarks' => 'nullable|string',
            'bns_assessor' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Evaluate logic using WHO Standard Curves
            $ageInMonths = $this->nutritionService->calculateAgeInMonths($validated['date_of_birth'], $validated['date_of_weighing']);
            $wfa = $this->nutritionService->evaluateWeightForAge($ageInMonths, $validated['sex'], $validated['weight_kg']);
            $hfa = $this->nutritionService->evaluateHeightForAge($ageInMonths, $validated['sex'], $validated['height_cm']);

            // 2. Automate SFP Program Triage (Malnourished = automatic 90-Day SFP enrollment)
            $sfpStatus = 'None';
            $sfpStartDate = null;
            if (in_array($wfa, ['Underweight', 'Severely Underweight'])) {
                $sfpStatus = 'Enrolled';
                $sfpStartDate = $validated['date_of_weighing'];
            }

            // 3. Create Child Profile
            $child = BcpcChild::create([
                'member_id' => $validated['member_id'] ?: null,
                'zone_id' => $validated['zone_id'] ?: null,
                'guardian_name' => $validated['guardian_name'],
                'address' => $validated['address'],
                'contact_number' => $validated['contact_number'],
                'bns_name' => $validated['bns_name'] ?? null,
                'child_first_name' => $validated['child_first_name'],
                'child_last_name' => $validated['child_last_name'],
                'child_middle_name' => $validated['child_middle_name'],
                'date_of_birth' => $validated['date_of_birth'],
                'sex' => $validated['sex'],
                'status' => 'Active',
                'sfp_status' => $sfpStatus,
                'sfp_start_date' => $sfpStartDate,
            ]);

            // 4. Create First Assessment (Day 1 of SFP if Enrolled)
            $child->assessments()->create([
                'user_id' => Auth::id(),
                'date_of_weighing' => $validated['date_of_weighing'],
                'weight_kg' => $validated['weight_kg'],
                'height_cm' => $validated['height_cm'],
                'wfa_status' => $wfa,
                'hfa_status' => $hfa,
                'intervention_logs' => $validated['intervention_logs'] ?? [],
                'remarks' => $validated['remarks'] ?? null,
                'bns_assessor' => $validated['bns_assessor'] ?? ($validated['bns_name'] ?? null),
                'sfp_day_number' => $sfpStatus === 'Enrolled' ? 1 : null,
            ]);

            return Redirect::route('admin.bcpc.index')->with('success', 'Child registered and evaluated successfully.');
        });
    }

    /**
     * Display a specific child profile for history and intervention logging.
     */
    public function show(int $id)
    {
        $child = BcpcChild::with(['assessments' => function ($q) {
            $q->orderBy('date_of_weighing', 'desc')->orderBy('id', 'desc');
        }, 'zone', 'member'])->findOrFail($id);

        $ageInMonths = $this->nutritionService->calculateAgeInMonths($child->date_of_birth->format('Y-m-d'), Carbon::now()->format('Y-m-d'));
        $years = floor($ageInMonths / 12);
        $months = $ageInMonths % 12;

        return Inertia::render('Admin/Bcpc/Show', [
            'child' => $child,
            'computedAge' => "{$years} Years, {$months} Months"
        ]);
    }

    /**
     * Update child record (useful for new weighing input / SFP adjustments).
     */
    public function update(Request $request, int $id)
    {
        $child = BcpcChild::findOrFail($id);

        $validated = $request->validate([
            'date_of_weighing' => 'required|date|after_or_equal:' . $child->date_of_birth->format('Y-m-d') . '|before_or_equal:today',
            'weight_kg' => 'required|numeric|min:0.5|max:100',
            'height_cm' => 'required|numeric|min:30|max:200',
            'intervention_logs' => 'nullable|array',
            'remarks' => 'nullable|string',
            'bns_assessor' => 'nullable|string|max:255',
            'sfp_day_number' => 'nullable|integer',
            'sfp_status' => 'nullable|string|in:None,Enrolled,Completed,Graduated,Terminated',
        ]);

        return DB::transaction(function () use ($validated, $child) {
            $ageInMonths = $this->nutritionService->calculateAgeInMonths($child->date_of_birth->format('Y-m-d'), $validated['date_of_weighing']);
            $wfa = $this->nutritionService->evaluateWeightForAge($ageInMonths, $child->sex, $validated['weight_kg']);
            $hfa = $this->nutritionService->evaluateHeightForAge($ageInMonths, $child->sex, $validated['height_cm']);

            // Handle SFP state updates
            $sfpStatus = $validated['sfp_status'] ?? $child->sfp_status;
            $sfpStartDate = $child->sfp_start_date;
            $sfpEndDate = $child->sfp_end_date;

            // 1. Auto-graduation / SFP updates based on recovery progress
            if ($child->sfp_status === 'Enrolled') {
                if ($wfa === 'Normal') {
                    $sfpStatus = 'Graduated';
                    $sfpEndDate = $validated['date_of_weighing'];
                }
            } elseif ($child->sfp_status === 'None' || $child->sfp_status === 'Graduated') {
                // Relapse or initial diagnosis -> re-enroll in SFP
                if (in_array($wfa, ['Underweight', 'Severely Underweight'])) {
                    $sfpStatus = 'Enrolled';
                    $sfpStartDate = $validated['date_of_weighing'];
                    $sfpEndDate = null;
                }
            }

            // 2. Allow manual override resets
            if (isset($validated['sfp_status'])) {
                $sfpStatus = $validated['sfp_status'];
                if ($sfpStatus === 'Enrolled' && !$sfpStartDate) {
                    $sfpStartDate = $validated['date_of_weighing'];
                }
                if (in_array($sfpStatus, ['Graduated', 'Completed', 'Terminated'])) {
                    $sfpEndDate = $validated['date_of_weighing'];
                }
            }

            $child->update([
                'sfp_status' => $sfpStatus,
                'sfp_start_date' => $sfpStartDate,
                'sfp_end_date' => $sfpEndDate,
            ]);

            // 3. Log assessment
            $child->assessments()->create([
                'user_id' => Auth::id(),
                'date_of_weighing' => $validated['date_of_weighing'],
                'weight_kg' => $validated['weight_kg'],
                'height_cm' => $validated['height_cm'],
                'wfa_status' => $wfa,
                'hfa_status' => $hfa,
                'intervention_logs' => $validated['intervention_logs'] ?? [],
                'remarks' => $validated['remarks'] ?? null,
                'bns_assessor' => $validated['bns_assessor'] ?? null,
                'sfp_day_number' => $validated['sfp_day_number'] ?? ($sfpStatus === 'Enrolled' ? 1 : null),
            ]);

            return Redirect::back()->with('success', 'New nutrition measurement recorded successfully.');
        });
    }

    /**
     * Ensure default zones (Puroks) are seeded for Barangay 183 Villamor.
     */
    protected function ensureZonesExist()
    {
        if (Zone::query()->count() === 0) {
            $defaultZones = [
                ['name' => 'Purok 1', 'color_code' => '#10b981', 'description' => 'Barangay 183 Villamor - Purok 1', 'is_active' => true],
                ['name' => 'Purok 2', 'color_code' => '#3b82f6', 'description' => 'Barangay 183 Villamor - Purok 2', 'is_active' => true],
                ['name' => 'Purok 3', 'color_code' => '#f59e0b', 'description' => 'Barangay 183 Villamor - Purok 3', 'is_active' => true],
                ['name' => 'Purok 4', 'color_code' => '#ef4444', 'description' => 'Barangay 183 Villamor - Purok 4', 'is_active' => true],
                ['name' => 'Purok 5', 'color_code' => '#8b5cf6', 'description' => 'Barangay 183 Villamor - Purok 5', 'is_active' => true],
                ['name' => 'Purok 6', 'color_code' => '#ec4899', 'description' => 'Barangay 183 Villamor - Purok 6', 'is_active' => true],
                ['name' => 'Purok 7', 'color_code' => '#6b7280', 'description' => 'Barangay 183 Villamor - Purok 7', 'is_active' => true],
                ['name' => 'Purok 8', 'color_code' => '#06b6d4', 'description' => 'Barangay 183 Villamor - Purok 8', 'is_active' => true],
            ];
            foreach ($defaultZones as $dz) {
                Zone::create($dz);
            }
        }
    }
}
