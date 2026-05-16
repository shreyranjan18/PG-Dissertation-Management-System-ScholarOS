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
        Schema::table('dissertations', function (Blueprint $table) {
            $table->integer('guide_marks')->nullable();
            $table->integer('hod_marks')->nullable();
            $table->integer('examiner_marks')->nullable();
            $table->integer('total_marks')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dissertations', function (Blueprint $table) {
            $table->dropColumn(['guide_marks', 'hod_marks', 'examiner_marks', 'total_marks']);
        });
    }
};
