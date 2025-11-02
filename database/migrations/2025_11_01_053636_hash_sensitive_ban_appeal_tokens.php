<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * ✅ SECURITY FIX: Hash sensitive tokens to prevent exposure in database dumps,
     * logs, or XSS attacks in admin panel.
     *
     * This migration:
     * 1. Adds new hashed token columns
     * 2. Migrates existing tokens to hashed versions
     * 3. Drops old plaintext token columns
     * 4. Adds token rotation tracking
     */
    public function up(): void
    {
        // Step 1: Add new hashed token columns to ban_appeals table
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->string('appeal_token_hash', 64)->nullable()->after('appeal_token');
            $table->timestamp('appeal_token_rotated_at')->nullable()->after('appeal_token_hash');
        });

        // Step 2: Add new hashed token columns to user_bans table
        Schema::table('user_bans', function (Blueprint $table) {
            $table->string('appeal_url_token_hash', 64)->nullable()->after('appeal_url_token');
            $table->timestamp('appeal_url_token_rotated_at')->nullable()->after('appeal_url_token_hash');
        });

        // Step 3: Migrate existing tokens to hashed versions
        // Note: This is a one-time migration. After this, tokens will be hashed on creation.
        DB::table('ban_appeals')->whereNotNull('appeal_token')->chunkById(100, function ($appeals) {
            foreach ($appeals as $appeal) {
                DB::table('ban_appeals')
                    ->where('id', $appeal->id)
                    ->update([
                        'appeal_token_hash' => hash('sha256', $appeal->appeal_token),
                        'appeal_token_rotated_at' => now(),
                    ]);
            }
        });

        DB::table('user_bans')->whereNotNull('appeal_url_token')->chunkById(100, function ($bans) {
            foreach ($bans as $ban) {
                DB::table('user_bans')
                    ->where('id', $ban->id)
                    ->update([
                        'appeal_url_token_hash' => hash('sha256', $ban->appeal_url_token),
                        'appeal_url_token_rotated_at' => now(),
                    ]);
            }
        });

        // Step 4: Drop old plaintext token columns
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->dropColumn('appeal_token');
        });

        Schema::table('user_bans', function (Blueprint $table) {
            $table->dropColumn('appeal_url_token');
        });

        // Step 5: Rename hashed columns to original names
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->renameColumn('appeal_token_hash', 'appeal_token');
        });

        Schema::table('user_bans', function (Blueprint $table) {
            $table->renameColumn('appeal_url_token_hash', 'appeal_url_token');
        });

        // Step 6: Add indexes for performance
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->index('appeal_token');
        });

        Schema::table('user_bans', function (Blueprint $table) {
            $table->index('appeal_url_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove indexes
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->dropIndex(['appeal_token']);
        });

        Schema::table('user_bans', function (Blueprint $table) {
            $table->dropIndex(['appeal_url_token']);
        });

        // Rename back to hash columns
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->renameColumn('appeal_token', 'appeal_token_hash');
        });

        Schema::table('user_bans', function (Blueprint $table) {
            $table->renameColumn('appeal_url_token', 'appeal_url_token_hash');
        });

        // Add back plaintext columns
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->string('appeal_token', 64)->nullable()->after('id');
        });

        Schema::table('user_bans', function (Blueprint $table) {
            $table->string('appeal_url_token', 64)->nullable()->after('id');
        });

        // Drop hashed columns and rotation tracking
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->dropColumn(['appeal_token_hash', 'appeal_token_rotated_at']);
        });

        Schema::table('user_bans', function (Blueprint $table) {
            $table->dropColumn(['appeal_url_token_hash', 'appeal_url_token_rotated_at']);
        });
    }
};
