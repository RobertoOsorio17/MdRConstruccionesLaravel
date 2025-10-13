# 🤖 Sistema de Recomendaciones ML - MDR Construcciones

## 📋 Descripción General

Sistema de recomendaciones basado en Machine Learning que utiliza múltiples algoritmos para personalizar la experiencia del usuario en el blog de MDR Construcciones.

### **Versión Actual: 2.0**

---

## 🏗️ Arquitectura del Sistema

### **Componentes Principales**

1. **Content Analysis Service V2** (`ContentAnalysisServiceV2.php`)
   - Análisis de contenido con TF-IDF optimizado
   - Vectorización de posts (contenido, categorías, tags)
   - Cálculo de métricas de legibilidad y engagement
   - Sistema de caché para vocabulario e IDF

2. **ML Recommendation Service** (`MLRecommendationService.php`)
   - Motor híbrido de recomendaciones
   - Combina 4 estrategias: Content-Based, Collaborative, Personalized, Trending
   - Sistema de scoring y ranking
   - Diversificación de resultados

3. **ML User Profile Service** (`MLUserProfileService.php`)
   - Actualización automática de perfiles de usuario
   - Clustering de usuarios (5 clusters)
   - Análisis de patrones de lectura
   - Cálculo de preferencias de categorías y tags

4. **ML Metrics Service** (`MLMetricsService.php`)
   - Evaluación de calidad del sistema
   - Métricas: Precision@K, Recall@K, F1, NDCG, CTR
   - A/B Testing
   - Análisis de diversidad y cobertura

---

## 📊 Modelos de Base de Datos

### **ml_post_vectors**
Almacena representaciones vectoriales de posts:
- `content_vector`: Vector TF-IDF del contenido
- `category_vector`: Vector one-hot de categorías
- `tag_vector`: Vector one-hot de tags
- `readability_score`: Puntuación de legibilidad (0-1)
- `engagement_score`: Puntuación de engagement (0-1)

### **ml_user_profiles**
Perfiles de usuario para personalización:
- `category_preferences`: Preferencias de categorías (JSON)
- `tag_interests`: Intereses en tags (JSON)
- `reading_patterns`: Patrones de lectura (JSON)
- `user_cluster`: Cluster asignado (1-5)
- `engagement_rate`: Tasa de engagement (0-1)

### **ml_interaction_logs**
Registro de interacciones para feedback loop:
- `interaction_type`: view, like, bookmark, share, comment, recommendation_click
- `time_spent_seconds`: Tiempo en el post
- `scroll_percentage`: Porcentaje de scroll (0-100)
- `completed_reading`: Si completó la lectura
- `implicit_rating`: Rating implícito (0-5)
- `engagement_score`: Score de engagement (0-1)

---

## 🎯 Algoritmos de Recomendación

### **1. Content-Based Filtering**
Recomienda posts similares al actual basándose en:
- Similitud de contenido (TF-IDF cosine similarity)
- Similitud de categorías (Jaccard similarity)
- Similitud de tags (Jaccard similarity)

**Peso:** 50% contenido, 30% categorías, 20% tags

### **2. Collaborative Filtering**
Recomienda posts que gustaron a usuarios similares:
- Encuentra usuarios con preferencias similares
- Agrega posts populares entre usuarios similares
- Filtra por engagement score > 3.0

### **3. Personalized Recommendations**
Recomendaciones basadas en el perfil del usuario:
- Preferencias de categorías (peso 35%)
- Patrones de lectura (peso 30%)
- Preferencias de longitud de contenido (peso 10%)
- Cluster de usuario (peso 25%)

### **4. Trending Recommendations**
Posts populares con boost temporal:
- Engagement reciente (últimos 7 días)
- Decay temporal exponencial
- Boost por viralidad

---

## 🚀 API Endpoints

### **Públicos**

#### `GET /api/ml/recommendations`
Obtener recomendaciones personalizadas.

**Parámetros:**
```json
{
  "session_id": "string (opcional)",
  "current_post_id": "integer (opcional)",
  "limit": "integer (1-20, default: 10)"
}
```

**Respuesta:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 1,
      "title": "Post Title",
      "slug": "post-slug",
      "ml_data": {
        "score": 0.85,
        "source": "personalized",
        "reason": "Based on your reading preferences",
        "confidence": 85
      }
    }
  ],
  "metadata": {
    "algorithm_version": "2.0",
    "user_type": "authenticated",
    "total_count": 10
  }
}
```

### **Autenticados**

#### `POST /api/ml/interaction`
Registrar interacción del usuario.

**Body:**
```json
{
  "post_id": 1,
  "interaction_type": "view|like|bookmark|share|comment|recommendation_click",
  "time_spent_seconds": 120,
  "scroll_percentage": 85.5,
  "completed_reading": true,
  "recommendation_source": "personalized",
  "recommendation_position": 1
}
```

#### `GET /api/ml/insights`
Obtener insights del perfil del usuario.

#### `POST /api/ml/profile/update`
Actualizar perfil de usuario manualmente.

### **Admin**

#### `POST /api/ml/train`
Entrenar modelos ML (analizar posts y actualizar perfiles).

#### `GET /api/ml/metrics/report`
Obtener reporte completo de métricas.

**Parámetros:**
```json
{
  "k": 10,
  "days": 7
}
```

#### `POST /api/ml/ab-test`
Ejecutar prueba A/B entre variantes.

**Body:**
```json
{
  "variant_a": "content_based",
  "variant_b": "personalized",
  "days": 7
}
```

#### `POST /api/ml/cache/clear`
Limpiar cachés del sistema ML.

---

## 🛠️ Comandos Artisan

### **Entrenar Modelos**
```bash
# Entrenar todo (posts + perfiles)
php artisan ml:train

