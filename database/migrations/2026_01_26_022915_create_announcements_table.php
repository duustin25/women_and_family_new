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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The admin who wrote it
            $table->foreignId('organization_id')->nullable()->constrained()->onDelete('set null'); // The org it belongs to
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category'); // VAWC, GAD, etc.
            $table->text('content');
            $table->string('excerpt');
            $table->string('image_path')->nullable();
            $table->string('location')->nullable();
            $table->date('event_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
