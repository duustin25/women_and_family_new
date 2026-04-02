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
        // ADDED: with('user') to fetch the linked system account names
        $officials = \App\Models\OrganizationalMember::with('user')
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Public/Officials/Index', [
            'head' => $officials->where('level', 'head')->first(),
            'secretary' => $officials->where('level', 'secretary')->first(),
            // values()->all() resets the array keys so React maps over it cleanly
            'staff' => $officials->where('level', 'staff')->values()->all()
        ]);
    }

    public function gad()
    {
        $activities = \App\Models\GadEvent::where('status', 'approved')
            ->orderBy('event_date', 'desc')
            ->take(6)
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