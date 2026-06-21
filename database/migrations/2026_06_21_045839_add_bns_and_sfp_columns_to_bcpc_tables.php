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
            $table->string('bns_name')->nullable()->after('contact_number');
            $table->string('sfp_status')->default('None')->after('status'); // None, Enrolled, Completed, Graduated, Terminated
            $table->date('sfp_start_date')->nullable()->after('sfp_status');
            $table->date('sfp_end_date')->nullable()->after('sfp_start_date');
        });

        Schema::table('bcpc_assessments', function (Blueprint $table) {
            $table->string('bns_assessor')->nullable()->after('remarks');
            $table->integer('sfp_day_number')->nullable()->after('bns_assessor'); // e.g., 1, 30, 60, 90
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bcpc_children', function (Blueprint $table) {
            $table->dropColumn(['bns_name', 'sfp_status', 'sfp_start_date', 'sfp_end_date']);
        });

        Schema::table('bcpc_assessments', function (Blueprint $table) {
            $table->dropColumn(['bns_assessor', 'sfp_day_number']);
        });
    }
};
