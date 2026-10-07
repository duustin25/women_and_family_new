<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <title>{{ config('app.name') }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <style>
        @media only screen and (max-width: 600px) {
            .inner-body {
                width: 100% !important;
                border-radius: 0 !important;
                border-left: none !important;
                border-right: none !important;
            }

            .content-cell {
                padding: 24px 18px !important;
            }

            .footer {
                width: 100% !important;
            }
        }

        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
                display: block !important;
            }
        }
    </style>
    {!! $head ?? '' !!}
</head>

<body>

    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    {!! $header ?? '' !!}

                    <!-- Email Body -->
                    <tr>
                        <td class="body" width="100%" cellpadding="0" cellspacing="0">
                            <table class="inner-body" align="center" width="580" cellpadding="0" cellspacing="0" role="presentation">
                                <!-- Top Accent Header Bar -->
                                <tr>
                                    <td style="height: 4px; background-color: #1e40af; border-top-left-radius: 7px; border-top-right-radius: 7px;"></td>
                                </tr>
                                <!-- Body content -->
                                <tr>
                                    <td class="content-cell">
                                        @php
                                            // Bulletproof Indentation Safeguard:
                                            // Markdown treats lines indented by 4+ spaces as preformatted code blocks (<pre><code>).
                                            // Strip accidental leading whitespace from HTML tags and Markdown headings/lists.
                                            $cleanSlot = preg_replace('/^[ \t]+(?=<|#|\*|[a-zA-Z0-9])/m', '', (string)$slot);
                                        @endphp
                                        {!! Illuminate\Mail\Markdown::parse($cleanSlot) !!}

                                        {!! $subcopy ?? '' !!}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {!! $footer ?? '' !!}
                </table>
            </td>
        </tr>
    </table>
</body>

</html>