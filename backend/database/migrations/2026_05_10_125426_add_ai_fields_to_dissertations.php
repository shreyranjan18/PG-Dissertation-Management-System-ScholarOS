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
            $table->text('ai_summary')->nullable();
            $table->json('ai_suggestions')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dissertations', function (Blueprint $table) {
            //
        });
    }
};
