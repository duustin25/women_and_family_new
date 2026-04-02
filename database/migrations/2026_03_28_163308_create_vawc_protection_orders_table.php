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
        Schema::create('vawc_protection_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vawc_case_id')->constrained('vawc_cases')->cascadeOnDelete();
            
            // Types per Flowchart Phase 4 & 7
            $table->enum('type', ['BPO', 'TPO', 'PPO'])->default('BPO');
            
            // SLA Tracking per RA 9262 (Same-Day / 1-Hour requirement)
            $table->dateTime('application_datetime')->nullable();
            $table->dateTime('issued_datetime')->nullable();
            $table->boolean('is_sla_breached')->default(false);
            
            // Status Lifecycle
            $table->enum('status', ['Draft', 'Applied', 'Issued', 'Served', 'Violated', 'Expired'])->default('Applied');
            
            $table->date('expiration_date')->nullable();
            $table->foreignId('issued_by_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_protection_orders');
    }
};
