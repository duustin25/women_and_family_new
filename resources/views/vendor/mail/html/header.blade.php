@props(['url'])
@php
    $brgyLogo = isset($message) && file_exists(public_path('Logo/barangay183LOGO.png'))
        ? $message->embed(public_path('Logo/barangay183LOGO.png'))
        : asset('Logo/barangay183LOGO.png');
    $wfpLogo = isset($message) && file_exists(public_path('Logo/women&family_logo.png'))
        ? $message->embed(public_path('Logo/women&family_logo.png'))
        : asset('Logo/women&family_logo.png');
@endphp
<tr>
<td class="header" style="padding: 28px 0 16px 0; text-align: center;">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none; color: inherit;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; text-align: center;">
        <tr>
            <td style="vertical-align: middle; padding-right: 14px;">
                <img src="{{ $brgyLogo }}" alt="Barangay 183 Seal" width="52" height="52" style="width: 52px; height: 52px; border-radius: 50%; display: block; border: 1px solid #e5e7eb;" />
            </td>
            <td style="vertical-align: middle; text-align: center; padding: 0 10px;">
                <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 700; color: #111827; letter-spacing: -0.01em; line-height: 1.25; display: block;">
                    Barangay 183 Women & Family Protection System
                </span>
            </td>
            <td style="vertical-align: middle; padding-left: 14px;">
                <img src="{{ $wfpLogo }}" alt="Women & Family Logo" width="52" height="52" style="width: 52px; height: 52px; border-radius: 50%; display: block; border: 1px solid #e5e7eb;" />
            </td>
        </tr>
    </table>
</a>
</td>
</tr>

