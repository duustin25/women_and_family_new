<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaseAbuseType extends Model
{
    use HasFactory;

    protected $table = 'case_types';

    protected $fillable = ['name', 'category', 'color', 'description', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function caseReports()
    {
        return $this->hasMany(CaseReport::class, 'abuse_type_id');
    }
}
