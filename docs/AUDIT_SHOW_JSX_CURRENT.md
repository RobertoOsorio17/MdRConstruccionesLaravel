# Auditoría Técnica: Show.jsx Actual

**Fecha**: 2025-10-13  
**Archivo**: `resources/js/Pages/Services/Show.jsx`  
**Líneas totales**: 835  
**Componentes importados**: 14 externos + 58 MUI icons

---

## 📊 Resumen Ejecutivo

### Problemas Críticos Identificados
1. **Redirección externa en CTAs** (líneas 556, 676, 699, 828): Rompe continuidad, pierde datos de intención
2. **Estilos inline masivos** (>150 instancias): No usa tokens de `designSystem.js`
3. **Lógica duplicada**: Datos hardcodeados (processSteps, servicePlans, achievements, features)
4. **Componentes monolíticos**: 835 líneas en un solo archivo, dificulta mantenimiento
5. **Falta de tracking**: Sin eventos analytics para medir engagement

### Oportunidades de Mejora
- **Componentización**: Dividir en 11+ componentes atómicos reutilizables
- **Design System**: Migrar 100% estilos a tokens de `designSystem.js`
- **Conversión inline**: Reemplazar redirecciones con wizard modal/inline
- **Analytics**: Implementar tracking granular de interacciones
- **Performance**: Code splitting, lazy loading, optimización de imágenes

---

## 🔍 Análisis Detallado por Sección

### 1. Imports y Dependencias (líneas 1-112)

#### ✅ Aspectos Positivos
- Usa componentes premium existentes: `BeforeAfterSlider`, `Enhanced3DTimeline`, `PlanComparator`, `FAQInteractive`
- Integración correcta de framer-motion para animaciones
- DOMPurify para sanitización HTML
- Swiper para carruseles

#### ❌ Problemas
```javascript
// NO usa designSystem.js
import { useTheme, useMediaQuery } from '@mui/material';
// Debería importar:
import designSystem from '@/theme/designSystem';
```

**Recomendación**: Crear barrel export en `ServicesV2/index.js` para imports limpios

---

### 2. ImageGalleryEnhanced (líneas 114-270)

#### ❌ Problemas Críticos
```javascript
// Línea 174: Estilos inline hardcodeados
bgcolor: 'rgba(0,0,0,0.5)'
// Debería usar:
bgcolor: designSystem.colors.surface.overlayDark

// Línea 204: Z-index mágico
zIndex: 9999
// Debería usar:
zIndex: designSystem.zIndex.modal
```

#### 🔧 Refactorización Necesaria
- Extraer a `ServicesV2/Gallery/GalleryLightbox.jsx`
- Usar `glassmorphism.dark` para overlay
- Implementar lazy loading con `loading="lazy"`
- Añadir srcset/sizes para responsive images
- Tracking: `trackEvent('gallery_image_view', { index, service })`

---

### 3. Componente Principal ServiceShow (líneas 273-834)

#### Props Recibidas
```javascript
{
  service,           // ✅ Completo
  relatedServices,   // ✅ Usado
  seo,              // ✅ Usado
  auth,             // ✅ Usado para favoritos
  testimonials,     // ⚠️ Opcional, puede ser []
  projects          // ⚠️ No usado actualmente
}
```

**Problema**: Faltan props críticas para nueva arquitectura:
- `metrics` (m² construidos, satisfacción, certificaciones)
- `certifications` (badges oficiales)
- `benefits` (pilares de valor)
- `guarantees` (políticas, seguros)

---

### 4. Estado y Lógica (líneas 281-337)

#### ✅ Aspectos Positivos
```javascript
const [activeTab, setActiveTab] = useState(0);
const [isFavorite, setIsFavorite] = useState(false);
const { scrollYProgress } = useScroll(); // ✅ Buen uso de framer-motion
```

#### ❌ Problemas
```javascript
// Línea 294: Redirección forzada
if (!auth?.user) {
    window.location.href = '/login';
    return;
}
// Debería: Mostrar modal de login inline o mensaje amigable
```

