@extends('emails.layouts.master')

@section('title', $actionTitle ?? 'Security Verification')

@section('content')
    <div style="text-align: center; margin-bottom: 20px;">
        <span class="purpose-badge">Security &bull; Authorization</span>
        <h2 style="font-size: 20px; font-weight: 800; color: #1e1b4b; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: -0.02em;">
            {{ $actionTitle }}
        </h2>
    </div>

    <!-- Objective Summary -->
    <table class="summary-card" cellpadding="0" cellspacing="0">
        <tr>
            <td class="summary-label">Recipient</td>
            <td class="summary-val">{{ $user->name }}</td>
        </tr>
        <tr>
            <td class="summary-label">Request</td>
            <td class="summary-val" style="color: #6b21a8; font-weight: 700;">
                {{ $actionTitle }}
            </td>
        </tr>
        @if(!empty($targetValue))
        <tr>
            <td class="summary-label">New Detail</td>
            <td class="summary-val" style="color: #0f172a; font-weight: 700;">
                {{ $targetValue }}
            </td>
        </tr>
        @endif
        <tr>
            <td class="summary-label">Timestamp</td>
            <td class="summary-val" style="color: #475569; font-size: 12px;">
                {{ now()->timezone('Asia/Manila')->format('M d, Y • h:i A') }} (PHT)
            </td>
        </tr>
        <tr>
            <td class="summary-label">Objective</td>
            <td class="summary-val" style="color: #475569;">
                Verify account identity to authorize sensitive credential modification.
            </td>
        </tr>
    </table>

    <!-- OTP Code Display -->
    <div class="otp-box">
        <div class="otp-label">One-Time Security Code</div>
        <div class="otp-number">{{ $otp }}</div>
        <div class="otp-pill">
            ⏱ Valid for 5 minutes &bull; Maximum 3 attempts before account lock
        </div>
    </div>

    <!-- Unauthorized Alert & Panic Button -->
    <div class="danger-card">
        <div class="danger-title">Did not request this change?</div>
        <div class="danger-desc">
            If you did not initiate this change, someone may be attempting unauthorized access. Freeze your account immediately to secure your data.
        </div>
        <div>
            <a href="{{ $panicUrl }}" class="btn-danger">
                Freeze Account Immediately
            </a>
        </div>
    </div>
@endsection
