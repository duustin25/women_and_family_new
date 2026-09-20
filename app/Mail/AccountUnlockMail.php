<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountUnlockMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $unlockUrl;

    public function __construct(User $user, string $rawUnlockToken)
    {
        $this->user = $user;
        $this->unlockUrl = url('/auth/unlock/verify/' . $rawUnlockToken);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Account Recovery: Secure Unlock Link',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account_unlock',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
