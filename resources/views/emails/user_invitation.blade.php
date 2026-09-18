<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Account Invitation & Verification</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 24px 32px; color: #ffffff; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; }
        .content { padding: 32px; }
        .otp-box { background: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; margin: 0; }
        .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-weight: 600; border-radius: 6px; text-align: center; margin-top: 16px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center; }
        .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>Barangay Case Management Portal</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $user->name }}</strong>,</p>
            <p>An official system account has been provisionally prepared for you with the assigned role of <span class="badge">{{ $user->role }}</span>.</p>
            <p>To finalize your account setup and choose your personal password, use the 6-digit confirmation code below:</p>

            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
                <small style="color: #64748b; display: block; margin-top: 6px;">Valid strictly for 10 minutes (Single Use Only)</small>
            </div>

            <p style="text-align: center;">
                <a href="{{ $activationUrl }}" class="btn">Verify Account & Set Password</a>
            </p>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
                <strong>Security Notice:</strong> Do not share this OTP with anyone. The system administrators will never ask for your verification code.
            </p>
        </div>
        <div class="footer">
            Women & Family Protection Case Management System &bull; Confidential &bull; RA 9262 / RA 10173 Compliant
        </div>
    </div>
</body>
</html>
