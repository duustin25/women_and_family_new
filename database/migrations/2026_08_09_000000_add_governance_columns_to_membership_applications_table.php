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
        Schema::table('membership_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('membership_applications', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('status');
            }
            if (!Schema::hasColumn('membership_applications', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('rejection_reason');
            }
            if (!Schema::hasColumn('membership_applications', 'appeal_reason')) {
                $table->text('appeal_reason')->nullable()->after('rejected_at');
            }
            if (!Schema::hasColumn('membership_applications', 'appeal_docs')) {
                $table->json('appeal_docs')->nullable()->after('appeal_reason');
            }
            if (!Schema::hasColumn('membership_applications', 'appealed_at')) {
                $table->timestamp('appealed_at')->nullable()->after('appeal_docs');
            }
            if (!Schema::hasColumn('membership_applications', 'approval_type')) {
                $table->string('approval_type')->nullable()->after('appealed_at'); // 'manual', 'admin_overrule', 'auto_sla'
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membership_applications', function (Blueprint $table) {
            $table->dropColumn([
                'rejection_reason',
                'rejected_at',
                'appeal_reason',
                'appeal_docs',
                'appealed_at',
                'approval_type',
            ]);
        });
    }
};
