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
        Schema::create('vawc_involved_parties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vawc_case_id')->constrained('vawc_cases')->cascadeOnDelete();

            // Basic Details
            $table->enum('role', ['Victim', 'Respondent', 'Witness', 'Reporter'])->default('Victim');
            $table->string('relationship_to_victim')->nullable();
            $table->string('name');
            $table->integer('age')->nullable();
            $table->string('gender')->nullable();

            // Pink Form Socio-Demographic Fields (RA 9262 Compliance)
            $table->string('civil_status')->nullable();
            $table->string('educational_attainment')->nullable();
            $table->string('occupation')->nullable();
            $table->text('physical_description')->nullable();

            // Sensitive Data (Encrypted in Laravel)
            $table->text('contact_number')->nullable();
            $table->text('address')->nullable();

            // Logic Helpers
            $table->boolean('is_minor')->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vawc_involved_parties');
    }
};
