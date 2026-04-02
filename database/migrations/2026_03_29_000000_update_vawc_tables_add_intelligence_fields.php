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
        // Add relationship field to involved parties
        Schema::table('vawc_involved_parties', function (Blueprint $table) {
            $table->string('relationship_to_victim')->nullable()->after('role');
        });

        // Add risk intelligence fields to cases
        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->integer('children_count')->default(0)->after('intake_type');
            $table->boolean('is_repeat_offense')->default(false)->after('children_count');
            $table->boolean('has_weapon_involved')->default(false)->after('is_repeat_offense');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vawc_involved_parties', function (Blueprint $table) {
            $table->dropColumn('relationship_to_victim');
        });

        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->dropColumn(['children_count', 'is_repeat_offense', 'has_weapon_involved']);
        });
    }
};
