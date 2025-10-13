# Especificación Técnica: Rediseño Landing de Servicios Premium

## 📋 Resumen Ejecutivo

Transformar la página de servicios (Show.jsx, 835 líneas) en una landing premium unificada que informe, convenza y convierta sin abandonar la página. Eliminar redirecciones externas, consolidar estilos usando design system, y crear componentes modulares reutilizables.

## 🎯 Objetivos Estratégicos

1. **Conversión sin redirección**: Wizard inline/modal para cotizaciones, evitando salida a /contacto
2. **Coherencia visual**: 100% uso de tokens de `designSystem.js` (colors, spacing, shadows, transitions)
3. **Componentización**: Reducir de 835 líneas a componentes atómicos reutilizables en `ServicesV2/`
4. **Métricas clave**: ↑ tiempo en página, ↑ interacción CTA, ↑ envíos directos, ↑ consumo testimonios
5. **Accesibilidad y SEO**: WCAG 2.1 AA, Lighthouse >90, Schema JSON-LD completo

## 🏗️ Arquitectura Narrativa (11 Bloques)

### 1. Hero Inmersivo
- **Componente**: `ServiceHero`
- **Contenido**: Video/imagen hero, titular aspiracional, subtitular diferenciador, badges de confianza
- **CTAs**: Primario "Agendar asesoría" (modal wizard), Secundario "Descargar dossier" (PDF inline)
- **Tokens**: `glassmorphism.medium`, `colors.primary.600`, `shadows.colored.primary`

### 2. Confianza Inmediata
- **Componente**: `TrustHighlights`
- **Contenido**: Métricas clave (m² construidos, satisfacción, obras certificadas), logos clientes, certificaciones
- **Animación**: `AnimatedCounter` con `useIntersectionReveal`
- **Tokens**: `spacing[8]`, `colors.accent.emerald`, `borders.radius.xl`

### 3. Beneficios Esenciales
- **Componente**: `BenefitGrid`
- **Contenido**: 3-4 pilares con iconografía custom, datos cuantificables, microcopy orientado al dolor
- **Layout**: Grid responsive 1-2-4 columnas (mobile-tablet-desktop)
- **Tokens**: `shadows.colored.accentHover`, `transitions.presets.transform`

### 4. Casos de Éxito
- **Componente**: `CaseStudy`
- **Contenido**: Storytelling problema → solución → resultado, galería before/after, KPIs, testimonios
- **Interacción**: Lightbox premium con navegación, zoom, información del proyecto
- **Tokens**: `glassmorphism.strong`, `colors.text.secondary`

### 5. Diferenciales Técnicos
- **Componente**: `Differentiators`
- **Contenido**: Comparativa "Nuestro método vs mercado", certificaciones, tecnología (BIM, supervisión)
- **Visual**: Ilustraciones 3D/diagramas con transiciones suaves
- **Tokens**: `colors.primary.500`, `spacing[12]`

### 6. Proceso Paso a Paso
- **Componente**: `ProcessTimeline`
- **Contenido**: Timeline horizontal (desktop) / stepper vertical (mobile), etapas, roles, entregables, tiempos
- **Animación**: Scroll-triggered progress con `useScroll` de framer-motion
- **Tokens**: `transitions.duration.slow`, `zIndex.sticky`

### 7. Catálogo Visual
- **Componente**: `VisualGallery`
- **Contenido**: Mosaico de proyectos con filtros (vivienda, corporativo, remodelación)
- **Optimización**: Lazy loading, srcset/sizes, WEBP/AVIF
- **Tokens**: `borders.radius.lg`, `shadows.xl`

### 8. Evidencia Social
- **Componente**: `TestimonialsCarousel`
- **Contenido**: Carrusel Swiper con testimonios video/texto, cita destacada, NPS, badges
- **Configuración**: Autoplay, navigation, pagination, responsive 1-3 items
- **Tokens**: `colors.accent.amber`, `glassmorphism.light`

### 9. FAQs Técnicas
- **Componente**: `ServiceFAQ`
- **Contenido**: Acordeones MUI con preguntas reales (financiamiento, permisos, mantenimiento)
- **Accesibilidad**: ARIA roles, keyboard navigation, focus management
- **Tokens**: `borders.width.thin`, `colors.border.main`

### 10. Garantías
- **Componente**: `GuaranteesBlock`
- **Contenido**: Políticas de obra, soporte post-entrega, seguros, iconografía oficial
- **Tokens**: `colors.success.600`, `spacing[6]`

### 11. CTA Final Multi-Acción
- **Componente**: `InlineQuoteWizard` + `StickyCTA`
- **Contenido**: Wizard multi-paso, WhatsApp/teléfono con `tel:` y `wa.me`, Calendly embed
- **Sticky**: Panel lateral (desktop), barra inferior (mobile)
- **Tokens**: `zIndex.fab`, `glassmorphism.dark`

## 🎨 Design System Integration

### Paleta de Colores
```javascript
// Primarios
colors.primary.600 → CTAs principales, enlaces
colors.secondary.700 → Textos principales
colors.accent.emerald → Logros, testimonios positivos
colors.accent.amber → Destacados, badges premium

// Superficies
surface.primary → Fondos principales
surface.secondary → Fondos alternos
glassmorphism.medium → Cards premium, modales
```

### Espaciado
```javascript
spacing[8] → Separación entre secciones (32px)
spacing[12] → Aire generoso en hero (48px)
spacing[4] → Padding interno cards (16px)
```

