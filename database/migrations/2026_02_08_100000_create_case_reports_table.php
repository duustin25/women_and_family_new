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
        Schema::create('case_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type');
            $table->string('case_number')->unique();
            $table->string('victim_name')->nullable();
            $table->integer('victim_age')->nullable();
            $table->string('victim_gender')->nullable();
            $table->string('complainant_name')->nullable();
            $table->string('complainant_contact')->nullable();
            $table->string('relation_to_victim')->nullable();
            $table->timestamp('incident_date')->nullable();
            $table->string('incident_location')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->foreignId('zone_id')->nullable()->constrained();
            $table->foreignId('abuse_type_id')->nullable()->constrained('case_types');
            $table->string('lifecycle_status')->default('New');
            $table->foreignId('handled_by_id')->nullable()->constrained('users');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('case_reports');
    }
};
