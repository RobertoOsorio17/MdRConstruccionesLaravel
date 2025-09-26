<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes to posts table for better search performance
        if (Schema::hasTable('posts')) {
            Schema::table('posts', function (Blueprint $table) {
                // Check if columns exist before adding indexes
                if (Schema::hasColumn('posts', 'status') && Schema::hasColumn('posts', 'published_at')) {
                    try {
                        $table->index(['status', 'published_at'], 'posts_status_published_index');
                    } catch (\Exception $e) {
                        // Index might already exist
                    }
                }

                if (Schema::hasColumn('posts', 'author_id') && Schema::hasColumn('posts', 'status')) {
                    try {
                        $table->index(['author_id', 'status'], 'posts_author_status_index');
                    } catch (\Exception $e) {
                        // Index might already exist
                    }
                }

                if (Schema::hasColumn('posts', 'slug')) {
                    try {
                        $table->index('slug', 'posts_slug_index');
                    } catch (\Exception $e) {
                        // Index might already exist
                    }
                }
            });

            // Full-text search indexes (if using MySQL)
            if (DB::connection()->getDriverName() === 'mysql') {
                try {
                    // Check if columns exist for full-text index
                    if (Schema::hasColumn('posts', 'title') &&
                        Schema::hasColumn('posts', 'excerpt') &&
                        Schema::hasColumn('posts', 'content')) {
                        DB::statement('ALTER TABLE posts ADD FULLTEXT search_index (title, excerpt, content)');
                    }
                } catch (\Exception $e) {
                    // Full-text index might already exist or not supported
                }
            }
        }

        // Add indexes to categories table
        if (Schema::hasTable('categories')) {
            Schema::table('categories', function (Blueprint $table) {
                if (Schema::hasColumn('categories', 'name')) {
                    try {
                        $table->index('name', 'categories_name_index');
                    } catch (\Exception $e) {
                        // Index might already exist
                    }
                }

                if (Schema::hasColumn('categories', 'slug')) {
                    try {
                        $table->index('slug', 'categories_slug_index');
                    } catch (\Exception $e) {
                        // Index might already exist
                    }
                }
            });
        }

        // Add indexes to category_post pivot table if it exists
        if (Schema::hasTable('category_post')) {
            Schema::table('category_post', function (Blueprint $table) {
                try {
                    $table->index(['category_id', 'post_id'], 'category_post_category_post_index');
                } catch (\Exception $e) {
                    // Index might already exist
                }

                try {
                    $table->index(['post_id', 'category_id'], 'category_post_post_category_index');
                } catch (\Exception $e) {
                    // Index might already exist
                }
            });
        }

        // Add indexes to users table for author searches
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'name')) {
                    try {
                        $table->index('name', 'users_name_index');
                    } catch (\Exception $e) {
                        // Index might already exist
                    }
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Drop full-text index if it exists
            if (DB::connection()->getDriverName() === 'mysql') {
                try {
                    DB::statement('ALTER TABLE posts DROP INDEX search_index');
                } catch (\Exception $e) {
                    // Index might not exist, ignore error
                }
            }
            
            $table->dropIndex('posts_status_published_index');
            $table->dropIndex('posts_author_status_index');
            $table->dropIndex(['slug']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['slug']);
        });

        if (Schema::hasTable('category_post')) {
            Schema::table('category_post', function (Blueprint $table) {
                $table->dropIndex(['category_id', 'post_id']);
                $table->dropIndex(['post_id', 'category_id']);
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['name']);
        });
    }
};