**Recomendación**: Crear `useServiceInteractions` hook para encapsular favoritos, share, tracking

---

### 5. Datos Hardcodeados (líneas 340-417)

#### ❌ Problema Crítico: Datos Estáticos
```javascript
// Línea 340-366: processSteps hardcodeado
const processSteps = [
    { label: 'Consulta Inicial', description: '...', icon: <Phone /> },
    // ...
];

// Línea 369-409: servicePlans hardcodeado
const servicePlans = [
    { name: 'Básico', price: 'Desde €1,500', features: [...] },
    // ...
];

// Línea 412-417: achievements hardcodeado
const achievements = [
    { icon: <EmojiEvents />, value: '500+', label: 'Proyectos Completados' },
    // ...
];
```

**Impacto**: 
- No reutilizable entre servicios
- Dificulta actualización de contenido
- No permite personalización por servicio

**Solución**: Mover a backend
```php
// ServiceController::show
'process_steps' => $service->process_steps ?? $this->getDefaultProcessSteps(),
'plans' => $service->plans ?? $this->getDefaultPlans(),
'metrics' => $this->getServiceMetrics($service),
```

---

### 6. Progress Bar (líneas 423-442)

#### ✅ Aspectos Positivos
```javascript
<motion.div
    style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    }}
/>
```

#### ⚠️ Mejoras Menores
- Usar `designSystem.colors.primary.600` y `colors.accent.purple`
- Añadir `will-change: transform` para performance
- Z-index debería ser `designSystem.zIndex.fixed`

---

### 7. EnhancedHeroSection (líneas 444-451)

#### ✅ Componente Reutilizable
```javascript
<EnhancedHeroSection
    service={service}
    achievements={achievements}
    onFavoriteToggle={handleFavoriteToggle}
    onShare={handleShare}
    isFavorite={isFavorite}
/>
```

**Análisis**: Componente bien estructurado, pero necesita:
- Props adicionales: `ctaConfig`, `badges`, `media`
- Integración con wizard inline (no redirección)
- Tracking de interacciones

---

### 8. CertificationsBadges (líneas 453-456)

#### ⚠️ Problema: Sin Props
```javascript
<CertificationsBadges />
```

**Debería recibir**:
```javascript
<CertificationsBadges certifications={certifications} />
```

---

### 9. BeforeAfterSlider (líneas 458-467)

#### ✅ Componente Premium
```javascript
{service.before_image && service.after_image && (
    <BeforeAfterSlider
        beforeImage={service.before_image}
        afterImage={service.after_image}
        title="Transformación Real"
    />
)}
```

**Mejora**: Integrar en `CaseStudy` component con storytelling completo

---

### 10. Tabs de Contenido (líneas 469-581)

#### ❌ Problemas de UX
```javascript
<Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
    <Tab label="Descripción" />
    <Tab label="Proceso" />
    <Tab label="Precios" />
    <Tab label="Galería" />
</Tabs>
```

**Problemas**:
1. **Oculta contenido**: Usuario debe hacer clic para ver proceso/precios
2. **Reduce scroll depth**: Contenido no visible en scroll natural
3. **Dificulta SEO**: Contenido en tabs menos indexable

**Solución**: Eliminar tabs, mostrar todo en scroll vertical con secciones bien definidas

#### Estilos Inline (líneas 479-484)
```javascript
sx={{
    bgcolor: '#f8fafc',  // ❌ Debería: designSystem.colors.surface.secondary
    '& .MuiTab-root': {
        fontWeight: 600,
        fontSize: '1rem',
    }
}}
```

---

### 11. Tab Descripción (líneas 494-538)

#### ❌ Estilos Inline Masivos
```javascript
sx={{
    '& p': { mb: 2, lineHeight: 1.8, color: '#475569' },  // ❌
    '& h2, & h3, & h4': { mt: 4, mb: 2, fontWeight: 600 },
    '& ul, & ol': { pl: 3, mb: 2 },
    '& li': { mb: 1 },
}}
```

