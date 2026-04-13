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
        'guardian_name',
        'address',
        'contact_number',
        'child_first_name',
        'child_last_name',
        'child_middle_name',
        'date_of_birth',
        'sex',
        'date_of_weighing',
        'weight_kg',
        'height_cm',
        'wfa_status',
        'hfa_status',
        'intervention_logs',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_weighing' => 'date',
        'weight_kg' => 'float',
        'height_cm' => 'float',
        'intervention_logs' => 'array',
    ];

    /**
     * Virtual attribute for the full name.
     */
    public function getFullNameAttribute()
    {
        return trim("{$this->child_first_name} {$this->child_middle_name} {$this->child_last_name}");
    }
}
