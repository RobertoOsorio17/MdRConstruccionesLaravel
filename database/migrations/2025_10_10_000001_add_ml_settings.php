<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            // Algoritmos
            [
                'key' => 'ml_enable_hybrid',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Habilitar Algoritmo Híbrido',
                'description' => 'Combina múltiples algoritmos para mejores recomendaciones',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 1,
            ],
            [
                'key' => 'ml_enable_content_based',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Habilitar Basado en Contenido',
                'description' => 'Recomienda posts similares basándose en el contenido',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 2,
            ],
            [
                'key' => 'ml_enable_collaborative',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Habilitar Filtrado Colaborativo',
                'description' => 'Recomienda basándose en usuarios similares',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 3,
            ],
            [
                'key' => 'ml_enable_trending',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Habilitar Trending',
                'description' => 'Recomienda contenido popular y en tendencia',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 4,
            ],

            // Pesos de algoritmos
            [
                'key' => 'ml_hybrid_weight',
                'value' => '0.4',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Peso Híbrido',
                'description' => 'Importancia del algoritmo híbrido (0-1)',
                'validation_rules' => json_encode(['numeric', 'min:0', 'max:1']),
                'sort_order' => 10,
            ],
            [
                'key' => 'ml_content_weight',
                'value' => '0.3',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Peso Contenido',
                'description' => 'Importancia del algoritmo basado en contenido (0-1)',
                'validation_rules' => json_encode(['numeric', 'min:0', 'max:1']),
                'sort_order' => 11,
            ],
            [
                'key' => 'ml_collaborative_weight',
                'value' => '0.2',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Peso Colaborativo',
                'description' => 'Importancia del filtrado colaborativo (0-1)',
                'validation_rules' => json_encode(['numeric', 'min:0', 'max:1']),
                'sort_order' => 12,
            ],
            [
                'key' => 'ml_trending_weight',
                'value' => '0.1',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Peso Trending',
                'description' => 'Importancia del contenido trending (0-1)',
                'validation_rules' => json_encode(['numeric', 'min:0', 'max:1']),
                'sort_order' => 13,
            ],

            // Parámetros de recomendación
            [
                'key' => 'ml_default_limit',
                'value' => '10',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Límite por Defecto',
                'description' => 'Número de recomendaciones a generar (1-50)',
                'validation_rules' => json_encode(['integer', 'min:1', 'max:50']),
                'sort_order' => 20,
            ],
            [
                'key' => 'ml_diversity_boost',
                'value' => '0.3',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Diversity Boost',
                'description' => 'Factor de diversidad en recomendaciones (0-1)',
                'validation_rules' => json_encode(['numeric', 'min:0', 'max:1']),
                'sort_order' => 21,
            ],
            [
                'key' => 'ml_min_confidence',
                'value' => '0.4',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Confianza Mínima',
                'description' => 'Nivel mínimo de confianza para mostrar recomendaciones (0-1)',
                'validation_rules' => json_encode(['numeric', 'min:0', 'max:1']),
                'sort_order' => 22,
            ],
            [
                'key' => 'ml_cache_timeout',
                'value' => '300',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Timeout de Caché (segundos)',
                'description' => 'Tiempo de vida del caché de recomendaciones (60-3600)',
                'validation_rules' => json_encode(['integer', 'min:60', 'max:3600']),
                'sort_order' => 23,
            ],

            // Clustering
            [
                'key' => 'ml_enable_clustering',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Habilitar Clustering',
                'description' => 'Agrupar usuarios por comportamiento similar',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 30,
            ],
            [
                'key' => 'ml_cluster_count',
                'value' => '5',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Número de Clusters',
                'description' => 'Cantidad de grupos de usuarios (2-10)',
                'validation_rules' => json_encode(['integer', 'min:2', 'max:10']),
                'sort_order' => 31,
            ],
            [
                'key' => 'ml_clustering_algorithm',
                'value' => 'kmeans',
                'type' => 'select',
                'group' => 'ml',
                'label' => 'Algoritmo de Clustering',
                'description' => 'Método para agrupar usuarios',
                'validation_rules' => json_encode(['in:kmeans,dbscan,hierarchical']),
                'options' => json_encode([
                    ['value' => 'kmeans', 'label' => 'K-Means'],
                    ['value' => 'dbscan', 'label' => 'DBSCAN'],
                    ['value' => 'hierarchical', 'label' => 'Jerárquico'],
                ]),
                'sort_order' => 32,
            ],

            // Anomaly Detection
            [
                'key' => 'ml_enable_anomaly_detection',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Habilitar Detección de Anomalías',
                'description' => 'Detectar comportamientos sospechosos',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 40,
            ],
            [
                'key' => 'ml_anomaly_threshold',
                'value' => '70',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Umbral de Anomalía',
                'description' => 'Puntuación mínima para considerar una anomalía (0-100)',
                'validation_rules' => json_encode(['integer', 'min:0', 'max:100']),
                'sort_order' => 41,
            ],
            [
                'key' => 'ml_auto_block_suspicious',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Auto-bloquear Usuarios Sospechosos',
                'description' => 'Bloquear automáticamente usuarios con comportamiento anómalo',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 42,
            ],

            // Performance
            [
                'key' => 'ml_enable_caching',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Habilitar Caché',
                'description' => 'Cachear recomendaciones para mejor rendimiento',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 50,
            ],
            [
                'key' => 'ml_enable_queue_jobs',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Habilitar Queue Jobs',
                'description' => 'Procesar tareas ML en segundo plano',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 51,
            ],
            [
                'key' => 'ml_batch_size',
                'value' => '100',
                'type' => 'number',
                'group' => 'ml',
                'label' => 'Tamaño de Batch',
                'description' => 'Cantidad de registros a procesar por lote (10-1000)',
                'validation_rules' => json_encode(['integer', 'min:10', 'max:1000']),
                'sort_order' => 52,
            ],

            // Explainable AI
            [
                'key' => 'ml_include_explanations',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ml',
                'label' => 'Incluir Explicaciones',
                'description' => 'Generar explicaciones de por qué se recomienda cada post',
                'validation_rules' => json_encode(['boolean']),
                'sort_order' => 60,
            ],
            [
                'key' => 'ml_explanation_detail',
                'value' => 'medium',
                'type' => 'select',
                'group' => 'ml',
                'label' => 'Nivel de Detalle de Explicaciones',
                'description' => 'Cantidad de información en las explicaciones',
                'validation_rules' => json_encode(['in:low,medium,high']),
                'options' => json_encode([
                    ['value' => 'low', 'label' => 'Bajo'],
                    ['value' => 'medium', 'label' => 'Medio'],
                    ['value' => 'high', 'label' => 'Alto'],
                ]),
                'sort_order' => 61,
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('admin_settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('admin_settings')->where('group', 'ml')->delete();
    }
};

