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
        // Check if columns already exist before adding them
        if (!Schema::hasColumn('user_bans', 'admin_notes')) {
            Schema::table('user_bans', function (Blueprint $table) {
                $table->text('admin_notes')->nullable()->after('reason');
            });
        }

        if (!Schema::hasColumn('user_bans', 'ip_ban')) {
            Schema::table('user_bans', function (Blueprint $table) {
                $table->boolean('ip_ban')->default(false)->after('admin_notes');
            });
        }

        // Modify banned_by column to be nullable and change foreign key constraint
        // Check if foreign key exists before dropping
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_bans'
            AND CONSTRAINT_NAME = 'user_bans_banned_by_foreign'
        ");

        if (!empty($foreignKeys)) {
            Schema::table('user_bans', function (Blueprint $table) {
                $table->dropForeign(['banned_by']);
            });
        }

        Schema::table('user_bans', function (Blueprint $table) {
            // Make column nullable
            $table->unsignedBigInteger('banned_by')->nullable()->change();
        });

        // Check if foreign key already exists before adding
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_bans'
            AND CONSTRAINT_NAME = 'user_bans_banned_by_foreign'
        ");

        if (empty($foreignKeys)) {
            Schema::table('user_bans', function (Blueprint $table) {
                // Add new foreign key with SET NULL
                $table->foreign('banned_by')
                      ->references('id')
                      ->on('users')
                      ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_bans', function (Blueprint $table) {
            // Restore original foreign key constraint
            $table->dropForeign(['banned_by']);
            $table->foreign('banned_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            // Drop added columns
            $table->dropColumn(['admin_notes', 'ip_ban']);
        });
    }
};
