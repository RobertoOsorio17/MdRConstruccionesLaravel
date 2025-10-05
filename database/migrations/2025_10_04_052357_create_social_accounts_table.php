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
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('provider', 50); // google, facebook, github
            $table->string('provider_id', 191);
            $table->text('provider_token')->nullable();
            $table->text('provider_refresh_token')->nullable();
            $table->timestamps();

            // Unique constraint: one provider account per user
            $table->unique(['user_id', 'provider']);
            // Index for faster lookups (with limited length)
            $table->index('provider');
            $table->index('provider_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
