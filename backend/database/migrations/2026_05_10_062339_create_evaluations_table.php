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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dissertation_id');
            $table->unsignedBigInteger('evaluator_id');
            $table->text('remarks')->nullable();
            $table->integer('marks')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->foreign('dissertation_id')->references('id')->on('dissertations')->onDelete('cascade');
            $table->foreign('evaluator_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
