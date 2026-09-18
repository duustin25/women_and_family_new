<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    // Role Constants
    const ROLE_ADMIN = 'admin';
    const ROLE_HEAD = 'head'; // Committee Head
    const ROLE_PRESIDENT = 'president'; // Org President
    const ROLE_RESIDENT = 'resident';

    // Lifecycle Status Constants
    const STATUS_ACTIVE = 'active';
    const STATUS_PENDING_VERIFICATION = 'pending_verification';
    const STATUS_LOCKED = 'locked';
    const STATUS_SUSPENDED = 'suspended';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'is_active',
        'invited_by_id',
        'organization_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * RELATIONSHIP: User belongs to an organization (if they are a President)
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * RELATIONSHIP: The admin user who invited this user.
     */
    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by_id');
    }

    /**
     * RELATIONSHIP: Security and Activation OTP tokens.
     */
    public function emailOtps()
    {
        return $this->hasMany(EmailOtp::class);
    }

    // --- Scopes ---
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('status', self::STATUS_ACTIVE);
    }

    public function scopePendingVerification($query)
    {
        return $query->where('status', self::STATUS_PENDING_VERIFICATION);
    }

    public function scopeLocked($query)
    {
        return $query->where('status', self::STATUS_LOCKED);
    }

    // --- Helpers ---
    public function isVerifiedAndActive(): bool
    {
        return (bool) $this->is_active && $this->status === self::STATUS_ACTIVE;
    }

    public function isLocked(): bool
    {
        return $this->status === self::STATUS_LOCKED;
    }

    public function isPendingVerification(): bool
    {
        return $this->status === self::STATUS_PENDING_VERIFICATION;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isHead(): bool
    {
        return $this->role === self::ROLE_HEAD;
    }

    public function isPresident(): bool
    {
        return $this->role === self::ROLE_PRESIDENT;
    }

    public function isStaff(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_HEAD]);
    }
}

