<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Http\Resources\OrganizationResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Organization::with('president')->latest();

        // RBAC: President Scope
        if ($user->isPresident()) {
            $query->where('id', $user->organization_id);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                    ->orWhereHas('president', function ($q2) use ($searchTerm) {
                        $q2->where('name', 'LIKE', "%{$searchTerm}%");
                    });
            });
        }

        $organization = $query->paginate(7)->withQueryString();

        return Inertia::render('Admin/Organizations/Index', [
            'organization' => OrganizationResource::collection($organization),
            'filters' => $request->only(['search'])
        ]);
    }

    public function create(Request $request)
    {
        // Only Admin can create new Organizations
        if (!$request->user()->isAdmin()) {
            abort(403, 'Only Admins can create organizations.');
        }

        // Fetch potential presidents (users with role 'president')
        $users = \App\Models\User::where('role', 'president')->orderBy('name')->get(['id', 'name', 'role']);

        return Inertia::render('Admin/Organizations/Create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:organizations',
            'description' => 'required|string',
            'president_name' => 'nullable|string',
            'color_theme' => 'required|string', // e.g., 'bg-blue-600'
            'image' => 'nullable|image|max:2048',
            'left_logo' => 'nullable|image|max:2048',
            'right_logo' => 'nullable|image|max:2048',
            'requirements' => 'nullable|array', // Captured as an array for the JSON column
            'print_settings' => 'nullable|array',
            'form_schema' => 'nullable|array',
        ], [
            'name.required' => 'The organization must have a formal name.',
            'name.unique' => 'An organization with this name already exists in the registry.',
            'description.required' => 'A brief mission description (Mission & Vision) is mandatory.',
            'color_theme.required' => 'Please select a primary branding color for the organization.',
            'image.image' => 'The cover photo must be a valid image file.',
            'image.max' => 'The cover photo must not exceed 2MB.',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('organizations', 'public');
        }

        if ($request->hasFile('left_logo')) {
            $validated['left_logo_path'] = $request->file('left_logo')->store('organizations', 'public');
        }

        if ($request->hasFile('right_logo')) {
            $validated['right_logo_path'] = $request->file('right_logo')->store('organizations', 'public');
        }

        // --- THE FIX STARTS HERE ---
        // If 'requirements' is not in the request, we force it to be an empty array
        $validated['requirements'] = $request->input('requirements', []);

        // Remove president_name from validated array since it's no longer in the DB
        $presidentName = $validated['president_name'] ?? null;
        unset($validated['president_name']);

        $org = Organization::create($validated);

        // Assign the user as president by matching names
        if ($presidentName) {
            $user = \App\Models\User::where('role', 'president')->where('name', $presidentName)->first();
            if ($user) {
                $user->update(['organization_id' => $org->id]);
            }
        }

        return redirect()->route('admin.organizations.index')->with('success', 'Organization Created!');
    }

    public function edit(Organization $organization)
    {
        $users = \App\Models\User::where('role', 'president')->orderBy('name')->get(['id', 'name', 'role']);

        // Load president so the Resource maps it properly
        $organization->load('president');

        return Inertia::render('Admin/Organizations/Edit', [
            'organization' => new OrganizationResource($organization),
            'users' => $users
        ]);
    }

    public function update(Request $request, Organization $organization)
    {
        // RBAC: President can only update THEIR organization
        $user = $request->user();
        if ($user->isPresident() && $user->organization_id !== $organization->id) {
            abort(403, 'You can only edit your own organization.');
        }

        if (!$request->has('requirements')) {
            $request->merge(['requirements' => []]);
        }

        [
            'name.required' => 'The organization must have a formal name.',
            'name.unique' => 'An organization with this name already exists in the registry.',
            'description.required' => 'A brief mission description (Mission & Vision) is mandatory.',
            'color_theme.required' => 'Please select a primary branding color for the organization.',
            'image.image' => 'The cover photo must be a valid image file.',
            'image.max' => 'The cover photo must not exceed 2MB.',
        ];

        if ($request->hasFile('image')) {
            if ($organization->image_path) {
                Storage::disk('public')->delete($organization->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('organizations', 'public');
        }

        if ($request->hasFile('left_logo')) {
            if ($organization->left_logo_path) {
                Storage::disk('public')->delete($organization->left_logo_path);
            }
            $validated['left_logo_path'] = $request->file('left_logo')->store('organizations', 'public');
        }

        if ($request->hasFile('right_logo')) {
            if ($organization->right_logo_path) {
                Storage::disk('public')->delete($organization->right_logo_path);
            }
            $validated['right_logo_path'] = $request->file('right_logo')->store('organizations', 'public');
        }

        // Ensure form_schema is saved as JSON
        if (!$request->has('form_schema')) {
            $validated['form_schema'] = $organization->form_schema;
        } else {
            $validated['form_schema'] = $request->input('form_schema');
        }

        // Handle president mapping
        $presidentName = $validated['president_name'] ?? null;
        unset($validated['president_name']);

        $organization->update($validated);

        // Unset old president if changed
        $currentPresident = $organization->president;
        if ($currentPresident && $currentPresident->name !== $presidentName) {
            $currentPresident->update(['organization_id' => null]);
        }

        // Set new president
        if ($presidentName) {
            $newUser = \App\Models\User::where('role', 'president')->where('name', $presidentName)->first();
            if ($newUser) {
                $newUser->update(['organization_id' => $organization->id]);
            }
        }

        return redirect()->route('admin.organizations.edit', $organization->slug)
            ->with('success', 'Organization updated successfully.');
    }

    public function destroy(Request $request, Organization $organization)
    {
        // Only Admin can destroy
        if (!$request->user()->isAdmin()) {
            abort(403, 'Only Admins can delete organizations.');
        }

        if ($organization->image_path) {
            Storage::disk('public')->delete($organization->image_path);
        }

        if ($organization->left_logo_path) {
            Storage::disk('public')->delete($organization->left_logo_path);
        }

        if ($organization->right_logo_path) {
            Storage::disk('public')->delete($organization->right_logo_path);
        }

        // Unlink president before deleting
        $president = $organization->president;
        if ($president) {
            $president->update(['organization_id' => null]);
        }

        $organization->delete();
        return redirect()->route('admin.organizations.index')->with('success', 'Organization deleted.');
    }

    public function members(Request $request, Organization $organization)
    {
        // RBAC: President can only see their own organization's members
        $user = $request->user();
        if ($user->isPresident() && $user->organization_id !== $organization->id) {
            abort(403, 'You can only view members of your own organization.');
        }

        $query = \App\Models\MembershipApplication::with('organization')
            ->where('organization_id', $organization->id)
            ->where('status', 'Approved');

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where('fullname', 'LIKE', "%{$searchTerm}%");
        }

        // Setup Sorting
        $sortColumn = $request->input('sort', 'actioned_at'); // default sort
        $sortDirection = $request->input('direction', 'desc');

        $coreColumns = ['fullname', 'address', 'actioned_at', 'status'];
        $sortDirectionSafe = $sortDirection === 'asc' ? 'asc' : 'desc';

        if (in_array($sortColumn, $coreColumns)) {
            $query->orderBy($sortColumn, $sortDirectionSafe);
        } else {
            // Assume it is a dynamic JSON field inside `form_data`
            // Sanitize column name to alphanumerics/underscores to prevent SQL injection issues
            $safeColumn = preg_replace('/[^a-zA-Z0-9_]/', '', $sortColumn);
            if ($safeColumn) {
                $query->orderBy("form_data->{$safeColumn}", $sortDirectionSafe);
            } else {
                $query->latest('actioned_at');
            }
        }

        $members = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Organizations/Members', [
            'organization' => new OrganizationResource($organization),
            'members' => \App\Http\Resources\MembershipApplicationResource::collection($members),
            'filters' => $request->only(['search', 'sort', 'direction'])
        ]);
    }
}
