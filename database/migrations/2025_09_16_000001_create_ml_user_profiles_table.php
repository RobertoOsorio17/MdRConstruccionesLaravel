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
        Schema::create('ml_user_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->nullable(); // Para usuarios invitados
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete(); // Para usuarios registrados
            
            // Perfil de comportamiento
            $table->json('reading_patterns')->nullable(); // Horarios, duraciones típicas
            $table->json('category_preferences')->nullable(); // Preferencias por categoría
            $table->json('tag_interests')->nullable(); // Intereses por tags
            $table->json('content_type_preferences')->nullable(); // Longitud, tipo de contenido
            
            // Métricas de comportamiento
            $table->float('avg_reading_time')->default(0);
            $table->float('engagement_rate')->default(0);
            $table->integer('total_posts_read')->default(0);
            $table->float('return_rate')->default(0); // Tasa de retorno
            
            // Clustering ML
            $table->integer('user_cluster')->nullable(); // Cluster asignado por ML
            $table->float('cluster_confidence')->default(0);
            
            // Metadatos
            $table->timestamp('last_activity')->nullable();
            $table->timestamp('profile_updated_at')->nullable();
            $table->string('model_version')->default('1.0');
            
            $table->timestamps();
            $table->index(['session_id', 'user_id']);
            $table->index(['user_cluster', 'model_version']);
            $table->index('last_activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ml_user_profiles');
    }
};