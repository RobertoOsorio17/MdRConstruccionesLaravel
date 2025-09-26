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
        Schema::create('error_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type', 10)->index(); // 404, 500, 403, etc.
            $table->text('url');
            $table->string('method', 10)->default('GET');
            $table->text('user_agent')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('referrer')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->json('additional_data')->nullable(); // For storing extra context
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['type', 'created_at']);
            $table->index('created_at');
            $table->index('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('error_logs');
    }
};
