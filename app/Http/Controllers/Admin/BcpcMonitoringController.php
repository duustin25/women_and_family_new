<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BcpcChild;
use App\Models\BcpcAssessment;
use App\Models\Member;
use App\Models\Zone;
use App\Models\AuditLog;
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
     * Synchronize and transition children who reached 60+ months to 'Aged Out' status.
     * Compliant with RA 11037 & DOH e-OPT Plus 0-59 months scope guidelines.
     */
    private function syncAgedOutChildren(): void
    {
        $activeChildren = BcpcChild::where('status', 'Active')->get();
        $today = Carbon::today()->format('Y-m-d');
        foreach ($activeChildren as $child) {
            $ageInMonths = $this->nutritionService->calculateAgeInMonths($child->date_of_birth->format('Y-m-d'), $today);
            if ($ageInMonths >= 60) {
                $child->update(['status' => 'Aged Out']);
            }
        }
    }

    /**
     * Display the BCPC Child Nutrition Registry (Index).
     */
    public function index(Request $request)
    {
        $this->ensureZonesExist();
        $this->syncAgedOutChildren();

        $query = BcpcChild::with(['latestAssessment', 'zone', 'member']);

        // Registry Status Filter (Active 0-59m vs Aged Out / Archived for COA Audit)
        if ($request->has('registry_status') && $request->registry_status !== 'all') {
            $query->where('status', $request->registry_status);
        } elseif (!$request->has('registry_status') || $request->registry_status === 'Active') {
            $query->where('status', 'Active');
        }

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

        // 2. Apply Status Filter (Targeting Latest Assessment WFA / WFLH)
        if ($request->has('status') && $request->status !== 'all') {
            $query->whereHas('latestAssessment', function ($q) use ($request) {
                $q->where('wfa_status', $request->status)
                  ->orWhere('wflh_status', $request->status);
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
            'filters' => $request->only(['search', 'status', 'sfp_status', 'registry_status']),
            'metrics' => [
                'total_monitored' => BcpcChild::where('status', 'Active')->count(),
                'active_sfp' => BcpcChild::where('status', 'Active')->where('sfp_status', 'Enrolled')->count(),
                'archived_count' => BcpcChild::where('status', 'Aged Out')->count(),
                'severely_underweight' => BcpcAssessment::whereIn('id', function ($query) {
                    $query->select(DB::raw('max(id)'))
                        ->from('bcpc_assessments')
                        ->groupBy('bcpc_child_id');
                })->whereHas('child', function ($q) {
                    $q->where('status', 'Active');
                })->where(function ($q) {
                    $q->where('wfa_status', 'Severely Underweight')
                      ->orWhere('wflh_status', 'Severely Wasted');
                })->count(),
                'underweight' => BcpcAssessment::whereIn('id', function ($query) {
                    $query->select(DB::raw('max(id)'))
                        ->from('bcpc_assessments')
                        ->groupBy('bcpc_child_id');
                })->whereHas('child', function ($q) {
                    $q->where('status', 'Active');
                })->where(function ($q) {
                    $q->where('wfa_status', 'Underweight')
                      ->orWhere('wflh_status', 'Wasted');
                })->count(),
            ]
        ]);
    }

    /**
     * Executive BCPC Analytics & Command Center Dashboard.
     */
    public function dashboard()
    {
        $this->ensureZonesExist();
        $this->syncAgedOutChildren();

        $children = BcpcChild::with(['latestAssessment', 'zone'])
            ->where('status', 'Active')
            ->get();

        // 1. Triage Top Priority (SAM - Severe Acute Malnutrition / Wasting)
        $topPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            return in_array($latest->wfa_status, ['Severely Underweight']) 
                || in_array($latest->wflh_status ?? '', ['Severely Wasted']);
        })->values();

        // 2. Second Priority (MAM / Moderate Malnutrition)
        $secondPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            $isSam = in_array($latest->wfa_status, ['Severely Underweight']) || in_array($latest->wflh_status ?? '', ['Severely Wasted']);
            if ($isSam) return false;
            return in_array($latest->wfa_status, ['Underweight']) || in_array($latest->wflh_status ?? '', ['Wasted']);
        })->values();

        // 3. Third Priority (Stunted / Height Focus)
        $thirdPriority = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;
            return in_array($latest->hfa_status, ['Stunted', 'Severely Stunted']);
        })->values();

        // 4. Active Supplemental Feeding Program (SFP) Roster
        $activeSfp = $children->filter(function ($child) {
            return $child->sfp_status === 'Enrolled';
        })->values();

        // 5. Overdue Re-Weighing Check-ins (> 30 Days)
        $overdueWeighings = $children->filter(function ($child) {
            $latest = $child->latestAssessment;
            if (!$latest) return false;

            $isAtRisk = in_array($latest->wfa_status, ['Underweight', 'Severely Underweight'])
                || in_array($latest->hfa_status, ['Stunted', 'Severely Stunted'])
                || in_array($latest->wflh_status ?? '', ['Wasted', 'Severely Wasted'])
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

        // 7. Zone Malnutrition Breakdown (Purok Malnutrition Hotspots in Barangay 183)
        $zonesBreakdown = Zone::query()->get()->map(function ($zone) use ($children) {
            $zoneChildren = $children->filter(function ($c) use ($zone) {
                return $c->zone_id === $zone->id;
            });

            $samCount = $zoneChildren->filter(function ($c) {
                $l = $c->latestAssessment;
                return $l && ($l->wfa_status === 'Severely Underweight' || ($l->wflh_status ?? '') === 'Severely Wasted');
            })->count();

            $mamCount = $zoneChildren->filter(function ($c) {
                $l = $c->latestAssessment;
                return $l && ($l->wfa_status === 'Underweight' || ($l->wflh_status ?? '') === 'Wasted');
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
     * Render the Child Registration Form.
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
     * Store new Child Profile & Record Baseline WHO OPT+ Assessment.
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
            'weight_kg' => 'required|numeric|min:1.5|max:35.0',
            'height_cm' => 'required|numeric|min:40.0|max:125.0',
            'intervention_logs' => 'nullable|array',
            'remarks' => 'nullable|string',
            'bns_assessor' => 'nullable|string|max:255',
            'confirm_outlier' => 'nullable|boolean',
        ]);

        // 0-59 Months Lockout Check (OPT Plus Guideline)
        $ageInMonthsAtRegistration = $this->nutritionService->calculateAgeInMonths($validated['date_of_birth'], $validated['date_of_weighing']);
        if ($ageInMonthsAtRegistration >= 60) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'date_of_birth' => 'Child has aged out of the Barangay e-OPT Plus program (0-59 months). Nutritional monitoring is now handled by the school sector.'
            ]);
        }

        // Secondary Backend Outlier Safeguard (unless user explicitly confirmed override)
        if (!$request->boolean('confirm_outlier')) {
            $outlierCheck = $this->nutritionService->isExtremeOutlier(
                $ageInMonthsAtRegistration,
                $validated['sex'],
                (float)$validated['weight_kg'],
                (float)$validated['height_cm']
            );

            if ($outlierCheck['is_extreme']) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'weight_kg' => $outlierCheck['message'],
                    'height_cm' => 'Extreme biological outlier detected. Please verify measurement or confirm value.'
                ]);
            }
        }

        return DB::transaction(function () use ($validated, $ageInMonthsAtRegistration) {
            // 1. Evaluate WHO Growth Standard Z-Scores (3 Axes)
            $ageInMonths = $ageInMonthsAtRegistration;
            $wfa = $this->nutritionService->evaluateWeightForAge($ageInMonths, $validated['sex'], $validated['weight_kg']);
            $hfa = $this->nutritionService->evaluateHeightForAge($ageInMonths, $validated['sex'], $validated['height_cm']);
            $wflh = $this->nutritionService->evaluateWeightForLengthHeight($ageInMonths, $validated['sex'], $validated['weight_kg'], $validated['height_cm']);

            // NNC Bilateral Oedema (Fluid Retention) SAM Protocol Override (NNC Page 23)
            $interventionLogs = $validated['intervention_logs'] ?? [];
            if (in_array('Bilateral Oedema (Fluid Retention) [SAM PIMAM]', $interventionLogs)) {
                $wfa = 'Severely Underweight';
                $wflh = 'Severely Wasted';
            }

            // 2. Automate 120-Day Supplemental Feeding Program (SFP) Triage
            // Guardrail: SFP is contraindicated for Overweight / Obese children (Double Burden Protocol)
            $isOverweightOrObese = in_array($wflh, ['Overweight', 'Obese']);
            $sfpStatus = 'None';
            $sfpStartDate = null;
            if (!$isOverweightOrObese && (in_array($wfa, ['Underweight', 'Severely Underweight']) || in_array($wflh, ['Wasted', 'Severely Wasted']))) {
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

            // 4. Create Baseline Assessment
            $child->assessments()->create([
                'user_id' => Auth::id(),
                'date_of_weighing' => $validated['date_of_weighing'],
                'weight_kg' => $validated['weight_kg'],
                'height_cm' => $validated['height_cm'],
                'wfa_status' => $wfa,
                'hfa_status' => $hfa,
                'wflh_status' => $wflh,
                'intervention_logs' => $validated['intervention_logs'] ?? [],
                'remarks' => $validated['remarks'] ?? null,
                'bns_assessor' => $validated['bns_assessor'] ?? ($validated['bns_name'] ?? null),
                'sfp_day_number' => $sfpStatus === 'Enrolled' ? 1 : null,
            ]);

            return Redirect::route('admin.bcpc.index')->with('success', 'Child registered and evaluated successfully.');
        });
    }

    /**
     * Display a specific child profile & growth progression timeline.
     */
    public function show(int $id)
    {
        $child = BcpcChild::with(['assessments' => function ($q) {
            $q->orderBy('date_of_weighing', 'desc')->orderBy('id', 'desc');
        }, 'zone', 'member'])->findOrFail($id);

        // Auto-heal SFP state for enrollees if latest assessment recovered or completed 120 days
        if ($child->sfp_status === 'Enrolled' && $child->latestAssessment) {
            $latest = $child->latestAssessment;
            $weighingDate = Carbon::parse($latest->date_of_weighing);
            $startDate = $child->sfp_start_date ? Carbon::parse($child->sfp_start_date) : $weighingDate;
            $daysElapsed = $startDate->diffInDays($weighingDate);

            $wfa = $latest->wfa_status;
            $wflh = $latest->wflh_status ?? 'Normal';

            if ($wfa === 'Normal' && $wflh === 'Normal') {
                $child->update([
                    'sfp_status' => 'Graduated',
                    'sfp_end_date' => $latest->date_of_weighing,
                ]);
            } elseif ($daysElapsed >= 115) {
                $child->update([
                    'sfp_status' => ($wfa === 'Normal' && $wflh === 'Normal') ? 'Graduated' : 'Completed',
                    'sfp_end_date' => $latest->date_of_weighing,
                ]);
            }
        }

        $ageInMonths = $this->nutritionService->calculateAgeInMonths($child->date_of_birth->format('Y-m-d'), Carbon::now()->format('Y-m-d'));
        $years = floor($ageInMonths / 12);
        $months = $ageInMonths % 12;

        return Inertia::render('Admin/Bcpc/Show', [
            'child' => $child,
            'computedAge' => "{$years} Years, {$months} Months"
        ]);
    }

    /**
     * Update child record (Record new measurement / update SFP status).
     */
    public function update(Request $request, int $id)
    {
        $child = BcpcChild::findOrFail($id);

        $validated = $request->validate([
            'date_of_weighing' => 'required|date|after_or_equal:' . $child->date_of_birth->format('Y-m-d') . '|before_or_equal:today',
            'weight_kg' => 'required|numeric|min:1.5|max:35.0',
            'height_cm' => 'required|numeric|min:40.0|max:125.0',
            'intervention_logs' => 'nullable|array',
            'remarks' => 'nullable|string',
            'bns_assessor' => 'nullable|string|max:255',
            'sfp_day_number' => 'nullable|integer',
            'sfp_status' => 'nullable|string|in:None,Enrolled,Completed,Graduated,Terminated',
            'confirm_outlier' => 'nullable|boolean',
        ]);

        // 0-59 Months Lockout Check (OPT Plus Guideline)
        $ageInMonths = $this->nutritionService->calculateAgeInMonths($child->date_of_birth->format('Y-m-d'), $validated['date_of_weighing']);
        if ($ageInMonths >= 60) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'date_of_weighing' => 'Child has aged out of the Barangay e-OPT Plus program (0-59 months). Nutritional monitoring is now handled by the school sector.'
            ]);
        }

        // Secondary Backend Outlier Safeguard (unless user explicitly confirmed override)
        if (!$request->boolean('confirm_outlier')) {
            $outlierCheck = $this->nutritionService->isExtremeOutlier(
                $ageInMonths,
                $child->sex,
                (float)$validated['weight_kg'],
                (float)$validated['height_cm']
            );

            if ($outlierCheck['is_extreme']) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'weight_kg' => $outlierCheck['message'],
                    'height_cm' => 'Extreme biological outlier detected. Please verify measurement or confirm value.'
                ]);
            }
        }

        return DB::transaction(function () use ($validated, $child, $ageInMonths) {
            $wfa = $this->nutritionService->evaluateWeightForAge($ageInMonths, $child->sex, $validated['weight_kg']);
            $hfa = $this->nutritionService->evaluateHeightForAge($ageInMonths, $child->sex, $validated['height_cm']);
            $wflh = $this->nutritionService->evaluateWeightForLengthHeight($ageInMonths, $child->sex, $validated['weight_kg'], $validated['height_cm']);

            // NNC Bilateral Oedema (Fluid Retention) SAM Protocol Override (NNC Page 23)
            $interventionLogs = $validated['intervention_logs'] ?? [];
            if (in_array('Bilateral Oedema (Fluid Retention) [SAM PIMAM]', $interventionLogs)) {
                $wfa = 'Severely Underweight';
                $wflh = 'Severely Wasted';
            }

            // SFP Guardrail: SFP is contraindicated for Overweight / Obese children (Double Burden Protocol)
            $isOverweightOrObese = in_array($wflh, ['Overweight', 'Obese']);

            // 1. Auto-graduation & 120-Day Cycle Completion Rules (RA 11037 / NNC OPT+)
            $weighingDate = Carbon::parse($validated['date_of_weighing']);
            $sfpStartDate = $child->sfp_start_date;
            $sfpEndDate = $child->sfp_end_date;
            $daysElapsed = $sfpStartDate ? Carbon::parse($sfpStartDate)->diffInDays($weighingDate) : 0;
            $sfpStatus = $child->sfp_status;
            $isRelapse = false;

            if ($child->sfp_status === 'Enrolled') {
                if ($isOverweightOrObese) {
                    // Overnutrition detected -> Discharge from SFP to prevent overfeeding
                    $sfpStatus = 'Graduated';
                    $sfpEndDate = $validated['date_of_weighing'];
                } elseif ($wfa === 'Normal' && $wflh === 'Normal') {
                    // Child fully recovered to Normal status -> Graduated!
                    $sfpStatus = 'Graduated';
                    $sfpEndDate = $validated['date_of_weighing'];
                } elseif ($daysElapsed >= 115) {
                    // Completed full 120-Day Feeding Cycle
                    $sfpStatus = ($wfa === 'Normal' && $wflh === 'Normal') ? 'Graduated' : 'Completed';
                    $sfpEndDate = $validated['date_of_weighing'];
                }
            } elseif (in_array($child->sfp_status, ['Graduated', 'Completed'])) {
                // SFP Post-Graduation / Post-Completion Relapse Engine (Cycle 2 Intake)
                if (!$isOverweightOrObese && (in_array($wfa, ['Underweight', 'Severely Underweight']) || in_array($wflh, ['Wasted', 'Severely Wasted']))) {
                    $sfpStatus = 'Enrolled';
                    $sfpStartDate = $validated['date_of_weighing'];
                    $sfpEndDate = null;
                    $isRelapse = true;
                    if (!in_array('SFP Relapse Protocol (Cycle 2 Enrollment)', $interventionLogs)) {
                        array_unshift($interventionLogs, 'SFP Relapse Protocol (Cycle 2 Enrollment)');
                    }
                }
            } elseif ($child->sfp_status === 'None') {
                if (!$isOverweightOrObese && (in_array($wfa, ['Underweight', 'Severely Underweight']) || in_array($wflh, ['Wasted', 'Severely Wasted']))) {
                    if (!isset($validated['sfp_status']) || $validated['sfp_status'] === 'Enrolled') {
                        $sfpStatus = 'Enrolled';
                        $sfpStartDate = $validated['date_of_weighing'];
                        $sfpEndDate = null;
                    }
                }
            }

            // 2. Respect manual user dropdown overrides ONLY if explicitly changed from previous status
            if (isset($validated['sfp_status']) && !empty($validated['sfp_status']) && $validated['sfp_status'] !== $child->sfp_status) {
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

            $sfpDayNum = (isset($validated['sfp_day_number']) && (int)$validated['sfp_day_number'] > 0)
                ? (int)$validated['sfp_day_number']
                : null;

            if ($isRelapse) {
                $sfpDayNum = 1;
            }

            // Smart Auto-resolution for SFP milestone node if left unselected
            if (!$sfpDayNum && $sfpStartDate) {
                $daysElapsed = Carbon::parse($sfpStartDate)->diffInDays(Carbon::parse($validated['date_of_weighing']));
                if ($daysElapsed <= 7) {
                    $sfpDayNum = 1;
                } elseif ($daysElapsed >= 20 && $daysElapsed <= 40) {
                    $sfpDayNum = 30;
                } elseif ($daysElapsed >= 50 && $daysElapsed <= 70) {
                    $sfpDayNum = 60;
                } elseif ($daysElapsed >= 80 && $daysElapsed <= 100) {
                    $sfpDayNum = 90;
                } elseif ($daysElapsed >= 110 && $daysElapsed <= 130) {
                    $sfpDayNum = 120;
                } else {
                    $sfpDayNum = min(120, max(1, $daysElapsed));
                }
            }

            $remarks = $validated['remarks'] ?? null;
            if ($isRelapse && empty($remarks)) {
                $remarks = 'SFP Relapse Protocol: Nutritional relapse detected. Automatically re-enrolled into Cycle 2 SFP.';
            }

            // 3. Log assessment
            $assessment = $child->assessments()->create([
                'user_id' => Auth::id(),
                'date_of_weighing' => $validated['date_of_weighing'],
                'weight_kg' => $validated['weight_kg'],
                'height_cm' => $validated['height_cm'],
                'wfa_status' => $wfa,
                'hfa_status' => $hfa,
                'wflh_status' => $wflh,
                'intervention_logs' => $validated['intervention_logs'] ?? [],
                'remarks' => $validated['remarks'] ?? null,
                'bns_assessor' => $validated['bns_assessor'] ?? null,
                'sfp_day_number' => $sfpDayNum,
            ]);

            // Dispatch BCPC Assessment event if exists
            if (class_exists(\App\Events\BcpcAssessmentRecorded::class)) {
                event(new \App\Events\BcpcAssessmentRecorded($child, $assessment));
            }

            return Redirect::back()->with('success', 'New nutrition measurement recorded successfully.');
        });
    }

    /**
     * Printable Official DOH/NNC e-OPT Plus Master List & Executive Summary.
     */
    public function print()
    {
        $this->ensureZonesExist();
        $children = BcpcChild::with(['latestAssessment', 'zone'])->get();

        $metrics = [
            'total' => $children->count(),
            'sam' => $children->filter(fn($c) => $c->latestAssessment && ($c->latestAssessment->wfa_status === 'Severely Underweight' || ($c->latestAssessment->wflh_status ?? '') === 'Severely Wasted'))->count(),
            'mam' => $children->filter(fn($c) => $c->latestAssessment && ($c->latestAssessment->wfa_status === 'Underweight' || ($c->latestAssessment->wflh_status ?? '') === 'Wasted'))->count(),
            'stunted' => $children->filter(fn($c) => $c->latestAssessment && in_array($c->latestAssessment->hfa_status, ['Stunted', 'Severely Stunted']))->count(),
            'active_sfp' => $children->filter(fn($c) => $c->sfp_status === 'Enrolled')->count(),
            'graduated_sfp' => $children->filter(fn($c) => $c->sfp_status === 'Graduated')->count(),
        ];

        return Inertia::render('Admin/Bcpc/Print', [
            'monitoredChildren' => $children,
            'metrics' => $metrics,
            'generatedAt' => Carbon::now()->format('F d, Y'),
        ]);
    }

    /**
     * Ensure default zones (Puroks) exist for Barangay 183.
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
