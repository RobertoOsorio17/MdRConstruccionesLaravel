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
        Schema::table('notifications', function (Blueprint $table) {
            // Add sent_by field to track which admin sent the notification
            $table->foreignId('sent_by')->nullable()->after('user_id')->constrained('users')->onDelete('set null');

            // Add priority field for notification importance
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->after('type');

            // Add action_url and action_text for actionable notifications
            $table->string('action_url', 500)->nullable()->after('data');
            $table->string('action_text', 100)->nullable()->after('action_url');

            // Add title field for better notification display
            $table->string('title', 200)->nullable()->after('type');

            // Add indexes for better query performance
            $table->index(['sent_by', 'created_at']);
            $table->index(['priority', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['sent_by']);
            $table->dropIndex(['sent_by', 'created_at']);
            $table->dropIndex(['priority', 'created_at']);
            $table->dropColumn(['sent_by', 'priority', 'action_url', 'action_text', 'title']);
        });
    }
};
