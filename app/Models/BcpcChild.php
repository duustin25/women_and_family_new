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
        'child_first_name',
        'child_last_name',
        'child_middle_name',
        'date_of_birth',
        'sex',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

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
