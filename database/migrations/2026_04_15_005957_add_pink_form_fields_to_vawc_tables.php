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
        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->string('referral_status')->nullable()->after('weapons_confiscated');
            $table->text('witness_info')->nullable()->after('referral_status');
            $table->string('action_sought')->nullable()->after('witness_info');
        });

        Schema::table('vawc_involved_parties', function (Blueprint $table) {
            $table->string('civil_status')->nullable()->after('gender');
            $table->string('educational_attainment')->nullable()->after('civil_status');
            $table->string('occupation')->nullable()->after('educational_attainment');
            $table->text('physical_description')->nullable()->after('occupation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->dropColumn(['referral_status', 'witness_info', 'action_sought']);
        });

        Schema::table('vawc_involved_parties', function (Blueprint $table) {
            $table->dropColumn(['civil_status', 'educational_attainment', 'occupation', 'physical_description']);
        });
    }
};
