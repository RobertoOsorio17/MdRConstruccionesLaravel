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
        Schema::create('ml_interaction_logs', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            
            // Tipo de interacción
            $table->enum('interaction_type', [
                'view', 'click', 'like', 'share', 'comment', 'bookmark', 'recommendation_click'
            ]);
            
            // Contexto de la recomendación
            $table->string('recommendation_source')->nullable(); // 'ml', 'collaborative', 'content_based'
            $table->json('recommendation_context')->nullable(); // Contexto adicional
            $table->float('recommendation_score')->nullable(); // Score de la recomendación
            $table->integer('recommendation_position')->nullable(); // Posición en la lista
            
            // Métricas de interacción
            $table->integer('time_spent_seconds')->nullable();
            $table->float('scroll_percentage')->nullable();
            $table->boolean('completed_reading')->default(false);
            $table->json('interaction_metadata')->nullable(); // Datos adicionales
            
            // Feedback implícito
            $table->float('implicit_rating')->nullable(); // Rating calculado automáticamente
            $table->float('engagement_score')->nullable(); // Score de engagement
            
            $table->timestamps();
            
            // Índices para análisis ML
            $table->index(['session_id', 'interaction_type', 'created_at']);
            $table->index(['user_id', 'interaction_type', 'created_at']);
            $table->index(['post_id', 'interaction_type', 'created_at']);
            $table->index(['recommendation_source', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ml_interaction_logs');
    }
};