<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
 
class BcpcAssessment extends Model
{
    use HasFactory;
 
    protected $table = 'bcpc_assessments';
 
    protected $fillable = [
        'bcpc_child_id',
        'user_id',
        'date_of_weighing',
        'weight_kg',
        'height_cm',
        'wfa_status',
        'hfa_status',
        'intervention_logs',
        'remarks',
    ];
 
    protected $casts = [
        'date_of_weighing' => 'date',
        'weight_kg' => 'float',
        'height_cm' => 'float',
        'intervention_logs' => 'array',
    ];
 
    /**
     * Relationship back to the Child profile.
     */
    public function child()
    {
        return $this->belongsTo(BcpcChild::class, 'bcpc_child_id');
    }
 
    /**
     * Relationship to the Recording User (BNS/Admin).
     */
    public function recorder()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
