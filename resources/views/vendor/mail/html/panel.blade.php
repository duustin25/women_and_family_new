@php
    $cleanSlot = preg_replace('/^[ \t]+(?=<|#|\*|[a-zA-Z0-9])/m', '', (string)$slot);
@endphp
<table class="panel" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="panel-content">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="panel-item">
{!! Illuminate\Mail\Markdown::parse($cleanSlot) !!}
</td>
</tr>
</table>
</td>
</tr>
</table>