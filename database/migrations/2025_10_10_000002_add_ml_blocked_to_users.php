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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('ml_blocked')->default(false)->after('email_verified_at');
            $table->timestamp('ml_blocked_at')->nullable()->after('ml_blocked');
            $table->string('ml_blocked_reason')->nullable()->after('ml_blocked_at');
            $table->integer('ml_anomaly_score')->default(0)->after('ml_blocked_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ml_blocked', 'ml_blocked_at', 'ml_blocked_reason', 'ml_anomaly_score']);
        });
    }
};

