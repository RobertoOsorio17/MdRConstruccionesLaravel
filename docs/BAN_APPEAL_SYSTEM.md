# Sistema de Apelación de Baneos - Documentación Completa

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Características](#características)
3. [Arquitectura](#arquitectura)
4. [Instalación](#instalación)
5. [Configuración](#configuración)
6. [Uso](#uso)
7. [API](#api)
8. [Seguridad](#seguridad)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 📖 Descripción General

El **Sistema de Apelación de Baneos** permite a los usuarios baneados solicitar la revisión de su baneo mediante un proceso estructurado y seguro. Los administradores pueden revisar, aprobar, rechazar o solicitar más información sobre las apelaciones.

### Flujo del Sistema

```
Usuario Baneado → Envía Apelación → Revisión Admin → Decisión → Notificación
```

---

## ✨ Características

### Para Usuarios
- ✅ **Una apelación por baneo** - Previene spam de apelaciones
- ✅ **Subida de evidencia** - Permite adjuntar imágenes como prueba
- ✅ **Tokens de seguridad** - URLs firmadas para prevenir acceso no autorizado
- ✅ **Notificaciones por email** - Alertas automáticas sobre el estado de la apelación
- ✅ **Seguimiento de estado** - Visualización del progreso de la apelación

### Para Administradores
- ✅ **Panel de gestión completo** - Interfaz intuitiva para revisar apelaciones
- ✅ **Estadísticas en tiempo real** - Métricas de apelaciones pendientes, aprobadas, rechazadas
- ✅ **Filtros avanzados** - Búsqueda por estado, usuario, fecha
- ✅ **Acciones múltiples** - Aprobar, rechazar, solicitar más información
- ✅ **Auditoría completa** - Registro de todas las acciones

### Seguridad
- ✅ **Validación MIME real** - No solo extensión de archivo
- ✅ **Validación de integridad de imagen** - Previene archivos corruptos
- ✅ **Detección de spam** - Patrones de texto sospechoso
- ✅ **Rate limiting** - Límites por usuario e IP
- ✅ **Validación de User Agent** - Detecta bots y crawlers
- ✅ **Sanitización de entrada** - Previene XSS y SQL injection
- ✅ **Logging completo** - Auditoría de todas las acciones

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── BanAppealController.php          # Controlador para usuarios
│   │   └── Admin/
│   │       └── BanAppealManagementController.php  # Controlador para admins
│   ├── Middleware/
│   │   ├── ValidateBanAppealAccess.php      # Middleware de seguridad
│   │   └── EnsureUserNotBanned.php          # Middleware actualizado con info de apelación
│   └── Requests/
│       ├── SubmitBanAppealRequest.php       # Validación de envío
│       └── Admin/
│           └── ReviewBanAppealRequest.php   # Validación de revisión
├── Models/
│   ├── BanAppeal.php                        # Modelo principal
│   ├── UserBan.php                          # Modelo actualizado con relación
│   └── User.php                             # Modelo actualizado con relaciones
├── Services/
│   └── BanAppealService.php                 # Lógica de negocio
├── Notifications/
│   ├── BanAppealSubmitted.php               # Notificación de envío
│   └── BanAppealReviewed.php                # Notificación de revisión
└── Providers/
    └── RateLimitServiceProvider.php         # Rate limiters

database/
└── migrations/
    └── 2025_10_30_050215_create_ban_appeals_table.php

resources/
└── js/
    └── Pages/
        ├── BanAppeal/
        │   ├── Create.jsx                   # Formulario de apelación
        │   └── Status.jsx                   # Estado de apelación
        └── Admin/
            └── BanAppeals/
                ├── Index.jsx                # Lista de apelaciones
                └── Show.jsx                 # Detalle de apelación

routes/
├── web.php                                  # Rutas de usuario
└── admin.php                                # Rutas de admin

config/
└── ban_appeals.php                          # Configuración del sistema
```

### Base de Datos

**Tabla: `ban_appeals`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | ID único |
| user_id | bigint | Usuario que apela |
| user_ban_id | bigint | Baneo asociado |
| reason | text | Razón de la apelación |
| evidence_path | string | Ruta de evidencia |
| status | enum | Estado (pending, approved, rejected, more_info_requested) |
| admin_response | text | Respuesta del admin |
| reviewed_by | bigint | Admin que revisó |
| reviewed_at | timestamp | Fecha de revisión |
| appeal_token | string | Token único de seguridad |
| ip_address | string | IP del usuario |
| user_agent | string | User agent |

**Índices:**
- `user_id` - Búsqueda por usuario
- `user_ban_id` - Búsqueda por baneo
- `status` - Filtrado por estado
- `appeal_token` - Acceso por token
- Constraint único: `(user_ban_id)` - Una apelación por baneo

---

## 🚀 Instalación

### 1. Ejecutar Migración

```bash
php artisan migrate
```

### 2. Crear Enlace de Storage

```bash
php artisan storage:link
```

### 3. Configurar Colas (Opcional pero Recomendado)

```bash
# Crear tabla de trabajos
php artisan queue:table
php artisan migrate

# Iniciar worker
php artisan queue:work
```

### 4. Configurar Permisos

Asegúrate de que el directorio `storage/app/public/ban-appeals` tenga permisos de escritura:

```bash
chmod -R 775 storage/app/public/ban-appeals
```

---

## ⚙️ Configuración

Edita `config/ban_appeals.php` para personalizar el sistema:

```php
return [
    'limits' => [
        'max_appeals_per_ban' => 1,
        'duplicate_prevention_window' => 5,
        'max_appeals_per_hour' => 3,
    ],
    
    'reason' => [
        'min_length' => 50,
        'max_length' => 2000,
        'spam_detection_enabled' => true,
    ],
    
    'evidence' => [
        'max_file_size' => 5 * 1024 * 1024, // 5MB
        'allowed_mime_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ],
    
    // ... más opciones
];
```

### Variables de Entorno

Añade a tu `.env`:

```env
# Notificaciones
MAIL_FROM_ADDRESS=noreply@tudominio.com
MAIL_FROM_NAME="${APP_NAME}"

# Colas (opcional)
QUEUE_CONNECTION=database
```

---

## 📘 Uso

### Para Usuarios

#### 1. Verificar Elegibilidad

Los usuarios baneados verán automáticamente un enlace para apelar si son elegibles.

#### 2. Enviar Apelación

```
URL: /ban-appeal/create
Método: GET (mostrar formulario)
Método: POST (enviar apelación)
```

**Campos requeridos:**
- `reason` (string, 50-2000 caracteres)
- `terms_accepted` (boolean)

**Campos opcionales:**
- `evidence` (file, imagen, máx 5MB)

#### 3. Ver Estado

```
URL: /ban-appeal/status/{token}
Método: GET
```

### Para Administradores

#### 1. Ver Lista de Apelaciones

```
URL: /admin/ban-appeals
Método: GET
Parámetros: ?status=pending&per_page=15
```

#### 2. Ver Detalle

```
URL: /admin/ban-appeals/{id}
Método: GET
```

#### 3. Aprobar Apelación

```
URL: /admin/ban-appeals/{id}/approve
Método: POST
Body: { "response": "Mensaje opcional" }
```

#### 4. Rechazar Apelación

```
URL: /admin/ban-appeals/{id}/reject
Método: POST
Body: { "response": "Razón del rechazo (requerido, mín 20 chars)" }
```

#### 5. Solicitar Más Información

```
URL: /admin/ban-appeals/{id}/request-info
Método: POST
Body: { "response": "Información requerida (requerido, mín 20 chars)" }
```

---

## 🔒 Seguridad

### Validaciones Implementadas

#### 1. Validación de Archivos

```php
// Validación MIME real (no solo extensión)
$mimeType = $file->getMimeType();
if (!in_array($mimeType, $allowedMimes)) {
    throw new Exception('Tipo de archivo no permitido');
}

// Validación de integridad de imagen
$imageInfo = @getimagesize($file->getRealPath());
if ($imageInfo === false) {
    throw new Exception('Archivo corrupto');
}

// Validación de dimensiones
[$width, $height] = $imageInfo;
if ($width < 50 || $height < 50 || $width > 8000 || $height > 8000) {
    throw new Exception('Dimensiones inválidas');
}
```

#### 2. Detección de Spam

```php
// Repetición excesiva de caracteres
if (preg_match('/(.)\1{20,}/', $text)) {
    return true; // Spam detectado
}

// URLs excesivas
$urlCount = preg_match_all('/https?:\/\//', $text);
if ($urlCount > 3) {
    return true; // Spam detectado
}

// Keywords de spam
$spamKeywords = ['viagra', 'casino', 'lottery', ...];
foreach ($spamKeywords as $keyword) {
    if (stripos($text, $keyword) !== false) {
        return true; // Spam detectado
    }
}
```

#### 3. Rate Limiting

```php
// Por usuario (3 apelaciones por hora)
RateLimiter::for('ban-appeals', function (Request $request) {
    return Limit::perHour(3)->by($request->user()->id);
});

// Por IP (5 solicitudes por 5 minutos)
$ipKey = 'ban_appeal_ip:' . $ip;
if (RateLimiter::tooManyAttempts($ipKey, 5)) {
    return response()->json(['error' => 'RATE_LIMIT_EXCEEDED'], 429);
}
RateLimiter::hit($ipKey, 300); // 5 minutos
```

#### 4. Validación de User Agent

```php
// Detectar bots y crawlers
$botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'];
foreach ($botPatterns as $pattern) {
    if (stripos($userAgent, $pattern) !== false) {
        return true; // Sospechoso
    }
}

// User agents muy cortos (probablemente falsos)
if (strlen($userAgent) < 20) {
    return true; // Sospechoso
}
```

---

## 🧪 Testing

### Tests Recomendados

```bash
# Crear tests
php artisan make:test BanAppealServiceTest --unit
php artisan make:test BanAppealSubmissionTest
php artisan make:test BanAppealReviewTest

# Ejecutar tests
php artisan test --filter=BanAppeal
```

### Casos de Prueba Sugeridos

1. **Envío de Apelación**
   - ✅ Usuario baneado puede enviar apelación
   - ✅ Usuario no baneado no puede enviar apelación
   - ✅ Solo una apelación por baneo
   - ✅ Validación de longitud de razón
   - ✅ Validación de archivo de evidencia
   - ✅ Detección de spam

2. **Revisión de Apelación**
   - ✅ Admin puede aprobar apelación
   - ✅ Admin puede rechazar apelación
   - ✅ Admin puede solicitar más información
   - ✅ Apelación aprobada desbanea al usuario
   - ✅ Notificaciones se envían correctamente

3. **Seguridad**
   - ✅ Rate limiting funciona
   - ✅ Tokens de seguridad son únicos
   - ✅ Validación de MIME type
   - ✅ Detección de user agents sospechosos

---

## 🐛 Troubleshooting

### Problema: "No se puede subir evidencia"

**Solución:**
```bash
# Verificar permisos
chmod -R 775 storage/app/public/ban-appeals

# Recrear enlace simbólico
php artisan storage:link
```

### Problema: "Notificaciones no se envían"

**Solución:**
```bash
# Verificar configuración de email en .env
# Iniciar queue worker
php artisan queue:work

# Ver trabajos fallidos
php artisan queue:failed
```

### Problema: "Error de rate limiting"

**Solución:**
```bash
# Limpiar cache de rate limiter
php artisan cache:clear

# Ajustar límites en config/ban_appeals.php
```

---

## 📊 Métricas y Monitoreo

### Logs

Todos los eventos se registran en `storage/logs/laravel.log`:

```
[2025-10-30 12:00:00] local.INFO: Ban appeal submitted successfully {"appeal_id":1,"user_id":5}
[2025-10-30 12:05:00] local.INFO: Ban appeal approved {"appeal_id":1,"admin_id":1}
```

### Estadísticas

Accede a las estadísticas en el panel de admin:
- Total de apelaciones pendientes
- Total de apelaciones aprobadas
- Total de apelaciones rechazadas
- Tasa de aprobación

---

## 🔄 Mantenimiento

### Limpieza de Archivos Antiguos

```bash
# Eliminar evidencia de apelaciones antiguas (>90 días)
find storage/app/public/ban-appeals -type f -mtime +90 -delete
```

### Optimización de Base de Datos

```bash
# Optimizar tabla de apelaciones
php artisan db:table ban_appeals --optimize
```

---

## 📞 Soporte

Para problemas o preguntas:
- Revisa los logs en `storage/logs/laravel.log`
- Verifica la configuración en `config/ban_appeals.php`
- Consulta esta documentación

---

**Última actualización:** 30 de Octubre, 2025
**Versión del Sistema:** 1.0.0

