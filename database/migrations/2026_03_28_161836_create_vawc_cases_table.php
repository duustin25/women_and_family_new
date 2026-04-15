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

            // Risk Intelligence Fields
            $table->integer('children_count')->default(0);
            $table->boolean('is_repeat_offense')->default(false);
            $table->boolean('has_weapon_involved')->default(false);

            // Flowchart Phase 1: Verification
            $table->boolean('incident_veracity')->default(false); // PB goes to area and verifies
            $table->boolean('perpetrator_present')->default(false);
            $table->boolean('warrantless_arrest_made')->default(false);
            $table->boolean('weapons_confiscated')->default(false);

            // Pink Form Fields (RA 9262 Compliance)
            $table->string('referral_status')->nullable();
            $table->text('witness_info')->nullable();
            $table->string('action_sought')->nullable();

            // Lifecycle Management
            $table->enum('status', ['Intake', 'Assessment', 'Alternative Housing', 'BPO Processing', 'Monitoring', 'Escalated', 'Closed'])
                ->default('Intake');

            // Closure Fields
            $table->string('closure_reason')->nullable();
            $table->text('closure_remarks')->nullable();
            $table->timestamp('closed_at')->nullable();

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
