<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VawcDossier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'dossier_number',
        'survivor_name',
        'respondent_name',
        'relationship_type',
        'survivor_demographics',
        'respondent_demographics',
        'incident_count',
        'highest_threat_level',
        'current_lifecycle',
        'last_incident_at',
        'created_by_id',
    ];

    protected $casts = [
        'survivor_demographics' => 'array',
        'respondent_demographics' => 'array',
        'incident_count' => 'integer',
        'last_incident_at' => 'datetime',
    ];

    /**
     * All sub-cases (incidents) belonging to this Master Dossier.
     */
    public function cases(): HasMany
    {
        return $this->hasMany(VawcCase::class, 'dossier_id')->orderBy('incident_sequence', 'desc');
    }

    /**
     * User who created the dossier folder.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * Recalculate dossier summary metrics based on child cases.
     */
    public function syncDossierAggregates(): void
    {
        $cases = $this->cases()->with(['assessment', 'protectionOrders'])->get();
        $this->incident_count = $cases->count();

        // Calculate highest threat level
        $threatWeights = ['CRITICAL' => 4, 'HIGH' => 3, 'MODERATE' => 2, 'LOW' => 1, 'PENDING' => 0];
        $highestWeight = 0;
        $highestLevel = 'PENDING';

        $hasActiveBpo = false;
        $hasCourtEscalation = false;
        $hasMonitoring = false;
        $allClosed = true;

        foreach ($cases as $c) {
            $level = $c->assessment?->risk_level ?? 'PENDING';
            $weight = $threatWeights[$level] ?? 0;
            if ($weight >= $highestWeight) {
                $highestWeight = $weight;
                $highestLevel = $level;
            }

            if ($c->status !== 'Closed') {
                $allClosed = false;
            }

            if (in_array($c->status, ['BPO Processing', 'Issued', 'Served'])) {
                $hasActiveBpo = true;
            } elseif ($c->status === 'Escalated') {
                $hasCourtEscalation = true;
            } elseif ($c->status === 'Monitoring') {
                $hasMonitoring = true;
            }
        }

        $this->highest_threat_level = $highestLevel;

        if ($hasActiveBpo) {
            $this->current_lifecycle = 'Active BPO';
        } elseif ($hasCourtEscalation) {
            $this->current_lifecycle = 'Escalated to Court';
        } elseif ($hasMonitoring) {
            $this->current_lifecycle = 'Under Monitoring';
        } elseif ($allClosed && $cases->isNotEmpty()) {
            $this->current_lifecycle = 'Dormant/Closed';
        }

        $latestCase = $cases->first();
        if ($latestCase) {
            $this->last_incident_at = $latestCase->caseReport?->incident_date ?? $latestCase->created_at;
        }

        $this->save();
    }
}
