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
        if ($request->user_id === '0' || $request->user_id === 'none') {
            $request->merge(['user_id' => null]);
        }

        $rules = [
            'user_id' => 'required|exists:users,id|unique:organizational_members,user_id',
            'position' => 'required|string|max:255',
            'committee' => 'nullable|string|max:255',
            'level' => 'required|in:head,secretary,staff',
            'image_path' => 'nullable|image|max:10240',
        ];

        $validated = $request->validate($rules);

        if (in_array($request->level, ['head', 'secretary'])) {
            if (OrganizationalMember::where('level', $request->level)->exists()) {
                return back()->withErrors(['level' => 'A ' . ucfirst($request->level) . ' is already assigned. Please reassign the current one to Staff first.']);
            }
        }

        if ($request->hasFile('image_path')) {
            $path = $request->file('image_path')->store('officials', 'public');
            $validated['image_path'] = '/storage/' . $path;
        }

        OrganizationalMember::create($validated);
        return redirect()->route('admin.officials.index')->with('success', 'Official added successfully.');
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
        if ($request->user_id === '0' || $request->user_id === 'none') {
            $request->merge(['user_id' => null]);
        }

        $official = OrganizationalMember::findOrFail($id);

        $rules = [
            'user_id' => [
                'required',
                'exists:users,id',
                Rule::unique('organizational_members', 'user_id')->ignore($id)
            ],
            'position' => 'required|string|max:255',
            'committee' => 'nullable|string|max:255',
            'level' => 'required|in:head,secretary,staff',
            'image_path' => 'nullable|image|max:10240',
            'is_active' => 'boolean'
        ];

        $validated = $request->validate($rules);

        // ENFORCE RULE: Only 1 Head, Only 1 Secretary (Excluding self)
        if (in_array($request->level, ['head', 'secretary'])) {
            if (OrganizationalMember::where('level', $request->level)->where('id', '!=', $id)->exists()) {
                return back()->withErrors(['level' => 'A ' . ucfirst($request->level) . ' is already assigned.']);
            }
        }



        if ($request->hasFile('image_path')) {
            if ($official->image_path) {
                $relativePath = str_replace('/storage/', '', $official->image_path);
                Storage::disk('public')->delete($relativePath);
            }
            $path = $request->file('image_path')->store('officials', 'public');
            $validated['image_path'] = '/storage/' . $path;
        } else {
            unset($validated['image_path']);
        }

        $official->update($validated);

        return redirect()->route('admin.officials.index')->with('success', 'Official updated successfully.');
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
