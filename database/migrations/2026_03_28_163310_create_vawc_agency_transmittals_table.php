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
        Schema::create('vawc_agency_transmittals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('protection_order_id')->constrained('vawc_protection_orders')->cascadeOnDelete();
            
            // Flowchart Phase 2: Transmission to PNP
            $table->string('agency')->default('PNP Women and Children Protection');
            $table->dateTime('transmittal_datetime');
            $table->string('document_path')->nullable();
            
            $table->enum('status', ['Sent', 'Acknowledged'])->default('Sent');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_agency_transmittals');
    }
};
