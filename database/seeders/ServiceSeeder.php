<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar tabla antes de llenar
        Service::truncate();
        $services = [
            [
                'title' => 'Reforma de Baños',
                'slug' => 'reforma-de-banos',
                'excerpt' => 'Transforma tu baño en un espacio moderno y funcional con nuestros diseños personalizados y materiales de primera calidad.',
                'body' => '<h3>Reforma Integral de Baños</h3><p>Transformamos tu baño en un espacio único que combina funcionalidad, estética y confort. Nuestro equipo de especialistas se encarga de todo el proceso, desde el diseño inicial hasta la instalación final.</p><h4>Servicios Incluidos:</h4><ul><li><strong>Diseño personalizado:</strong> Creamos un proyecto adaptado a tus necesidades y gustos</li><li><strong>Fontanería completa:</strong> Instalación de tuberías, grifos y sistemas de agua</li><li><strong>Electricidad e iluminación:</strong> Puntos de luz, enchufes y sistemas de ventilación</li><li><strong>Azulejado y revestimientos:</strong> Colocación de azulejos, gresite y materiales decorativos</li><li><strong>Instalación de sanitarios:</strong> Inodoros, lavabos, duchas y bañeras</li><li><strong>Carpintería a medida:</strong> Muebles de baño personalizados</li></ul><h4>Materiales de Calidad</h4><p>Trabajamos únicamente con las mejores marcas del mercado: Roca, Jacob Delafon, Hansgrohe, Porcelanosa, entre otras. Todos nuestros materiales incluyen garantía del fabricante.</p>',
                'icon' => 'Bathtub',
                'faq' => json_encode([
                    ['question' => '¿Cuánto tiempo tarda una reforma de baño completa?', 'answer' => 'Una reforma completa de baño suele tardar entre 10-15 días laborables, dependiendo del tamaño y la complejidad del proyecto. Incluye demolición, fontanería, electricidad, azulejado e instalación de sanitarios.'],
                    ['question' => '¿El presupuesto incluye todos los materiales?', 'answer' => 'Sí, nuestros presupuestos son cerrados e incluyen todos los materiales necesarios especificados en el proyecto: azulejos, sanitarios, grifos, iluminación, y accesorios. Sin sorpresas adicionales.'],
                    ['question' => '¿Qué garantía ofrecen en las reformas?', 'answer' => 'Ofrecemos 2 años de garantía en mano de obra y garantía del fabricante en todos los materiales. Además, incluimos servicio post-venta para cualquier incidencia.'],
                    ['question' => '¿Puedo elegir los materiales y acabados?', 'answer' => 'Por supuesto. Te asesoramos en la selección de materiales, pero la decisión final es tuya. Trabajamos con una amplia gama de proveedores para adaptarnos a todos los presupuestos y gustos.'],
                    ['question' => '¿Realizan la demolición del baño antiguo?', 'answer' => 'Sí, nos encargamos de todo el proceso: demolición controlada, retirada de escombros, protección del resto de la vivienda y limpieza final. Todo incluido en el presupuesto.']
                ]),
                'sort_order' => 1,
                'featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Reforma de Cocinas',
                'slug' => 'reforma-de-cocinas',
                'excerpt' => 'Crea la cocina de tus sueños con nuestros diseños integrales y funcionales que maximizan el espacio y la comodidad.',
                'body' => '<h3>Reforma Integral de Cocinas</h3><p>Diseñamos y construimos cocinas que son el corazón de tu hogar. Combinamos funcionalidad, estética y las últimas tecnologías para crear el espacio perfecto para tu familia.</p><h4>Nuestro Proceso:</h4><ol><li><strong>Estudio del espacio:</strong> Análisis detallado de distribuciones y optimización</li><li><strong>Diseño 3D:</strong> Visualización completa antes de comenzar la obra</li><li><strong>Selección de materiales:</strong> Asesoramiento en electrodomésticos y acabados</li><li><strong>Ejecución integral:</strong> Fontanería, electricidad, mobiliario y decoración</li></ol><h4>Incluye:</h4><ul><li>Mobiliario de cocina a medida</li><li>Electrodomésticos de primeras marcas</li><li>Encimeras de granito, cuarzo o Silestone</li><li>Iluminación LED integrada</li><li>Fontanería y electricidad</li><li>Azulejado y pavimento</li></ul>',
                'icon' => 'Kitchen',
                'faq' => json_encode([
                    ['question' => '¿Puedo elegir los electrodomésticos?', 'answer' => 'Por supuesto, trabajamos con las mejores marcas (Bosch, Siemens, AEG, Whirlpool) y te asesoramos en la selección según tus necesidades y presupuesto. También podemos integrar electrodomésticos que ya tengas.'],
                    ['question' => '¿Realizan muebles de cocina a medida?', 'answer' => 'Sí, todos nuestros muebles de cocina se fabrican a medida según el diseño acordado. Optimizamos cada centímetro de espacio y nos adaptamos a cualquier distribución, incluso las más complicadas.'],
                    ['question' => '¿Cuánto tiempo tarda una reforma de cocina?', 'answer' => 'Una reforma completa de cocina suele tardar entre 15-20 días laborables. Esto incluye demolición, instalaciones, mobiliario, electrodomésticos y acabados finales.'],
                    ['question' => '¿Qué tipos de encimeras ofrecen?', 'answer' => 'Ofrecemos encimeras de granito natural, cuarzo, Silestone, Dekton y laminadas. Te asesoramos sobre las ventajas de cada material según el uso y mantenimiento que prefieras.']
                ]),
                'sort_order' => 2,
                'featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Pintura y Decoración',
                'slug' => 'pintura-y-decoracion',
                'excerpt' => 'Renueva tus espacios con nuestros servicios de pintura profesional y asesoría decorativa para lograr ambientes únicos.',
                'body' => '<h3>Pintura y Decoración Profesional</h3><p>Transformamos tus espacios con servicios completos de pintura interior y exterior. Nuestro equipo de pintores profesionales garantiza acabados perfectos con materiales de alta calidad.</p><h4>Servicios de Pintura:</h4><ul><li>Pintura interior de viviendas y locales</li><li>Pintura exterior de fachadas</li><li>Tratamientos especiales (anticondensación, ignifugo)</li><li>Lacado de puertas y ventanas</li><li>Pintura decorativa y efectos especiales</li><li>Empapelado y vinilos decorativos</li></ul><h4>Asesoramiento Decorativo</h4><p>Te ayudamos a elegir colores, texturas y acabados que mejor se adapten a tu estilo y personalidad.</p>',
                'icon' => 'FormatPaint',
                'faq' => json_encode([
                    ['question' => '¿Qué marcas de pintura utilizan?', 'answer' => 'Trabajamos con las mejores marcas del mercado: Bruguer, Montó, Titan, CIL. Utilizamos pinturas de alta calidad que garantizan durabilidad y acabados perfectos.'],
                    ['question' => '¿Incluye la preparación de las superficies?', 'answer' => 'Sí, incluimos lijado, masillado, imprimación y todas las tareas de preparación necesarias para garantizar un acabado perfecto y duradero.'],
                    ['question' => '¿Realizan trabajos en exteriores?', 'answer' => 'Sí, realizamos pintura de fachadas, muros exteriores, vallas y cualquier superficie exterior. Utilizamos pinturas especiales resistentes a la intemperie.']
                ]),
                'sort_order' => 3,
                'featured' => false,
                'is_active' => true,
            ],
            [
                'title' => 'Instalaciones Eléctricas',
                'slug' => 'instalaciones-electricas',
                'excerpt' => 'Instalaciones eléctricas seguras y eficientes para tu hogar o negocio, cumpliendo toda la normativa vigente.',
                'body' => '<h3>Instalaciones Eléctricas Profesionales</h3><p>Realizamos instalaciones eléctricas completas, renovaciones y reparaciones con todas las certificaciones necesarias. Nuestros electricistas están cualificados y al día con la normativa vigente.</p><h4>Servicios Eléctricos:</h4><ul><li>Instalaciones eléctricas nuevas</li><li>Renovación de instalaciones antiguas</li><li>Boletines eléctricos y certificaciones</li><li>Sistemas de iluminación LED</li><li>Domótica y automatización</li><li>Sistemas de seguridad</li></ul>',
                'icon' => 'ElectricalServices',
                'faq' => json_encode([
                    ['question' => '¿Emiten certificados eléctricos?', 'answer' => 'Sí, emitimos todos los certificados y boletines eléctricos necesarios según la normativa vigente. Somos instaladores autorizados.'],
                    ['question' => '¿Realizan instalaciones de domótica?', 'answer' => 'Sí, instalamos sistemas domóticos para automatizar iluminación, persianas, climatización y sistemas de seguridad, mejorando el confort y la eficiencia energética.']
                ]),
                'sort_order' => 4,
                'featured' => false,
                'is_active' => true,
            ],
            [
                'title' => 'Albañilería General',
                'slug' => 'albanileria-general',
                'excerpt' => 'Trabajos de albañilería profesional para cualquier tipo de construcción, reforma o reparación.',
                'body' => '<h3>Albañilería y Construcción</h3><p>Desde pequeñas reparaciones hasta obras mayores, nuestro equipo de albañiles profesionales garantiza acabados de calidad en todos los trabajos de construcción.</p><h4>Servicios de Albañilería:</h4><ul><li>Construcción de tabiques y paredes</li><li>Solados y alicatados</li><li>Enfoscados y revocos</li><li>Reparación de humedades</li><li>Trabajos de mampostería</li><li>Reformas estructurales</li></ul>',
                'icon' => 'Construction',
                'faq' => json_encode([]),
                'sort_order' => 5,
                'featured' => false,
                'is_active' => true,
            ],
            [
                'title' => 'Rehabilitación de Fachadas',
                'slug' => 'rehabilitacion-de-fachadas',
                'excerpt' => 'Mejora la imagen y eficiencia energética de tu edificio con nuestras rehabilitaciones integrales de fachadas.',
                'body' => '<h3>Rehabilitación Integral de Fachadas</h3><p>Especializados en rehabilitación de fachadas, aislamiento térmico y mejora de la eficiencia energética de edificios. Mejoramos tanto la estética como el rendimiento energético.</p><h4>Servicios de Rehabilitación:</h4><ul><li>SATE (Sistema de Aislamiento Térmico Exterior)</li><li>Reparación de grietas y fisuras</li><li>Impermeabilización de fachadas</li><li>Pintura y revestimientos exteriores</li><li>Renovación de balcones y terrazas</li><li>Certificación energética</li></ul>',
                'icon' => 'Apartment',
                'faq' => json_encode([
                    ['question' => '¿Qué es el sistema SATE?', 'answer' => 'El SATE (Sistema de Aislamiento Térmico por el Exterior) es una solución integral que mejora el aislamiento y elimina los puentes térmicos, reduciendo el consumo energético hasta un 40%.'],
                    ['question' => '¿Trabajan con comunidades de propietarios?', 'answer' => 'Sí, tenemos amplia experiencia trabajando con comunidades de vecinos. Nos encargamos de todos los trámites, presupuestos y coordinación necesaria.']
                ]),
                'sort_order' => 6,
                'featured' => true,
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
