<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds is_irrevocable field to user_bans table.
     * Irrevocable bans cannot be appealed and must be permanent.
     */
    public function up(): void
    {
        Schema::table('user_bans', function (Blueprint $table) {
            $table->boolean('is_irrevocable')
                ->default(false)
                ->after('ip_ban')
                ->comment('If true, this ban cannot be appealed and must be permanent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_bans', function (Blueprint $table) {
            $table->dropColumn('is_irrevocable');
        });
    }
};
