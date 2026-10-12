<?php

namespace App\Services\Analytics;

use App\Models\Member;
use App\Models\MemberCommunication;
use App\Models\MembershipApplication;
use App\Models\Organization;
use App\Models\User;
use Carbon\Carbon;

class OrganizationMetricsService
{
    public function __construct(
        protected GadCommunityAnalyticsService $gadService
    ) {}

    /**
     * Get membership application growth trends.
     */
    public function getMembershipTrends(int $year, ?User $user = null): array
    {
        $query = MembershipApplication::approved()
            ->whereYear('created_at', $year);

        if ($user && $user->isPresident()) {
            $query->where('organization_id', $user->organization_id);
        }

        $memberships = $query->get()
            ->groupBy(fn($m) => Carbon::parse($m->created_at)->month)
            ->map(fn($group) => count($group));

        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $data = [];
        foreach ($months as $index => $monthName) {
            $data[] = [
                'month' => $monthName,
                'count' => $memberships->get($index + 1, 0),
            ];
        }

        $totalThisYear = MembershipApplication::approved()->whereYear('created_at', $year)->count();
        $totalLastYear = MembershipApplication::approved()->whereYear('created_at', $year - 1)->count();

        $growth = '+0%';
        if ($totalLastYear > 0) {
            $percent = (($totalThisYear - $totalLastYear) / $totalLastYear) * 100;
            $growth = ($percent >= 0 ? '+' : '') . number_format($percent, 1) . '%';
        } elseif ($totalThisYear > 0) {
            $growth = '+100%';
        }

        return [
            'total'   => $totalThisYear,
            'growth'  => $growth,
            'monthly' => $data,
        ];
    }

    /**
     * Get detailed analytics for GAD Organizations & Membership.
     */
    public function getOrganizationAnalytics(int $year, ?int $orgId = null): array
    {
        $demographics = $this->extractMemberDemographics($orgId);

        return [
            'total_members'             => $demographics['total'],
            'age_distribution'          => $demographics['age'],
            'gender_distribution'       => $demographics['gender'],
            'civil_status_distribution' => $demographics['civil_status'],
            'purok_distribution'        => $demographics['purok'],
            'applications'              => $this->getApplicationsAnalytics($year, $orgId),
            'gad'                       => $this->gadService->getGadEventsAnalytics($year, $orgId),
            'communications'           => $this->getCommunicationsAnalytics($year, $orgId),
            'organizations_list'        => Organization::all()->map(fn($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'slug' => $o->slug,
                'members_count' => $o->membershipApplications()->approved()->count()
            ])->toArray(),
        ];
    }

