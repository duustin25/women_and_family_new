<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationalMember;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OfficialController extends Controller
{
    public function index()
    {
        $officials = OrganizationalMember::with('user')
            ->orderBy('level')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Admin/Officials/Index', [
            'officials' => $officials
        ]);
    }

    public function create()
    {
        $availableUsers = \App\Models\User::select('id', 'name')->get();
        return Inertia::render('Admin/Officials/Create', [
            'users' => $availableUsers
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user_id === '0' || $request->user_id === 'none' || empty($request->user_id)) {
            $request->merge(['user_id' => null]);
        }

        $rules = [
            'user_id' => 'nullable|exists:users,id|unique:organizational_members,user_id',
            'name' => 'required_without:user_id|nullable|string|max:255',
            'position' => 'required|string|max:255',
            'committee' => 'nullable|string|max:255',
            'level' => 'required|in:level_1,level_2,level_3,head,secretary,staff',
            'image_path' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif|max:5120',
        ];

        $validated = $request->validate($rules);

        // Clear name if linking an account to keep it normalized
        if (!empty($validated['user_id'])) {
            $validated['name'] = null;
        }

        if (in_array($request->level, ['head', 'level_1'])) {
            if (OrganizationalMember::whereIn('level', ['head', 'level_1'])->exists()) {
                return back()->withErrors(['level' => 'A Level 1 Head Committee is already assigned. Please reassign the current one first.']);
            }
        }

        if (in_array($request->level, ['secretary', 'level_2'])) {
            if (OrganizationalMember::whereIn('level', ['secretary', 'level_2'])->exists()) {
                return back()->withErrors(['level' => 'A Level 2 Secretary is already assigned. Please reassign the current one first.']);
            }
        }

        if ($request->hasFile('image_path')) {
            try {
                if (!Storage::disk('public')->exists('officials')) {
                    Storage::disk('public')->makeDirectory('officials');
                }
                $path = $request->file('image_path')->store('officials', 'public');
                $validated['image_path'] = '/storage/' . $path;
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Official image upload failed: " . $e->getMessage());
                return back()->withErrors(['image_path' => 'Unable to save the uploaded image. Please ensure the file is under 5MB.']);
            }
        }

        OrganizationalMember::create($validated);
        return redirect()->route('admin.settings.index', ['tab' => 'officials'])->with('success', 'Official added successfully.');
    }

    public function edit($id)
    {
        $official = OrganizationalMember::findOrFail($id);
        $availableUsers = \App\Models\User::select('id', 'name')->get();

        return Inertia::render('Admin/Officials/Edit', [
            'official' => $official,
            'users' => $availableUsers
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($request->user_id === '0' || $request->user_id === 'none' || empty($request->user_id)) {
            $request->merge(['user_id' => null]);
        }

        $official = OrganizationalMember::findOrFail($id);

        $rules = [
            'user_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('organizational_members', 'user_id')->ignore($id)
            ],
            'name' => 'required_without:user_id|nullable|string|max:255',
            'position' => 'required|string|max:255',
            'committee' => 'nullable|string|max:255',
            'level' => 'required|in:level_1,level_2,level_3,head,secretary,staff',
            'image_path' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'is_active' => 'boolean'
        ];

        $validated = $request->validate($rules);

        // Clear name if linking an account to keep it normalized
        if (!empty($validated['user_id'])) {
            $validated['name'] = null;
        }

        // ENFORCE RULE: Only 1 Level 1 Head, Only 1 Level 2 Secretary (Excluding self)
        if (in_array($request->level, ['head', 'level_1'])) {
            if (OrganizationalMember::whereIn('level', ['head', 'level_1'])->where('id', '!=', $id)->exists()) {
                return back()->withErrors(['level' => 'A Level 1 Head Committee is already assigned.']);
            }
        }
        if (in_array($request->level, ['secretary', 'level_2'])) {
            if (OrganizationalMember::whereIn('level', ['secretary', 'level_2'])->where('id', '!=', $id)->exists()) {
                return back()->withErrors(['level' => 'A Level 2 Secretary is already assigned.']);
            }
        }

        if ($request->hasFile('image_path')) {
            try {
                if ($official->image_path) {
                    $relativePath = str_replace('/storage/', '', $official->image_path);
                    try {
                        Storage::disk('public')->delete($relativePath);
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::warning("Could not delete previous official image: " . $e->getMessage());
                    }
                }
                if (!Storage::disk('public')->exists('officials')) {
                    Storage::disk('public')->makeDirectory('officials');
                }
                $path = $request->file('image_path')->store('officials', 'public');
                $validated['image_path'] = '/storage/' . $path;
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Official image update failed: " . $e->getMessage());
                return back()->withErrors(['image_path' => 'Unable to save the uploaded image. Please ensure the file is under 5MB.']);
            }
        } else {
            unset($validated['image_path']);
        }

        $official->update($validated);

        return redirect()->route('admin.settings.index', ['tab' => 'officials'])->with('success', 'Official updated successfully.');
    }

    public function destroy($id)
    {
        $official = OrganizationalMember::findOrFail($id);

        if ($official->image_path) {
            $relativePath = str_replace('/storage/', '', $official->image_path);
            Storage::disk('public')->delete($relativePath);
        }

        $official->delete();

        return back()->with('success', 'Official removed.');
    }
}
