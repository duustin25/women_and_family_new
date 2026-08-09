<?php

namespace App\Services;

use App\Models\GadEvent;
use App\Models\Organization;
use App\Models\MembershipApplication;
use Carbon\Carbon;

class GadAnalyticsService
{
    /**
     * Get GAD programs, budget allocations, and organization membership analytics.
     */
    public function getOrganizationAnalytics(int $year): array
    {
        $totalOrgs = Organization::count();
        $totalMembers = MembershipApplication::where('status', 'approved')->count();
        $pendingApplications = MembershipApplication::where('status', 'pending')->count();
        $totalGadEvents = GadEvent::whereYear('created_at', $year)->count();

        $orgBreakdown = Organization::withCount(['membershipApplications as approved_members' => function ($q) {
            $q->where('status', 'approved');
        }])->get()->map(function ($org) {
            return [
                'id' => $org->id,
                'name' => $org->name,
                'slug' => $org->slug,
                'approved_members' => $org->approved_members,
            ];
        });

        return [
            'total_organizations'  => $totalOrgs,
            'total_approved_members' => $totalMembers,
            'pending_applications' => $pendingApplications,
            'gad_events_count'     => $totalGadEvents,
            'organization_members' => $orgBreakdown,
        ];
    }
}