# Solo analizar posts
php artisan ml:train --posts

# Solo actualizar perfiles
php artisan ml:train --profiles

# Limpiar caché después de entrenar
php artisan ml:train --clear-cache
```

### **Generar Reporte de Métricas**
```bash
# Reporte básico (K=10, 7 días)
php artisan ml:metrics

# Reporte personalizado
php artisan ml:metrics --k=20 --days=30

# Exportar a archivo JSON
php artisan ml:metrics --export
```

---

## 📈 Métricas de Evaluación

### **Precision@K**
Proporción de recomendaciones relevantes entre las K primeras.
- **Excelente:** ≥ 70%
- **Bueno:** 50-70%
- **Regular:** 30-50%
- **Necesita mejora:** < 30%

### **Recall@K**
Proporción de items relevantes que fueron recomendados.
- **Excelente:** ≥ 60%
- **Bueno:** 40-60%
- **Regular:** 20-40%
- **Necesita mejora:** < 20%

### **NDCG@K (Normalized Discounted Cumulative Gain)**
Calidad del ranking de recomendaciones.
- **Excelente:** ≥ 0.8
- **Bueno:** 0.6-0.8
- **Regular:** 0.4-0.6
- **Necesita mejora:** < 0.4

### **CTR (Click-Through Rate)**
Tasa de clics en recomendaciones.
- **Excelente:** ≥ 10%
- **Bueno:** 5-10%
- **Regular:** 2-5%
- **Necesita mejora:** < 2%

### **Diversity**
Variedad de posts recomendados.
- **Alta:** ≥ 70%
- **Buena:** 50-70%
- **Baja:** 30-50%
- **Muy baja:** < 30%

### **Coverage**
Porcentaje del catálogo que se recomienda.
- **Excelente:** ≥ 50%
- **Bueno:** 30-50%
- **Regular:** 10-30%
- **Pobre:** < 10%

---

## 🔧 Configuración y Optimización

### **Caché**
El sistema utiliza caché de Laravel para:
- Vocabulario global (1 hora)
- Valores IDF (1 hora)
- IDs de categorías/tags (1 hora)
- Recomendaciones (5 minutos)
- Reportes de métricas (5 minutos)

### **Programación Automática**
Agregar a `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Entrenar modelos diariamente a las 2 AM
    $schedule->command('ml:train --clear-cache')
             ->dailyAt('02:00')
             ->withoutOverlapping();
    
    // Generar reporte semanal
    $schedule->command('ml:metrics --export')
             ->weekly()
             ->mondays()
             ->at('09:00');
}
```

---

## 🎓 Clusters de Usuarios

1. **Power Users** (Cluster 1)
   - Engagement rate > 70%
   - Return rate > 50%
   - Usuarios muy activos y comprometidos

2. **Regular Engaged Users** (Cluster 2)
   - Engagement rate > 40%
   - Total posts > 10
   - Usuarios regulares con buen engagement

3. **Casual Returners** (Cluster 3)
   - Return rate > 30%
   - Usuarios que vuelven ocasionalmente

4. **Explorers** (Cluster 4)
   - Total posts > 5
   - Usuarios que exploran contenido variado

5. **New/Inactive Users** (Cluster 5)
   - Usuarios nuevos o inactivos
   - Requieren estrategia de cold start

---

## 🐛 Troubleshooting

### **Problema: Recomendaciones vacías**
- Verificar que existan posts publicados
- Ejecutar `php artisan ml:train`
- Verificar logs en `storage/logs/laravel.log`

### **Problema: Métricas en 0**
- Verificar que existan interacciones registradas
- Aumentar el período de análisis (--days)
- Verificar que los logs de interacción se estén guardando

### **Problema: Performance lento**
- Ejecutar `php artisan ml:train --clear-cache`
- Verificar índices de base de datos
- Considerar aumentar tiempo de caché

---

## 📝 Próximas Mejoras

- [ ] Integración con TensorFlow/PyTorch para deep learning
- [ ] Recomendaciones en tiempo real con Redis
- [ ] Análisis de sentimiento en comentarios
- [ ] Recomendaciones multi-objetivo (engagement + diversidad)
- [ ] Sistema de bandits para exploración/explotación
- [ ] Embeddings de posts con BERT/transformers
- [ ] Recomendaciones contextuales (hora, dispositivo, ubicación)

---

## 📚 Referencias

- [Recommender Systems Handbook](https://www.springer.com/gp/book/9780387858203)
- [TF-IDF Wikipedia](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- [NDCG Metric](https://en.wikipedia.org/wiki/Discounted_cumulative_gain)
- [Collaborative Filtering](https://en.wikipedia.org/wiki/Collaborative_filtering)

