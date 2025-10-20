# 📘 Guía de Uso - Componentes Unificados

**Fecha:** Octubre 2025  
**Versión:** 1.0  
**Estado:** Activo

Esta guía proporciona ejemplos prácticos de cómo usar los componentes unificados del sistema de diseño.

---

## 🎯 Componentes Disponibles

### 1. UniversalHero
### 2. ContentCard
### 3. SectionContainer
### 4. GlobalThemeProvider

---

## 1️⃣ UniversalHero - Hero Unificado

### 📋 Casos de Uso

#### Caso 1: Home Page (variant="primary")

```jsx
import UniversalHero from '@/Components/Common/UniversalHero';

export default function Home() {
  return (
    <MainLayout>
      <UniversalHero
        variant="primary"
        title="Construimos tus sueños"
        subtitle="Más de 25 años transformando espacios con calidad y compromiso"
        description="Somos expertos en construcción, reformas y diseño de interiores. Tu proyecto en las mejores manos."
        cta={{
          primary: { 
            text: 'Solicitar Presupuesto', 
            href: '/contacto' 
          },
          secondary: { 
            text: 'Ver Proyectos', 
            href: '/proyectos' 
          }
        }}
        gradient="hero"
        badges={[
          { icon: '⭐', value: '4.9/5', text: 'Valoración' },
          { icon: '✅', value: '500+', text: 'Proyectos' },
          { icon: '🏆', value: '25', text: 'Años' }
        ]}
      />
    </MainLayout>
  );
}
```

#### Caso 2: Services Index (variant="secondary")

```jsx
import UniversalHero from '@/Components/Common/UniversalHero';

export default function ServicesIndex({ services }) {
  return (
    <MainLayout>
      <UniversalHero
        variant="secondary"
        title="Nuestros Servicios"
        subtitle="Soluciones integrales de construcción para particulares y empresas"
        cta={{
          primary: { 
            text: 'Ver Catálogo', 
            href: '/catalogo.pdf' 
          }
        }}
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicios' }
        ]}
        backgroundImage="/images/services-hero.jpg"
        overlay={0.5}
      />
      
      {/* Grid de servicios */}
    </MainLayout>
  );
}
```

#### Caso 3: Blog Post Individual (variant="minimal")

```jsx
import UniversalHero from '@/Components/Common/UniversalHero';

export default function BlogPost({ post }) {
  return (
    <MainLayout>
      <UniversalHero
        variant="minimal"
        title={post.title}
        subtitle={`Publicado el ${post.published_at} por ${post.author}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.category.name, href: `/blog/categoria/${post.category.slug}` },
          { label: post.title }
        ]}
        align="left"
      />
      
      {/* Contenido del post */}
    </MainLayout>
  );
}
```

#### Caso 4: Con Imagen de Fondo y CTAs Personalizados

```jsx
<UniversalHero
  variant="primary"
  title="Reformas Integrales"
  subtitle="Transformamos tu hogar en el espacio que siempre soñaste"
  cta={{
    primary: { 
      text: 'Pedir Cita Gratis', 
      onClick: () => setModalOpen(true) 
    },
    secondary: { 
      text: 'Llamar Ahora', 
      onClick: () => window.location.href = 'tel:+34912345678' 
    }
  }}
  backgroundImage="https://images.unsplash.com/photo-renovacion"
  gradient={false}  // No usar gradiente sobre la imagen
  overlay={0.6}     // Overlay oscuro para contraste
/>
```

---

## 2️⃣ ContentCard - Card Unificado

### 📋 Casos de Uso

#### Caso 1: Blog Posts

```jsx
import ContentCard from '@/Components/Common/ContentCard';
import { Grid } from '@mui/material';

