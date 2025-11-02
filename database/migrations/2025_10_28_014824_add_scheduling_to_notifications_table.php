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
            // Scheduling fields
            $table->timestamp('scheduled_at')->nullable()->after('read_at');
            $table->enum('status', ['draft', 'scheduled', 'sent', 'failed', 'cancelled'])->default('sent')->after('scheduled_at');
            $table->timestamp('sent_at')->nullable()->after('status');
            $table->text('failure_reason')->nullable()->after('sent_at');

            // Additional metadata
            $table->boolean('is_recurring')->default(false)->after('failure_reason');
            $table->string('recurrence_pattern', 50)->nullable()->after('is_recurring'); // daily, weekly, monthly
            $table->timestamp('next_occurrence')->nullable()->after('recurrence_pattern');

            // Indexes for performance
            $table->index(['status', 'scheduled_at']);
            $table->index(['is_recurring', 'next_occurrence']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['status', 'scheduled_at']);
            $table->dropIndex(['is_recurring', 'next_occurrence']);

            $table->dropColumn([
                'scheduled_at',
                'status',
                'sent_at',
                'failure_reason',
                'is_recurring',
                'recurrence_pattern',
                'next_occurrence',
            ]);
        });
    }
};
