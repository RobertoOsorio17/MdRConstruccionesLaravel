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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('reviewable'); // Polymorphic relation (services, projects, etc.)
            $table->unsignedTinyInteger('rating')->comment('1-5 stars');
            $table->text('comment')->nullable();
            $table->json('photos')->nullable()->comment('Array of photo URLs');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes (morphs() already creates index for reviewable_type and reviewable_id)
            $table->index('status');
            $table->index('rating');
            $table->index('created_at');

            // Prevent duplicate reviews from same user for same item
            $table->unique(['user_id', 'reviewable_type', 'reviewable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
