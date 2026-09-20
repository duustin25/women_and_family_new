<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Account Security Recovery</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; line-height: 1.5; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 24px 32px; color: #ffffff; text-align: center; }
        .header-sub { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff; }
        .content { padding: 32px; }
        .btn-unlock { display: inline-block; background-color: #0f172a; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-weight: 600; font-size: 14px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .notice-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; color: #475569; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="header-sub">Barangay 183 &bull; Women & Family Protection System</div>
            <h1>Account Recovery & Unlock</h1>
        </div>
        <div class="content">
            <p style="margin-top: 0; font-size: 15px;">Hello <strong>{{ $user->name }}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">
                A secure account unlock request was submitted for your Barangay account. Because your account was previously locked or frozen, you can verify your identity and set a new password by clicking the button below:
            </p>

            <div style="text-align: center;">
                <a href="{{ $unlockUrl }}" class="btn-unlock">Unlock Account & Reset Password</a>
            </div>

            <div class="notice-box">
                <strong>Security Information:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                    <li>This single-use recovery link is valid strictly for <strong>15 minutes</strong>.</li>
                    <li>Once used, all previous sessions remain terminated to ensure security.</li>
                    <li>If you did not request this recovery link, please contact your Barangay IT Administrator immediately.</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            Barangay 183 Office of Women & Family Affairs &bull; RA 9262 & RA 10173 Protected
        </div>
    </div>
</body>
</html>
