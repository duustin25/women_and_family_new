<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\MembershipApplication;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class MembershipService
{
    /**
     * Handle the creation of a new membership application.
     * Strategy: Accepts raw request data, validates based on rules, constructs JSON, and saves.
     */
    public function submitApplication(array $data)
    {
        // 1. Basic Validation
        $validator = Validator::make($data, [
            'organization_id' => 'required|exists:organizations,id',
            'fullname' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'birthdate' => 'required|date',
            'sex' => 'required|string',
            'civil_status' => 'required|string',
            'contact_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // 2. Organization Specific Check (Strategy Trigger)
        // In a more complex app, we might load a specific Strategy Class here based on Org Slug.
        // For now, we will handle the JSON construction flexibly.

        // 3. Construct JSON Data Arrays
        $personalData = [
            'birthdate' => $data['birthdate'],
            'sex' => $data['sex'],
            'civil_status' => $data['civil_status'],
            'contact_number' => $data['contact_number'],
            'occupation' => $data['occupation'] ?? null,
            'skills' => $data['skills'] ?? null,
            // Add any other dynamic fields passed that aren't top-level
        ];

        $familyData = [
            'num_children' => $data['num_children'] ?? 0,
            // Future: Loop through 'dependents' array if provided
        ];

        // 4. Create the Record
        return MembershipApplication::create([
            'organization_id' => $data['organization_id'],
            'fullname' => $data['fullname'],
            'address' => $data['address'],
            'personal_data' => $personalData,
            'family_data' => $familyData,
            'status' => 'pending',
        ]);
    }

    /**
     * Get applications scoped by User Role.
     */
    public function getScopedApplications($user, $filters = [], $perPage = 10)
    {
        $query = MembershipApplication::with('organization')->latest();

        // 1. RBAC Scoping
        if ($user->isPresident()) {
            $query->where('organization_id', $user->organization_id);
        }

        // 2. Apply Filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%"); // Search by ID too
            });
        }

        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['organization_id']) && $filters['organization_id'] !== 'All') {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['income']) && $filters['income'] !== 'All') {
            $query->where('personal_data->monthly_income', $filters['income']);
        }

        return $query->paginate($perPage)->withQueryString();
    }
}
