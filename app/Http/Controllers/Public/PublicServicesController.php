<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicServicesController extends Controller
{
    public function vawc()
    {
        return Inertia::render('Public/VAWC/Index');
    }

    public function bcpc()
    {
        return Inertia::render('Public/BCPC/Index');
    }

    public function officials()
    {
        $officials = \App\Models\OrganizationalMember::with('user')
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();

        // Level 1: Head Committee (Top Tier)
        $level1 = $officials->filter(fn($o) => in_array($o->level, ['head', 'level_1']))->values();
        // Level 2: Secretary (Mid Tier)
        $level2 = $officials->filter(fn($o) => in_array($o->level, ['secretary', 'level_2']))->values();
        // Level 3: Staff & Officers (Operational Tier: Staff, AVAWC Officer, etc.)
        $level3 = $officials->filter(fn($o) => in_array($o->level, ['staff', 'level_3']))->values();

        return Inertia::render('Public/Officials/Index', [
            'level1' => $level1->all(),
            'level2' => $level2->all(),
            'level3' => $level3->all(),
            'head' => $level1->first() ?? null,
            'secretary' => $level2->first() ?? null,
            'staff' => $level3->all(),
        ]);
    }

    public function gad()
    {
        $activities = \App\Models\GadEvent::with('organization')
            ->where('status', 'approved')
            ->orderBy('event_date', 'desc')
            ->get();

        return Inertia::render('Public/GAD/Index', [
            'activities' => $activities,
        ]);
    }

    public function storeMembershipApplication(Request $request, \App\Services\MembershipService $service)
    {
        try {
            $service->submitApplication($request->all());
            return back()->with('success', 'Application received. Pending verification.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return back()->with('error', 'Something went wrong: ' . $e->getMessage());
        }
    }
    public function laws()
    {
        return Inertia::render('Public/Laws');
    }
}