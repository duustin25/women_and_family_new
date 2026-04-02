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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Who performed the action. Null if system/guest.
            $table->string('action'); // Created, Updated, Deleted, Logged In, etc.
            $table->morphs('auditable'); // Polymorphic columns (auditable_type, auditable_id)
            $table->json('old_values')->nullable(); // State before action
            $table->json('new_values')->nullable(); // State after action
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