### Sombras
```javascript
shadows.colored.primary → CTAs hover
shadows.glass → Glassmorphism cards
shadows.xl → Elevación máxima
```

### Transiciones
```javascript
transitions.presets.transform → Hover effects
transitions.duration.normal → Animaciones estándar (300ms)
transitions.easing.smooth → Cubic bezier suave
```

## 📱 Responsive Breakpoints

### Desktop XL (≥1280px)
- Hero pantalla completa (100vh)
- Panel sticky lateral derecho
- Carrusel 3 items visibles
- Timeline horizontal

### Desktop Estándar (960-1280px)
- Hero 70vh
- Timeline en filas
- Carrusel 2 items
- Maintain sticky lateral

### Tablet (600-960px)
- Hero imagen superior + CTA debajo
- Timeline stepper vertical
- Carrusel 1.3 items (peek next)
- Grid 2 columnas

### Mobile (<600px)
- Todo en columna única
- Carruseles scroll-snap
- CTA barra inferior persistente
- Formularios 1 columna, inputs grandes
- Teclado específico (tel, email)

## 🔧 Estructura de Componentes

```
resources/js/Components/ServicesV2/
├── Hero/
│   └── ServiceHero.jsx
├── Trust/
│   └── TrustHighlights.jsx
├── Benefits/
│   └── BenefitGrid.jsx
├── Cases/
│   ├── CaseStudy.jsx
│   └── CaseLightbox.jsx
├── Process/
│   └── ProcessTimeline.jsx
├── Gallery/
│   ├── VisualGallery.jsx
│   └── GalleryFilters.jsx
├── Testimonials/
│   └── TestimonialsCarousel.jsx
├── FAQ/
│   └── ServiceFAQ.jsx
├── Guarantees/
│   └── GuaranteesBlock.jsx
├── CTA/
│   ├── InlineQuoteWizard.jsx
│   └── StickyCTA.jsx
└── Shared/
    ├── AnimatedCounter.jsx
    ├── GlassCard.jsx
    └── SectionContainer.jsx
```

## 🔌 Backend Integration

### ServiceController Enhancement
```php
public function show($slug)
{
    $service = Service::where('slug', $slug)->firstOrFail();
    
    return Inertia::render('Services/Show.v2', [
        'service' => new ServiceResource($service),
        'testimonials' => TestimonialResource::collection(
            Testimonial::approved()->featured()->limit(6)->get()
        ),
        'projects' => ProjectResource::collection(
            Project::published()->featured()->limit(9)->get()
        ),
        'metrics' => [
            'total_projects' => Project::completed()->count(),
            'satisfaction_rate' => 98.5,
            'square_meters' => 125000,
            'certifications' => 12
        ],
        'certifications' => CertificationResource::collection(
            Certification::active()->get()
        ),
        'seo' => [
            'title' => $service->title . ' - MDR Construcciones',
            'description' => $service->excerpt,
            'keywords' => $service->keywords,
            'og_image' => $service->featured_image,
            'schema' => $this->generateServiceSchema($service)
        ]
    ]);
}
```

### ServiceResource
```php
class ServiceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
            'icon' => $this->icon,
            'featured_image' => $this->featured_image,
            'gallery' => $this->gallery,
            'faq' => $this->faq,
            'benefits' => $this->benefits,
            'process_steps' => $this->process_steps,
            'differentiators' => $this->differentiators,
            'guarantees' => $this->guarantees,
            'average_rating' => $this->average_rating,
            'reviews_count' => $this->reviews_count,
        ];
    }
}
```

## 📊 Analytics & Tracking

### Eventos Personalizados
```javascript
// Scroll depth
trackEvent('scroll_depth', { depth: '25%', service: serviceSlug });
trackEvent('scroll_depth', { depth: '50%', service: serviceSlug });
trackEvent('scroll_depth', { depth: '75%', service: serviceSlug });
trackEvent('scroll_depth', { depth: '100%', service: serviceSlug });

// CTA interactions
trackEvent('cta_click', { type: 'primary', label: 'Agendar asesoría', service: serviceSlug });
trackEvent('cta_click', { type: 'secondary', label: 'Descargar dossier', service: serviceSlug });
trackEvent('cta_click', { type: 'whatsapp', service: serviceSlug });

// Wizard flow
trackEvent('wizard_start', { service: serviceSlug });
trackEvent('wizard_step', { step: 1, service: serviceSlug });
trackEvent('wizard_complete', { service: serviceSlug, lead_value: estimatedBudget });

// Section engagement
trackEvent('section_view', { section: 'cases', service: serviceSlug });
trackEvent('faq_expand', { question: faqTitle, service: serviceSlug });
trackEvent('testimonial_view', { testimonial_id: id, service: serviceSlug });
```

## 🚀 Roadmap de Implementación

Ver task list completo para detalles de cada fase (7 semanas).

## 📈 KPIs de Éxito

- **Tiempo en página**: Baseline → +40%
- **Scroll depth 75%+**: Baseline → +30%
- **Tasa de conversión wizard**: >5%
- **Completion rate wizard**: >60%
- **Descargas dossier**: +50%
- **Interacción con casos**: >40% visitantes
- **Lighthouse Performance**: >90
- **Lighthouse Accessibility**: >95
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1

---

**Última actualización**: 2025-10-13  
**Versión**: 1.0  
**Responsable**: Equipo de Desarrollo MDR

