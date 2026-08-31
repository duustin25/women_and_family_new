<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vawc_dossiers', function (Blueprint $table) {
            $table->id();
            $table->string('dossier_number')->unique(); // e.g. DOS-2026-0001
            $table->string('survivor_name');
            $table->string('respondent_name')->default('Unknown');
            $table->string('relationship_type')->nullable(); // Spouse, Live-in Partner, Former Partner, etc.
            
            // Encrypted/JSON Demographic snapshots
            $table->json('survivor_demographics')->nullable();
            $table->json('respondent_demographics')->nullable();
            
            // Intelligence & Aggregates
            $table->integer('incident_count')->default(1);
            $table->enum('highest_threat_level', ['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'PENDING'])->default('PENDING');
            $table->enum('current_lifecycle', ['Active BPO', 'Under Monitoring', 'Escalated to Court', 'Dormant/Closed'])->default('Under Monitoring');
            $table->timestamp('last_incident_at')->nullable();
            
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_dossiers');
    }
};
