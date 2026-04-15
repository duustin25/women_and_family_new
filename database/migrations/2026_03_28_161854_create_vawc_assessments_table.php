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
        Schema::create('vawc_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vawc_case_id')->constrained('vawc_cases')->cascadeOnDelete();

            // Phase 2: Medical
            $table->boolean('requires_medical')->default(false);
            $table->text('medical_notes')->nullable(); // Encrypted

            // Phase 3: Alternative Housing
            $table->boolean('requires_alternative_housing')->default(false);
            $table->text('housing_notes')->nullable(); // Encrypted

            // Connector A logic
            $table->boolean('lswo_referral_made')->default(false);
            $table->boolean('dswd_referral_made')->default(false);

            // VAWC-RAVE Risk Scoring Algorithm
            $table->integer('abuse_frequency')->default(0);
            $table->integer('abuse_severity')->default(0);
            $table->integer('weapon_access')->default(0);
            $table->integer('life_threat_level')->default(0);
            $table->decimal('risk_score', 4, 2)->default(0.00);
            $table->string('risk_level')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_assessments');
    }
};
