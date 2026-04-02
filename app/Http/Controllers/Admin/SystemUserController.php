<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SystemUserController extends Controller
{
    /**
     * Display a listing of system users (Admins, Heads, Presidents).
     */
    public function index(Request $request)
    {
        // Only Super Admins can access this
        if (!$request->user()->isAdmin()) {
            abort(403, 'Unauthorized.');
        }

        $query = User::with('organization')->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                    ->orWhere('email', 'LIKE', "%{$request->search}%");
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/SystemUsers/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/SystemUsers/Create', [
            'organizations' => Organization::select('id', 'name')->orderBy('name')->get()
        ]);
    }

    public function edit(User $system_user)
    {
        return Inertia::render('Admin/SystemUsers/Edit', [
            'user' => $system_user,
            'organizations' => Organization::select('id', 'name')->orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            'role' => 'required|in:admin,head,president',
            // Make organization_id optional to break circular dependency
            'organization_id' => 'nullable|exists:organizations,id',
            'current_admin_password' => ['required', 'string', 'current_password'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => $validated['role'],
            // Explicitly set organization_id to null if not a president
            'organization_id' => $validated['role'] === 'president' ? ($validated['organization_id'] ?? null) : null,
        ]);

        return redirect()->route('admin.system-users.index')->with('success', 'System Account Created.');
    }

    public function update(Request $request, User $system_user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $system_user->id,
            'password' => ['nullable', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            'role' => 'required|in:admin,head,president',
            'organization_id' => 'nullable|exists:organizations,id',
            'current_admin_password' => ['required', 'string', 'current_password'],
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            // Explicitly set organization_id to null if not a president
            'organization_id' => $validated['role'] === 'president' ? ($validated['organization_id'] ?? null) : null,
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->input('password'));
        }

        // Prevent demoting the last Super Admin
        if ($system_user->isAdmin() && $validated['role'] !== 'admin' && User::where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'Cannot demote the last Super Admin.');
        }

        $system_user->update($data);

        return redirect()->route('admin.system-users.index')->with('success', 'System Account Updated.');
    }

    public function destroy(User $system_user)
    {
        if ($system_user->getKey() === auth()->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        // Prevent deleting the last Super Admin
        if ($system_user->isAdmin() && User::where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'Cannot delete the last Super Admin.');
        }

        $system_user->delete();
        return redirect()->route('admin.system-users.index')->with('success', 'User deactivated and moved to archives.');
    }

    public function archives(Request $request)
    {
        $query = User::onlyTrashed()->with('organization')->latest('deleted_at');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                    ->orWhere('email', 'LIKE', "%{$request->search}%");
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/SystemUsers/Archives', [
            'users' => $users,
            'filters' => $request->only(['search', 'role'])
        ]);
    }

    public function restore($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return redirect()->route('admin.system-users.archives')->with('success', 'User account restored successfully.');
    }
}
