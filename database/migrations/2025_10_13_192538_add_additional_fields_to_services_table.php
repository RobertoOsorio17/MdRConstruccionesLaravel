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
        Schema::table('services', function (Blueprint $table) {
            // Campos para ServicesV2 components
            $table->string('featured_image')->nullable()->after('image');
            $table->string('video_url')->nullable()->after('featured_image');
            $table->json('metrics')->nullable()->after('faq'); // Métricas de confianza
            $table->json('benefits')->nullable()->after('metrics'); // Beneficios del servicio
            $table->json('process_steps')->nullable()->after('benefits'); // Pasos del proceso
            $table->json('guarantees')->nullable()->after('process_steps'); // Garantías
            $table->json('certifications')->nullable()->after('guarantees'); // Certificaciones
            $table->json('gallery')->nullable()->after('certifications'); // Galería de imágenes
            $table->text('cta_primary_text')->nullable()->after('gallery'); // Texto CTA primario
            $table->text('cta_secondary_text')->nullable()->after('cta_primary_text'); // Texto CTA secundario
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'featured_image',
                'video_url',
                'metrics',
                'benefits',
                'process_steps',
                'guarantees',
                'certifications',
                'gallery',
                'cta_primary_text',
                'cta_secondary_text'
            ]);
        });
    }
};
