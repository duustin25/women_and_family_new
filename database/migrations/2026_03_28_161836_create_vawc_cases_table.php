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
        Schema::create('vawc_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_report_id')->constrained('case_reports')->cascadeOnDelete();
            
            // Flowchart Path: Direct vs Third-Party
            $table->enum('intake_type', ['Direct', 'Third-Party'])->default('Direct');
            
            // Flowchart Phase 1: Verification
            $table->boolean('incident_veracity')->default(false); // PB goes to area and verifies
            $table->boolean('perpetrator_present')->default(false);
            $table->boolean('warrantless_arrest_made')->default(false);
            $table->boolean('weapons_confiscated')->default(false);
            
            // Lifecycle Management
            $table->enum('status', ['Intake', 'Assessment', 'Alternative Housing', 'BPO Processing', 'Monitoring', 'Escalated', 'Closed'])
                ->default('Intake');
                
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_cases');
    }
};
