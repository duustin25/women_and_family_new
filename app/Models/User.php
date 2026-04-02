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
        ];
    }

    /**
     * RELATIONSHIP: User belongs to an organization (if they are a President)
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    // --- Helpers ---
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

