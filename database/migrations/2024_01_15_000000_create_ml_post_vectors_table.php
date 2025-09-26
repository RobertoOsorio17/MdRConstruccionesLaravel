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
        Schema::create('ml_post_vectors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            
            // Vectores de características del contenido
            $table->json('content_vector')->nullable(); // TF-IDF vector
            $table->json('category_vector')->nullable(); // One-hot encoding de categorías
            $table->json('tag_vector')->nullable(); // One-hot encoding de tags
            
            // Métricas calculadas
            $table->float('content_length_normalized')->default(0);
            $table->float('readability_score')->default(0);
            $table->float('engagement_score')->default(0);
            
            // Metadatos ML
            $table->timestamp('vector_updated_at')->nullable();
            $table->string('model_version')->default('1.0');
            
            $table->timestamps();
            $table->unique('post_id');
            $table->index(['model_version', 'vector_updated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ml_post_vectors');
    }
};