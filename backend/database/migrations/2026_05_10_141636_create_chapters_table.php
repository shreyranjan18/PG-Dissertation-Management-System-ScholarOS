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
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dissertation_id')->constrained()->onDelete('cascade');
            $table->string('title'); // e.g. Chapter 1: Introduction
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status')->default('pending'); // pending, approved, changes_requested
            $table->text('guide_feedback')->nullable();
            $table->integer('order')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};
