<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Mail\SecurityOtpMail;
use App\Models\EmailOtp;
use App\Services\OtpSecurityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Initiate Step-Up OTP for password update.
     */
    public function update(PasswordUpdateRequest $request, OtpSecurityService $otpService): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Stage hashed new password and generate Step-Up OTP
        $newHashedPassword = Hash::make($validated['password']);
        $otpPayload = $otpService->createStepUpProtectionOtp($user, EmailOtp::ACTION_PASSWORD_CHANGE, $newHashedPassword);

        // Send OTP mail with Emergency Panic Kill-Switch
        Mail::to($user->email)->send(
            new SecurityOtpMail(
                $user,
                $otpPayload['otp'],
                EmailOtp::ACTION_PASSWORD_CHANGE,
                'Account Password',
                $otpPayload['panic_token']
            )
        );

        return back()->with('step_up_required', [
            'action' => EmailOtp::ACTION_PASSWORD_CHANGE,
            'endpoint' => route('user-password.verify'),
            'message' => 'To complete your password update, enter the 6-digit confirmation code sent to your verified email address.',
        ]);
    }
}
