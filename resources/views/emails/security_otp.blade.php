<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $actionTitle ?? 'Security Verification' }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; line-height: 1.5; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 24px 32px; color: #ffffff; text-align: center; }
        .header-sub { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff; }
        .content { padding: 32px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .info-row:last-child { margin-bottom: 0; }
        .info-label { color: #64748b; font-weight: 500; }
        .info-value { color: #0f172a; font-weight: 600; text-align: right; }
        .otp-box { background: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #0f172a; margin: 0; padding-left: 10px; }
        .otp-sub { font-size: 12px; color: #64748b; margin-top: 8px; display: block; }
        .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 18px; margin-top: 28px; text-align: center; }
        .alert-title { font-size: 14px; font-weight: 700; color: #991b1b; margin: 0 0 6px 0; }
        .alert-desc { font-size: 12px; color: #7f1d1d; margin: 0 0 14px 0; }
        .btn-freeze { display: inline-block; background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 10px 20px; font-weight: 600; font-size: 12px; border-radius: 6px; letter-spacing: 0.025em; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="header-sub">Barangay 183 &bull; Women & Family Protection System</div>
            <h1>{{ $actionTitle }}</h1>
        </div>
        <div class="content">
            <p style="margin-top: 0; font-size: 15px;">Hello <strong>{{ $user->name }}</strong>,</p>
            <p style="font-size: 14px; color: #475569; margin-bottom: 0;">
                A credential update request has been initiated for your Barangay account. Please verify this request to proceed:
            </p>

            <div class="info-card">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                        <td style="color: #64748b; padding: 4px 0; font-weight: 500;">Request Type:</td>
                        <td style="color: #0f172a; padding: 4px 0; font-weight: 600; text-align: right;">{{ $actionTitle }}</td>
                    </tr>
                    @if(!empty($targetValue))
                    <tr>
                        <td style="color: #64748b; padding: 4px 0; font-weight: 500;">New Email Address:</td>
                        <td style="color: #0f172a; padding: 4px 0; font-weight: 700; text-align: right;">{{ $targetValue }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td style="color: #64748b; padding: 4px 0; font-weight: 500;">Timestamp:</td>
                        <td style="color: #0f172a; padding: 4px 0; font-weight: 500; text-align: right;">{{ now()->timezone('Asia/Manila')->format('M d, Y &bull; h:i A') }} (PHT)</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 14px; color: #334155; margin-bottom: 0;">
                Enter this single-use 6-digit confirmation code in the verification prompt:
            </p>

            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
                <span class="otp-sub">Valid for 5 minutes &bull; Maximum 3 attempts before account lock</span>
            </div>

            <div class="alert-box">
                <div class="alert-title">Did not request this change?</div>
                <div class="alert-desc">
                    If you did not initiate this change, someone may be attempting to access your account. Do not share this code with anyone.
                </div>
                <a href="{{ $panicUrl }}" class="btn-freeze">Freeze Account Immediately</a>
            </div>
        </div>
        <div class="footer">
            Barangay 183 Office of Women & Family Affairs &bull; RA 9262 & RA 10173 Protected
        </div>
    </div>
</body>
</html>