**Debería**:
```javascript
sx={{
    '& p': { 
        mb: designSystem.spacing[2], 
        lineHeight: 1.8, 
        color: designSystem.colors.text.secondary 
    },
    // ...
}}
```

#### Features Hardcodeadas (líneas 518-534)
```javascript
{[
    'Presupuesto sin compromiso',
    'Materiales de primera calidad',
    // ...
].map((feature, index) => (
    // ...
))}
```

**Solución**: Mover a `service.features` desde backend

---

### 12. Tab Proceso (líneas 541-548)

#### ✅ Usa Componente Reutilizable
```javascript
<Enhanced3DTimeline />
```

**Problema**: No recibe props, usa datos internos hardcodeados

**Solución**:
```javascript
<ProcessTimeline steps={service.process_steps} />
```

---

### 13. Tab Precios (líneas 550-561)

#### ❌ Redirección Externa Crítica
```javascript
<PlanComparator
    onSelectPlan={(plan) => {
        window.location.href = '/contacto';  // ❌ PROBLEMA CRÍTICO
    }}
/>
```

**Impacto**:
- Pierde contexto del plan seleccionado
- Rompe flujo de conversión
- No trackea intención del usuario

**Solución**:
```javascript
<PlanComparator
    plans={service.plans}
    onSelectPlan={(plan) => {
        trackEvent('plan_selected', { plan: plan.name, service: service.slug });
        openQuoteWizard({ preselectedPlan: plan });
    }}
/>
```

---

### 14. Tab Galería (líneas 563-579)

#### ⚠️ Condicional Débil
```javascript
{service.images && service.images.length > 0 ? (
    <ImageGalleryEnhanced images={service.images} />
) : (
    <Alert severity="info">
        No hay imágenes disponibles...
    </Alert>
)}
```

**Mejora**: Mostrar proyectos relacionados si no hay imágenes propias

---

### 15. Testimonials Carousel (líneas 583-631)

#### ✅ Implementación Sólida
```javascript
<Swiper
    modules={[Navigation, Pagination, Autoplay]}
    slidesPerView={isMobile ? 1 : isTablet ? 2 : 3}
    autoplay={{ delay: 5000 }}
>
```

#### ❌ Estilos Inline
```javascript
style={{ padding: '20px 0 50px' }}  // ❌
// Debería:
sx={{ py: designSystem.spacing[5], pb: designSystem.spacing[12] }}
```

#### ⚠️ Falta Tracking
```javascript
// Añadir:
onSlideChange={(swiper) => {
    trackEvent('testimonial_view', { 
        index: swiper.activeIndex,
        testimonial_id: testimonials[swiper.activeIndex].id 
    });
}}
```

---

### 16. FAQ Section (líneas 633-636)

#### ✅ Componente Reutilizable
```javascript
<FAQInteractive />
```

**Mejora**: Pasar FAQs desde backend
```javascript
<ServiceFAQ faqs={service.faq} />
```

---

### 17. Contact CTA Section (líneas 638-741)

#### ❌ PROBLEMA CRÍTICO: Redirección Externa
```javascript
// Línea 676
<Button
    component={Link}
    href="/contacto"  // ❌ REDIRECCIÓN EXTERNA
    startIcon={<RequestQuote />}
>
    Ir a Página de Contacto
</Button>

// Línea 699
<Button
    component="a"
    href="https://wa.me/34123456789"  // ⚠️ Número hardcodeado
    target="_blank"
>
    WhatsApp Directo
</Button>
```

**Impacto Negativo**:
1. Usuario abandona página de servicio
2. Pierde contexto del servicio específico
3. No captura datos de intención (plan, presupuesto estimado)
4. Dificulta tracking de conversión

