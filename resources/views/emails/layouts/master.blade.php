<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>@yield('title', $subject ?? ($pageTitle ?? 'Barangay 183 Official Notification'))</title>
    <style type="text/css">
        /* Client-specific Resets */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        
        /* Base */
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-width: 100% !important;
            background-color: #f6f3fb;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e1b4b;
            line-height: 1.5;
        }

        /* Container Card */
        .email-wrapper {
            width: 100%;
            background-color: #f6f3fb;
            padding: 30px 10px;
        }

        .email-card {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #e9d5ff;
            box-shadow: 0 10px 25px -5px rgba(59, 7, 100, 0.08), 0 8px 10px -6px rgba(59, 7, 100, 0.04);
        }

        /* Header Elements */
        .top-strip {
            background-color: #3b0764;
            color: #f3e8ff;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 9px 24px;
            text-align: center;
        }

        .header-banner {
            background: linear-gradient(135deg, #4c1d95 0%, #6b21a8 50%, #7e22ce 100%);
            padding: 24px 28px;
            text-align: center;
            border-bottom: 3px solid #ce1126; /* Synchronized Red Accent from Public Layout */
        }

        .seal-img {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background-color: #ffffff;
            padding: 2px;
            border: 2px solid #e9d5ff;
            display: inline-block;
            vertical-align: middle;
        }

        .header-title {
            color: #ffffff;
            font-size: 17px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
            line-height: 1.25;
        }

        .header-subtitle {
            color: #f3e8ff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
            opacity: 0.95;
        }

        /* Content Body */
        .content-body {
            padding: 32px 30px;
            background-color: #ffffff;
        }

        /* Purpose Pill */
        .purpose-badge {
            display: inline-block;
            background-color: #f3e8ff;
            color: #6b21a8;
            border: 1px solid #d8b4fe;
            border-radius: 9999px;
            padding: 4px 12px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }

        /* Objective Summary Box */
        .summary-card {
            width: 100%;
            background-color: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 10px;
            margin: 18px 0;
            border-collapse: collapse;
        }

        .summary-card td {
            padding: 10px 14px;
            font-size: 13px;
            border-bottom: 1px solid #f3e8ff;
        }

        .summary-card tr:last-child td {
            border-bottom: none;
        }

        .summary-label {
            width: 95px;
            color: #6b21a8;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            vertical-align: top;
        }

        .summary-val {
            color: #1e1b4b;
            font-weight: 600;
            vertical-align: top;
        }

        /* OTP Display Box */
        .otp-box {
            background-color: #faf5ff;
            border: 2px dashed #a855f7;
            border-radius: 12px;
            padding: 22px 16px;
            text-align: center;
            margin: 24px 0;
        }

        .otp-label {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #6b21a8;
            margin-bottom: 6px;
        }

        .otp-number {
            font-family: 'SFMono-Regular', Consolas, 'Courier New', Courier, monospace;
            font-size: 38px;
            font-weight: 900;
            letter-spacing: 12px;
            color: #3b0764;
            margin: 6px 0;
            padding-left: 12px; /* Centers the letter-spaced digits */
        }

        .otp-pill {
            display: inline-block;
            background-color: #f3e8ff;
            color: #581c87;
            border-radius: 9999px;
            padding: 3px 12px;
            font-size: 11px;
            font-weight: 700;
            margin-top: 6px;
        }

        /* Call To Action Buttons */
        .btn-container {
            text-align: center;
            margin: 26px 0 16px 0;
        }

        .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
            background-color: #6b21a8;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-radius: 8px;
            box-shadow: 0 4px 14px rgba(107, 33, 168, 0.35);
        }

        .btn-danger {
            display: inline-block;
            background-color: #ce1126;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-radius: 6px;
            box-shadow: 0 3px 10px rgba(206, 17, 38, 0.3);
        }

        /* Alerts & Notices */
        .notice-card {
            background-color: #faf5ff;
            border: 1px solid #e9d5ff;
            border-left: 4px solid #6b21a8;
            border-radius: 6px;
            padding: 12px 14px;
            font-size: 12px;
            color: #4c1d95;
            margin-top: 24px;
            line-height: 1.45;
        }

        .danger-card {
            background-color: #fff1f2;
            border: 1px solid #fecdd3;
            border-left: 4px solid #ce1126;
            border-radius: 8px;
            padding: 16px;
            margin-top: 26px;
            text-align: center;
        }

        .danger-title {
            color: #9f1239;
            font-weight: 800;
            font-size: 13px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .danger-desc {
            color: #881337;
            font-size: 12px;
            margin-bottom: 14px;
            line-height: 1.4;
        }

        /* Footer */
        .footer-banner {
            background-color: #1a0a25;
            color: #cbd5e1;
            padding: 24px 28px;
            text-align: center;
            border-top: 3px solid #6b21a8;
        }

        .footer-logo-title {
            color: #ffffff;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .footer-compliance {
            color: #a855f7;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .footer-meta {
            color: #94a3b8;
            font-size: 10.5px;
            line-height: 1.45;
            max-width: 460px;
            margin: 0 auto;
        }

        /* Responsive Mobile Handling */
        @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 12px 6px !important; }
            .content-body { padding: 24px 18px !important; }
            .header-banner { padding: 20px 14px !important; }
            .otp-number { font-size: 30px !important; letter-spacing: 8px !important; padding-left: 8px !important; }
            .header-title { font-size: 14px !important; }
            .seal-img { width: 38px !important; height: 38px !important; }
            .btn-primary { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        }
    </style>
