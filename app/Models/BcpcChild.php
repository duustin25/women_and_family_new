<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property \Carbon\Carbon $date_of_birth
 * @property \Carbon\Carbon $date_of_weighing
 * @property float $weight_kg
 * @property float $height_cm
 * @property array $intervention_logs
 */
class BcpcChild extends Model
{
    use HasFactory;

    protected $table = 'bcpc_children';

    protected $fillable = [
        'member_id',
        'zone_id',
        'guardian_name',
        'address',
        'contact_number',
        'bns_name',
        'child_first_name',
        'child_last_name',
        'child_middle_name',
        'photo_path',
        'date_of_birth',
        'sex',
        'status',
        'sfp_status',
        'sfp_start_date',
        'sfp_end_date',
        'sfp_cycle_number',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'sfp_start_date' => 'date',
        'sfp_end_date' => 'date',
        'sfp_cycle_number' => 'integer',
    ];

    protected $appends = [
        'full_name',
        'photo_url',
    ];

    /**
     * Virtual attribute for the photo URL.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        if ($this->photo_path) {
            return asset('storage/' . $this->photo_path);
        }
        return null;
    }

    /**
     * Virtual attribute for the full name.
     */
    public function getFullNameAttribute()
    {
        return trim("{$this->child_first_name} {$this->child_middle_name} {$this->child_last_name}");
    }

    /**
     * Relationship to the Resident record.
     */
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Relationship to the Zone.
     */
    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Relationship to Nutritional Assessments.
     */
    public function assessments()
    {
        return $this->hasMany(BcpcAssessment::class, 'bcpc_child_id');
    }

    /**
     * Helper for latest assessment.
     */
    public function latestAssessment()
    {
        return $this->hasOne(BcpcAssessment::class, 'bcpc_child_id')->latestOfMany();
    }
}
