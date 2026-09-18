<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailOtp;
use App\Models\User;
use App\Mail\UserInvitationMail;
use App\Services\OtpSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class AccountActivationController extends Controller
{
    /**
     * Show the account verification & password setup portal.
     */
    public function showVerifyForm(Request $request): Response
    {
        return Inertia::render('auth/verify-account', [
            'email' => $request->query('email', ''),
        ]);
    }

    /**
     * Verify the 6-digit OTP and set the user's permanent password.
     */
    public function activateAccount(Request $request, OtpSecurityService $otpService)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string', 'size:6'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        /** @var User $user */
        $user = User::where('email', $validated['email'])->firstOrFail();

        if ($user->isVerifiedAndActive()) {
            return redirect()->route('login')->with('message', 'Your account is already active and verified. Please log in.');
        }

        if ($user->isLocked()) {
            return back()->withErrors([
                'otp' => 'This account has been locked due to excessive failed attempts. Please contact a Super Administrator to unlock your account.'
            ]);
        }

        $result = $otpService->verifyOtp($user, EmailOtp::ACTION_ACTIVATION, $validated['otp']);

        if (!$result['success']) {
            return back()->withErrors([
                'otp' => $result['message']
            ]);
        }

        // Activate the user
        $user->update([
            'password' => Hash::make($validated['password']),
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('login')->with('success', 'Account activated successfully! You can now log in with your new password.');
    }

    /**
     * Resend an activation code (rate-limited via OtpSecurityService).
     */
    public function resendOtp(Request $request, OtpSecurityService $otpService)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        /** @var User $user */
        $user = User::where('email', $validated['email'])->firstOrFail();

        if ($user->isVerifiedAndActive()) {
            return back()->with('message', 'Account is already verified.');
        }

        try {
            $otpData = $otpService->resendActivationOtp($user);
            Mail::to($user->email)->send(new UserInvitationMail($user, $otpData['otp']));

            return back()->with('success', 'A new 6-digit verification code has been dispatched to your email.');
        } catch (Exception $e) {
            return back()->withErrors([
                'otp' => $e->getMessage()
            ]);
        }
    }
}
