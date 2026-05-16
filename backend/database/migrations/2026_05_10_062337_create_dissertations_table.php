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
        Schema::create('dissertations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('abstract')->nullable();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('guide_id')->nullable();
            $table->string('domain')->nullable();
            $table->string('department')->nullable();
            $table->string('research_area')->nullable();
            $table->string('file_path')->nullable();
            $table->integer('progress')->default(0);
            $table->string('status')->default('pending_approval'); // pending_approval, approved, rejected, changes_requested
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('guide_id')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dissertations');
    }
};
