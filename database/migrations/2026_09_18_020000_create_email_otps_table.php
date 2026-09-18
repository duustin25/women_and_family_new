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
        Schema::create('email_otps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action'); // ACCOUNT_ACTIVATION, EMAIL_CHANGE, PASSWORD_CHANGE, ACCOUNT_DELETION
            $table->string('target_value')->nullable(); // Quarantined proposed email or payload
            $table->string('otp_hash', 64); // SHA-256 hash of 6-digit code
            $table->string('panic_token_hash', 64)->nullable(); // SHA-256 hash of emergency kill token
            $table->unsignedTinyInteger('attempts')->default(0); // Max 3 tries
            $table->boolean('is_used')->default(false);
            $table->timestamp('expires_at');
            $table->timestamps();

            // High-performance composite indexes
            $table->index(['user_id', 'action', 'is_used']);
            $table->index('expires_at');
            $table->index('panic_token_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_otps');
    }
};
