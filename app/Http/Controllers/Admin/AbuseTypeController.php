<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CaseAbuseType;
use Illuminate\Http\Request;

class AbuseTypeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:case_abuse_types,name',
            'color' => 'nullable|string|max:7', // Hex code
        ]);

        // Auto assign a random color if not provided 
        // (Just a nicety)
        if (empty($validated['color'])) {
            $validated['color'] = '#' . dechex(rand(0x000000, 0xFFFFFF));
        }

        CaseAbuseType::create($validated);

        return back()->with('success', 'New abuse type added.');
    }

    public function destroy($id)
    {
        CaseAbuseType::destroy($id);
        return back()->with('success', 'Abuse type removed.');
    }
}
