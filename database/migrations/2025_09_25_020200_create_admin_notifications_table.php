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
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // null = system notification
            $table->string('type', 100); // info, warning, error, success, system
            $table->string('title', 200);
            $table->text('message');
            $table->json('data')->nullable(); // Additional data for the notification
            $table->string('action_url', 500)->nullable(); // URL to navigate when clicked
            $table->string('action_text', 100)->nullable(); // Text for action button
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->timestamp('read_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // Auto-delete after this date
            $table->boolean('is_dismissible')->default(true);
            $table->boolean('is_system')->default(false); // System-wide notification
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index(['type', 'created_at']);
            $table->index(['priority', 'created_at']);
            $table->index(['is_system', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
};
