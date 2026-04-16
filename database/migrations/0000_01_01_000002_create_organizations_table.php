<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., KALIPI
            $table->string('slug')->unique(); // e.g., kalipi-association
            $table->text('description'); // Short description
            $table->string('color_theme')->default('bg-blue-700'); // For your UI coloring
            $table->string('image_path')->nullable(); // Banner image
            $table->string('left_logo_path')->nullable();
            $table->string('right_logo_path')->nullable();
            $table->json('requirements')->nullable(); // Array of requirements needed to apply
            $table->json('form_schema')->nullable();
            $table->json('print_settings')->nullable(); // Print layout configuration
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
