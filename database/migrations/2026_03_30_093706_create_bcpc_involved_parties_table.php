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
        Schema::create('bcpc_involved_parties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bcpc_case_id')->constrained('bcpc_cases')->cascadeOnDelete();
            $table->enum('role', ['CICL', 'Victim', 'Parent/Guardian', 'Other']);
            $table->string('name');
            $table->integer('age')->nullable();
            $table->string('gender', 50)->nullable();
            $table->string('contact')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bcpc_involved_parties');
    }
};
