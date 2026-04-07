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
            $table->integer('abuse_frequency')->default(0)->after('dswd_referral_made');
            $table->integer('abuse_severity')->default(0)->after('abuse_frequency');
            $table->integer('weapon_access')->default(0)->after('abuse_severity');
            $table->integer('life_threat_level')->default(0)->after('weapon_access');
            $table->decimal('risk_score', 4, 2)->default(0.00)->after('life_threat_level');
            $table->string('risk_level')->nullable()->after('risk_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vawc_assessments', function (Blueprint $table) {
            $table->dropColumn([
                'abuse_frequency',
                'abuse_severity',
                'weapon_access',
                'life_threat_level',
                'risk_score',
                'risk_level'
            ]);
        });
    }
};
