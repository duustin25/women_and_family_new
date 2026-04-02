<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('membership_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            // Primary Indexing Fields
            $table->string('fullname');
            $table->string('address');
            $table->string('email')->nullable();
            $table->string('status')->default('Pending'); // Pending, Approved, Disapproved

            // Dynamic JSON Storage (Form Builder Data)
            $table->json('form_data')->nullable(); // Consolidates all dynamic form inputs including tables

            // Approval Tracking
            $table->string('recommended_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->timestamp('actioned_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_applications');
    }
};
