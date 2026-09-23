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
        Schema::table('bcpc_children', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('child_middle_name');
            $table->unsignedTinyInteger('sfp_cycle_number')->default(1)->after('sfp_end_date');
        });

        Schema::table('bcpc_assessments', function (Blueprint $table) {
            $table->unsignedTinyInteger('sfp_cycle_number')->default(1)->after('sfp_day_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bcpc_children', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'sfp_cycle_number']);
        });

        Schema::table('bcpc_assessments', function (Blueprint $table) {
            $table->dropColumn(['sfp_cycle_number']);
        });
    }
};
