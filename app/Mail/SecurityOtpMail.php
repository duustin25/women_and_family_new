<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SecurityOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $otp;
    public string $action;
    public ?string $targetValue;
    public string $panicUrl;
    public string $actionTitle;
    public string $actionDescription;

    public function __construct(User $user, string $otp, string $action, ?string $targetValue = null, ?string $panicToken = null)
    {
        $this->user = $user;
        $this->otp = $otp;
        $this->action = $action;
        $this->targetValue = $targetValue;
        $this->panicUrl = $panicToken ? url('/auth/security/panic/' . $panicToken) : url('/login');
        
        $normalized = strtoupper($action);
        if ($normalized === \App\Models\EmailOtp::ACTION_EMAIL_CHANGE || $normalized === 'EMAIL_CHANGE') {
            $this->actionTitle = 'Email Address Update';
            $this->actionDescription = $targetValue ? "Change primary email address to: {$targetValue}" : 'Change primary email address';
        } elseif ($normalized === \App\Models\EmailOtp::ACTION_PASSWORD_CHANGE || $normalized === 'PASSWORD_CHANGE') {
            $this->actionTitle = 'Account Password Change';
            $this->actionDescription = 'Update account login password';
        } else {
            $this->actionTitle = 'Account Security Verification';
            $this->actionDescription = 'Sensitive Account Security Verification';
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Verification Code: {$this->actionTitle}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.security_otp',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
