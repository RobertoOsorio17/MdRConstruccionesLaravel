<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_bans', function (Blueprint $table) {
            if (!Schema::hasColumn('user_bans', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('reason');
            }
            if (!Schema::hasColumn('user_bans', 'ip_ban')) {
                $table->boolean('ip_ban')->default(false)->after('expires_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_bans', function (Blueprint $table) {
            if (Schema::hasColumn('user_bans', 'admin_notes')) {
                $table->dropColumn('admin_notes');
            }
            if (Schema::hasColumn('user_bans', 'ip_ban')) {
                $table->dropColumn('ip_ban');
            }
        });
    }
};

