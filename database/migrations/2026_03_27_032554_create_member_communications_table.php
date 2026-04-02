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
        Schema::create('member_communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->onDelete('cascade');
            $table->foreignId('sent_by')->constrained('users')->onDelete('cascade');
            $table->string('subject');
            $table->text('body');
            $table->string('type'); // 'Bulk', 'Individual', 'Welcome', 'Beneficiary'
            $table->enum('status', ['Sent', 'Failed', 'Pending'])->default('Sent');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_communications');
    }
};
