<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MembershipApplication;
use App\Http\Resources\MembershipApplicationResource;
use Illuminate\Http\Request;
use App\Models\Organization;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MembershipApplicationController extends Controller
{
    /**
     * Display a listing of all membership applications.
     */
    public function index(Request $request, \App\Services\MembershipService $service)
    {
        // RBAC: Use Service to scope applications (President sees only their Org, Admin sees all)
        // Pass query params as filters
        $filters = $request->only(['search', 'status', 'organization_id', 'income']);
        $applications = $service->getScopedApplications($request->user(), $filters);

        // Fetch organizations for filter dropdown
        if ($request->user()->isPresident()) {
            $organizations = Organization::where('id', $request->user()->organization_id)->get();
        } else {
            $organizations = Organization::orderBy('name')->get();
        }

        // Fetch distinct monthly_income values from personal_data JSON for the filter dropdown
        // Uses MySQL JSON extraction syntax. If using SQLite/Postgres, syntax might vary slightly, 
        // but '->>' is standard in Laravel for JSON extraction in where/select.
        $incomes = MembershipApplication::selectRaw("JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.monthly_income')) as income")
            ->whereNotNull('form_data->monthly_income')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.monthly_income')) != ''")
            ->distinct()
            ->pluck('income')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('Admin/Applications/Index', [
            'applications' => MembershipApplicationResource::collection($applications),
            'filters' => $filters,
            'organizations' => $organizations,
            'incomes' => $incomes
        ]);
    }

    public function create(Request $request)
    {
        $query = Organization::with('president')->orderBy('name');

        if ($request->user()->isPresident()) {
            $query->where('id', $request->user()->organization_id);
        }

        $organizations = $query->get()->map(function ($org) {
            return [
                'id' => $org->id,
                'name' => $org->name,
                'slug' => $org->slug,
                'description' => $org->description,
                'president_name' => $org->president?->name,
                'color_theme' => $org->color_theme,
            ];
        });

        // Ensure this matches: resources/js/Pages/Admin/Applications/Create.tsx
        return Inertia::render('Admin/Applications/Create', [
            'organizations' => $organizations
        ]);
    }

    /**
     * Show the manual encoding form for a specific organization in admin context.
     */
    public function encode(Organization $organization)
    {
        return Inertia::render('Public/Organizations/Apply/DynamicForm', [
            'organization' => $organization,
            'mode' => 'admin'
        ]);
    }

    /**
     * Display the specific application for review.
     */
    // Inside MembershipApplicationController.php
    public function show(MembershipApplication $application)
    {
        // RBAC: President check
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->isPresident() && $user->organization_id !== $application->organization_id) {
            abort(403, 'Unauthorized. This application belongs to another organization.');
        }

        $application->load('organization');

        // All applications now use the unified dynamic review page
        $view = 'Admin/Applications/ReviewData';

        return Inertia::render($view, [
            'application' => new MembershipApplicationResource($application),
            'organization' => new \App\Http\Resources\OrganizationResource($application->organization),
            'mode' => 'admin'
        ]);
    }


    /**
     * Update the status of the application (Approve/Disapprove).
     */
    public function updateStatus(Request $request, MembershipApplication $application)
    {
        // RBAC: President check
        /** @var \App\Models\User $user */
        $user = $request->user();
        if ($user->isPresident() && $user->organization_id !== $application->organization_id) {
            abort(403, 'Unauthorized to update this application.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Approved,Disapproved',
        ]);

        $previousStatus = $application->status;

        $application->update([
            'status' => $validated['status'],
            'approved_by' => Auth::user()->name, // Track which admin actioned this
            'actioned_at' => now(),
        ]);

        // Trigger side effects when approved (Member creation, Email sequence)
        if ($validated['status'] === 'Approved' && $previousStatus !== 'Approved') {
            event(new \App\Events\ApplicationApproved($application));
        } else if ($validated['status'] === 'Disapproved' && $previousStatus !== 'Disapproved') {
            event(new \App\Events\ApplicationDisapproved($application));
        }

        return redirect()->route('admin.applications.index')
            ->with('success', "Application has been {$validated['status']}.");
    }

    /**
     * Print the application in an official layout.
     */
    public function print(MembershipApplication $application)
    {
        // RBAC: President check
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->isPresident() && $user->organization_id !== $application->organization_id) {
            abort(403, 'Unauthorized to print this application.');
        }

        $application->load(['organization']);

        return Inertia::render('Admin/Applications/Print', [
            'application' => new MembershipApplicationResource($application),
            'organization' => new \App\Http\Resources\OrganizationResource($application->organization),
        ]);
    }

    /**
     * Show the form for editing the application.
     */
    public function edit(MembershipApplication $application)
    {
        // RBAC: President check
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->isPresident() && $user->organization_id !== $application->organization_id) {
            abort(403, 'Unauthorized to edit this application.');
        }

        $application->load('organization');

        // Use generic edit form for all
        return Inertia::render('Admin/Applications/Edit', [
            'application' => new MembershipApplicationResource($application),
            'organization' => new \App\Http\Resources\OrganizationResource($application->organization),
        ]);
    }

    /**
     * Update the application data.
     */
    public function update(Request $request, MembershipApplication $application)
    {
        // RBAC: President check
        /** @var \App\Models\User $user */
        $user = $request->user();
        if ($user->isPresident() && $user->organization_id !== $application->organization_id) {
            abort(403, 'Unauthorized to update this application.');
        }

        // 1. Validate Basic Info
        $validated = $request->validate([
            'fullname' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:255',
            // We allow updating the JSON blobs directly if needed, or specific fields
            'form_data' => 'nullable|array',
        ]);

        // 2. Update the record
        $application->update($validated);

        // 3. Sync with Member Record if it exists (KEEPS THEM CONNECTED)
        $member = \App\Models\Member::where('membership_application_id', $application->id)->first();
        if ($member) {
            $member->update([
                'fullname' => $application->fullname,
                'email' => $application->email ?? ($application->form_data['email'] ?? $member->email),
                'phone' => $application->form_data['contact'] ?? ($application->form_data['contact_number'] ?? $member->phone),
            ]);
        }

        // 3. Log the "Edit" action in Audit Logs (Optional but recommended)
        // \App\Models\AuditLog::create([ ... ]); 
        // For now, we rely on the system user knowing they did it. 
        // If you have a specific Audit Service, call it here.

        return redirect()->route('admin.applications.show', $application->id)
            ->with('success', 'Application details updated successfully.');
    }

    /**
     * Reject application with a mandatory rejection reason.
     */
    public function reject(Request $request, $id, \App\Services\OrganizationGovernanceService $service)
    {
        $request->validate([
            'reason' => 'required|string|min:5',
        ]);

        $application = MembershipApplication::findOrFail($id);
        
        /** @var \App\Models\User $user */
        $user = $request->user();
        if ($user->isPresident() && $user->organization_id !== $application->organization_id) {
            abort(403, 'Unauthorized to reject this application.');
        }

        $service->rejectApplication($application, $request->input('reason'), $request->user()->name);

        return redirect()->back()->with('success', "Application rejected with documented reason.");
    }

    /**
     * Resident submits an appeal against rejection.
     */
    public function appeal(Request $request, $id, \App\Services\OrganizationGovernanceService $service)
    {
        $request->validate([
            'appeal_reason' => 'required|string|min:10|max:500',
        ], [
            'appeal_reason.required' => 'Please provide an appeal statement.',
            'appeal_reason.min' => 'Appeal statement must be at least 10 characters.',
            'appeal_reason.max' => 'Appeal statement must not exceed 500 characters to keep review concise.',
        ]);

        $application = MembershipApplication::findOrFail($id);
        try {
            $service->submitAppeal($application, $request->input('appeal_reason'));
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['appeal_reason' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', "Appeal submitted successfully! Escalated to Barangay Admin Command Center.");
    }

    /**
     * Barangay Admin overrules rejection and force-approves application.
     */
    public function overrule(Request $request, $id, \App\Services\OrganizationGovernanceService $service)
    {
        if ($request->user()->isPresident()) {
            abort(403, 'Unauthorized. Only Barangay Administrators can overrule organization rejections.');
        }

        $application = MembershipApplication::findOrFail($id);
        $service->overruleAndApprove($application, $request->user()->name);

        return redirect()->back()->with('success', "Barangay Admin overruled rejection and approved the application.");
    }

    /**
     * Barangay Admin sustains officer rejection decision after reviewing resident appeal.
     */
    public function sustain(Request $request, $id, \App\Services\OrganizationGovernanceService $service)
    {
        if ($request->user()->isPresident()) {
            abort(403, 'Unauthorized. Only Barangay Administrators can action appeals.');
        }

        $application = MembershipApplication::findOrFail($id);
        $service->sustainDisapproval($application, $request->user()->name);

        return redirect()->back()->with('success', "Disapproval sustained. Resident appeal resolved and closed.");
    }

    /**
     * Display Appeals Queue for Barangay Admin.
     */
    public function appeals(Request $request)
    {
        if ($request->user()->isPresident()) {
            abort(403, 'Unauthorized. Governance Appeals Queue is strictly managed by Barangay Administrators.');
        }

        $tab = $request->input('tab', 'active');

        $query = MembershipApplication::with('organization');

        if ($tab === 'history') {
            // Appeals history (Overruled or Sustained)
            $query->where(function ($q) {
                $q->whereIn('approval_type', ['admin_overrule', 'admin_sustained'])
                    ->orWhereIn('status', [
                        MembershipApplication::STATUS_FINAL_DISAPPROVED,
                        'Final Disapproved',
                        'final_disapproved',
                    ]);
            });
        } else {
            // Active appeals queue (Only applications submitted for appeal)
            $query->whereIn('status', [
                MembershipApplication::STATUS_APPEALED,
                'Appealed',
                'appealed',
            ]);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('appeal_reason', 'like', "%{$search}%")
                  ->orWhereHas('organization', function ($orgQ) use ($search) {
                      $orgQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $appeals = $query->latest('updated_at')->paginate(10)->withQueryString();

        $stats = [
            'active_count' => MembershipApplication::whereIn('status', [
                MembershipApplication::STATUS_APPEALED,
                'Appealed',
                'appealed',
            ])->count(),
            'overruled_count' => MembershipApplication::where('approval_type', 'admin_overrule')->count(),
            'sustained_count' => MembershipApplication::where(function ($q) {
                $q->where('approval_type', 'admin_sustained')
                    ->orWhereIn('status', [
                        MembershipApplication::STATUS_FINAL_DISAPPROVED,
                        'Final Disapproved',
                        'final_disapproved',
                    ]);
            })->count(),
        ];
        $stats['total_resolved'] = $stats['overruled_count'] + $stats['sustained_count'];

        return Inertia::render('Admin/Applications/AppealsIndex', [
            'appeals' => $appeals,
            'tab' => $tab,
            'filters' => $request->only('search', 'tab'),
            'stats' => $stats,
        ]);
    }
}
