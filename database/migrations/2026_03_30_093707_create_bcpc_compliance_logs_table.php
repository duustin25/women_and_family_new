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
        Schema::create('bcpc_compliance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bcpc_case_id')->constrained('bcpc_cases')->cascadeOnDelete();
            $table->foreignId('logged_by_id')->constrained('users')->cascadeOnDelete();
            $table->date('monitor_date');
            $table->boolean('is_compliant')->default(true);
            $table->text('notes');
            $table->string('attachment_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bcpc_compliance_logs');
    }
};
