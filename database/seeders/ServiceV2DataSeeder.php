<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceV2DataSeeder extends Seeder
{
    /**
     * Seed ServicesV2 data for existing services.
     */
    public function run(): void
    {
        // Buscar servicio de construcción de viviendas
        $service = Service::where('slug', 'construccion-viviendas')->first();

        if (!$service) {
            // Crear servicio si no existe
            $service = Service::create([
                'title' => 'Construcción de Viviendas Premium',
                'slug' => 'construccion-viviendas',
                'excerpt' => 'Transformamos tus ideas en espacios únicos con calidad y profesionalismo',
                'body' => 'Servicio completo de construcción de viviendas premium con más de 15 años de experiencia.',
                'icon' => 'Home',
                'sort_order' => 1,
                'is_active' => true,
                'featured' => true,
            ]);
        }

        // Actualizar con datos ServicesV2
        $service->update([
            'featured_image' => '/images/services/construccion-viviendas-hero.jpg',
            'video_url' => null,
            'cta_primary_text' => 'SOLICITAR ASESORÍA GRATUITA',
            'cta_secondary_text' => 'DESCARGAR CATÁLOGO PDF',

            // Métricas de confianza
            'metrics' => [
                ['icon' => '🏆', 'value' => '500+', 'label' => 'Proyectos Completados'],
                ['icon' => '⭐', 'value' => '98%', 'label' => 'Clientes Satisfechos'],
                ['icon' => '📈', 'value' => '15+', 'label' => 'Años de Experiencia'],
                ['icon' => '🏗️', 'value' => '125,000 m²', 'label' => 'Metros Cuadrados'],
            ],

            // Beneficios
            'benefits' => [
                [
                    'icon' => '⚡',
                    'title' => 'Entrega Rápida',
                    'description' => 'Cumplimos plazos sin comprometer calidad. Metodología ágil y equipos especializados.',
                    'metric' => '95% a tiempo'
                ],
                [
                    'icon' => '🛡️',
                    'title' => 'Garantía Total',
                    'description' => 'Respaldamos nuestro trabajo con garantías extendidas y seguros completos.',
                    'metric' => '10 años'
                ],
                [
                    'icon' => '💰',
                    'title' => 'Mejor Precio',
                    'description' => 'Optimizamos recursos sin sacrificar estándares. Transparencia en cada presupuesto.',
                    'metric' => 'Hasta 30% ahorro'
                ],
                [
                    'icon' => '⭐',
                    'title' => 'Calidad Premium',
                    'description' => 'Materiales certificados y acabados de primera. Excelencia en cada detalle.',
                    'metric' => 'ISO 9001'
                ],
                [
                    'icon' => '👷',
                    'title' => 'Equipo Certificado',
                    'description' => 'Profesionales con formación continua y certificaciones internacionales.',
                    'metric' => '100% certificados'
                ],
                [
                    'icon' => '🤝',
                    'title' => 'Atención Personalizada',
                    'description' => 'Gestor dedicado para tu proyecto. Comunicación directa y transparente.',
                    'metric' => '24/7 disponible'
                ],
            ],

            // Pasos del proceso
            'process_steps' => [
                [
                    'id' => 1,
                    'title' => 'Consulta Inicial',
                    'description' => 'Reunión para entender tus necesidades, presupuesto y visión del proyecto. Análisis del terreno y viabilidad.',
                    'icon' => '📋',
                    'duration' => '1-2 días',
                    'deliverables' => ['Presupuesto preliminar', 'Plan de trabajo inicial', 'Cronograma estimado']
                ],
                [
                    'id' => 2,
                    'title' => 'Diseño y Planificación',
                    'description' => 'Desarrollo de planos arquitectónicos, estructurales y de instalaciones. Gestión de permisos y licencias.',
                    'icon' => '📐',
                    'duration' => '3-4 semanas',
                    'deliverables' => ['Planos completos', 'Renders 3D', 'Presupuesto definitivo', 'Licencias tramitadas']
                ],
                [
                    'id' => 3,
                    'title' => 'Construcción',
                    'description' => 'Ejecución de obra con supervisión constante. Actualizaciones semanales del progreso.',
                    'icon' => '🏗️',
                    'duration' => '4-8 meses',
                    'deliverables' => ['Reportes semanales', 'Fotos de progreso', 'Control de calidad continuo']
                ],
                [
                    'id' => 4,
                    'title' => 'Acabados y Detalles',
                    'description' => 'Instalación de acabados finales, pintura, carpintería y detalles decorativos.',
                    'icon' => '🎨',
                    'duration' => '2-3 semanas',
                    'deliverables' => ['Acabados premium', 'Limpieza profunda', 'Inspección final']
                ],
                [
                    'id' => 5,
                    'title' => 'Entrega y Garantía',
                    'description' => 'Entrega formal de la vivienda con documentación completa y activación de garantías.',
                    'icon' => '🔑',
                    'duration' => '1 semana',
                    'deliverables' => ['Certificados de obra', 'Manuales de mantenimiento', 'Garantías activadas']
                ],
            ],

            // Garantías
            'guarantees' => [
                [
                    'id' => 1,
                    'title' => 'Garantía de Calidad',
                    'description' => 'Todos nuestros trabajos están respaldados por garantía extendida de hasta 10 años en estructura y acabados.',
                    'icon' => 'Verified',
                    'badge' => '10 años'
                ],
                [
                    'id' => 2,
                    'title' => 'Seguro de Responsabilidad',
                    'description' => 'Cobertura completa de seguro de responsabilidad civil y daños durante toda la obra.',
                    'icon' => 'Security',
                    'badge' => 'Asegurado'
                ],
                [
                    'id' => 3,
                    'title' => 'Satisfacción Garantizada',
                    'description' => 'Si no quedas satisfecho con algún aspecto, trabajamos hasta que lo estés. Sin costo adicional.',
                    'icon' => 'ThumbUp',
                    'badge' => '100%'
                ],
                [
                    'id' => 4,
                    'title' => 'Certificaciones Oficiales',
                    'description' => 'Cumplimos con todas las normativas y certificaciones del sector de la construcción.',
                    'icon' => 'EmojiEvents',
                    'badge' => 'ISO 9001'
                ],
            ],

            // Certificaciones
            'certifications' => [
                ['name' => 'ISO 9001:2015', 'description' => 'Gestión de Calidad Certificada'],
                ['name' => 'ISO 14001', 'description' => 'Gestión Ambiental'],
                ['name' => 'OHSAS 18001', 'description' => 'Seguridad y Salud Laboral'],
            ],

            // Galería
            'gallery' => [
                [
                    'id' => 1,
                    'url' => '/images/gallery/villa-1.jpg',
                    'thumbnail' => '/images/gallery/villa-1-thumb.jpg',
                    'title' => 'Villa Mediterránea - Vista Frontal',
                    'category' => 'Viviendas',
                    'description' => 'Proyecto residencial en Marbella con vistas al mar'
                ],
                [
                    'id' => 2,
                    'url' => '/images/gallery/villa-2.jpg',
                    'thumbnail' => '/images/gallery/villa-2-thumb.jpg',
                    'title' => 'Salón Principal con Vistas',
                    'category' => 'Interiores',
                    'description' => 'Espacios amplios y luminosos con acabados premium'
                ],
                [
                    'id' => 3,
                    'url' => '/images/gallery/villa-3.jpg',
                    'thumbnail' => '/images/gallery/villa-3-thumb.jpg',
                    'title' => 'Piscina Infinity y Terraza',
                    'category' => 'Exteriores',
                    'description' => 'Zona de piscina con vistas panorámicas'
                ],
                [
                    'id' => 4,
                    'url' => '/images/gallery/modern-1.jpg',
                    'thumbnail' => '/images/gallery/modern-1-thumb.jpg',
                    'title' => 'Casa Moderna Minimalista',
                    'category' => 'Viviendas',
                    'description' => 'Diseño contemporáneo con líneas limpias'
                ],
                [
                    'id' => 5,
                    'url' => '/images/gallery/kitchen-1.jpg',
                    'thumbnail' => '/images/gallery/kitchen-1-thumb.jpg',
                    'title' => 'Cocina de Diseño',
                    'category' => 'Interiores',
                    'description' => 'Cocina equipada con electrodomésticos de alta gama'
                ],
                [
                    'id' => 6,
                    'url' => '/images/gallery/garden-1.jpg',
                    'thumbnail' => '/images/gallery/garden-1-thumb.jpg',
                    'title' => 'Jardín Mediterráneo',
                    'category' => 'Exteriores',
                    'description' => 'Paisajismo con especies autóctonas'
                ],
            ],

            // FAQs con categorías
            'faq' => [
                [
                    'question' => '¿Cuánto tiempo tarda la construcción de una vivienda?',
                    'answer' => 'El tiempo de construcción depende del tamaño y complejidad del proyecto. Típicamente, una vivienda unifamiliar de 200-300m² tarda entre 6-8 meses desde el inicio de obra hasta la entrega final.',
                    'category' => 'Plazos'
                ],
                [
                    'question' => '¿Qué incluye el presupuesto inicial?',
                    'answer' => 'El presupuesto incluye todos los costos de construcción: materiales, mano de obra, permisos, licencias, gestión de proyecto y garantías. Trabajamos con transparencia total y sin costos ocultos.',
                    'category' => 'Presupuesto'
                ],
                [
                    'question' => '¿Ofrecen financiación para proyectos?',
                    'answer' => 'Sí, trabajamos con entidades financieras de confianza que ofrecen condiciones especiales para proyectos de construcción. Te asesoramos en todo el proceso de financiación.',
                    'category' => 'Presupuesto'
                ],
                [
                    'question' => '¿Qué garantías ofrecen?',
                    'answer' => 'Ofrecemos garantía de 10 años en estructura, 5 años en instalaciones y 2 años en acabados. Además, todos nuestros proyectos cuentan con seguro decenal obligatorio.',
                    'category' => 'Garantías'
                ],
                [
                    'question' => '¿Puedo hacer cambios durante la construcción?',
                    'answer' => 'Sí, es posible realizar modificaciones durante la obra, aunque recomendamos definir todo en la fase de diseño. Los cambios posteriores pueden afectar plazos y presupuesto.',
                    'category' => 'Proceso'
                ],
                [
                    'question' => '¿Trabajan con arquitectos externos?',
                    'answer' => 'Sí, podemos trabajar con tu arquitecto de confianza o proporcionarte nuestro equipo de arquitectos especializados. Nos adaptamos a tus preferencias.',
                    'category' => 'Proceso'
                ],
                [
                    'question' => '¿Qué certificaciones energéticas obtienen las viviendas?',
                    'answer' => 'Nuestras viviendas obtienen certificaciones energéticas A o B, incorporando aislamiento térmico de alta calidad, ventanas de doble acristalamiento y sistemas eficientes.',
                    'category' => 'Calidad'
                ],
                [
                    'question' => '¿Realizan proyectos fuera de la provincia?',
                    'answer' => 'Sí, realizamos proyectos en toda Andalucía y zonas limítrofes. Consultanos para tu ubicación específica.',
                    'category' => 'Cobertura'
                ],
            ],
        ]);

        $this->command->info('✅ Datos ServicesV2 poblados para: ' . $service->title);
    }
}