export default function BlogIndex({ posts }) {
  return (
    <Container>
      <Grid container spacing={4}>
        {posts.map(post => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <ContentCard
              type="post"
              image={post.cover_image}
              title={post.title}
              excerpt={post.excerpt}
              meta={{
                date: post.published_at,
                author: post.author.name,
                category: post.category.name,
                tags: post.tags.map(t => t.name)
              }}
              actions={[
                { 
                  label: 'Leer más', 
                  href: `/blog/${post.slug}`,
                  variant: 'contained'
                }
              ]}
              variant="elevated"
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
```

#### Caso 2: Servicios

```jsx
<Grid container spacing={3}>
  {services.map(service => (
    <Grid item xs={12} md={6} lg={4} key={service.id}>
      <ContentCard
        type="service"
        image={service.featured_image}
        title={service.title}
        excerpt={service.short_description}
        meta={{
          rating: service.average_rating,
          category: service.category.name
        }}
        actions={[
          { 
            label: 'Ver Detalles', 
            href: `/servicios/${service.slug}`,
            variant: 'contained',
            color: 'primary'
          },
          { 
            label: 'Solicitar Info', 
            onClick: () => handleContactModal(service),
            variant: 'outlined'
          }
        ]}
        variant="elevated"
        hoverable={true}
      />
    </Grid>
  ))}
</Grid>
```

#### Caso 3: Proyectos

```jsx
<Grid container spacing={4}>
  {projects.map(project => (
    <Grid item xs={12} sm={6} md={4} key={project.id}>
      <ContentCard
        type="project"
        image={project.main_image}
        title={project.title}
        excerpt={project.summary}
        meta={{
          location: project.location,
          date: project.completion_date,
          budget: `${project.budget.toLocaleString()}€`,
          tags: project.tags.map(t => t.name)
        }}
        actions={[
          { 
            label: 'Ver Galería', 
            href: `/proyectos/${project.slug}`,
            variant: 'contained'
          }
        ]}
        imageHeight={250}
        variant="elevated"
      />
    </Grid>
  ))}
</Grid>
```

#### Caso 4: Testimonio / Review

```jsx
<ContentCard
  type="testimonial"
  image={testimonial.client_avatar}
  title={testimonial.client_name}
  excerpt={testimonial.comment}
  meta={{
    rating: `${testimonial.rating}/5`,
    date: testimonial.created_at,
    category: testimonial.service.name
  }}
  variant="flat"
  imageHeight={80}
  actions={[
    { 
      label: 'Ver más reviews', 
      href: '/testimonios',
      variant: 'text',
      size: 'small'
    }
  ]}
/>
```

#### Caso 5: Card Genérico para Llamada a la Acción

```jsx
<ContentCard
  type="generic"
  title="¿Necesitas ayuda con tu proyecto?"
  description="Nuestro equipo de expertos está listo para asesorarte sin compromiso. Contáctanos hoy mismo."
  actions={[
    { 
      label: 'Contactar Ahora', 
      onClick: () => setContactModalOpen(true),
      variant: 'contained',
      fullWidth: true
    }
  ]}
  variant="outlined"
  hoverable={false}
/>
```

#### Caso 6: Card sin Imagen

```jsx
<ContentCard
  type="generic"
  title="Garantía de 10 Años"
  excerpt="Todos nuestros trabajos incluyen garantía extendida y servicio post-venta."
  meta={{
    tags: ['Garantía', 'Calidad', 'Confianza']
  }}
  variant="flat"
/>
```

---

## 3️⃣ SectionContainer - Wrapper de Secciones

### 📋 Casos de Uso

#### Caso 1: Sección Estándar con Padding Large

```jsx
import SectionContainer from '@/Components/Common/SectionContainer';

<SectionContainer py="large" maxWidth="lg">
  <Typography variant="h2" gutterBottom textAlign="center">
    Nuestros Servicios
  </Typography>
  <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>
    Ofrecemos soluciones completas de construcción
  </Typography>
  
  <Grid container spacing={4}>
    {/* Cards de servicios */}
  </Grid>
</SectionContainer>
```

#### Caso 2: Sección con Fondo de Color

```jsx
<SectionContainer 
  py="xlarge" 
  backgroundColor="surface"
  maxWidth="xl"
>
  <Typography variant="h2" gutterBottom>
    ¿Por qué elegirnos?
  </Typography>
  {/* Contenido */}
</SectionContainer>
```

#### Caso 3: Sección con Gradiente Hero

```jsx
import { HeroSectionContainer } from '@/Components/Common/SectionContainer';

<HeroSectionContainer py="xlarge" centerContent>
  <Typography variant="h1" gutterBottom sx={{ color: 'white' }}>
    Transformamos Espacios
  </Typography>
  <Typography variant="h5" sx={{ color: 'white', opacity: 0.9 }}>
    Con más de 25 años de experiencia
  </Typography>
  <Button variant="contained" size="large" sx={{ mt: 4 }}>
    Empezar Ahora
  </Button>
</HeroSectionContainer>
```

#### Caso 4: Sección con Imagen de Fondo y Overlay

```jsx
<SectionContainer
  py="xlarge"
  backgroundImage="/images/parallax-bg.jpg"
  overlay={0.7}
  centerContent
>
  <Typography variant="h2" sx={{ color: 'white' }} gutterBottom>
    500+ Proyectos Completados
  </Typography>
  <Typography variant="h5" sx={{ color: 'white', opacity: 0.9 }}>
    La confianza de nuestros clientes nos respalda
  </Typography>
</SectionContainer>
```

#### Caso 5: Padding Personalizado

```jsx
<SectionContainer
  pt={10}  // Padding top custom
  pb={16}  // Padding bottom custom
  px={4}   // Padding horizontal custom
  maxWidth="md"
>
  {/* Contenido con spacing específico */}
</SectionContainer>
```

#### Caso 6: Sin Padding Horizontal (Full Width Content)

```jsx
<SectionContainer
  py="large"
  disableGutters
  maxWidth={false}  // Sin maxWidth
>
  <Box sx={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
    <Swiper>
      {/* Slider full width */}
    </Swiper>
  </Box>
</SectionContainer>
```

---

## 4️⃣ Patrones Comunes de Uso

### Patrón 1: Página de Índice Completa (Blog/Servicios/Proyectos)

```jsx
import UniversalHero from '@/Components/Common/UniversalHero';
import SectionContainer from '@/Components/Common/SectionContainer';
import ContentCard from '@/Components/Common/ContentCard';
import { Grid, Typography } from '@mui/material';

export default function ServicesIndex({ services, categories }) {
  return (
    <MainLayout>
      {/* Hero */}
      <UniversalHero
        variant="secondary"
        title="Nuestros Servicios"
        subtitle="Soluciones integrales de construcción"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicios' }
        ]}
        cta={{
          primary: { text: 'Pedir Presupuesto', href: '/contacto' }
        }}
      />

      {/* Servicios Grid */}
      <SectionContainer py="large" maxWidth="lg">
        <Grid container spacing={4}>
          {services.map(service => (
            <Grid item xs={12} md={6} lg={4} key={service.id}>
              <ContentCard
                type="service"
                image={service.featured_image}
                title={service.title}
                excerpt={service.short_description}
                meta={{
                  rating: service.average_rating,
                  category: service.category.name
                }}
                actions={[
                  { label: 'Ver Detalles', href: `/servicios/${service.slug}` }
                ]}
                variant="elevated"
              />
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      {/* CTA Section */}
      <SectionContainer py="xlarge" backgroundColor="primary">
        <Typography variant="h3" textAlign="center" color="white" gutterBottom>
          ¿Listo para empezar tu proyecto?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" size="large" color="secondary">
            Contactar Ahora
          </Button>
        </Box>
      </SectionContainer>
    </MainLayout>
  );
}
```

### Patrón 2: Landing Page con Múltiples Secciones

```jsx
export default function ServiceDetail({ service }) {
  return (
    <MainLayout>
      {/* Hero */}
      <UniversalHero
        variant="primary"
        title={service.title}
        subtitle={service.tagline}
        cta={{
          primary: { text: 'Solicitar Asesoría', onClick: () => setModalOpen(true) },
          secondary: { text: 'Ver Galería', href: '#gallery' }
        }}
        backgroundImage={service.hero_image}
        overlay={0.5}
        badges={[
          { icon: '⭐', value: service.rating, text: 'Rating' },
          { icon: '✅', value: service.projects_count, text: 'Proyectos' }
        ]}
      />

      {/* Beneficios */}
      <SectionContainer py="large" maxWidth="lg">
        <Typography variant="h2" textAlign="center" gutterBottom>
          ¿Por qué elegir {service.title}?
        </Typography>
        <Grid container spacing={3} mt={4}>
          {service.benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <ContentCard
                type="generic"
                title={benefit.title}
                description={benefit.description}
                variant="flat"
              />
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      {/* Proyectos Relacionados */}
      <SectionContainer py="xlarge" backgroundColor="surface">
        <Typography variant="h2" gutterBottom>
          Proyectos Destacados
        </Typography>
        <Grid container spacing={4} mt={2}>
          {service.featured_projects.map(project => (
            <Grid item xs={12} md={6} key={project.id}>
              <ContentCard
                type="project"
                image={project.main_image}
                title={project.title}
                excerpt={project.summary}
                meta={{
                  location: project.location,
                  date: project.completion_date
                }}
                actions={[
                  { label: 'Ver Proyecto', href: `/proyectos/${project.slug}` }
                ]}
              />
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      {/* Testimonios */}
      <SectionContainer py="large" maxWidth="md" centerContent>
        <Typography variant="h2" gutterBottom>
          Lo que dicen nuestros clientes
        </Typography>
        <Grid container spacing={3} mt={4}>
          {service.testimonials.map((testimonial, index) => (
            <Grid item xs={12} key={index}>
              <ContentCard
                type="testimonial"
                image={testimonial.avatar}
                title={testimonial.name}
                excerpt={testimonial.comment}
                meta={{
                  rating: testimonial.rating,
                  date: testimonial.date
                }}
                variant="outlined"
              />
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      {/* Final CTA */}
      <SectionContainer py="xlarge" backgroundGradient="hero" centerContent>
        <Typography variant="h2" color="white" gutterBottom>
          ¿Listo para comenzar?
        </Typography>
        <Typography variant="h5" color="white" sx={{ opacity: 0.9, mb: 4 }}>
          Solicita una consulta gratuita hoy mismo
        </Typography>
        <Button variant="contained" size="large" color="secondary">
          Contactar Ahora
        </Button>
      </SectionContainer>
    </MainLayout>
  );
}
```

---

## 🎨 Combinaciones de Variantes

### Hero + Card + Section Combinations

| Página | Hero Variant | Card Variant | Section Background |
|--------|--------------|--------------|-------------------|
| **Home** | primary | elevated | alternating (default/surface) |
| **Services Index** | secondary | elevated | default |
| **Service Detail** | primary | flat/outlined | alternating |
| **Projects Index** | secondary | elevated | default |
| **Project Detail** | minimal | elevated | default |
| **Blog Index** | secondary | elevated | default |
| **Blog Post** | minimal | N/A | default |
| **About** | secondary | flat | surface |
| **Contact** | primary | flat | default |

---

## 📊 Responsive Guidelines

### Breakpoints

- **xs**: 0-599px (móvil pequeño)
- **sm**: 600-959px (móvil grande)
- **md**: 960-1279px (tablet)
- **lg**: 1280-1919px (desktop)
- **xl**: 1920px+ (desktop grande)

### Grid Columns por Dispositivo

```jsx
<Grid container spacing={4}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    {/* 
      xs: 1 columna (móvil)
      sm: 2 columnas (tablet portrait)
      md: 3 columnas (tablet landscape)
      lg: 4 columnas (desktop)
    */}
  </Grid>
</Grid>
```

### Padding Responsive Automático

SectionContainer aplica padding responsive automáticamente:

```jsx
// "large" preset:
// - xs (móvil): 64px vertical
// - md (tablet+): 96px vertical
<SectionContainer py="large">
  {/* Padding se adapta automáticamente */}
</SectionContainer>
```

---

## ✅ Checklist de Implementación

Al crear una nueva página, sigue este orden:

- [ ] Envolver app con `GlobalThemeProvider` (una vez)
- [ ] Usar `UniversalHero` con la variante apropiada
- [ ] Estructurar contenido con `SectionContainer`
- [ ] Usar `ContentCard` para listas de contenido
- [ ] Aplicar Grid de MUI para layouts responsive
- [ ] Verificar que no se creen ThemeProviders adicionales
- [ ] Testear en móvil, tablet y desktop
- [ ] Validar accesibilidad (keyboard navigation, screen readers)

---

## 🚀 Próximos Pasos

1. Implementar `GlobalThemeProvider` en app.jsx
2. Migrar páginas existentes a usar los nuevos componentes
3. Crear componentes de Loading States (SkeletonCard, EmptyState)
4. Documentar más patrones conforme se descubran

---

**Última actualización:** Octubre 2025  
**Mantenido por:** Equipo de Desarrollo Frontend
