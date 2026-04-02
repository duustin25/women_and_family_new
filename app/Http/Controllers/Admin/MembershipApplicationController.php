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
        $organizations = Organization::orderBy('name')->get();

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

    public function create()
    {
        $organizations = Organization::orderBy('name')->get();

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
}
