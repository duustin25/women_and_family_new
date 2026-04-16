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
            
            // Foreign Keys (Indicate normalization)
            $table->foreignId('member_id')->nullable()->constrained('members')->onDelete('set null');
            $table->foreignId('zone_id')->nullable()->constrained('zones')->onDelete('set null');

            // Guardian Info
            $table->string('guardian_name');
            $table->string('address');
            $table->string('contact_number')->nullable();
            
            // Child Identity Data
            $table->string('child_first_name');
            $table->string('child_last_name');
            $table->string('child_middle_name')->nullable();
            $table->date('date_of_birth');
            $table->enum('sex', ['Male', 'Female']);
            
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
