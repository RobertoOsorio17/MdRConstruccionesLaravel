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
        Schema::create('admin_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->string('type', 50)->default('string'); // string, integer, boolean, json, array
            $table->string('group', 100)->default('general'); // general, security, email, etc.
            $table->string('label', 200);
            $table->text('description')->nullable();
            $table->json('validation_rules')->nullable(); // Laravel validation rules
            $table->json('options')->nullable(); // For select/radio options
            $table->boolean('is_public')->default(false); // Can be accessed by non-admin users
            $table->boolean('is_encrypted')->default(false); // Should be encrypted in database
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['group', 'sort_order']);
            $table->index(['is_public']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_settings');
    }
};
