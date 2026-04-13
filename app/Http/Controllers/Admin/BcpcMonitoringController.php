<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BcpcChild;
use App\Services\NutritionCalculatorService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $query = BcpcChild::query();

        // 1. Apply Search Filter (Child or Guardian Name)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('child_first_name', 'like', "%{$search}%")
                  ->orWhere('child_last_name', 'like', "%{$search}%")
                  ->orWhere('guardian_name', 'like', "%{$search}%");
            });
        }

        // 2. Apply Status Filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('wfa_status', $request->status);
        }

        $children = $query->orderBy('date_of_weighing', 'desc')->get();

        // Check if user wants the Dashboard View or Registry View
        // For now, we'll keep redirecting admin.bcpc.index to the Registry, 
        // and we'll add a separate route for Dashboard Analytics.
        
        return Inertia::render('Admin/Bcpc/Index', [
            'monitoredChildren' => $children,
            'filters' => $request->only(['search', 'status']),
            'metrics' => [
                'total_monitored' => BcpcChild::count(),
                'severely_underweight' => BcpcChild::where('wfa_status', 'Severely Underweight')->count(),
                'underweight' => BcpcChild::where('wfa_status', 'Underweight')->count(),
            ]
        ]);
    }

    /**
     * Optional Analytics Dashboard view.
     */
    public function dashboard()
    {
        $children = BcpcChild::where('status', 'Active')->orderBy('date_of_weighing', 'desc')->get();

        // 1. Triage Top Priority (SAM)
        $topPriority = $children->filter(function ($child) {
            return in_array($child->wfa_status, ['Severely Underweight']) || in_array($child->hfa_status, ['Severely Stunted']);
        })->values();

        // 2. Second Priority (120-Day Feeding targeting)
        $secondPriority = $children->filter(function ($child) {
            return in_array($child->wfa_status, ['Underweight']) && !in_array($child->wfa_status, ['Severely Underweight']);
        })->values();

        // 3. Third Priority (Stunted/Education targeting)
        $thirdPriority = $children->filter(function ($child) {
            return in_array($child->hfa_status, ['Stunted']) && !in_array($child->hfa_status, ['Severely Stunted']);
        })->values();

        // 4. Upcoming Birthdays (Next 30 Days)
        $today = Carbon::now();
        $upcomingBirthdays = $children->filter(function ($child) use ($today) {
            if (!$child->date_of_birth) return false;
            // Set birthday to current year to check diff
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
        return Inertia::render('Admin/Bcpc/Create');
    }

    /**
     * Store a new registry and evaluate thresholds automatically.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
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
        ]);

        // Evaluate logic
        $ageInMonths = $this->nutritionService->calculateAgeInMonths($validated['date_of_birth'], $validated['date_of_weighing']);

        $validated['wfa_status'] = $this->nutritionService->evaluateWeightForAge($ageInMonths, $validated['sex'], $validated['weight_kg']);
        $validated['hfa_status'] = $this->nutritionService->evaluateHeightForAge($ageInMonths, $validated['sex'], $validated['height_cm']);
        $validated['status'] = 'Active';

        BcpcChild::create($validated);

        return redirect()->route('admin.bcpc.index')->with('success', 'Child registered and evaluated successfully.');
    }

    /**
     * Display a specific child profile for history and intervention logging.
     */
    public function show($id)
    {
        $child = BcpcChild::findOrFail($id);

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
        ]);

        $ageInMonths = $this->nutritionService->calculateAgeInMonths($child->date_of_birth->format('Y-m-d'), $validated['date_of_weighing']);

        $validated['wfa_status'] = $this->nutritionService->evaluateWeightForAge($ageInMonths, $child->sex, $validated['weight_kg']);
        $validated['hfa_status'] = $this->nutritionService->evaluateHeightForAge($ageInMonths, $child->sex, $validated['height_cm']);

        $child->update($validated);

        return back()->with('success', 'Profile and nutrition metrics updated.');
    }
}
