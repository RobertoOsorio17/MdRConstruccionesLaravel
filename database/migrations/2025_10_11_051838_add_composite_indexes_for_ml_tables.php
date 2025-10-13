<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * ✅ FIXED: Add composite indexes to optimize ML query performance
     */
    public function up(): void
    {
        Schema::table('ml_interaction_logs', function (Blueprint $table) {
            // Composite index for user/session + post queries (recommendation generation)
            $table->index(['user_id', 'post_id', 'created_at'], 'idx_ml_interactions_user_post_time');

            // Composite index for session + interaction type queries
            $table->index(['session_id', 'interaction_type', 'created_at'], 'idx_ml_interactions_session_type_time');

            // Composite index for post engagement queries (trending recommendations)
            $table->index(['post_id', 'created_at', 'engagement_score'], 'idx_ml_interactions_post_engagement');

            // Composite index for implicit rating queries (matrix factorization)
            $table->index(['user_id', 'implicit_rating'], 'idx_ml_interactions_user_rating');
        });

        Schema::table('ml_user_profiles', function (Blueprint $table) {
            // Composite index for cluster-based queries
            $table->index(['user_cluster', 'updated_at'], 'idx_ml_profiles_cluster_updated');

            // Index for session + updated_at (profile retrieval)
            $table->index(['session_id', 'updated_at'], 'idx_ml_profiles_session_updated');
        });

        Schema::table('ml_post_vectors', function (Blueprint $table) {
            // Composite index for vector similarity queries
            $table->index(['post_id', 'updated_at'], 'idx_ml_vectors_post_updated');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ml_interaction_logs', function (Blueprint $table) {
            $table->dropIndex('idx_ml_interactions_user_post_time');
            $table->dropIndex('idx_ml_interactions_session_type_time');
            $table->dropIndex('idx_ml_interactions_post_engagement');
            $table->dropIndex('idx_ml_interactions_user_rating');
        });

        Schema::table('ml_user_profiles', function (Blueprint $table) {
            $table->dropIndex('idx_ml_profiles_cluster_updated');
            $table->dropIndex('idx_ml_profiles_session_updated');
        });

        Schema::table('ml_post_vectors', function (Blueprint $table) {
            $table->dropIndex('idx_ml_vectors_post_updated');
        });
    }
};
