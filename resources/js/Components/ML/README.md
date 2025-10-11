# 🤖 Sistema de Machine Learning - Frontend

Sistema completo de Machine Learning integrado en el frontend de MDR Construcciones Blog.

## 📁 Estructura de Archivos

```
resources/js/
├── Components/ML/
│   ├── MLInsights.jsx                 # Widget de insights del usuario
│   ├── RecommendationCard.jsx         # Tarjeta individual de recomendación
│   ├── RecommendationsWidget.jsx      # Widget de recomendaciones
│   ├── InteractionTracker.jsx         # Tracker automático de interacciones
│   └── Admin/
│       └── MLDashboard.jsx            # Panel de administración ML
├── Hooks/
│   ├── useMLRecommendations.js        # Hook principal de ML
│   └── usePostTracking.js             # Hook de tracking de posts
├── Services/
│   └── MLService.js                   # Servicio centralizado de API ML
└── Pages/Blog/
    └── ShowWithML.jsx                 # Ejemplo de integración completa
```

## 🎯 Componentes Principales

### 1. **MLInsights** - Widget de Insights del Usuario

Muestra información personalizada sobre el perfil de lectura del usuario.

**Uso:**
```jsx
import MLInsights from '@/Components/ML/MLInsights';

// Versión completa
<MLInsights variant="full" />

// Versión compacta
<MLInsights variant="compact" />
```

**Características:**
- Muestra estadísticas de lectura (posts leídos, tiempo promedio, engagement)
- Perfil de usuario con cluster asignado
- Categorías favoritas con barras de progreso
- Patrones de lectura (horario preferido, duración)
- Detalles técnicos expandibles

---

### 2. **RecommendationsWidget** - Widget de Recomendaciones

Muestra recomendaciones personalizadas usando diferentes algoritmos ML.

**Uso:**
```jsx
import RecommendationsWidget from '@/Components/ML/RecommendationsWidget';

<RecommendationsWidget
    currentPostId={post.id}
    limit={6}
    showAlgorithmSelector={true}
    showExplanations={true}
    title="🤖 Artículos Recomendados Para Ti"
/>
```

**Props:**
- `currentPostId` (number|null): ID del post actual para contexto
- `limit` (number): Número de recomendaciones a mostrar (default: 6)
- `showAlgorithmSelector` (boolean): Mostrar selector de algoritmos (default: false)
- `showExplanations` (boolean): Mostrar explicaciones de recomendaciones (default: false)
- `title` (string): Título del widget
- `variant` (string): 'grid' | 'carousel' | 'list' (default: 'grid')

**Algoritmos disponibles:**
- **Híbrido**: Combinación de todos los algoritmos
- **Contenido**: Basado en similitud de contenido
- **Colaborativo**: Filtrado colaborativo (usuarios similares)
- **Trending**: Posts populares recientemente

---

### 3. **RecommendationCard** - Tarjeta de Recomendación

Tarjeta individual para mostrar una recomendación con explicación.

**Uso:**
```jsx
import RecommendationCard from '@/Components/ML/RecommendationCard';

<RecommendationCard
    post={post}
    position={1}
    onView={handleRecommendationClick}
    showExplanation={true}
/>
```

**Características:**
- Badge de posición para top 3
- Chip de algoritmo con color distintivo
- Barra de confianza
- Explicación expandible
- Animaciones suaves

---

### 4. **InteractionTracker** - Tracker Automático

Componente invisible que rastrea automáticamente las interacciones del usuario.

**Uso:**
```jsx
import InteractionTracker from '@/Components/ML/InteractionTracker';

// En el layout o página principal
<InteractionTracker post={post} enabled={true} />
```

**Métricas rastreadas:**
- ✅ Vistas de posts
- ✅ Tiempo de lectura (con heartbeat cada 30s)
- ✅ Profundidad de scroll (scroll depth)
- ✅ Engagement score calculado
- ✅ Patrones de lectura (velocidad, consistencia)
- ✅ Clicks en enlaces
- ✅ Cambios de visibilidad de página

**Características:**
- Throttling de eventos de scroll (150ms)
- Registro automático al cambiar de pestaña
- Heartbeat cada 30 segundos
- Cálculo de engagement score en tiempo real
- Sin impacto en rendimiento

---

### 5. **MLDashboard** - Panel de Administración

Panel completo de administración del sistema ML (solo para admins).

**Uso:**
```jsx
import MLDashboard from '@/Components/ML/Admin/MLDashboard';

// En ruta protegida de admin
<MLDashboard />
```

**Funcionalidades:**
- 📊 Métricas del sistema (interacciones, confianza, CTR)
- 🔄 Entrenamiento de modelos con opciones avanzadas
- 📈 Análisis de clustering (Silhouette, Davies-Bouldin, Inertia)
- 🏥 Health check del sistema
- ⚙️ Configuración de entrenamiento (modo, batch size, async)

---

## 🎣 Hooks

### **useMLRecommendations**

Hook principal para interactuar con el sistema ML.

**Uso:**
```jsx
import { useMLRecommendations } from '@/Hooks/useMLRecommendations';

const {
    // Estado
    mlRecommendations,
    insights,
    loading,
    error,
    
    // Funciones principales
    getMLRecommendations,
    getMLInsights,
    
    // Tracking
    trackPostView,
    trackRecommendationClick,
    trackReadingTime,
    trackSocialInteraction,
    logMLInteraction,
    
    // Utilidades
    getRecommendationExplanation,
    filterRecommendationsBySource,
    getMLStats,
    sessionId
} = useMLRecommendations();
```

**Funciones principales:**

