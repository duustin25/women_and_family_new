<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CaseAbuseType;
use App\Models\Agency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $abuseTypes = CaseAbuseType::orderBy('category')->orderBy('name')->get();
        $zones = \App\Models\Zone::orderBy('name')->get();

        return Inertia::render('Admin/Settings/Index', [
            'abuseTypes' => $abuseTypes,
            'referralPartners' => [], // Deprecated
            'caseStatuses' => [], // Deprecated
            'zones' => $zones
        ]);
    }

    public function storeAbuseType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:case_types,name',
            'category' => 'required|string|in:VAWC,BCPC,Both',
            'color' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        CaseAbuseType::create($validated);

        return back()->with('success', 'Abuse Type added successfully.');
    }

    public function updateAbuseType(Request $request, $id)
    {
        $type = CaseAbuseType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:case_types,name,' . $id,
            'category' => 'sometimes|required|string|in:VAWC,BCPC,Both',
            'color' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $type->update($validated);

        return back()->with('success', 'Abuse Type updated.');
    }



    public function storeZone(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:zones,name',
        ]);

        \App\Models\Zone::create($validated);

        return back()->with('success', 'Zone added successfully.');
    }

    public function updateZone(Request $request, $id)
    {
        $zone = \App\Models\Zone::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:zones,name,' . $id,
            'is_active' => 'boolean'
        ]);

        $zone->update($validated);

        return back()->with('success', 'Zone updated.');
    }
}
