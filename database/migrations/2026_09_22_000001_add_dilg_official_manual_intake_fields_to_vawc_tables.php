<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Incorporates official DILG NBOO manual intake fields and flowchart decision nodes.
     */
    public function up(): void
    {
        // 1. Add complainant_address to case_reports if not present
        if (!Schema::hasColumn('case_reports', 'complainant_address')) {
            Schema::table('case_reports', function (Blueprint $table) {
                $table->text('complainant_address')->nullable()->after('complainant_contact');
            });
        }

        // 2. Add demographics, alias, birth, and work address to vawc_involved_parties
        Schema::table('vawc_involved_parties', function (Blueprint $table) {
            if (!Schema::hasColumn('vawc_involved_parties', 'alias')) {
                $table->string('alias')->nullable()->after('name');
            }
            if (!Schema::hasColumn('vawc_involved_parties', 'birthdate')) {
                $table->date('birthdate')->nullable()->after('age');
            }
            if (!Schema::hasColumn('vawc_involved_parties', 'birthplace')) {
                $table->string('birthplace')->nullable()->after('birthdate');
            }
            if (!Schema::hasColumn('vawc_involved_parties', 'nationality')) {
                $table->string('nationality')->default('Filipino')->after('birthplace');
            }
            if (!Schema::hasColumn('vawc_involved_parties', 'work_address')) {
                $table->text('work_address')->nullable()->after('address');
            }
        });

        // 3. Add incident facts, weapons, emergency handoffs, and guardian BPO consent to vawc_cases
        Schema::table('vawc_cases', function (Blueprint $table) {
            if (!Schema::hasColumn('vawc_cases', 'incident_location_details')) {
                $table->text('incident_location_details')->nullable()->after('children_details');
            }
            if (!Schema::hasColumn('vawc_cases', 'is_offender_armed')) {
                $table->boolean('is_offender_armed')->default(false)->after('has_weapon_involved');
            }
            if (!Schema::hasColumn('vawc_cases', 'weapons_used')) {
                $table->json('weapons_used')->nullable()->after('is_offender_armed');
            }
            if (!Schema::hasColumn('vawc_cases', 'substance_abuse')) {
                $table->json('substance_abuse')->nullable()->after('weapons_used');
            }
            if (!Schema::hasColumn('vawc_cases', 'requires_medical')) {
                $table->boolean('requires_medical')->default(false)->after('weapons_confiscated');
            }
            if (!Schema::hasColumn('vawc_cases', 'medical_facility_name')) {
                $table->string('medical_facility_name')->nullable()->after('requires_medical');
            }
            if (!Schema::hasColumn('vawc_cases', 'requires_alternative_housing')) {
                $table->boolean('requires_alternative_housing')->default(false)->after('medical_facility_name');
            }
            if (!Schema::hasColumn('vawc_cases', 'victim_shelter_choice')) {
                $table->string('victim_shelter_choice')->nullable()->after('requires_alternative_housing');
            }
            if (!Schema::hasColumn('vawc_cases', 'immediate_emergency_actions')) {
                $table->json('immediate_emergency_actions')->nullable()->after('victim_shelter_choice');
            }
            if (!Schema::hasColumn('vawc_cases', 'is_bpo_consented_by_guardian')) {
                $table->boolean('is_bpo_consented_by_guardian')->default(true)->after('immediate_emergency_actions');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->dropColumn([
                'incident_location_details',
                'is_offender_armed',
                'weapons_used',
                'substance_abuse',
                'requires_medical',
                'medical_facility_name',
                'requires_alternative_housing',
                'victim_shelter_choice',
                'immediate_emergency_actions',
                'is_bpo_consented_by_guardian'
            ]);
        });

        Schema::table('vawc_involved_parties', function (Blueprint $table) {
            $table->dropColumn([
                'alias',
                'birthdate',
                'birthplace',
                'nationality',
                'work_address'
            ]);
        });

        if (Schema::hasColumn('case_reports', 'complainant_address')) {
            Schema::table('case_reports', function (Blueprint $table) {
                $table->dropColumn('complainant_address');
            });
        }
    }
};
