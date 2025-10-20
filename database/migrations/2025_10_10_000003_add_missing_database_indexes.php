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
            if (!Schema::hasIndex('comments', 'idx_comments_post_status_created')) {
                $table->index(['post_id', 'status', 'created_at'], 'idx_comments_post_status_created');
            }

            // ✅ Index for parent_id to optimize nested comment queries
            if (!Schema::hasIndex('comments', 'idx_comments_parent')) {
                $table->index('parent_id', 'idx_comments_parent');
            }

            // ✅ Index for IP address filtering (admin reports)
            if (!Schema::hasIndex('comments', 'idx_comments_ip')) {
                $table->index('ip_address', 'idx_comments_ip');
            }
        });

        Schema::table('user_interactions', function (Blueprint $table) {
            // ✅ Composite index for user interactions lookup
            if (!Schema::hasIndex('user_interactions', 'idx_user_interactions_lookup')) {
                $table->index(['user_id', 'interactable_type', 'interactable_id'], 'idx_user_interactions_lookup');
            }

            // ✅ Index for specific interaction types
            if (!Schema::hasIndex('user_interactions', 'idx_interactions_type')) {
                $table->index(['interactable_type', 'interactable_id', 'type'], 'idx_interactions_type');
            }
        });

        Schema::table('posts', function (Blueprint $table) {
            // ✅ Composite index for published posts ordering
            if (!Schema::hasIndex('posts', 'idx_posts_published_featured')) {
                $table->index(['status', 'published_at', 'featured'], 'idx_posts_published_featured');
            }

            // ✅ Index for slug lookup
            if (!Schema::hasIndex('posts', 'posts_slug_index') && !Schema::hasIndex('posts', 'idx_posts_slug')) {
                $table->index('slug', 'idx_posts_slug');
            }

            // ✅ Index for views count (popular posts)
            if (!Schema::hasIndex('posts', 'idx_posts_views')) {
                $table->index('views_count', 'idx_posts_views');
            }
        });

        Schema::table('user_follows', function (Blueprint $table) {
            // ✅ Composite index for follower/following lookups
            if (!Schema::hasIndex('user_follows', 'idx_follows_follower_following')) {
                $table->index(['follower_id', 'following_id'], 'idx_follows_follower_following');
            }
            if (!Schema::hasIndex('user_follows', 'idx_follows_following_follower')) {
                $table->index(['following_id', 'follower_id'], 'idx_follows_following_follower');
            }
        });

        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                // ✅ Composite index for unread notifications
                if (!Schema::hasIndex('notifications', 'idx_notifications_user_unread')) {
                    $table->index(['user_id', 'read_at', 'created_at'], 'idx_notifications_user_unread');
                }
            });
        }

        Schema::table('user_devices', function (Blueprint $table) {
            // ✅ Index for device_id lookup (column exists as device_id, not device_fingerprint)
            if (!Schema::hasIndex('user_devices', 'user_devices_device_id_index') && !Schema::hasIndex('user_devices', 'idx_devices_device_id')) {
                $table->index('device_id', 'idx_devices_device_id');
            }

            // Check if the composite index already exists
            if (!Schema::hasIndex('user_devices', 'user_devices_user_id_last_used_at_index') && !Schema::hasIndex('user_devices', 'idx_devices_user_activity')) {
                $table->index(['user_id', 'last_used_at'], 'idx_devices_user_activity');
            }
        });

        Schema::table('admin_audit_logs', function (Blueprint $table) {
            // ✅ Composite index for admin activity tracking
            if (!Schema::hasIndex('admin_audit_logs', 'idx_audit_user_date')) {
                $table->index(['user_id', 'created_at'], 'idx_audit_user_date');
            }
            if (!Schema::hasIndex('admin_audit_logs', 'idx_audit_action_date')) {
                $table->index(['action', 'created_at'], 'idx_audit_action_date');
            }
        });

        Schema::table('ml_interaction_logs', function (Blueprint $table) {
            // ✅ Indexes for ML queries (using actual column names: post_id, not interactable_*)
            if (!Schema::hasIndex('ml_interaction_logs', 'idx_ml_user_date')) {
                $table->index(['user_id', 'created_at'], 'idx_ml_user_date');
            }
            if (!Schema::hasIndex('ml_interaction_logs', 'idx_ml_post_interaction')) {
                $table->index(['post_id', 'interaction_type'], 'idx_ml_post_interaction');
            }
        });

        // Skip search_analytics - already has indexes in create migration
        // (idx_search_query_normalized, idx_search_created_at, idx_search_results_date)

        Schema::table('contact_requests', function (Blueprint $table) {
            // ✅ Indexes for admin filtering
            if (!Schema::hasIndex('contact_requests', 'idx_contacts_status_date')) {
                $table->index(['status', 'created_at'], 'idx_contacts_status_date');
            }
            if (!Schema::hasIndex('contact_requests', 'idx_contacts_ip')) {
                $table->index('ip_address', 'idx_contacts_ip');
            }
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
            if (Schema::hasIndex('user_devices', 'idx_devices_device_id')) {
                $table->dropIndex('idx_devices_device_id');
            }
            if (Schema::hasIndex('user_devices', 'idx_devices_user_activity')) {
                $table->dropIndex('idx_devices_user_activity');
            }
        });

        Schema::table('admin_audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_user_date');
            $table->dropIndex('idx_audit_action_date');
        });

        Schema::table('ml_interaction_logs', function (Blueprint $table) {
            if (Schema::hasIndex('ml_interaction_logs', 'idx_ml_user_date')) {
                $table->dropIndex('idx_ml_user_date');
            }
            if (Schema::hasIndex('ml_interaction_logs', 'idx_ml_post_interaction')) {
                $table->dropIndex('idx_ml_post_interaction');
            }
        });

        // Skip search_analytics - indexes managed in create migration

        Schema::table('contact_requests', function (Blueprint $table) {
            $table->dropIndex('idx_contacts_status_date');
            $table->dropIndex('idx_contacts_ip');
        });
    }
};
