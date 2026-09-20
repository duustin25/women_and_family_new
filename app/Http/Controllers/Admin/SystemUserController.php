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

    public function edit(Request $request, User $system_user)
    {
        // Solution B (Separation of Duties): Self-editing is prohibited in System User Management
        if ($system_user->id === $request->user()->id) {
            return redirect()->route('profile.edit')->with('info', 'To manage your personal credentials and security settings, please use Personal Settings.');
        }

        $pendingEmailOtp = \App\Models\EmailOtp::where('user_id', $system_user->id)
            ->where('action', \App\Models\EmailOtp::ACTION_EMAIL_CHANGE)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();

        return Inertia::render('Admin/SystemUsers/Edit', [
            'user' => $system_user,
            'organizations' => Organization::select('id', 'name')->orderBy('name')->get(),
            'pending_email' => $pendingEmailOtp?->target_value,
        ]);
    }

    public function store(Request $request, \App\Services\OtpSecurityService $otpService)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'required|in:admin,head,president',
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        // Phase 1: Create provisional user with high-entropy placeholder password
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(64)),
            'role' => $validated['role'],
            'organization_id' => $validated['role'] === 'president' ? ($validated['organization_id'] ?? null) : null,
            'status' => User::STATUS_PENDING_VERIFICATION,
            'is_active' => false,
            'invited_by_id' => $request->user()->id,
        ]);

        // Generate 6-digit activation OTP and send invitation email
        $otp = $otpService->createProvisionalActivationOtp($user);
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\UserInvitationMail($user, $otp));

        return redirect()->route('admin.settings.index', ['tab' => 'users'])->with('success', "Provisional account created for {$user->name}. An activation OTP has been dispatched to {$user->email}.");
    }

    /**
     * Resend an activation OTP to a user pending verification.
     */
    public function resendInvitation(User $system_user, \App\Services\OtpSecurityService $otpService)
    {
        if ($system_user->isVerifiedAndActive()) {
            return back()->with('error', 'This user is already verified and active.');
        }

        try {
            $otpData = $otpService->resendActivationOtp($system_user);
            \Illuminate\Support\Facades\Mail::to($system_user->email)->send(new \App\Mail\UserInvitationMail($system_user, $otpData['otp']));

            return back()->with('success', "A fresh activation code was emailed to {$system_user->email}.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Unlock a locked user and send a fresh activation OTP.
     */
    public function unlockUser(User $system_user, \App\Services\OtpSecurityService $otpService)
    {
        $rawOtp = $otpService->adminUnlockUser($system_user);
        \Illuminate\Support\Facades\Mail::to($system_user->email)->send(new \App\Mail\UserInvitationMail($system_user, $rawOtp));

        return back()->with('success', "User {$system_user->name} has been unlocked. A new activation OTP was dispatched to their email.");
    }

    /**
     * Direct Admin Commit (Zero OTP Friction):
     * Updates profile attributes, role assignments, primary email, and manual password overrides.
     * Enforces audit logging and prevents demoting the last Super Admin.
     */
    public function update(Request $request, User $system_user)
    {
        // Solution B (Separation of Duties): Self-editing is prohibited in System User Management
        if ($system_user->id === $request->user()->id) {
            return redirect()->route('profile.edit')->with('error', 'Self-editing is prohibited in System User Management. Please use Personal Settings to update your credentials.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $system_user->id,
            'role' => 'required|in:admin,head,president',
            'organization_id' => 'nullable|exists:organizations,id',
            'password' => ['nullable', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);

        // Prevent demoting the last Super Admin
        if ($system_user->isAdmin() && $validated['role'] !== 'admin' && User::where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'Cannot demote the last remaining Super Admin in the system.');
        }

        $oldValues = [
            'name' => $system_user->name,
            'email' => $system_user->email,
            'role' => $system_user->role,
            'organization_id' => $system_user->organization_id,
        ];

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'organization_id' => $validated['role'] === 'president' ? ($validated['organization_id'] ?? null) : null,
        ];

        $isPasswordReset = false;
        if (!empty($validated['password'])) {
            $updateData['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
            $isPasswordReset = true;
        }

        \App\Services\AuditLogger::$suppressObserver = true;
        try {
            $system_user->update($updateData);
        } finally {
            \App\Services\AuditLogger::$suppressObserver = false;
        }

        $actor = Auth::user();
        $newValues = [
            'name' => $system_user->name,
            'email' => $system_user->email,
            'role' => $system_user->role,
            'organization_id' => $system_user->organization_id,
            'password_overridden' => $isPasswordReset,
            '_actor_name' => $actor?->name,
            '_actor_role' => $actor?->role,
            '_obfuscated_target' => \App\Services\AuditLogger::obfuscateIdentifier(User::class, $system_user->id, $system_user, [
                'name' => $system_user->name,
                'role' => $system_user->role,
            ]),
        ];

        // Audit Trail: Direct Admin Commit with full diff
        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $isPasswordReset ? 'USER_CREDENTIALS_OVERRIDDEN' : 'USER_ROLE_MUTATED',
            'auditable_type' => User::class,
            'auditable_id' => $system_user->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $message = "Account information updated successfully for {$system_user->name}.";
        if ($isPasswordReset) {
            $message .= " Password was successfully reset.";
        }

        return redirect()->route('admin.settings.index', ['tab' => 'users'])->with('success', $message);
    }

    /**
     * Backward-compatible handler for credential updates (proxies to update).
     */
    public function updateCredentials(Request $request, User $system_user)
    {
        return $this->update($request, $system_user);
    }

    public function destroy(User $system_user)
    {
        if ($system_user->id === Auth::id()) {
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
        return redirect()->route('admin.settings.index', array_merge([
            'tab' => 'users',
            'view' => 'archives',
        ], $request->only(['search', 'role'])));
    }

    public function restore(int $id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return redirect()->route('admin.settings.index', [
            'tab' => 'users',
            'view' => 'archives',
        ])->with('success', "User account '{$user->name}' restored successfully.");
    }
}
