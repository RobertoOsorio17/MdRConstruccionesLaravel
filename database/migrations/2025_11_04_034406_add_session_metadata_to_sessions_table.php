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
        Schema::table('sessions', function (Blueprint $table) {
            // Add metadata columns for session tracking
            $table->string('initial_ip', 45)->nullable()->after('ip_address');
            $table->string('initial_user_agent_hash', 64)->nullable()->after('initial_ip');
            $table->timestamp('created_at')->nullable()->after('last_activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropColumn(['initial_ip', 'initial_user_agent_hash', 'created_at']);
        });
    }
};
