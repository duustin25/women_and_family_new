<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailOtp;
use App\Mail\SecurityOtpMail;
use App\Services\OtpSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OtpSecurityController extends Controller
{
    /**
     * Emergency Panic Link endpoint.
     * Instantly revokes sessions and locks user account via pessimistic DB lock.
     */
    public function emergencyPanic(string $token, OtpSecurityService $otpService): Response
    {
        $success = $otpService->triggerPanicKillSwitch($token);

        return Inertia::render('auth/panic-confirmation', [
            'success' => $success,
            'message' => $success 
                ? 'Account Security Kill-Switch Triggered. All active logins and sessions have been immediately destroyed. Your account is now locked to protect confidential records. Please contact a Super Administrator to unlock your account.'
                : 'This emergency security link is invalid or has already been used.',
        ]);
    }

    /**
     * Verify Step-Up OTP for quarantined email address updates.
     */
    public function verifyEmailChange(Request $request, OtpSecurityService $otpService)
    {
        $validated = $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $result = $otpService->verifyOtp($user, EmailOtp::ACTION_EMAIL_CHANGE, $validated['otp']);

        if (!$result['success']) {
            if (!empty($result['locked'])) {
                \Illuminate\Support\Facades\Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Your account has been locked due to excessive failed verification attempts. Please contact a Super Administrator to review and unlock your account.',
                ]);
            }

            return back()->withErrors([
                'otp' => $result['message'],
            ]);
        }

        $newEmail = $result['target_value'];
        $user->email = $newEmail;
        $user->email_verified_at = now();
        $user->save();

        return back()->with('success', "Email address has been successfully verified and updated to: {$newEmail}");
    }

    /**
     * Verify Step-Up OTP for password update.
     */
    public function verifyPasswordChange(Request $request, OtpSecurityService $otpService)
    {
        $validated = $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $result = $otpService->verifyOtp($user, EmailOtp::ACTION_PASSWORD_CHANGE, $validated['otp']);

        if (!$result['success']) {
            if (!empty($result['locked'])) {
                \Illuminate\Support\Facades\Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Your account has been locked due to excessive failed verification attempts. Please contact a Super Administrator to review and unlock your account.',
                ]);
            }

            return back()->withErrors([
                'otp' => $result['message'],
            ]);
        }

        $newPasswordHash = $result['target_value'];
        $user->password = $newPasswordHash;
        $user->save();

        \App\Models\AuditLog::create([
            'user_id' => $user->id,
            'action' => 'USER_PASSWORD_MUTATED',
            'auditable_type' => get_class($user),
            'auditable_id' => $user->id,
            'old_values' => ['password' => '***'],
            'new_values' => ['password' => '***'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Your password has been successfully updated.');
    }
}
