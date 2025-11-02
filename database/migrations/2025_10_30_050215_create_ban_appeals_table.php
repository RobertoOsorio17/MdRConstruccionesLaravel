<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the ban_appeals table to track user appeals for account bans.
     * Includes security features like unique tokens and rate limiting support.
     */
    public function up(): void
    {
        Schema::create('ban_appeals', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('User who submitted the appeal');

            $table->foreignId('user_ban_id')
                ->constrained('user_bans')
                ->onDelete('cascade')
                ->comment('The ban being appealed');

            // Appeal content
            $table->text('reason')
                ->comment('User explanation for the appeal (max 2000 chars)');

            $table->string('evidence_path', 500)
                ->nullable()
                ->comment('Path to uploaded evidence files (images)');

            // Status tracking
            $table->enum('status', ['pending', 'approved', 'rejected', 'more_info_requested'])
                ->default('pending')
                ->comment('Current status of the appeal');

            $table->text('admin_response')
                ->nullable()
                ->comment('Administrator response to the appeal');

            // Review tracking
            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('Administrator who reviewed the appeal');

            $table->timestamp('reviewed_at')
                ->nullable()
                ->comment('When the appeal was reviewed');

            // Security
            $table->string('appeal_token', 64)
                ->unique()
                ->comment('Unique security token for the appeal');

            $table->string('ip_address', 45)
                ->nullable()
                ->comment('IP address from which appeal was submitted');

            $table->text('user_agent')
                ->nullable()
                ->comment('Browser user agent from appeal submission');

            // Additional fields
            $table->boolean('terms_accepted')
                ->default(false)
                ->comment('User confirmed they read the rules');

            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'status']);
            $table->index(['user_ban_id']);
            $table->index(['status', 'created_at']);
            $table->index(['reviewed_by']);
            $table->index(['appeal_token']);

            // Unique constraint: one appeal per ban
            $table->unique(['user_ban_id'], 'unique_appeal_per_ban');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ban_appeals');
    }
};
