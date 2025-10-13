<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            [
                'title' => 'Reforma Integral Vivienda Moderna',
                'slug' => 'reforma-integral-vivienda-moderna',
                'summary' => 'Reforma completa de vivienda de 120m² con diseño contemporáneo y espacios abiertos',
                'body' => 'Proyecto de reforma integral que transformó completamente una vivienda de los años 80. Incluye nueva distribución de espacios, cocina americana integrada, baños completos, instalación eléctrica y fontanería renovada, suelos de parquet natural, y acabados de alta calidad en toda la vivienda. \n\nEl proyecto se desarrolló en 6 meses, manteniendo una comunicación constante con los clientes para asegurar que el resultado final cumpliera con todas sus expectativas. Se utilizaron materiales de primera calidad y las últimas tecnologías en domótica y eficiencia energética.',
                'gallery' => json_encode([
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800',
                    'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800',
                    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800'
                ]),
                'location' => 'Madrid Centro',
                'budget_estimate' => 100000.00,
                'start_date' => now()->subMonths(8)->format('Y-m-d'),
                'end_date' => now()->subMonths(2)->format('Y-m-d'),
                'featured' => true,
                'status' => 'completed',
            ],
            [
                'title' => 'Cocina de Diseño Minimalista',
                'slug' => 'cocina-diseno-minimalista',
                'summary' => 'Cocina moderna con isla central y acabados en madera y acero inoxidable',
                'body' => 'Diseño y ejecución de cocina minimalista de 25m² con isla central, electrodomésticos de última generación, encimera de cuarzo, muebles lacados en blanco mate, y sistema de iluminación LED integrado. Incluye zona de desayuno y almacenamiento optimizado. \n\nLa reforma se completó en tiempo record de 2 meses, optimizando al máximo el espacio disponible y creando una cocina funcional y elegante que se integra perfectamente con el resto de la vivienda.',
                'gallery' => json_encode([
                    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
                    'https://images.unsplash.com/photo-1556909045-f208c06ea82e?w=800',
                    'https://images.unsplash.com/photo-1556909114-69e2c4e5e4da?w=800'
                ]),
                'location' => 'Las Rozas',
                'budget_estimate' => 30000.00,
                'start_date' => now()->subMonths(3)->format('Y-m-d'),
                'end_date' => now()->subMonths(1)->format('Y-m-d'),
                'featured' => true,
                'status' => 'completed',
            ],
            [
                'title' => 'Baño Principal Suite de Lujo',
                'slug' => 'bano-principal-suite-lujo',
                'summary' => 'Baño principal de 15m² con bañera exenta y ducha de lluvia',
                'body' => 'Reforma completa del baño principal creando un espacio tipo suite. Incluye bañera exenta de diseño, ducha de lluvia con mampara de cristal, doble lavabo suspendido, sanitarios suspendidos, suelo radiante, y revestimientos de mármol Carrara. \n\nEl proyecto incorporó las últimas tendencias en diseño de baños, creando un ambiente relajante y lujoso que convierte el baño en un verdadero spa personal.',
                'gallery' => json_encode([
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
                    'https://images.unsplash.com/photo-1584622781084-8107a89db4b1?w=800'
                ]),
                'location' => 'Pozuelo de Alarcón',
                'budget_estimate' => 20000.00,
                'start_date' => now()->subMonths(4)->format('Y-m-d'),
                'end_date' => now()->subMonths(3)->format('Y-m-d'),
                'featured' => false,
                'status' => 'completed',
            ],
            [
                'title' => 'Ático con Terraza Panorámica',
                'slug' => 'atico-terraza-panoramica',
                'summary' => 'Reforma integral de ático de 90m² + 40m² de terraza con vistas',
                'body' => 'Proyecto integral de ático con terraza. Redistribución completa del interior, creación de loft diáfano, cocina americana, dormitorio en altillo, y acondicionamiento total de terraza con pérgola, suelo técnico, sistema de riego automático y zona chill-out. \n\nUn proyecto único que transformó un espacio convencional en un hogar moderno y sofisticado, aprovechando al máximo las vistas panorámicas de la ciudad.',
                'gallery' => json_encode([
                    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800',
                    'https://images.unsplash.com/photo-1572120360612-345e8c7b7e46?w=800',
                    'https://images.unsplash.com/photo-1572120360617-a3d5d2e4c45d?w=800'
                ]),
                'location' => 'Malasaña, Madrid',
                'budget_estimate' => 140000.00,
                'start_date' => now()->subMonths(12)->format('Y-m-d'),
                'end_date' => now()->subMonths(4)->format('Y-m-d'),
                'featured' => true,
                'status' => 'completed',
            ],
            [
                'title' => 'Oficina Corporativa Moderna',
                'slug' => 'oficina-corporativa-moderna',
                'summary' => 'Diseño y reforma de oficinas de 200m² para empresa tecnológica',
                'body' => 'Proyecto de interiorismo corporativo con espacios abiertos, salas de reuniones acristaladas, zona de descanso, cocina office, sistema de climatización individualizado, suelos técnicos para cableado, y mobiliario de diseño contemporáneo. \n\nEl diseño se centró en crear un ambiente de trabajo colaborativo y productivo, incorporando elementos de bienestar y tecnología avanzada.',
                'gallery' => json_encode([
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
                    'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800'
                ]),
                'location' => 'Distrito Financiero',
                'budget_estimate' => 75000.00,
                'start_date' => now()->subMonths(8)->format('Y-m-d'),
                'end_date' => now()->subMonths(5)->format('Y-m-d'),
                'featured' => false,
                'status' => 'completed',
            ],
            [
                'title' => 'Chalet Unifamiliar Contemporáneo',
                'slug' => 'chalet-unifamiliar-contemporaneo',
                'summary' => 'Construcción nueva de chalet de 300m² con piscina y jardín',
                'body' => 'Proyecto de construcción integral de vivienda unifamiliar en parcela de 800m². Casa de 300m² distribuida en 2 plantas, 4 dormitorios, 3 baños, salón de 50m², cocina americana, garaje para 2 vehículos, piscina de 8x4m, jardín paisajístico y zona barbacoa. \n\nUn proyecto integral que combina arquitectura contemporánea con funcionalidad familiar, utilizando materiales sostenibles y tecnologías de eficiencia energética.',
                'gallery' => json_encode([
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc7?w=800',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc8?w=800',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc9?w=800'
                ]),
                'location' => 'Boadilla del Monte',
                'budget_estimate' => 450000.00,
                'start_date' => now()->subMonths(20)->format('Y-m-d'),
                'end_date' => now()->subMonths(8)->format('Y-m-d'),
                'featured' => true,
                'status' => 'completed',
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create($projectData);
        }
    }
}
