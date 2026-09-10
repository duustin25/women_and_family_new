<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE `vawc_dossiers` MODIFY COLUMN `current_lifecycle` VARCHAR(50) NOT NULL DEFAULT 'Application Pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE `vawc_dossiers` MODIFY COLUMN `current_lifecycle` ENUM('Active BPO', 'Under Monitoring', 'Escalated to Court', 'Dormant/Closed') NOT NULL DEFAULT 'Under Monitoring'");
    }
};
