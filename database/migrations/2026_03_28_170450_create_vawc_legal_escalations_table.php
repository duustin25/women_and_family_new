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
        Schema::create('vawc_legal_escalations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vawc_case_id')->constrained('vawc_cases')->onDelete('cascade');
            $table->dateTime('violation_datetime');
            $table->string('referral_target'); // PNP, Prosecutor, Court
            $table->boolean('escorted_by_pb')->default(false); // RA 9262 Step 12
            $table->string('status')->default('Case Prepared'); // Case Prepared, Filed, Under Trial
            $table->text('violation_description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_legal_escalations');
    }
};
