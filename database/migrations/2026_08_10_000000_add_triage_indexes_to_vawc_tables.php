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
        Schema::table('vawc_assessments', function (Blueprint $table) {
            $table->index(['risk_level', 'risk_score', 'vawc_case_id'], 'idx_vawc_triage_priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vawc_assessments', function (Blueprint $table) {
            $table->dropIndex('idx_vawc_triage_priority');
        });
    }
};
