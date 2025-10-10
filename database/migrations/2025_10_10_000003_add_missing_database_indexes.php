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
            // ✅ Composite index for filtering comments by post, status, and ordering
            $table->index(['post_id', 'status', 'created_at'], 'idx_comments_post_status_created');

            // ✅ Index for parent_id to optimize nested comment queries
            $table->index('parent_id', 'idx_comments_parent');

            // ✅ Index for IP address filtering (admin reports)
            $table->index('ip_address', 'idx_comments_ip');
        });

        Schema::table('user_interactions', function (Blueprint $table) {
            // ✅ Composite index for user interactions lookup
            $table->index(['user_id', 'interactable_type', 'interactable_id'], 'idx_user_interactions_lookup');

            // ✅ Index for specific interaction types
            $table->index(['interactable_type', 'interactable_id', 'type'], 'idx_interactions_type');
        });

        Schema::table('posts', function (Blueprint $table) {
            // ✅ Composite index for published posts ordering
            $table->index(['status', 'published_at', 'featured'], 'idx_posts_published_featured');

            // ✅ Index for slug lookup
            if (!Schema::hasIndex('posts', 'posts_slug_index')) {
                $table->index('slug', 'idx_posts_slug');
            }

            // ✅ Index for views count (popular posts)
            $table->index('views_count', 'idx_posts_views');
        });

        Schema::table('user_follows', function (Blueprint $table) {
            // ✅ Composite index for follower/following lookups
            $table->index(['follower_id', 'following_id'], 'idx_follows_follower_following');
            $table->index(['following_id', 'follower_id'], 'idx_follows_following_follower');
        });

        Schema::table('notifications', function (Blueprint $table) {
            // ✅ Composite index for unread notifications
            $table->index(['user_id', 'read_at', 'created_at'], 'idx_notifications_user_unread');
        });

        Schema::table('user_devices', function (Blueprint $table) {
            // ✅ Index for device fingerprint lookup
            $table->index('device_fingerprint', 'idx_devices_fingerprint');
            $table->index(['user_id', 'last_used_at'], 'idx_devices_user_activity');
        });

        Schema::table('admin_audit_logs', function (Blueprint $table) {
            // ✅ Composite index for admin activity tracking
            $table->index(['user_id', 'created_at'], 'idx_audit_user_date');
            $table->index(['action', 'created_at'], 'idx_audit_action_date');
        });

        Schema::table('ml_interaction_logs', function (Blueprint $table) {
            // ✅ Indexes for ML queries
            $table->index(['user_id', 'created_at'], 'idx_ml_user_date');
            $table->index(['interactable_type', 'interactable_id'], 'idx_ml_interactable');
        });

        Schema::table('search_analytics', function (Blueprint $table) {
            // ✅ Index for search term analytics
            $table->index('search_term', 'idx_search_term');
            $table->index('created_at', 'idx_search_date');
        });

        Schema::table('contact_requests', function (Blueprint $table) {
            // ✅ Indexes for admin filtering
            $table->index(['status', 'created_at'], 'idx_contacts_status_date');
            $table->index('ip_address', 'idx_contacts_ip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex('idx_comments_post_status_created');
            $table->dropIndex('idx_comments_parent');
            $table->dropIndex('idx_comments_ip');
        });

        Schema::table('user_interactions', function (Blueprint $table) {
            $table->dropIndex('idx_user_interactions_lookup');
            $table->dropIndex('idx_interactions_type');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('idx_posts_published_featured');
            $table->dropIndex('idx_posts_slug');
            $table->dropIndex('idx_posts_views');
        });

        Schema::table('user_follows', function (Blueprint $table) {
            $table->dropIndex('idx_follows_follower_following');
            $table->dropIndex('idx_follows_following_follower');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_unread');
        });

        Schema::table('user_devices', function (Blueprint $table) {
            $table->dropIndex('idx_devices_fingerprint');
            $table->dropIndex('idx_devices_user_activity');
        });

        Schema::table('admin_audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_user_date');
            $table->dropIndex('idx_audit_action_date');
        });

        Schema::table('ml_interaction_logs', function (Blueprint $table) {
            $table->dropIndex('idx_ml_user_date');
            $table->dropIndex('idx_ml_interactable');
        });

        Schema::table('search_analytics', function (Blueprint $table) {
            $table->dropIndex('idx_search_term');
            $table->dropIndex('idx_search_date');
        });

        Schema::table('contact_requests', function (Blueprint $table) {
            $table->dropIndex('idx_contacts_status_date');
            $table->dropIndex('idx_contacts_ip');
        });
    }
};
