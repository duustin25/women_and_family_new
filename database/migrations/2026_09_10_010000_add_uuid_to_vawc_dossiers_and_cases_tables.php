<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add uuid column to vawc_dossiers if not present
        if (!Schema::hasColumn('vawc_dossiers', 'uuid')) {
            Schema::table('vawc_dossiers', function (Blueprint $table) {
                $table->uuid('uuid')->nullable()->after('id')->index();
            });

            // Backfill existing rows
            $dossiers = DB::table('vawc_dossiers')->whereNull('uuid')->get(['id']);
            foreach ($dossiers as $dossier) {
                DB::table('vawc_dossiers')->where('id', $dossier->id)->update([
                    'uuid' => (string) Str::uuid()
                ]);
            }

            // Set unique constraint after backfill
            Schema::table('vawc_dossiers', function (Blueprint $table) {
                $table->unique('uuid');
            });
        }

        // 2. Add uuid column to vawc_cases if not present
        if (!Schema::hasColumn('vawc_cases', 'uuid')) {
            Schema::table('vawc_cases', function (Blueprint $table) {
                $table->uuid('uuid')->nullable()->after('id')->index();
            });

            // Backfill existing rows
            $cases = DB::table('vawc_cases')->whereNull('uuid')->get(['id']);
            foreach ($cases as $case) {
                DB::table('vawc_cases')->where('id', $case->id)->update([
                    'uuid' => (string) Str::uuid()
                ]);
            }

            // Set unique constraint after backfill
            Schema::table('vawc_cases', function (Blueprint $table) {
                $table->unique('uuid');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('vawc_cases', 'uuid')) {
            Schema::table('vawc_cases', function (Blueprint $table) {
                $table->dropUnique(['uuid']);
                $table->dropColumn('uuid');
            });
        }

        if (Schema::hasColumn('vawc_dossiers', 'uuid')) {
            Schema::table('vawc_dossiers', function (Blueprint $table) {
                $table->dropUnique(['uuid']);
                $table->dropColumn('uuid');
            });
        }
    }
};
