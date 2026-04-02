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
        Schema::create('vawc_compliance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vawc_case_id')->constrained('vawc_cases')->onDelete('cascade');
            $table->dateTime('monitor_date');
            $table->boolean('is_compliant')->default(true);
            $table->text('notes')->nullable();
            $table->string('referral_type')->nullable(); // Counseling, DSWD, PNP, Prosecutor
            $table->text('referral_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_compliance_logs');
    }
};