    /**
     * Extract age, gender, civil status, and purok demographic profiles from members metadata.
     */
    public function extractMemberDemographics(?int $orgId = null): array
    {
        $membersQuery = Member::active();
        if ($orgId) {
            $membersQuery->where('organization_id', $orgId);
        }
        $members = $membersQuery->with(['organization', 'application'])->get();

        $ageCategories = [
            'Under 18 (Youth)' => 0,
            '18-30 (Young Adult)' => 0,
            '31-50 (Adult)' => 0,
            '51-64 (Middle-aged)' => 0,
            '65+ (Senior)' => 0,
            'Unknown' => 0
        ];

        $genderCategories = [
            'Male' => 0,
            'Female' => 0,
            'Other/Not Disclosed' => 0
        ];

        $civilStatusCategories = [
            'Single' => 0,
            'Married' => 0,
            'Widowed' => 0,
            'Separated' => 0,
            'Unknown' => 0
        ];

        $purokDistribution = [];

        foreach ($members as $member) {
            $meta = $member->member_meta ?: [];

            // Age extraction
            $age = null;
            foreach ($meta as $key => $val) {
                if (str_ends_with($key, '_age') || $key === 'age') {
                    if (is_numeric($val)) {
                        $age = (int)$val;
                        break;
                    }
                }
                if (str_ends_with($key, '_dob') || str_ends_with($key, '_date_of_birth') || $key === 'dob' || $key === 'date_of_birth') {
                    try {
                        $age = Carbon::parse($val)->age;
                        break;
                    } catch (\Throwable $e) {
                    }
                }
            }
            if ($age !== null) {
                if ($age < 18) $ageCategories['Under 18 (Youth)']++;
                elseif ($age <= 30) $ageCategories['18-30 (Young Adult)']++;
                elseif ($age <= 50) $ageCategories['31-50 (Adult)']++;
                elseif ($age <= 64) $ageCategories['51-64 (Middle-aged)']++;
                else $ageCategories['65+ (Senior)']++;
            } else {
                $ageCategories['Unknown']++;
            }

            // Gender extraction
            $gender = null;
            foreach ($meta as $key => $val) {
                if (str_ends_with($key, '_sex') || str_ends_with($key, '_gender') || $key === 'sex' || $key === 'gender') {
                    $gender = ucfirst(strtolower(trim($val)));
                    break;
                }
            }
            if (!$gender && $member->organization) {
                $orgSlug = $member->organization->slug;
                if (str_contains($orgSlug, 'erpat') || str_contains($orgSlug, 'father')) {
                    $gender = 'Male';
                } elseif (str_contains($orgSlug, 'kalipi') || str_contains($orgSlug, 'woman') || str_contains($orgSlug, 'women')) {
                    $gender = 'Female';
                }
            }
            if ($gender === 'Male' || $gender === 'M') {
                $genderCategories['Male']++;
            } elseif ($gender === 'Female' || $gender === 'F') {
                $genderCategories['Female']++;
            } else {
                $genderCategories['Other/Not Disclosed']++;
            }

            // Civil status extraction
            $civilStatus = null;
            foreach ($meta as $key => $val) {
                if (str_ends_with($key, '_civil_status') || str_ends_with($key, '_marital') || $key === 'civil_status' || $key === 'marital_status') {
                    $civilStatus = ucfirst(strtolower(trim($val)));
                    break;
                }
            }
            if ($civilStatus) {
                if (str_contains($civilStatus, 'Single')) $civilStatusCategories['Single']++;
                elseif (str_contains($civilStatus, 'Married')) $civilStatusCategories['Married']++;
                elseif (str_contains($civilStatus, 'Widow')) $civilStatusCategories['Widowed']++;
                elseif (str_contains($civilStatus, 'Separated') || str_contains($civilStatus, 'Divorced')) $civilStatusCategories['Separated']++;
                else $civilStatusCategories['Unknown']++;
            } else {
                $civilStatusCategories['Unknown']++;
            }

            // Purok/Zone extraction
            $purok = null;
            foreach ($meta as $key => $val) {
                if (str_ends_with($key, '_zone') || str_ends_with($key, '_purok') || $key === 'zone' || $key === 'purok') {
                    $purok = trim($val);
                    break;
                }
            }
            $address = $meta['address'] ?? ($member->application->address ?? null);
            if (!$purok && $address) {
                if (preg_match('/(Purok\s*\d+|Zone\s*\d+)/i', $address, $matches)) {
                    $purok = ucwords(strtolower($matches[0]));
                }
            }
            if (!$purok) {
                $purok = 'Not Disclosed';
            }
            $purokDistribution[$purok] = ($purokDistribution[$purok] ?? 0) + 1;
        }

        $purokData = [];
        foreach ($purokDistribution as $purokName => $count) {
            $purokData[] = ['name' => $purokName, 'count' => $count];
        }
        usort($purokData, fn($a, $b) => $b['count'] <=> $a['count']);

        $ageData = [];
        foreach ($ageCategories as $name => $count) {
            if ($count > 0 || $name === 'Unknown') {
                $ageData[] = ['name' => $name, 'value' => $count];
            }
        }
        $genderData = [];
        foreach ($genderCategories as $name => $count) {
            $genderData[] = ['name' => $name, 'value' => $count];
        }
        $civilStatusData = [];
        foreach ($civilStatusCategories as $name => $count) {
            if ($count > 0) {
                $civilStatusData[] = ['name' => $name, 'value' => $count];
            }
        }

        return [
            'total' => $members->count(),
            'age' => $ageData,
            'gender' => $genderData,
            'civil_status' => $civilStatusData,
            'purok' => $purokData,
        ];
    }

    /**
     * Get monthly membership applications metrics.
     */
    public function getApplicationsAnalytics(int $year, ?int $orgId = null): array
    {
        $appsQuery = MembershipApplication::whereYear('created_at', $year);
        if ($orgId) {
            $appsQuery->where('organization_id', $orgId);
        }
        $apps = $appsQuery->get();

        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $monthlyApps = [];
        $appsByMonth = $apps->groupBy(fn($a) => Carbon::parse($a->created_at)->month);
        foreach ($months as $idx => $mName) {
            $mNum = $idx + 1;
            $monthGroup = $appsByMonth->get($mNum, collect());
            $monthlyApps[] = [
                'month' => $mName,
                'submitted' => $monthGroup->count(),
                'approved' => $monthGroup->where('status', 'Approved')->count(),
                'disapproved' => $monthGroup->where('status', 'Disapproved')->count(),
            ];
        }

        return [
            'total' => $apps->count(),
            'approved' => $apps->where('status', 'Approved')->count(),
            'pending' => $apps->where('status', 'Pending')->count(),
            'disapproved' => $apps->where('status', 'Disapproved')->count(),
            'monthly_trend' => $monthlyApps,
        ];
    }

    /**
     * Get member communications messaging metrics.
     */
    public function getCommunicationsAnalytics(int $year, ?int $orgId = null): array
    {
        $commQuery = MemberCommunication::query()
            ->join('members', 'member_communications.member_id', '=', 'members.id')
            ->whereYear('member_communications.created_at', $year);
        if ($orgId) {
            $commQuery->where('members.organization_id', $orgId);
        }
        $commQuery->select('member_communications.*');
        $comms = $commQuery->get();

        $months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $monthlyComms = [];
        $commsByMonth = $comms->groupBy(fn($c) => Carbon::parse($c->created_at)->month);
        foreach ($months as $idx => $mName) {
            $mNum = $idx + 1;
            $monthGroup = $commsByMonth->get($mNum, collect());
            $monthlyComms[] = [
                'month' => $mName,
                'sent' => $monthGroup->count(),
            ];
        }

        return [
            'total' => $comms->count(),
            'sent' => $comms->where('status', 'Sent')->count(),
            'failed' => $comms->where('status', 'Failed')->count(),
            'monthly_trend' => $monthlyComms,
        ];
    }
}
