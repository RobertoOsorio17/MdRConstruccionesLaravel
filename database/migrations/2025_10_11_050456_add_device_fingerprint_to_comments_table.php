<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * ✅ FIXED: Add device fingerprint column to prevent easy evasion of guest limits
     */
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->string('device_fingerprint', 64)->nullable()->after('user_agent');
            $table->index('device_fingerprint', 'idx_comments_device_fingerprint');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex('idx_comments_device_fingerprint');
            $table->dropColumn('device_fingerprint');
        });
    }
};
