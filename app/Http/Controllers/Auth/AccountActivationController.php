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
     * Enforces token validation, single-use security, and 10-minute expiration.
     */
    public function showVerifyForm(Request $request, OtpSecurityService $otpService)
    {
        $token = $request->query('token');
        $email = $request->query('email');

        // Flow 1: Accessed via single-use invitation token in email
        if ($token) {
            $validation = $otpService->validateActivationToken($token);

            if (!$validation['valid']) {
                $user = $validation['record']?->user;
                if ($user && $user->isVerifiedAndActive()) {
                    return redirect()->route('login')->with('message', 'Your account is already active and verified. Please log in.');
                }

                return Inertia::render('auth/verify-account', [
                    'email' => $user?->email ?? '',
                    'token' => $token,
                    'isExpired' => true,
                    'expiredReason' => $validation['message'],
                ]);
            }

            $user = $validation['record']->user;
            if ($user->isVerifiedAndActive()) {
                return redirect()->route('login')->with('message', 'Your account is already active and verified. Please log in.');
            }

            if ($user->isLocked()) {
                return Inertia::render('auth/verify-account', [
                    'email' => $user->email,
                    'token' => $token,
                    'isExpired' => true,
                    'expiredReason' => 'This account has been locked due to excessive failed attempts. Please contact an Administrator to unlock your account.',
                ]);
            }

            return Inertia::render('auth/verify-account', [
                'email' => $user->email,
                'token' => $token,
                'isExpired' => false,
                'expiredReason' => null,
            ]);
        }

        // Flow 2: Accessed via ?email= (legacy or direct link)
        if ($email) {
            $user = User::where('email', $email)->first();

            if ($user && $user->isVerifiedAndActive()) {
                return redirect()->route('login')->with('message', 'Your account is already active and verified. Please log in.');
            }

            if ($user && $user->isLocked()) {
                return Inertia::render('auth/verify-account', [
                    'email' => $email,
                    'token' => null,
                    'isExpired' => true,
                    'expiredReason' => 'This account has been locked due to excessive failed attempts. Please contact an Administrator to unlock your account.',
                ]);
            }

            // Check if there is an active, unexpired, unused activation OTP for this user
            $hasActiveOtp = $user && EmailOtp::where('user_id', $user->id)
                ->where('action', EmailOtp::ACTION_ACTIVATION)
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->exists();

            if (!$hasActiveOtp) {
                return Inertia::render('auth/verify-account', [
                    'email' => $email,
                    'token' => null,
                    'isExpired' => true,
                    'expiredReason' => 'Your invitation link or verification session has expired. Verification codes are strictly valid for 10 minutes.',
                ]);
            }

            return Inertia::render('auth/verify-account', [
                'email' => $email,
                'token' => null,
                'isExpired' => false,
                'expiredReason' => null,
            ]);
        }

        // Flow 3: Direct navigation with no token and no email
        return Inertia::render('auth/verify-account', [
            'email' => '',
            'token' => null,
            'isExpired' => true,
            'expiredReason' => 'No active invitation session found. Please enter your email to request an activation code.',
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
                'otp' => 'This account has been locked due to excessive failed attempts. Please contact an Administrator to unlock your account.'
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

        // Invalidate all pending activation tokens for this user
        EmailOtp::where('user_id', $user->id)
            ->where('action', EmailOtp::ACTION_ACTIVATION)
            ->update(['is_used' => true]);

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

        if ($user->isLocked()) {
            return back()->withErrors([
                'otp' => 'This account is locked. Please contact your Administrator to unlock your account.'
            ]);
        }

        try {
            $otpData = $otpService->resendActivationOtp($user);
            Mail::to($user->email)->send(new UserInvitationMail($user, $otpData['otp'], $otpData['token']));

            return back()->with('success', 'A new 6-digit verification code and fresh activation link have been dispatched to your email.');
        } catch (Exception $e) {
            return back()->withErrors([
                'otp' => $e->getMessage()
            ]);
        }
    }
}
