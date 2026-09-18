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
        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $newEmail = $validated['email'];

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
}
