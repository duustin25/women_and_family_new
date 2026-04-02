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
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membership_application_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            // Core Identity
            $table->string('fullname');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            // Secure Token (UUID for Magic Link)
            $table->uuid('secure_token')->unique();
            // Data Retrieval Helper (Caching the original application JSON or just partial data)
            $table->json('member_meta')->nullable();
            // Management
            $table->enum('status', ['Active', 'Suspended', 'Deactivated'])->default('Active');
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
