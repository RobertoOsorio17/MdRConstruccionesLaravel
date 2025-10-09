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
        Schema::table('user_interactions', function (Blueprint $table) {
            // ✅ FIXED N+1: Add composite index for efficient user interaction queries
            // Note: This table uses polymorphic relationships (interactable_type, interactable_id)
            // The index on ['user_id', 'type'] already exists from the original migration
            // We'll add an additional index for common query patterns

            // Index for queries like: WHERE user_id = ? AND interactable_type = 'App\Models\Post' AND type = ?
            $table->index(['user_id', 'interactable_type', 'type'], 'idx_user_interactable_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_interactions', function (Blueprint $table) {
            // Drop the composite index
            $table->dropIndex('idx_user_interactable_type');
        });
    }
};
