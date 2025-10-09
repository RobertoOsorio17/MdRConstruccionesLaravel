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
        Schema::table('comments', function (Blueprint $table) {
            // ✅ FIXED: Add index on status column for efficient filtering
            // Optimizes queries like: WHERE status = 'approved'
            $table->index('status', 'idx_comments_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Drop the status index
            $table->dropIndex('idx_comments_status');
        });
    }
};
