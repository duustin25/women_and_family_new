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
        Schema::create('bcpc_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_report_id')->constrained('case_reports')->cascadeOnDelete();
            $table->integer('cicl_age_during_offense')->nullable();
            $table->boolean('acted_with_discernment')->default(false);
            $table->boolean('is_victimless_crime')->default(false);
            $table->string('diversion_program_type')->nullable();
            $table->date('contract_signed_date')->nullable();
            $table->enum('status', ['Intake', 'Proceeding', 'Program Implementation', 'Monitoring', 'Forwarded to Prosecutor', 'Terminated'])->default('Intake');
            $table->string('closure_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bcpc_cases');
    }
};
