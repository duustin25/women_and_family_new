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
        Schema::create('bcpc_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bcpc_child_id')->constrained('bcpc_children')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Measurement Data
            $table->date('date_of_weighing');
            $table->decimal('weight_kg', 8, 2);
            $table->decimal('height_cm', 8, 2);
            
            // e-OPT Nutritional Status (Computed)
            $table->enum('wfa_status', ['Normal', 'Underweight', 'Severely Underweight', 'Overweight'])->default('Normal');
            $table->enum('hfa_status', ['Normal', 'Stunted', 'Severely Stunted', 'Tall'])->default('Normal');
            
            $table->json('intervention_logs')->nullable();
            $table->text('remarks')->nullable();
            
            $table->timestamps();
        });
    }
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bcpc_assessments');
    }
};
