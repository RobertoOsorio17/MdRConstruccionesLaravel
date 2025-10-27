<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds priority column for automatic severity classification
     * and additional indexes for improved query performance.
     */
    public function up(): void
    {
        Schema::table('comment_reports', function (Blueprint $table) {
            // ✅ Add priority column for automatic severity classification
            $table->enum('priority', ['low', 'medium', 'high'])
                ->default('low')
                ->after('status')
                ->comment('Auto-assigned priority based on category severity');
            
            // ✅ Add indexes for improved query performance
            // Index for filtering by status (most common query)
            if (!Schema::hasIndex('comment_reports', 'idx_comment_reports_status')) {
                $table->index('status', 'idx_comment_reports_status');
            }
            
            // Index for filtering by category
            if (!Schema::hasIndex('comment_reports', 'idx_comment_reports_category')) {
                $table->index('category', 'idx_comment_reports_category');
            }
            
            // Index for filtering by priority
            if (!Schema::hasIndex('comment_reports', 'idx_comment_reports_priority')) {
                $table->index('priority', 'idx_comment_reports_priority');
            }
            
            // Composite index for common admin queries (status + priority + created_at)
            if (!Schema::hasIndex('comment_reports', 'idx_comment_reports_admin_filter')) {
                $table->index(['status', 'priority', 'created_at'], 'idx_comment_reports_admin_filter');
            }
            
            // Index for user_id to quickly find all reports by a user
            if (!Schema::hasIndex('comment_reports', 'idx_comment_reports_user')) {
                $table->index('user_id', 'idx_comment_reports_user');
            }
            
            // Index for comment_id to quickly find all reports for a comment
            if (!Schema::hasIndex('comment_reports', 'idx_comment_reports_comment')) {
                $table->index('comment_id', 'idx_comment_reports_comment');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comment_reports', function (Blueprint $table) {
            // Drop indexes
            $table->dropIndex('idx_comment_reports_status');
            $table->dropIndex('idx_comment_reports_category');
            $table->dropIndex('idx_comment_reports_priority');
            $table->dropIndex('idx_comment_reports_admin_filter');
            $table->dropIndex('idx_comment_reports_user');
            $table->dropIndex('idx_comment_reports_comment');
            
            // Drop priority column
            $table->dropColumn('priority');
        });
    }
};

