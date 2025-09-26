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
        Schema::create('user_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('interactable'); // Para posts, comments, etc.
            $table->enum('type', ['like', 'bookmark', 'view', 'share']);
            $table->json('metadata')->nullable(); // Para datos adicionales
            $table->timestamps();
            
            // Evitar interacciones duplicadas
            $table->unique(['user_id', 'interactable_type', 'interactable_id', 'type'], 'user_interactions_unique');
            
            // Índices para performance
            $table->index(['interactable_type', 'interactable_id', 'type']);
            $table->index(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_interactions');
    }
};
