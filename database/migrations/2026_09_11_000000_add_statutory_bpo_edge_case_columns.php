<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to support statutory BPO edge cases:
     * - Acting Kagawad signatory support (RA 9262 Sec. 14)
     * - Tender of Service & Witness Tanod recording (SC A.M. No. 04-10-11-SC)
     * - Minor children school/stay-away details (RA 7610 & RA 9262)
     */
    public function up(): void
    {
        Schema::table('vawc_protection_orders', function (Blueprint $table) {
            $table->string('signatory_role')->default('Punong Barangay')->after('issued_by_id');
            $table->string('signatory_name')->nullable()->after('signatory_role');
            $table->string('signatory_designation')->nullable()->after('signatory_name');
        });

        Schema::table('vawc_bpo_service_records', function (Blueprint $table) {
            $table->boolean('refused_to_sign')->default(false)->after('receiver_name');
            $table->string('serving_officer_name')->nullable()->after('refused_to_sign');
            $table->string('witness_tanod_name')->nullable()->after('serving_officer_name');
            $table->text('tender_notes')->nullable()->after('witness_tanod_name');
        });

        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->json('children_details')->nullable()->after('children_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->dropColumn('children_details');
        });

        Schema::table('vawc_bpo_service_records', function (Blueprint $table) {
            $table->dropColumn(['refused_to_sign', 'serving_officer_name', 'witness_tanod_name', 'tender_notes']);
        });

        Schema::table('vawc_protection_orders', function (Blueprint $table) {
            $table->dropColumn(['signatory_role', 'signatory_name', 'signatory_designation']);
        });
    }
};
