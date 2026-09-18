<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $otp;
    public string $activationUrl;

    public function __construct(User $user, string $otp)
    {
        $this->user = $user;
        $this->otp = $otp;
        $this->activationUrl = url('/verify-account?email=' . urlencode($user->email));
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Official System Invitation: Verify Your Account & Set Password',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user_invitation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
