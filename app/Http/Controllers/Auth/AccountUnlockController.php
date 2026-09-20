<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\AccountUnlockMail;
use App\Services\OtpSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class AccountUnlockController extends Controller
{
    /**
     * Show the unlock request form.
     */
    public function showRequestForm(): Response
    {
        return Inertia::render('auth/account-unlock-request');
    }

    /**
     * Dispatch an emergency unlock link via email (Timing-attack & enumeration safe).
     */
    public function sendUnlockLink(Request $request, OtpSecurityService $otpService)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', strtolower(trim($validated['email'])))->first();

        // Only dispatch if user exists and is actually locked
        if ($user && $user->isLocked()) {
            $rawToken = $otpService->createAccountUnlockToken($user);
            Mail::to($user->email)->send(new AccountUnlockMail($user, $rawToken));
        }

        // Generic response prevents user enumeration
        return back()->with('status', 'If an account associated with that email address is currently locked, a secure single-use recovery link has been dispatched to it.');
    }

    /**
     * Verify the unlock token and show the password reset form.
     */
    public function showResetForm(string $token, OtpSecurityService $otpService)
    {
        $record = $otpService->validateUnlockToken($token);

        if (!$record) {
            return redirect()->route('login')->withErrors([
                'email' => 'This account recovery link is invalid, expired, or has already been used.',
            ]);
        }

        return Inertia::render('auth/account-unlock', [
            'token' => $token,
            'email' => $record->user->email,
        ]);
    }

    /**
     * Confirm account unlock and commit the new password.
     */
    public function confirmUnlock(Request $request, OtpSecurityService $otpService)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        try {
            $otpService->completeAccountUnlock($validated['token'], $validated['password']);

            return redirect()->route('login')->with('success', 'Your account has been successfully unlocked and your password updated. You may now log in.');
        } catch (Exception $e) {
            return back()->withErrors([
                'password' => $e->getMessage(),
            ]);
        }
    }
}
