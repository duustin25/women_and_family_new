<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
// relationship import
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color_theme',
        'image_path',
        'left_logo_path',
        'right_logo_path',
        'requirements',
        'form_schema',
        'print_settings'
    ];

    // Cast requirements as array automatically
    protected $casts = [
        'requirements' => 'array',
        'form_schema' => 'array',
        'print_settings' => 'array',
    ];


    /**
     * RELATIONSHIP: An organization has many membership applications.
     */
    public function membershipApplications(): HasMany
    {
        return $this->hasMany(MembershipApplication::class);
    }

    /**
     * RELATIONSHIP: An organization has many events/proposals.
     */
    public function events(): HasMany
    {
        return $this->hasMany(GadEvent::class);
    }

    /**
     * RELATIONSHIP: Inverse connection to User (President)
     */
    public function president()
    {
        return $this->hasOne(User::class)->where('role', 'president');
    }

    /**
     * ACCESSOR: Map president->name to president_name for backward compatibility.
     */
    public function getPresidentNameAttribute()
    {
        return $this->president ? $this->president->name : null;
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($organization) {
            // Only generate slug if not provided/empty
            if (empty($organization->slug)) {
                $organization->slug = Str::slug($organization->name);
            }
        });

        static::updating(function ($organization) {
            if ($organization->isDirty('name')) {
                $organization->slug = Str::slug($organization->name);
            }
        });
    }
}