```jsx
// Obtener recomendaciones
const recs = await getMLRecommendations(postId, {
    limit: 10,
    algorithm: 'hybrid',
    diversityBoost: 0.3,
    includeExplanation: true,
    excludePosts: [1, 2, 3]
});

// Obtener insights del usuario
const insights = await getMLInsights();

// Registrar vista de post
await trackPostView(postId, postData);

// Registrar click en recomendación
await trackRecommendationClick(postId, {
    source: 'hybrid',
    score: 0.95,
    position: 1,
    confidence: 0.87,
    reason: 'Similar content'
});

// Registrar tiempo de lectura
await trackReadingTime(postId, 120, true, 85);

// Registrar interacción social
await trackSocialInteraction(postId, 'like', { source: 'post_page' });
```

---

### **usePostTracking**

Hook para tracking avanzado de posts con localStorage.

**Uso:**
```jsx
import { usePostTracking } from '@/Hooks/usePostTracking';

const {
    visitedPosts,
    startTracking,
    endTracking,
    getRecommendations,
    getUserStats,
    scrollDepth,
    maxScrollDepth,
    getEngagementMetrics
} = usePostTracking();
```

---

## 🔧 Servicio MLService

Servicio centralizado para todas las operaciones ML.

**Uso:**
```jsx
import MLService from '@/Services/MLService';

// Obtener recomendaciones
const result = await MLService.getRecommendations({
    currentPostId: 123,
    limit: 10,
    algorithm: 'hybrid'
});

// Registrar interacción
await MLService.logInteraction({
    post_id: 123,
    interaction_type: 'view',
    time_spent_seconds: 60
});

// Obtener insights
const insights = await MLService.getUserInsights();

// ADMIN: Entrenar modelos
await MLService.trainModels({
    mode: 'full',
    batchSize: 100,
    async: true
});

// ADMIN: Obtener métricas
const metrics = await MLService.getSystemMetrics('7d');
```

---

## 🚀 Integración Completa

### Ejemplo: Página de Blog con ML

```jsx
import React from 'react';
import InteractionTracker from '@/Components/ML/InteractionTracker';
import RecommendationsWidget from '@/Components/ML/RecommendationsWidget';
import MLInsights from '@/Components/ML/MLInsights';

const BlogPost = ({ post }) => {
    return (
        <>
            {/* Tracker automático (invisible) */}
            <InteractionTracker post={post} enabled={true} />
            
            {/* Contenido del post */}
            <article>
                <h1>{post.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
            
            {/* Insights del usuario */}
            <MLInsights variant="full" />
            
            {/* Recomendaciones personalizadas */}
            <RecommendationsWidget
                currentPostId={post.id}
                limit={6}
                showAlgorithmSelector={true}
                showExplanations={true}
            />
        </>
    );
};
```

---

## 📊 Métricas y Analytics

### Engagement Score

El engagement score se calcula con la siguiente fórmula:

```
Engagement = (Time * 0.35) + (Scroll * 0.40) + (Velocity * 0.25)
```

Donde:
- **Time**: Tiempo normalizado (max 3 minutos = 100%)
- **Scroll**: Profundidad de scroll (0-100%)
- **Velocity**: Velocidad de lectura normalizada

### Patrones de Lectura

Se analizan automáticamente:
- Velocidad de lectura (scrolls por segundo)
- Consistencia de scroll (lectura lineal vs jumping)
- Tipo de sesión (deep_reading, moderate_reading, scanning)
- Hora de lectura preferida

---

## 🎨 Personalización

### Colores de Algoritmos

```jsx
const algorithmColors = {
    'content_based': '#2196F3',    // Azul
    'collaborative': '#4CAF50',     // Verde
    'personalized': '#FF9800',      // Naranja
    'trending': '#E91E63',          // Rosa
    'hybrid': '#9C27B0'             // Púrpura
};
```

### Animaciones

Todos los componentes usan `framer-motion` para animaciones suaves:
- Fade in al cargar
- Hover effects
- Transiciones entre estados
- Stagger animations en listas

---

## 🔒 Seguridad

- ✅ Session ID único por usuario
- ✅ Throttling de eventos
- ✅ Validación de datos en backend
- ✅ Sanitización de metadata
- ✅ Rate limiting en API
- ✅ CSRF protection

---

## 📈 Performance

- ✅ Caché de recomendaciones (5 minutos)
- ✅ Debouncing de scroll events (150ms)
- ✅ Lazy loading de componentes
- ✅ Compresión de datos en localStorage
- ✅ Batch processing de interacciones
- ✅ Passive event listeners

---

## 🐛 Debugging

```jsx
// Habilitar logs detallados
localStorage.setItem('ml_debug', 'true');

// Ver session ID actual
console.log(MLService.sessionId);

// Ver caché de recomendaciones
const { mlRecommendations } = useMLRecommendations();
console.log(mlRecommendations);

// Ver métricas de engagement
const { getEngagementMetrics } = usePostTracking();
console.log(getEngagementMetrics());
```

---

## 📝 Notas Importantes

1. **InteractionTracker** debe incluirse en TODAS las páginas de posts
2. **Session ID** se genera automáticamente y persiste en localStorage
3. Las interacciones se envían en **background** sin bloquear UI
4. El sistema funciona tanto para **usuarios autenticados** como **invitados**
5. Los datos se comprimen automáticamente en localStorage
6. El caché se invalida automáticamente en interacciones importantes

---

## 🔄 Actualizaciones Futuras

- [ ] Soporte para PWA offline
- [ ] Sincronización con backend cuando vuelve online
- [ ] Predicción de siguiente post
- [ ] Notificaciones push de recomendaciones
- [ ] Modo dark/light theme
- [ ] Exportar datos de usuario
- [ ] Gamificación (badges, achievements)

