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

        if ($request->filled('status') && $request->input('status') !== 'all') {
            if ($request->input('status') === 'active') {
                $query->where('is_active', true);
            } elseif ($request->input('status') === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $organization = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Organizations/Index', [
            'organization' => OrganizationResource::collection($organization),
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create(Request $request)
    {
        // Admin and Head Committee (Staff) can create new Organizations
        if (!$request->user()->isStaff()) {
            abort(403, 'Only Administrators and Committee Heads can create organizations.');
        }

        // Fetch potential presidents (users with role 'president')
        $users = \App\Models\User::where('role', 'president')->orderBy('name')->get(['id', 'name', 'role']);

        return Inertia::render('Admin/Organizations/Create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        // Admin and Head Committee (Staff) can create new Organizations
        if (!$request->user()->isStaff()) {
            abort(403, 'Only Administrators and Committee Heads can create organizations.');
        }

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

        // Remove president_name from validated array since it's stored on the User model
        $presidentName = $validated['president_name'] ?? null;
        unset($validated['president_name']);

        $org = Organization::create($validated);

        // Assign the user as president by matching names or ID
        if ($presidentName) {
            $user = \App\Models\User::where('role', 'president')
                ->where(function ($q) use ($presidentName) {
                    $q->where('name', $presidentName)
                      ->orWhere('id', $presidentName);
                })->first();
            if ($user) {
                $user->update(['organization_id' => $org->id]);
            }
        }

        return redirect()->route('admin.organizations.index')->with('success', 'Organization Created!');
    }

    public function edit(Request $request, Organization $organization)
    {
        $user = $request->user();
        if ($user->isPresident() && $user->organization_id !== $organization->id) {
            abort(403, 'You can only edit your own organization.');
        }

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

        $validated = $request->validate([
            'name' => 'required|string|unique:organizations,name,' . $organization->id,
            'description' => 'required|string',
            'president_name' => 'nullable|string',
            'color_theme' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'left_logo' => 'nullable|image|max:2048',
            'right_logo' => 'nullable|image|max:2048',
            'requirements' => 'nullable|array',
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

        // Handle requirements mapping (prevent empty errors)
        $validated['requirements'] = $request->input('requirements', []);

        // Handle president mapping (Only Staff - Admin & Head Committee - can assign/reassign presidents)
        $presidentName = $validated['president_name'] ?? null;
        unset($validated['president_name']);

        $organization->update($validated);

        if ($user->isStaff()) {
            // Unset old president if changed
            $currentPresident = $organization->president;
            if ($currentPresident && $currentPresident->name !== $presidentName && $currentPresident->id != $presidentName) {
                $currentPresident->update(['organization_id' => null]);
            }

            // Set new president
            if ($presidentName) {
                $newUser = \App\Models\User::where('role', 'president')
                    ->where(function ($q) use ($presidentName) {
                        $q->where('name', $presidentName)
                          ->orWhere('id', $presidentName);
                    })->first();
                if ($newUser) {
                    $newUser->update(['organization_id' => $organization->id]);
                }
            }
        }

        return redirect()->route('admin.organizations.edit', $organization->slug)
            ->with('success', 'Organization updated successfully.');
    }

    public function toggleActive(Request $request, Organization $organization)
    {
        // RBAC: Only Admin and Head Committee can activate/deactivate (Org Presidents cannot)
        if (!$request->user()->isStaff()) {
            abort(403, 'Only Administrators and Committee Heads can activate or deactivate organizations.');
        }

        $organization->update([
            'is_active' => !$organization->is_active
        ]);

        $statusText = $organization->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Organization '{$organization->name}' has been {$statusText} successfully.");
    }

    public function destroy(Request $request, Organization $organization)
    {
        // RBAC: Only Admin and Head Committee can delete (Org Presidents cannot)
        if (!$request->user()->isStaff()) {
            abort(403, 'Org Presidents are not authorized to delete organizations.');
        }

        // Soft delete the organization without purging uploaded media or breaking relations
        $organization->delete();
        return redirect()->route('admin.organizations.index')->with('success', "Organization '{$organization->name}' moved to trash.");
    }

    public function members(Request $request, Organization $organization)
    {
        // RBAC: President can only see their own organization's members
        $user = $request->user();
        if ($user->isPresident() && $user->organization_id !== $organization->id) {
            abort(403, 'You can only view members of your own organization.');
        }

        $tab = $request->input('tab', 'active') === 'archived' ? 'archived' : 'active';

        $activeCount = \App\Models\MembershipApplication::where('organization_id', $organization->id)
            ->whereIn('status', ['Approved', 'approved'])
            ->count();

        $archivedCount = \App\Models\MembershipApplication::where('organization_id', $organization->id)
            ->whereIn('status', ['Inactive', 'inactive'])
            ->count();

        $query = \App\Models\MembershipApplication::with('organization')
            ->where('organization_id', $organization->id);

        if ($tab === 'archived') {
            $query->whereIn('status', ['Inactive', 'inactive']);
        } else {
            $query->whereIn('status', ['Approved', 'approved']);
        }

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
            'filters' => $request->only(['search', 'sort', 'direction', 'tab']),
            'tab' => $tab,
            'counts' => [
                'active' => $activeCount,
                'archived' => $archivedCount,
            ]
        ]);
    }

    public function exportMembers(Request $request, Organization $organization)
    {
        // RBAC: President can only view/export members of their own organization
        $user = $request->user();
        if ($user->isPresident() && (int)$user->organization_id !== (int)$organization->id) {
            abort(403, 'You can only view members of your own organization.');
        }

        $tab = $request->input('tab', 'active') === 'archived' ? 'archived' : 'active';

        $query = \App\Models\MembershipApplication::where('organization_id', $organization->id);

        if ($tab === 'archived') {
            $query->whereIn('status', ['Inactive', 'inactive']);
        } else {
            $query->whereIn('status', ['Approved', 'approved']);
        }

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

        $members = $query->get();

        // 1. Gather all fields defined in the current form schema (Active Fields)
        $schemaRaw = $organization->form_schema;
        $schemaFields = is_array($schemaRaw) ? $schemaRaw : [];
        $dynamicColumnKeys = [];
        $dynamicColumnLabels = [];

        $ignoredKeys = [
            'fullname', 'full_name', 'name', 'address', 'registered_address',
            'email', 'email_address', 'imported_via', 'imported_at', 'status',
            'actioned_at', 'approval_date', 'approved_by', 'recommended_by',
            'created_at', 'updated_at', 'id', 'organization_id', 'consent'
        ];

        foreach ($schemaFields as $field) {
            $type = $field['type'] ?? 'text';
            $id = $field['id'] ?? null;
            if ($id && 
                empty($field['is_core']) && 
                !in_array($type, ['section', 'paragraph']) && 
                !in_array($id, $ignoredKeys)
            ) {
                $dynamicColumnKeys[] = $id;
                $dynamicColumnLabels[$id] = $field['label'] ?? ucwords(str_replace('_', ' ', $id));
            }
        }

        // 2. Gather all fields from members' historical data (Legacy/Retired Fields)
        foreach ($members as $member) {
            $formData = $member->form_data ?: [];
            foreach (array_keys($formData) as $key) {
                $cleanKey = preg_replace('/_retired$/i', '', $key);
                if (!in_array($key, $ignoredKeys) && 
                    !in_array($cleanKey, $ignoredKeys) && 
                    !in_array($key, $dynamicColumnKeys) && 
                    !in_array($cleanKey, $dynamicColumnKeys) &&
                    strlen($key) < 50
                ) {
                    $dynamicColumnKeys[] = $key;
                    $dynamicColumnLabels[$key] = ucwords(str_replace(['_', '-'], ' ', $cleanKey));
                }
            }
        }

        $statusLabel = $tab === 'archived' ? 'archived_members' : 'active_members';
        $filename = Str::slug($organization->name) . "_{$statusLabel}_" . now()->format('Ymd_His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=" . $filename,
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // Combine core columns and dynamic labels
        $columns = array_merge(
            ['Full Name', 'Registered Address'],
            array_values($dynamicColumnLabels),
            ['Approval Date', 'Status']
        );

        $callback = function() use($members, $columns, $dynamicColumnKeys) {
            $file = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fputs($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            foreach ($members as $member) {
                $row = [
                    $member->fullname,
                    $member->address ?: '',
                ];

                // Add dynamic column values
                $formData = $member->form_data ?: [];
                foreach ($dynamicColumnKeys as $key) {
                    $val = $formData[$key] ?? null;
                    if (is_array($val)) {
                        $isAssoc = false;
                        if (!empty($val)) {
                            $keys = array_keys($val);
                            $isAssoc = array_keys($keys) !== $keys;
                        }

                        if ($isAssoc) {
                            if (isset($val['label'])) {
                                $displayVal = (string)$val['label'];
                            } elseif (isset($val['value'])) {
                                $displayVal = (string)$val['value'];
                            } else {
                                $pairs = [];
                                foreach ($val as $k => $v) {
                                    if (!is_array($v) && !is_object($v)) {
                                        $pairs[] = "{$k}: {$v}";
                                    }
                                }
                                $displayVal = implode(', ', $pairs);
                            }
                        } else {
                            $isFlat = true;
                            foreach ($val as $item) {
                                if (is_array($item) || is_object($item)) {
                                    $isFlat = false;
                                    break;
                                }
                            }

                            if ($isFlat) {
                                $displayVal = implode(', ', $val);
                            } else {
                                $formattedItems = [];
                                foreach ($val as $index => $item) {
                                    if (is_array($item)) {
                                        $itemPairs = [];
                                        foreach ($item as $k => $v) {
                                            if (!is_array($v) && !is_object($v) && $v !== null && $v !== '') {
                                                $itemPairs[] = "{$k}: {$v}";
                                            }
                                        }
                                        $formattedItems[] = "[" . ($index + 1) . "] " . implode(', ', $itemPairs);
                                    } else {
                                        $formattedItems[] = (string)$item;
                                    }
                                }
                                $displayVal = implode(' | ', $formattedItems);
                            }
                        }
                    } elseif (is_object($val)) {
                        $valArr = (array)$val;
                        if (isset($valArr['label'])) {
                            $displayVal = (string)$valArr['label'];
                        } elseif (isset($valArr['value'])) {
                            $displayVal = (string)$valArr['value'];
                        } else {
                            $pairs = [];
                            foreach ($valArr as $k => $v) {
                                if (!is_array($v) && !is_object($v)) {
                                    $pairs[] = "{$k}: {$v}";
                                }
                            }
                            $displayVal = implode(', ', $pairs);
                        }
                    } else {
                        $displayVal = (string)$val;
                    }
                    $row[] = ($displayVal !== null && $displayVal !== '') ? $displayVal : '';
                }

                $row[] = $member->actioned_at ? $member->actioned_at->toDateTimeString() : '';
                $row[] = $member->status;

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function toggleMemberStatus(Request $request, Organization $organization, \App\Models\MembershipApplication $application)
    {
        // RBAC: President check
        $user = $request->user();
        if ($user->isPresident() && (int)$user->organization_id !== (int)$organization->id) {
            abort(403, 'Unauthorized.');
        }

        if ((int)$application->organization_id !== (int)$organization->id) {
            abort(404, 'Application does not belong to this organization.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Approved,Inactive',
            'reason' => 'nullable|string|max:255',
        ]);

        $newStatus = $validated['status'];
        $application->update([
            'status' => $newStatus,
            'actioned_at' => now(),
        ]);

        // Synchronize corresponding Member model
        $member = \App\Models\Member::where('membership_application_id', $application->id)->first();
        if ($member) {
            $member->update([
                'status' => $newStatus === 'Approved' ? \App\Models\Member::STATUS_ACTIVE : \App\Models\Member::STATUS_INACTIVE,
            ]);
        }

        $msg = $newStatus === 'Approved' 
            ? "Member '{$application->fullname}' has been reactivated to the Active roster."
            : "Member '{$application->fullname}' has been archived / marked as Inactive.";

        return back()->with('success', $msg);
    }
}