</head>
<body>
    @php
        $appUrl = config('app.url') ?? '';
        $isLocal = app()->environment('local') || str_contains($appUrl, 'localhost') || str_contains($appUrl, '.test') || str_contains($appUrl, '127.0.0.1');

        // In local development, fall back to GitHub public asset so Gmail fetches without creating MIME attachments.
        // In Coolify / Production, use the live domain asset() URL.
        $brgyLogo = $isLocal
            ? 'https://raw.githubusercontent.com/duustin25/women_and_family_new/main/public/Logo/barangay183LOGO.png'
            : asset('Logo/barangay183LOGO.png');

        $wfpLogo = $isLocal
            ? 'https://raw.githubusercontent.com/duustin25/women_and_family_new/main/public/Logo/women%26family_logo.png'
            : asset('Logo/women&family_logo.png');
    @endphp

    <div class="email-wrapper">
        <div class="email-card">
            <!-- 1. Top Bar -->
            <div class="top-strip">
                Official System Notification &bull; Pasay City
            </div>

            <!-- 2. Header Banner with Dual Logos & Titles -->
            <div class="header-banner">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td width="52" align="left" style="vertical-align: middle;">
                            <img src="{{ $brgyLogo }}" alt="Barangay 183" width="46" height="46" class="seal-img" style="width: 46px; height: 46px; border-radius: 50%; background-color: #ffffff; padding: 2px; border: 2px solid #e9d5ff; display: block;" />
                        </td>
                        <td align="center" style="vertical-align: middle; padding: 0 10px;">
                            <h1 class="header-title">Barangay 183, Pasay City</h1>
                            <div class="header-subtitle">Office of Women & Family Protection</div>
                        </td>
                        <td width="52" align="right" style="vertical-align: middle;">
                            <img src="{{ $wfpLogo }}" alt="Women & Family" width="46" height="46" class="seal-img" style="width: 46px; height: 46px; border-radius: 50%; background-color: #ffffff; padding: 2px; border: 2px solid #e9d5ff; display: block;" />
                        </td>
                    </tr>
                </table>
            </div>

            <!-- 3. Main Content Area -->
            <div class="content-body">
                @yield('content', $slot ?? '')
            </div>

            <!-- 4. Footer Banner -->
            <div class="footer-banner">
                <div class="footer-logo-title">Women & Family Support System</div>
                <div class="footer-compliance">RA 9262 (Anti-VAWC) &bull; RA 10173 (Data Privacy) Protected</div>
                <div class="footer-meta">
                    This is an automated official security dispatch. Do not reply directly to this transmission. For verification, contact the Barangay 183 Hall during official office hours.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
