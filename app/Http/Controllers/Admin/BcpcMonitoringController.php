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

class BcpcMonitoringController extends Controller
{
    protected $nutritionService;

    public function __construct(NutritionCalculatorService $nutritionService)
    {
        $this->nutritionService = $nutritionService;
    }

    /**
     * Display the BCPC Monitoring Dashboard.
     */
    public function index(Request $request)
    {
        $query = BcpcChild::with(['latestAssessment', 'zone', 'member']);

        // 1. Apply Search Filter (Child or Guardian Name)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('child_first_name', 'like', "%{$search}%")
                    ->orWhere('child_last_name', 'like', "%{$search}%")
                    ->orWhere('guardian_name', 'like', "%{$search}%");
            });
        }

        // 2. Apply Status Filter (Targeting the Latest Assessment)
        if ($request->has('status') && $request->status !== 'all') {
            $query->whereHas('latestAssessment', function ($q) use ($request) {
                $q->where('wfa_status', $request->status);
            });
        }

        $children = $query->get()->sortByDesc(function ($child) {
            return $child->latestAssessment ? $child->latestAssessment->date_of_weighing : $child->created_at;
        })->values();

        return Inertia::render('Admin/Bcpc/Index', [
            'monitoredChildren' => $children,
            'filters' => $request->only(['search', 'status']),
            'metrics' => [
                'total_monitored' => BcpcChild::count(),
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
        $children = BcpcChild::with(['latestAssessment', 'zone'])
            ->where('status', 'Active')
            ->get();

        // 1. Triage Top Priority (SAM)
        $topPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            return in_array($latest->wfa_status, ['Severely Underweight']) || in_array($latest->hfa_status, ['Severely Stunted']);
        })->values();

        // 2. Second Priority (120-Day Feeding targeting)
        $secondPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            return in_array($latest->wfa_status, ['Underweight']) && !in_array($latest->wfa_status, ['Severely Underweight']);
        })->values();

        // 3. Third Priority (Stunted/Education targeting)
        $thirdPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            return in_array($latest->hfa_status, ['Stunted']) && !in_array($latest->hfa_status, ['Severely Stunted']);
        })->values();

        // 4. Upcoming Birthdays (Next 30 Days)
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

        return Inertia::render('Admin/Bcpc/Dashboard', [
            'monitoredChildren' => $children,
            'topPriority' => $topPriority,
            'secondPriority' => $secondPriority,
            'thirdPriority' => $thirdPriority,
            'upcomingBirthdays' => $upcomingBirthdays,
            'metrics' => [
                'total_monitored' => $children->count(),
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
        return Inertia::render('Admin/Bcpc/Create', [
            'members' => Member::select('id', 'fullname')->where('status', 'Active')->get(),
            'zones' => Zone::all(),
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
            'child_first_name' => 'required|string|max:255',
            'child_last_name' => 'required|string|max:255',
            'child_middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'sex' => 'required|in:Male,Female',
            'date_of_weighing' => 'required|date',
            'weight_kg' => 'required|numeric',
            'height_cm' => 'required|numeric',
            'intervention_logs' => 'nullable|array',
            'remarks' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Create Child Profile
            $child = BcpcChild::create([
                'member_id' => $validated['member_id'] ?? null,
                'zone_id' => $validated['zone_id'] ?? null,
                'guardian_name' => $validated['guardian_name'],
                'address' => $validated['address'],
                'contact_number' => $validated['contact_number'],
                'child_first_name' => $validated['child_first_name'],
                'child_last_name' => $validated['child_last_name'],
                'child_middle_name' => $validated['child_middle_name'],
                'date_of_birth' => $validated['date_of_birth'],
                'sex' => $validated['sex'],
                'status' => 'Active',
            ]);

            // 2. Evaluate logic
            $ageInMonths = $this->nutritionService->calculateAgeInMonths($validated['date_of_birth'], $validated['date_of_weighing']);
            $wfa = $this->nutritionService->evaluateWeightForAge($ageInMonths, $validated['sex'], $validated['weight_kg']);
            $hfa = $this->nutritionService->evaluateHeightForAge($ageInMonths, $validated['sex'], $validated['height_cm']);

            // 3. Create First Assessment
            $child->assessments()->create([
                'user_id' => Auth::id(),
                'date_of_weighing' => $validated['date_of_weighing'],
                'weight_kg' => $validated['weight_kg'],
                'height_cm' => $validated['height_cm'],
                'wfa_status' => $wfa,
                'hfa_status' => $hfa,
                'intervention_logs' => $validated['intervention_logs'] ?? [],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            return redirect()->route('admin.bcpc.index')->with('success', 'Child registered and evaluated successfully.');
        });
    }

    /**
     * Display a specific child profile for history and intervention logging.
     */
    public function show($id)
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
     * Update child record (useful for new weighing input / interventions).
     */
    public function update(Request $request, $id)
    {
        $child = BcpcChild::findOrFail($id);

        $validated = $request->validate([
            'date_of_weighing' => 'required|date',
            'weight_kg' => 'required|numeric',
            'height_cm' => 'required|numeric',
            'intervention_logs' => 'nullable|array',
            'remarks' => 'nullable|string',
        ]);

        $ageInMonths = $this->nutritionService->calculateAgeInMonths($child->date_of_birth->format('Y-m-d'), $validated['date_of_weighing']);

        $wfa = $this->nutritionService->evaluateWeightForAge($ageInMonths, $child->sex, $validated['weight_kg']);
        $hfa = $this->nutritionService->evaluateHeightForAge($ageInMonths, $child->sex, $validated['height_cm']);

        $child->assessments()->create([
            'user_id' => Auth::id(),
            'date_of_weighing' => $validated['date_of_weighing'],
            'weight_kg' => $validated['weight_kg'],
            'height_cm' => $validated['height_cm'],
            'wfa_status' => $wfa,
            'hfa_status' => $hfa,
            'intervention_logs' => $validated['intervention_logs'] ?? [],
            'remarks' => $validated['remarks'] ?? null,
        ]);

        return back()->with('success', 'New nutrition measurement recorded successfully.');
    }
}
