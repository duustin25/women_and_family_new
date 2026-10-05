<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('organization');
        $pendingEmailOtp = \App\Models\EmailOtp::where('user_id', $user->id)
            ->where('action', \App\Models\EmailOtp::ACTION_EMAIL_CHANGE)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'pending_email' => $pendingEmailOtp?->target_value,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request, \App\Services\OtpSecurityService $otpService): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Check if email is being changed
        if (isset($validated['email']) && strtolower(trim($validated['email'])) !== strtolower(trim($user->email))) {
            $newEmail = strtolower(trim($validated['email']));

            // Security check: Block changing email if there is already an active pending verification
            $activePendingOtp = \App\Models\EmailOtp::where('user_id', $user->id)
                ->where('action', \App\Models\EmailOtp::ACTION_EMAIL_CHANGE)
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->latest('id')
                ->first();

            if ($activePendingOtp) {
                // If the user submitted the exact same pending email, re-open modal without spamming a new OTP
                if (strtolower(trim($activePendingOtp->target_value)) === $newEmail) {
                    return back()->with('step_up_required', [
                        'action' => \App\Models\EmailOtp::ACTION_EMAIL_CHANGE,
                        'endpoint' => route('profile.verify-email-change'),
                        'target_value' => $newEmail,
                        'message' => 'A verification code was already sent for this email. Please enter the 6-digit confirmation code.',
                    ]);
                }

                return back()->withErrors([
                    'email' => "Cannot change to another email while a verification for {$activePendingOtp->target_value} is currently pending. Please enter the verification code or cancel the pending request first.",
                ]);
            }

            // Update other allowed attributes first (like name)
            if (isset($validated['name'])) {
                $user->name = $validated['name'];
                $user->save();
            }

            // Quarantine new email and create Step-Up OTP
            $otpPayload = $otpService->createStepUpProtectionOtp($user, \App\Models\EmailOtp::ACTION_EMAIL_CHANGE, $newEmail);

            // Send security alert & OTP with emergency panic link to current email
            \Illuminate\Support\Facades\Mail::to($user->email)->send(
                new \App\Mail\SecurityOtpMail($user, $otpPayload['otp'], \App\Models\EmailOtp::ACTION_EMAIL_CHANGE, $newEmail, $otpPayload['panic_token'])
            );

            return back()->with('step_up_required', [
                'action' => \App\Models\EmailOtp::ACTION_EMAIL_CHANGE,
                'endpoint' => route('profile.verify-email-change'),
                'target_value' => $newEmail,
                'message' => 'To complete your email update, enter the 6-digit confirmation code sent to your current email address.',
            ]);
        }

        $user->fill($validated);
        $user->save();

        return to_route('profile.edit')->with('success', 'Profile information updated successfully.');
    }

    /**
     * Cancel any active pending email change verification for the authenticated user.
     */
    public function cancelEmailChange(Request $request): RedirectResponse
    {
        \App\Models\EmailOtp::where('user_id', $request->user()->id)
            ->where('action', \App\Models\EmailOtp::ACTION_EMAIL_CHANGE)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        return to_route('profile.edit')->with('success', 'Pending email verification has been cancelled. You may now enter a new email address.');
    }
}
