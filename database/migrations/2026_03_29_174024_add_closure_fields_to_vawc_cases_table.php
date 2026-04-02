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
            $table->string('closure_reason')->nullable();
            $table->text('closure_remarks')->nullable();
            $table->timestamp('closed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->dropColumn(['closure_reason', 'closure_remarks', 'closed_at']);
        });
    }
};
