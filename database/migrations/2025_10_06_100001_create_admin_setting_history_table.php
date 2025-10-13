<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create the admin_setting_history table to track all configuration changes.
 * 
 * This migration creates a comprehensive audit trail for admin settings,
 * recording who changed what, when, and from where.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admin_setting_history', function (Blueprint $table) {
            $table->id();
            
            // Foreign key to the setting that was changed
            $table->foreignId('setting_id')
                  ->constrained('admin_settings')
                  ->onDelete('cascade');
            
            // Foreign key to the user who made the change
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            // Store the old and new values as text (will be cast based on setting type)
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            
            // Track where the change came from
            $table->string('ip_address', 45)->nullable(); // IPv6 compatible
            $table->text('user_agent')->nullable();
            
            // Additional context
            $table->string('change_reason', 500)->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            // Indexes for efficient querying
            $table->index('setting_id');
            $table->index('user_id');
            $table->index('created_at');
            $table->index(['setting_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_setting_history');
    }
};

