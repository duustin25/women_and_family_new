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
        Schema::create('bcpc_children', function (Blueprint $table) {
            $table->id();
            
            // Guardian Info
            $table->string('guardian_name');
            $table->string('address');
            $table->string('contact_number')->nullable();
            
            // Child Info
            $table->string('child_first_name');
            $table->string('child_last_name');
            $table->string('child_middle_name')->nullable();
            $table->date('date_of_birth');
            $table->enum('sex', ['Male', 'Female']);
            
            // OPT Plus Metrics
            $table->date('date_of_weighing');
            $table->decimal('weight_kg', 8, 2);
            $table->decimal('height_cm', 8, 2);
            
            // e-OPT Nutritional Status (Z-Score evaluated via PHP logic)
            // WFA - Weight for Age (Prioritization Trigger)
            $table->enum('wfa_status', ['Normal', 'Underweight', 'Severely Underweight', 'Overweight'])->default('Normal');
            // HFA - Height for Age
            $table->enum('hfa_status', ['Normal', 'Stunted', 'Severely Stunted', 'Tall'])->default('Normal');
            
            // Interventions Tracker (JSON to store array of supplementation records, etc.)
            $table->json('intervention_logs')->nullable();
            
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bcpc_children');
    }
};
