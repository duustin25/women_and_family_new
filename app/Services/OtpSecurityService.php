<?php

namespace App\Services;

use App\Models\User;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class OtpSecurityService
{
    const ACTIVATION_EXPIRY_MINUTES = 10;
    const STEP_UP_EXPIRY_MINUTES = 5;
    const MAX_FAILED_ATTEMPTS = 3;
    const RESEND_COOLDOWN_SECONDS = 60;

    /**
     * Compute a timing-safe SHA-256 HMAC hash using the application encryption key.
     */
    protected function hashToken(string $token): string
    {
        return hash_hmac('sha256', $token, config('app.key'));
    }

    /**
     * Phase 1: Create a provisional account activation OTP (10-minute validity).
     */
    public function createProvisionalActivationOtp(User $user): string
    {
        // 1. Invalidate any older unused activation tokens for this user
        EmailOtp::where('user_id', $user->id)
            ->where('action', EmailOtp::ACTION_ACTIVATION)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        // 2. Cryptographically secure 6-digit random code
        $rawOtp = sprintf('%06d', random_int(100000, 999999));
        $otpHash = $this->hashToken($rawOtp);

        EmailOtp::create([
            'user_id' => $user->id,
            'action' => EmailOtp::ACTION_ACTIVATION,
            'target_value' => $user->email,
            'otp_hash' => $otpHash,
            'panic_token_hash' => null,
            'attempts' => 0,
            'is_used' => false,
            'expires_at' => now()->addMinutes(self::ACTIVATION_EXPIRY_MINUTES),
        ]);

        return $rawOtp;
    }

    /**
     * Phase 3: Create a Step-Up credential protection OTP + Emergency Panic Token (5-minute validity).
     * Quarantines the proposed target_value (e.g. proposed new email).
     */
    public function createStepUpProtectionOtp(User $user, string $action, ?string $targetValue = null): array
    {
        // Invalidate older unused tokens for this action
        EmailOtp::where('user_id', $user->id)
            ->where('action', $action)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        // Generate 6-digit OTP and 64-char high-entropy panic token
        $rawOtp = sprintf('%06d', random_int(100000, 999999));
        $rawPanicToken = Str::random(64);

        EmailOtp::create([
            'user_id' => $user->id,
            'action' => $action,
            'target_value' => $targetValue,
            'otp_hash' => $this->hashToken($rawOtp),
            'panic_token_hash' => $this->hashToken($rawPanicToken),
            'attempts' => 0,
            'is_used' => false,
            'expires_at' => now()->addMinutes(self::STEP_UP_EXPIRY_MINUTES),
        ]);

        return [
            'otp' => $rawOtp,
            'panic_token' => $rawPanicToken,
        ];
    }

    /**
     * Verify an incoming OTP against stored hash using constant-time comparison (hash_equals).
     * Enforces the 3-strike brute-force lockout and single-use burn inside a DB transaction.
     */
    public function verifyOtp(User $user, string $action, string $inputCode): array
    {
        return DB::transaction(function () use ($user, $action, $inputCode) {
            /** @var EmailOtp|null $record */
            $record = EmailOtp::where('user_id', $user->id)
                ->where('action', $action)
                ->where('is_used', false)
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if (!$record) {
                return [
                    'success' => false,
                    'message' => 'No active verification code found. Please request a new code.',
                ];
            }

            // Rule 1: Check Expiration
            if ($record->expires_at->isPast()) {
                $record->update(['is_used' => true]);
                return [
                    'success' => false,
                    'message' => 'The verification code has expired. Please request a new one.',
                ];
            }

            // Rule 3: Check Attempt Threshold
            if ($record->attempts >= self::MAX_FAILED_ATTEMPTS) {
                $record->update(['is_used' => true]);
                $user->update(['status' => User::STATUS_LOCKED]);

                return [
                    'success' => false,
                    'locked' => true,
                    'message' => 'Too many failed verification attempts. For security, your account has been locked. Please contact a Super Administrator.',
                ];
            }

            // Constant-time hash verification (Timing Attack Defense)
            $expectedHash = $this->hashToken(trim($inputCode));
            $isValid = hash_equals($record->otp_hash, $expectedHash);

            if (!$isValid) {
                $newAttempts = $record->attempts + 1;

                if ($newAttempts >= self::MAX_FAILED_ATTEMPTS) {
                    $record->update([
                        'attempts' => $newAttempts,
                        'is_used' => true,
                    ]);
                    $user->update(['status' => User::STATUS_LOCKED]);

                    return [
                        'success' => false,
                        'locked' => true,
                        'message' => 'Maximum incorrect verification attempts reached. For security, your account has been locked.',
                    ];
                }

                $record->update(['attempts' => $newAttempts]);
                $attemptsRemaining = self::MAX_FAILED_ATTEMPTS - $newAttempts;

                return [
                    'success' => false,
                    'attempts_left' => $attemptsRemaining,
                    'message' => "Incorrect verification code. {$attemptsRemaining} attempt(s) remaining.",
                ];
            }

            // Rule 2: Single-Use Burn (Immediately mark as consumed)
            $record->update(['is_used' => true]);

            return [
                'success' => true,
                'target_value' => $record->target_value,
                'message' => 'Verification successful.',
            ];
        });
    }

    /**
     * Rule 5: Emergency Panic Link Session Kill-Switch
     * Uses pessimistic locking (lockForUpdate) to prevent concurrency race conditions.
     */
    public function triggerPanicKillSwitch(string $rawPanicToken): bool
    {
        $panicHash = $this->hashToken($rawPanicToken);

        return DB::transaction(function () use ($panicHash) {
            /** @var EmailOtp|null $record */
            $record = EmailOtp::where('panic_token_hash', $panicHash)
                ->where('expires_at', '>', now()->subHours(24))
                ->lockForUpdate()
                ->first();

            if (!$record) {
                return false;
            }

            /** @var User|null $user */
            $user = User::where('id', $record->user_id)->lockForUpdate()->first();
            if (!$user) {
                return false;
            }

            // Invalidate all active OTPs for this user
            EmailOtp::where('user_id', $user->id)->update(['is_used' => true]);

            // Freeze user status to locked
            $user->update([
                'status' => User::STATUS_LOCKED,
                'remember_token' => null,
            ]);

            // Flush all active browser sessions from the database sessions table
            if (config('session.driver') === 'database') {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }

            Log::warning("EMERGENCY PANIC KILL-SWITCH TRIGGERED: User ID {$user->id} ({$user->email}) all sessions terminated and account locked.");

            return true;
        });
    }

    /**
     * Rate-limited Resend Activation OTP (60-second cooldown).
     */
    public function resendActivationOtp(User $user): array
    {
        if ($user->isLocked()) {
            throw new Exception("Account is locked due to multiple failed verification attempts. Please contact an Administrator.");
        }

        $latestOtp = EmailOtp::where('user_id', $user->id)
            ->where('action', EmailOtp::ACTION_ACTIVATION)
            ->latest('id')
            ->first();

        if ($latestOtp && $latestOtp->created_at->diffInSeconds(now()) < self::RESEND_COOLDOWN_SECONDS) {
            $secondsRemaining = self::RESEND_COOLDOWN_SECONDS - $latestOtp->created_at->diffInSeconds(now());
            throw new Exception("Please wait {$secondsRemaining} seconds before requesting a new code.");
        }

        $rawOtp = $this->createProvisionalActivationOtp($user);

        return [
            'otp' => $rawOtp,
            'expires_in_minutes' => self::ACTIVATION_EXPIRY_MINUTES,
        ];
    }

    /**
     * Admin Unlock & Resend Recovery:
     * Resets a locked user to pending_verification and issues a fresh code.
     */
    public function adminUnlockUser(User $user): string
    {
        return DB::transaction(function () use ($user) {
            $user->update([
                'status' => User::STATUS_PENDING_VERIFICATION,
                'is_active' => false,
            ]);

            return $this->createProvisionalActivationOtp($user);
        });
    }
}
