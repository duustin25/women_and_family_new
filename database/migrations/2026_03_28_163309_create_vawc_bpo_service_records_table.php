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
        Schema::create('vawc_bpo_service_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('protection_order_id')->constrained('vawc_protection_orders')->cascadeOnDelete();
            
            // Flowchart Phase 4: Service status
            $table->enum('service_method', ['Personally Received', 'Left at Residence'])->default('Personally Received');
            $table->dateTime('served_datetime');
            $table->foreignId('served_by_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('receiver_name')->nullable(); // If left at residence, who acknowledged?
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_bpo_service_records');
    }
};
