@extends('emails.layouts.master')

@section('title', 'Account Setup & Verification')

@section('content')
    <div style="text-align: center; margin-bottom: 20px;">
        <span class="purpose-badge">Account Setup &bull; Verification</span>
        <h2 style="font-size: 20px; font-weight: 800; color: #1e1b4b; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: -0.02em;">
            Account Invitation
        </h2>
    </div>

    <!-- Objective Summary -->
    <table class="summary-card" cellpadding="0" cellspacing="0">
        <tr>
            <td class="summary-label">Recipient</td>
            <td class="summary-val">{{ $user->name }}</td>
        </tr>
        <tr>
            <td class="summary-label">System Role</td>
            <td class="summary-val">
                <span style="display: inline-block; background-color: #6b21a8; color: #ffffff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                    {{ $user->role }}
                </span>
            </td>
        </tr>
        <tr>
            <td class="summary-label">Objective</td>
            <td class="summary-val" style="color: #475569;">
                Finalize your portal credentials and set your official password.
            </td>
        </tr>
    </table>

    <!-- OTP Code Display -->
    <div class="otp-box">
        <div class="otp-label">One-Time Confirmation Code</div>
        <div class="otp-number">{{ $otp }}</div>
        <div class="otp-pill">
            ⏱ Valid strictly for 10 minutes (Single Use Only)
        </div>
    </div>

    <!-- Action Button -->
    <div class="btn-container">
        <a href="{{ $activationUrl }}" class="btn-primary">
            Verify Account & Set Password
        </a>
    </div>

    <!-- Security Notice -->
    <div class="notice-card">
        <strong>Security Notice:</strong> Never share this verification code with anyone. Official system administrators will never ask for your one-time code.
    </div>
@endsection