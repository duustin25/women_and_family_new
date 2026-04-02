<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\MembershipApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MembershipController extends Controller
{
    private function getContext(): string
    {
        return Auth::check() ? 'admin' : 'public';
    }

    public function create(Organization $organization)
    {
        // Default to dynamic form
        $view = 'Public/Organizations/Apply/DynamicForm';

        return Inertia::render($view, [
            'organization' => $organization,
            'mode' => $this->getContext()
        ]);
    }

    public function store(Request $request, Organization $organization)
    {
        $isAdmin = Auth::check();

        // 1. VALIDATE CORE FIELDS FIRST
        $request->validate([
            'fullname' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'email' => 'required|email|max:255', // Required for Magic Link Portal
        ]);

        $fullname = $request->input('fullname');
        $address = $request->input('address');
        $email = $request->input('email');

        // 2. DUPLICATE CHECK (Prevent flooding)
        // Check if this person has an active application (Pending or Approved)
        $existingApplication = $organization->membershipApplications()
            ->where('fullname', $fullname)
            ->whereIn('status', ['Pending', 'Approved'])
            ->first();

        if ($existingApplication) {
            return back()->withErrors([
                'fullname' => 'An active application (Pending or Approved) already exists for this name.'
            ]);
        }

        // 3. SUBMISSION DATA VALIDATION (Dynamic)
        $rules = [
            'form_data' => 'nullable|array',
        ];

        // 4. DYNAMIC VALIDATION LOGIC
        $customAttributes = []; // Store label mappings

        if (!empty($organization->form_schema)) {
            foreach ($organization->form_schema as $field) {
                // Determine validation rules for this field
                $fieldRules = [];

                if (!empty($field['required']) && $field['required'] == true) {
                    $fieldRules[] = 'required';
                } else {
                    $fieldRules[] = 'nullable';
                }

                // Type-based rules
                switch ($field['type']) {
                    case 'email':
                        $fieldRules[] = 'email:rfc,dns';
                        break;
                    case 'number':
                        $fieldRules[] = 'numeric';
                        break;
                    case 'date':
                        $fieldRules[] = 'date';
                        break;
                    case 'file':
                        // Basic file validation
                        $fieldRules[] = 'file';
                        $fieldRules[] = 'mimes:jpg,jpeg,png,pdf';
                        $fieldRules[] = 'max:5120'; // 5MB
                        break;
                    case 'checkbox':
                        $fieldRules[] = 'boolean';
                        break;
                    case 'repeater':
                        $fieldRules[] = 'nullable';
                        $fieldRules[] = 'array';
                        break;
                    default:
                        $fieldRules[] = 'string'; // Default string for text, select, etc.
                        // Ideally we could relax this for arrays (checkbox_group)
                        if ($field['type'] === 'checkbox_group') {
                            $fieldRules = ['nullable', 'array']; // Override for arrays
                        }
                        break;
                }

                $fieldId = $field['id'];
                $dbFieldKey = 'form_data.' . $fieldId;

                $rules[$dbFieldKey] = $fieldRules;
                $customAttributes[$dbFieldKey] = $field['label']; // Map ID to Label
            }
        }

        $validated = $request->validate($rules, [
            'form_data.*.required' => 'The :attribute is required.', // Use :attribute placeholder
        ], $customAttributes);

        // 5. HANDLE FILE UPLOADS
        // Logic: Iterate through schema, if it's a file type, check request, store, and replace value with path.
        // Re-fetch submission data from validated or request to ensure we have it
        $finalSubmissionData = $request->input('form_data', []);

        // Ensure submissionData is an array
        if (!is_array($finalSubmissionData)) {
            $finalSubmissionData = [];
        }

        if (!empty($organization->form_schema)) {
            foreach ($organization->form_schema as $field) {
                if ($field['type'] === 'file') {
                    $fieldId = $field['id'];
                    // Check if file exists in the request using dot notation
                    if ($request->hasFile("form_data.$fieldId")) {
                        $file = $request->file("form_data.$fieldId");
                        if ($file->isValid()) {
                            // Store file
                            $path = $file->store('uploads/requirements', 'public');
                            // Update the data array with the path string
                            $finalSubmissionData[$fieldId] = $path;
                        }
                    }
                }
            }
        }

        // 6. PERSISTENCE
        $application = $organization->membershipApplications()->create([
            'fullname' => $fullname,
            'address' => $address,
            'email' => $email, // NEW COLUMN
            // We store the dynamic answers in the new JSON column
            'form_data' => $finalSubmissionData,
            'status' => $isAdmin ? 'Approved' : 'Pending',
            'approved_by' => $isAdmin ? Auth::user()->name : null,
            'actioned_at' => $isAdmin ? now() : null,
        ]);

        // Automatically sends an Email due to logic of the system na may automatic approve pag admin nag encode ng data
        if ($isAdmin) {
            event(new \App\Events\ApplicationApproved($application));
        }


        // 5. FLASH MESSAGE REDIRECT
        if ($isAdmin) {
            return redirect()->route('admin.applications.index')
                ->with('success', 'Manual record for ' . $fullname . ' has been registered.');
        }

        return redirect()->route('public.organizations.show', $organization->slug)
            ->with('success', 'Application Submitted! Please wait for Barangay verification.');
    }

    public function print(Organization $organization, MembershipApplication $application)
    {
        // Simple security: Ensure application belongs to organization
        if ($application->organization_id !== $organization->id) {
            abort(404);
        }

        return Inertia::render('Public/Organizations/Apply/PrintView', [
            'organization' => new \App\Http\Resources\OrganizationResource($organization),
            'application' => new \App\Http\Resources\MembershipApplicationResource($application),
        ]);
    }
}