**Solución Propuesta**:
```javascript
<Button
    onClick={() => openQuoteWizard({ service: service.slug })}
    startIcon={<RequestQuote />}
>
    Solicitar Asesoría Personalizada
</Button>

<Button
    component="a"
    href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
        `Hola, estoy interesado en el servicio: ${service.title}`
    )}`}
    onClick={() => trackEvent('whatsapp_click', { service: service.slug })}
>
    WhatsApp Directo
</Button>
```

---

### 18. Related Services (líneas 743-807)

#### ✅ Implementación Correcta
```javascript
{relatedServices && relatedServices.length > 0 && (
    <Grid container spacing={3}>
        {relatedServices.slice(0, 3).map((related) => (
            <Card component={Link} href={`/servicios/${related.slug}`}>
```

#### ⚠️ Mejoras Menores
- Añadir tracking de clics
- Usar `designSystem.spacing` en lugar de valores hardcodeados
- Implementar skeleton loading mientras carga

---

### 19. FloatingCTA (líneas 825-831)

#### ❌ Redirección Externa
```javascript
<FloatingCTA
    onRequestQuote={() => {
        window.location.href = '/contacto';  // ❌ PROBLEMA
    }}
    showScrollTop={true}
/>
```

**Solución**:
```javascript
<StickyCTA
    ctaConfig={{
        primary: { label: 'Solicitar Asesoría', onClick: openQuoteWizard },
        whatsapp: { number: settings.whatsapp_number, message: `Servicio: ${service.title}` },
        phone: { number: settings.phone_number }
    }}
    position={isMobile ? 'bottom' : 'right'}
    showScrollTop={true}
/>
```

---

## 📈 Métricas de Código

### Estilos Inline vs Design System
- **Estilos inline**: ~150 instancias
- **Uso de designSystem.js**: 0%
- **Colores hardcodeados**: 45+ instancias
- **Espaciado hardcodeado**: 80+ instancias

### Componentización
- **Componentes externos usados**: 6 (EnhancedHeroSection, CertificationsBadges, BeforeAfterSlider, Enhanced3DTimeline, PlanComparator, FAQInteractive, FloatingCTA)
- **Componentes inline**: 2 (ImageGalleryEnhanced, Testimonials)
- **Componentes necesarios**: 11+ (según nueva arquitectura)

### Datos Hardcodeados
- `processSteps`: 5 items (línea 340)
- `servicePlans`: 3 items (línea 369)
- `achievements`: 4 items (línea 412)
- `features`: 8 items (línea 518)

### Redirecciones Externas
- `/contacto`: 2 instancias (líneas 556, 676)
- `FloatingCTA`: 1 instancia (línea 828)
- **Total**: 3 puntos de fuga críticos

---

## 🎯 Plan de Acción Prioritario

### Fase 1: Eliminar Redirecciones (Crítico)
1. Crear `InlineQuoteWizard` component
2. Reemplazar `href="/contacto"` con `onClick={openQuoteWizard}`
3. Implementar tracking de intenciones

### Fase 2: Migrar a Design System (Alto)
1. Crear utilidad `mapInlineStylesToTokens()`
2. Reemplazar colores hardcodeados con `designSystem.colors.*`
3. Reemplazar espaciado con `designSystem.spacing[*]`
4. Usar `glassmorphism` presets

### Fase 3: Componentización (Alto)
1. Extraer `ImageGalleryEnhanced` → `VisualGallery`
2. Crear `TrustHighlights`, `BenefitGrid`, `CaseStudy`
3. Refactorizar tabs a secciones verticales

### Fase 4: Backend Integration (Medio)
1. Mover datos hardcodeados a ServiceResource
2. Crear ServiceResource con todos los campos
3. Actualizar ServiceController::show

### Fase 5: Analytics (Medio)
1. Implementar `trackEvent` utility
2. Añadir tracking en todos los CTAs
3. Configurar scroll depth tracking

---

**Próximos pasos**: Iniciar Fase 1 con creación de `InlineQuoteWizard` y `StickyCTA` components.

