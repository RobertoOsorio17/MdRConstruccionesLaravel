<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds appeal_url_token and appeal_url_expires_at to track the current valid
     * signed URL for ban appeals. This prevents multiple simultaneous URLs and
     * allows invalidation of old URLs when new ones are generated.
     */
    public function up(): void
    {
        Schema::table('user_bans', function (Blueprint $table) {
            // Token to track the current valid appeal URL (prevents multiple URLs)
            $table->string('appeal_url_token', 64)->nullable()->after('is_irrevocable');

            // Expiration timestamp for the appeal URL
            $table->timestamp('appeal_url_expires_at')->nullable()->after('appeal_url_token');

            // Index for faster lookups when validating tokens
            $table->index('appeal_url_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_bans', function (Blueprint $table) {
            $table->dropIndex(['appeal_url_token']);
            $table->dropColumn(['appeal_url_token', 'appeal_url_expires_at']);
        });
    }
};
