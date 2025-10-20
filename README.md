# 🏗️ MDR Construcciones - Plataforma Web Integral

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-7.x-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Plataforma web moderna y completa para empresa de construcción con gestión de proyectos, blog, servicios, panel administrativo, sistema ML de recomendaciones y PWA**

[Características](#-características-principales) •
[Instalación](#-instalación) •
[Docker](#-instalación-con-docker) •
[Documentación](#-estructura-del-proyecto) •
[Contribuir](#-contribución)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Comandos Útiles](#-comandos-útiles)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Créditos](#-créditos)

---

## 📖 Descripción

**MDR Construcciones** es una plataforma web integral desarrollada con las últimas tecnologías para empresas del sector de la construcción. Combina un sitio web corporativo moderno con un potente sistema de gestión interna que incluye:

- 🏠 **Sitio Web Público**: Presentación de servicios, proyectos realizados, blog de noticias y formularios de contacto
- 📝 **Sistema de Blog**: Publicación de artículos con editor WYSIWYG, categorías, etiquetas, comentarios y sistema de likes
- 👥 **Gestión de Usuarios**: Perfiles personalizables, autenticación segura con 2FA, OAuth social login
- 🔐 **Panel de Administración**: Dashboard completo para gestión de contenido, usuarios, proyectos y servicios
- 📊 **Analytics**: Estadísticas detalladas de visitas, interacciones y rendimiento
- 🔔 **Sistema de Notificaciones**: Notificaciones en tiempo real y por email
- 🤖 **Sistema ML**: Recomendaciones personalizadas basadas en Machine Learning
- 💾 **Sistema de Caché**: Caché inteligente con Redis/File para optimización de rendimiento
- 📱 **PWA**: Progressive Web App con soporte offline y instalación en dispositivos
- 🐳 **Docker**: Entorno de desarrollo completamente dockerizado
- 📦 **Backups Automáticos**: Sistema de respaldo automático con Spatie Laravel Backup
- 📱 **Responsive Design**: Optimizado para dispositivos móviles, tablets y desktop

La plataforma está construida con **Laravel 12** en el backend y **React 18** con **Inertia.js** en el frontend, proporcionando una experiencia de usuario fluida tipo SPA (Single Page Application) con las ventajas del renderizado del lado del servidor.

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación y Seguridad

- ✅ **Registro y Login** con validación completa
- ✅ **Autenticación de Dos Factores (2FA)** con Google Authenticator
  - Modal interactivo con stepper de 3 pasos
  - Códigos QR y códigos de recuperación
  - Verificación en tiempo real
- ✅ **OAuth Social Login** (Google, Facebook, GitHub)
  - Integración completa con Laravel Socialite
  - Vinculación de cuentas existentes
  - Gestión de cuentas conectadas
- ✅ **Recuperación de Contraseña** por email
- ✅ **Verificación de Email** obligatoria
- ✅ **Tracking de Dispositivos/Sesiones**
  - Registro automático de todos los dispositivos
  - Información detallada (browser, OS, ubicación, IP)
  - Gestión de dispositivos confiables
  - Revocación de sesiones remotas
- ✅ **Sistema de Roles y Permisos** (Admin, Editor, User)

### 📝 Sistema de Blog Completo

- ✅ **Editor WYSIWYG** con TinyMCE
  - Inserción de imágenes y multimedia
  - Formateo avanzado de texto
  - Vista previa en tiempo real
- ✅ **Gestión de Posts**
  - Borradores, publicados, programados
  - Categorías y etiquetas
  - Imágenes destacadas
  - SEO optimizado (meta tags, slugs)
- ✅ **Sistema de Comentarios**
  - Comentarios anidados (respuestas)
  - Moderación (aprobar, rechazar, spam)
  - Identificación de usuarios registrados vs invitados
  - Sistema de likes/dislikes en comentarios
- ✅ **Interacciones Sociales**
  - Me gusta en posts
  - Guardar posts favoritos
  - Compartir en redes sociales
  - Seguir a otros usuarios
- ✅ **Búsqueda Avanzada**
  - Búsqueda por título, contenido, autor
  - Filtros por categoría, etiqueta, fecha
  - Resultados paginados

### 👤 Perfiles de Usuario

- ✅ **Configuración de Perfil con Pestañas**
  - **Información Personal**: Avatar, nombre, email, profesión, biografía
  - **Seguridad**: Cambio de contraseña, 2FA
  - **Dispositivos**: Gestión de sesiones activas
  - **Cuentas Conectadas**: OAuth accounts
  - **Notificaciones**: Preferencias de email y push
  - **Privacidad**: Visibilidad del perfil, información pública
- ✅ **Página de Perfil Público**
  - Posts publicados
  - Posts guardados
  - Posts con "me gusta"
  - Comentarios realizados
  - Servicios ofrecidos (para profesionales)
- ✅ **Sistema de Seguimiento**
  - Seguir/dejar de seguir usuarios
  - Lista de seguidores y seguidos
  - Feed personalizado

### 🏗️ Gestión de Proyectos y Servicios

- ✅ **Catálogo de Proyectos**
  - Galería de imágenes
  - Descripción detallada
  - Categorización por tipo de obra
  - Estado (en progreso, completado)
- ✅ **Servicios Ofrecidos**
  - Reformas integrales, cocinas y baños, pintura y decoración
  - Instalaciones, mantenimiento, consultoría
- ✅ **Solicitud de Presupuestos**
  - Formulario detallado con adjuntos
  - Seguimiento de solicitudes

### 🎛️ Panel de Administración

- ✅ **Dashboard Completo**
  - Estadísticas en tiempo real
  - Gráficos interactivos (Recharts)
  - Métricas de rendimiento
  - Actividad reciente
- ✅ **Gestión de Contenido**
  - CRUD completo de posts, proyectos, servicios
  - Editor visual integrado
  - Gestión de medios
  - Moderación de comentarios
- ✅ **Gestión de Usuarios**
  - Crear, editar, eliminar usuarios
  - Asignar roles y permisos
  - Banear/desbanear usuarios
  - Ver actividad de usuarios
- ✅ **Reportes y Analytics**
  - Visitas por página
  - Posts más populares
  - Usuarios más activos
  - Conversiones de formularios

### 🔔 Sistema de Notificaciones

- ✅ **Notificaciones en Tiempo Real**
  - Nuevos comentarios en tus posts
  - Respuestas a tus comentarios
  - Nuevos seguidores
  - Menciones
- ✅ **Notificaciones por Email**
  - Configurables por tipo
  - Templates personalizados
  - Queue system para envío masivo
- ✅ **Centro de Notificaciones**
  - Marcar como leído/no leído
  - Eliminar notificaciones
  - Filtros por tipo

### 🎨 Diseño y UX

- ✅ **Material-UI v7** para componentes
- ✅ **Diseño Responsive** (mobile-first)
- ✅ **Tema Personalizable** (light/dark mode)
- ✅ **Animaciones Suaves** con Framer Motion
- ✅ **Loading States** y Skeleton Screens
- ✅ **Error Boundaries** para manejo de errores
- ✅ **Optimización de Rendimiento**
  - Lazy loading de componentes
  - Code splitting
  - Optimización de imágenes
  - Caché de assets

### 🤖 Sistema de Machine Learning

- ✅ **Recomendaciones Personalizadas**
  - Content-based filtering (TF-IDF)
  - Collaborative filtering
  - Hybrid recommendations
  - Matrix factorization
- ✅ **Análisis de Contenido**
  - Vectorización de posts
  - Análisis de similitud
  - Clustering de usuarios
  - Detección de anomalías
- ✅ **Métricas de Evaluación**
  - Precision, Recall, F1-Score
  - Diversity y Coverage
  - Reportes automáticos
- ✅ **Comandos Artisan**
  - `php artisan ml:train` - Entrenar modelos
  - `php artisan ml:metrics` - Generar reportes

### 💾 Sistema de Caché Inteligente

- ✅ **Múltiples Drivers**
  - Redis (producción - recomendado)
  - File (desarrollo)
  - Database (fallback)
- ✅ **Caché de Búsquedas**
  - TTL: 5 minutos para resultados
  - TTL: 20 minutos para búsquedas populares
  - Reducción del 80% en tiempo de respuesta
- ✅ **Caché de Contenido**
  - Posts, usuarios, analytics
  - Invalidación automática
  - Cache tags (Redis)
- ✅ **Analytics de Caché**
  - Hit rate monitoring
  - Performance tracking

### 📱 Progressive Web App (PWA)

- ✅ **Instalación en Dispositivos**
  - Prompt de instalación personalizado
  - Soporte para iOS, Android, Desktop
- ✅ **Funcionamiento Offline**
  - Service Worker con estrategias de caché
  - Network First para HTML/API
  - Cache First para assets estáticos
- ✅ **Manifest Completo**
  - Iconos adaptables
  - Splash screens
  - Shortcuts

### 📦 Sistema de Backups

- ✅ **Backups Automáticos** con Spatie Laravel Backup
  - Backup completo (archivos + base de datos)
  - Backup solo base de datos
  - Backup solo archivos
- ✅ **Programación Automática**
  - Backups diarios configurables
  - Retención de 30 días
  - Limpieza automática de backups antiguos
- ✅ **Monitoreo de Salud**
  - Verificación de integridad
  - Alertas por email
  - Panel de administración

---

## 🛠️ Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Laravel** | ^12.0 | Framework PHP principal |
| **PHP** | ^8.2 | Lenguaje de programación |
| **MySQL** | 8.0+ | Base de datos relacional |
| **Laravel Fortify** | ^1.31 | Autenticación (login, 2FA, password reset) |
| **Laravel Sanctum** | ^4.0 | API token authentication |
| **Laravel Socialite** | ^5.23 | OAuth social login |
| **pragmarx/google2fa-laravel** | ^2.3 | Two-factor authentication |
| **jenssegers/agent** | ^2.6 | Device detection y user agent parsing |
| **intervention/image** | ^3.11 | Procesamiento de imágenes |
| **spatie/laravel-backup** | ^9.3 | Sistema de backups automáticos |
| **barryvdh/laravel-dompdf** | ^3.1 | Generación de PDFs |
| **maatwebsite/excel** | ^3.1 | Exportación a Excel |
| **mews/purifier** | ^3.4 | Sanitización de HTML |
| **predis/predis** | ^3.2 | Cliente Redis para PHP |
| **tightenco/ziggy** | ^2.0 | Rutas de Laravel en JavaScript |

### Frontend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **React** | ^18.2.0 | Librería UI |
| **Inertia.js** | ^2.0 | Adaptador SPA para Laravel |
| **Material-UI (MUI)** | ^7.3.2 | Framework de componentes UI |
| **Vite** | ^7.0.4 | Build tool y dev server |
| **Axios** | ^1.11.0 | Cliente HTTP |
| **date-fns** | ^4.1.0 | Manipulación de fechas |
| **DOMPurify** | ^3.2.7 | Sanitización de HTML |
| **TinyMCE** | ^8.1.2 | Editor WYSIWYG |
| **Recharts** | ^3.2.1 | Gráficos y visualizaciones |
| **Framer Motion** | ^12.23.12 | Animaciones |
| **React Google Maps** | ^2.20.7 | Integración con Google Maps |
| **Swiper** | ^12.0.2 | Carruseles y sliders |
| **Formik** | ^2.4.6 | Gestión de formularios |
| **Yup** | ^1.7.1 | Validación de esquemas |

### Herramientas de Desarrollo

- **Composer** ^2.0 - Gestor de dependencias PHP
- **NPM** - Gestor de dependencias JavaScript
- **Laravel Pint** ^1.24 - Code style fixer
- **PHPUnit** ^11.5.3 - Testing framework
- **Laravel Breeze** ^2.3 - Scaffolding de autenticación
- **Laravel Pail** ^1.2.2 - Log viewer en tiempo real
- **Docker** - Contenedorización (MySQL 8.0, PHP 8.3-fpm, Node 20, phpMyAdmin)

---

## 📦 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

### Opción 1: Instalación Local

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.x
- **NPM** >= 9.x
- **MySQL** >= 8.0 (o MariaDB >= 10.3)
- **Git** >= 2.0
- **Redis** (opcional, recomendado para producción)

### Opción 2: Instalación con Docker (Recomendado)

- **Docker** >= 20.x
- **Docker Compose** >= 2.x

### Extensiones PHP Requeridas (Solo instalación local)

```bash
php -m | grep -E 'pdo|mbstring|openssl|tokenizer|xml|ctype|json|bcmath|fileinfo|gd|intl|zip'
```

Extensiones necesarias:
- PDO PHP Extension
- Mbstring PHP Extension
- OpenSSL PHP Extension
- Tokenizer PHP Extension
- XML PHP Extension
- Ctype PHP Extension
- JSON PHP Extension
- BCMath PHP Extension
- Fileinfo PHP Extension
- GD PHP Extension
- Intl PHP Extension
- Zip PHP Extension

---

## 🚀 Instalación

### Método 1: Instalación Local

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/mdrconstrucciones.git
cd mdrconstrucciones
```

#### 2. Instalar Dependencias PHP

```bash
composer install
```

#### 3. Instalar Dependencias JavaScript

```bash
npm install
```

#### 4. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Generar la clave de aplicación
php artisan key:generate
```

Edita el archivo `.env` con tus configuraciones:

```env
APP_NAME="MDR Construcciones"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mdrconstrucciones
DB_USERNAME=root
DB_PASSWORD=

# Caché (file para desarrollo, redis para producción)
CACHE_STORE=file
# CACHE_STORE=redis  # Descomentar para usar Redis

# Queue
QUEUE_CONNECTION=database

# Session
SESSION_DRIVER=database

# Redis (opcional, para producción)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Email (opcional)
MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@mdrconstrucciones.com"
MAIL_FROM_NAME="${APP_NAME}"

# OAuth Social Login (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google reCAPTCHA v3 (opcional)
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Google Maps API (opcional)
GOOGLE_MAPS_API_KEY=

# TinyMCE API Key (opcional)
TINYMCE_API_KEY=

# ML System
ML_ENABLE_CACHING=true
ML_ENABLE_PRECOMPUTATION=false
```

#### 5. Crear Base de Datos

```bash
# Conectar a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE mdrconstrucciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 6. Ejecutar Migraciones y Seeders

```bash
# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders (datos de prueba)
php artisan db:seed

# O todo en un comando
php artisan migrate:fresh --seed
```

#### 7. Crear Enlace Simbólico para Storage

```bash
php artisan storage:link
```

#### 8. Compilar Assets

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción (optimizado)
npm run build
```

#### 9. Iniciar Servidor de Desarrollo

**Opción A: Comando único (recomendado)**
```bash
composer dev
# Inicia: servidor Laravel, queue worker, logs en tiempo real y Vite
```

**Opción B: Comandos separados**
```bash
# Terminal 1: Servidor Laravel
php artisan serve

# Terminal 2: Vite dev server
npm run dev

# Terminal 3 (opcional): Queue worker
php artisan queue:work
```

La aplicación estará disponible en: **http://localhost:8000**

---

### Método 2: Instalación con Docker (Recomendado)

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/mdrconstrucciones.git
cd mdrconstrucciones
```

#### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` para usar la configuración de Docker:

```env
APP_NAME="MDR Construcciones"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de datos Docker
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=mdrconstrucciones
DB_USERNAME=mdr
DB_PASSWORD=mdr

# Caché
CACHE_STORE=file

# Queue
QUEUE_CONNECTION=database

# Session
SESSION_DRIVER=database
```

#### 3. Iniciar Contenedores Docker

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

Servicios disponibles:
- **App (Laravel)**: http://localhost:8000
- **Vite Dev Server**: http://localhost:5173
- **phpMyAdmin**: http://localhost:8080
- **MySQL**: localhost:3306

#### 4. Ejecutar Migraciones dentro del contenedor

```bash
# Acceder al contenedor de la aplicación
docker-compose exec app bash

# Dentro del contenedor:
php artisan migrate:fresh --seed
php artisan storage:link
exit
```

#### 5. Detener y Limpiar

```bash
# Detener contenedores
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! elimina la base de datos)
docker-compose down -v
```

---

### Credenciales de Acceso por Defecto

Después de ejecutar los seeders, puedes acceder con:

**Administrador:**
- Email: `admin@mdrconstrucciones.com`
- Password: `password`

**Usuario Regular:**
- Email: `user@mdrconstrucciones.com`
- Password: `password`

---

## ⚙️ Configuración

### Configuración de OAuth (Social Login)

#### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Crea credenciales OAuth 2.0
5. Agrega las URIs de redirección autorizadas:
   ```
   http://localhost:8000/auth/google/callback
   https://tudominio.com/auth/google/callback
   ```
6. Copia el Client ID y Client Secret al `.env`:

```env
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

#### Facebook OAuth

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación
3. Agrega el producto "Facebook Login"
4. Configura las URIs de redirección válidas
5. Agrega al `.env`:

```env
FACEBOOK_CLIENT_ID=tu-app-id
FACEBOOK_CLIENT_SECRET=tu-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/auth/facebook/callback
```

#### GitHub OAuth

1. Ve a [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. Configura la Authorization callback URL
4. Agrega al `.env`:

```env
GITHUB_CLIENT_ID=tu-client-id
GITHUB_CLIENT_SECRET=tu-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback
```

### Configuración de Email (SMTP)

Para enviar emails (recuperación de contraseña, notificaciones, etc.), configura tu servidor SMTP en `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@mdrconstrucciones.com"
MAIL_FROM_NAME="MDR Construcciones"
```

**Nota**: Para Gmail, necesitas crear una [App Password](https://support.google.com/accounts/answer/185833).

### Configuración de Queue

Para procesar trabajos en segundo plano (emails, notificaciones):

```env
QUEUE_CONNECTION=database
```

Luego ejecuta el worker:

```bash
php artisan queue:work
```

### Configuración de Redis (Producción)

Para mejor rendimiento en producción, configura Redis:

**1. Instalar Redis (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**2. Configurar en `.env`:**
```env
CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

**3. Verificar conexión:**
```bash
php artisan tinker
>>> Redis::ping()
# Debe retornar: "PONG"
```

**Beneficios de Redis:**
- ⚡ 10x más rápido que file cache
- 🔄 Persistencia opcional
- 📊 Monitoreo en tiempo real
- 🚀 Escalabilidad horizontal

Ver `GUIA_INSTALACION_REDIS.md` para más detalles.

### Configuración del Sistema ML

El sistema de Machine Learning requiere entrenamiento inicial:

```bash
# Entrenar modelos (posts + perfiles de usuario)
php artisan ml:train

# Ver métricas del sistema
php artisan ml:metrics

# Programar entrenamiento automático (agregar a crontab)
* * * * * cd /ruta/proyecto && php artisan schedule:run >> /dev/null 2>&1
```

**Configuración en `.env`:**
```env
ML_ENABLE_CACHING=true
ML_ENABLE_PRECOMPUTATION=false
ML_CANDIDATE_POSTS_LIMIT=100
ML_DEFAULT_RECOMMENDATION_LIMIT=10
ML_CACHE_TIMEOUT=3600
```

### Configuración de Backups Automáticos

El sistema usa Spatie Laravel Backup para backups automáticos:

**1. Configurar en `config/backup.php`:**
- Directorios a incluir/excluir
- Discos de almacenamiento
- Retención de backups

**2. Ejecutar backup manual:**
```bash
# Backup completo
php artisan backup:run

# Solo base de datos
php artisan backup:run --only-db

# Solo archivos
php artisan backup:run --only-files
```

**3. Programar backups automáticos:**
Agregar a `app/Console/Kernel.php`:
```php
$schedule->command('backup:clean')->daily()->at('01:00');
$schedule->command('backup:run')->daily()->at('02:00');
```

**4. Monitorear backups:**
```bash
php artisan backup:list
php artisan backup:monitor
```

### Configuración de PWA

La aplicación incluye soporte PWA (Progressive Web App):

**1. Generar iconos PWA:**
- Crear logo de 512x512px
- Usar https://www.pwabuilder.com/imageGenerator
- Guardar iconos en `public/images/icons/`

**2. Actualizar `public/manifest.json`:**
```json
{
  "name": "MDR Construcciones",
  "short_name": "MDR",
  "icons": [
    {
      "src": "/images/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**3. El Service Worker se registra automáticamente en producción**

**Nota:** Para desarrollo, el PWA está deshabilitado por defecto. Ver `FIX_PANTALLA_BLANCA.md` para más información.

---

## 📁 Estructura del Proyecto

```
mdrconstrucciones/
├── app/
│   ├── Actions/              # Acciones reutilizables (Fortify)
│   ├── Console/              # Comandos Artisan personalizados
│   │   └── Commands/
│   │       ├── MLTrainCommand.php
│   │       └── MLMetricsCommand.php
│   ├── Http/
│   │   ├── Controllers/      # Controladores de la aplicación
│   │   │   ├── Admin/        # Controladores del panel admin
│   │   │   │   ├── BackupController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   └── ...
│   │   │   ├── Auth/         # Controladores de autenticación
│   │   │   │   ├── SocialAuthController.php
│   │   │   │   ├── TwoFactorController.php
│   │   │   │   └── ...
│   │   │   ├── MLController.php
│   │   │   ├── SearchController.php
│   │   │   └── ...
│   │   ├── Middleware/       # Middleware personalizado
│   │   └── Requests/         # Form requests para validación
│   ├── Models/               # Modelos Eloquent
│   │   ├── MLUserProfile.php
│   │   ├── SearchAnalytics.php
│   │   └── ...
│   ├── Notifications/        # Notificaciones personalizadas
│   ├── Policies/             # Políticas de autorización
│   ├── Providers/            # Service providers
│   └── Services/             # Servicios de negocio
│       ├── CacheService.php
│       ├── ContentAnalysisServiceV2.php
│       ├── DeviceTrackingService.php
│       ├── MLRecommendationService.php
│       └── SearchService.php
├── bootstrap/                # Archivos de arranque
├── config/                   # Archivos de configuración
│   ├── backup.php            # Configuración de backups
│   ├── cache.php             # Configuración de caché
│   ├── fortify.php           # Configuración de autenticación
│   ├── ml.php                # Configuración del sistema ML
│   ├── services.php          # Configuración de OAuth
│   └── ...
├── database/
│   ├── factories/            # Factories para testing
│   ├── migrations/           # Migraciones de base de datos
│   └── seeders/              # Seeders de datos iniciales
├── docs/                     # Documentación del proyecto
│   ├── DEPLOYMENT_GUIDE.md
│   ├── ML_SYSTEM.md
│   └── ...
├── public/                   # Archivos públicos
│   ├── build/                # Assets compilados (Vite)
│   ├── images/               # Imágenes públicas
│   ├── manifest.json         # PWA manifest
│   ├── service-worker.js     # Service Worker para PWA
│   └── storage/              # Enlace simbólico a storage
├── resources/
│   ├── css/                  # Estilos CSS
│   │   ├── app.css           # Estilos principales
│   │   └── tinymce-content.css
│   ├── js/                   # Código JavaScript/React
│   │   ├── Components/       # Componentes React reutilizables
│   │   │   ├── Admin/        # Componentes del admin
│   │   │   ├── Blog/         # Componentes del blog
│   │   │   ├── ML/           # Componentes ML
│   │   │   ├── PWA/          # Componentes PWA
│   │   │   ├── Profile/      # Componentes de perfil
│   │   │   └── ...
│   │   ├── Hooks/            # Custom React Hooks
│   │   │   ├── useMLRecommendations.js
│   │   │   ├── useSearch.js
│   │   │   └── ...
│   │   ├── Layouts/          # Layouts principales
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AuthenticatedLayout.jsx
│   │   │   ├── GuestLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── Pages/            # Páginas Inertia.js
│   │   │   ├── Admin/        # Páginas del admin
│   │   │   ├── Auth/         # Páginas de autenticación
│   │   │   ├── Blog/         # Páginas del blog
│   │   │   ├── Profile/      # Páginas de perfil
│   │   │   ├── Search/       # Páginas de búsqueda
│   │   │   └── ...
│   │   ├── Services/         # Servicios frontend
│   │   │   └── MLService.js
│   │   ├── Utils/            # Utilidades
│   │   │   ├── CacheManager.js
│   │   │   ├── registerServiceWorker.js
│   │   │   └── ...
│   │   ├── theme/            # Configuración de tema
│   │   │   ├── designSystem.js
│   │   │   └── muiTheme.js
│   │   └── app.jsx           # Punto de entrada React
│   └── views/                # Vistas Blade (mínimas)
├── routes/
│   ├── admin.php             # Rutas del panel admin
│   ├── api.php               # Rutas API
│   ├── auth.php              # Rutas de autenticación
│   ├── console.php           # Comandos de consola
│   └── web.php               # Rutas web principales
├── storage/                  # Almacenamiento de archivos
│   ├── app/                  # Archivos de la aplicación
│   │   └── backups/          # Backups automáticos
│   ├── framework/            # Archivos del framework
│   │   └── cache/            # Caché de archivos
│   └── logs/                 # Logs de la aplicación
├── tests/                    # Tests automatizados
│   ├── Feature/              # Tests de funcionalidad
│   └── Unit/                 # Tests unitarios
├── .env.example              # Ejemplo de variables de entorno
├── composer.json             # Dependencias PHP
├── docker-compose.yml        # Configuración Docker
├── Dockerfile                # Dockerfile para PHP
├── package.json              # Dependencias JavaScript
├── phpunit.xml               # Configuración de PHPUnit
├── vite.config.js            # Configuración de Vite
├── deploy-staging.sh         # Script de despliegue (Linux/Mac)
├── deploy-staging.bat        # Script de despliegue (Windows)
└── README.md                 # Este archivo
```

---

## 🔧 Comandos Útiles

### Comandos de Laravel

```bash
# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Migraciones
php artisan migrate                    # Ejecutar migraciones pendientes
php artisan migrate:rollback           # Revertir última migración
php artisan migrate:fresh              # Eliminar todas las tablas y recrear
php artisan migrate:fresh --seed       # Recrear y poblar con datos

# Seeders
php artisan db:seed                    # Ejecutar todos los seeders
php artisan db:seed --class=UserSeeder # Ejecutar seeder específico

# Queue (trabajos en segundo plano)
php artisan queue:work                 # Procesar trabajos
php artisan queue:listen               # Procesar trabajos (auto-reload)
php artisan queue:restart              # Reiniciar workers

# Storage
php artisan storage:link               # Crear enlace simbólico

# Crear archivos
php artisan make:controller NombreController
php artisan make:model Nombre -m       # Con migración
php artisan make:migration create_tabla_table
php artisan make:seeder NombreSeeder
php artisan make:request NombreRequest
php artisan make:policy NombrePolicy
```

---

## Notas de Diseño (UI) recientes

- Se unificaron las páginas de autenticación para mantener coherencia visual con el resto del sitio:
  - `resources/js/Pages/Auth/LoginMUI.jsx` y `resources/js/Pages/Auth/RegisterMUI.jsx` ahora se renderizan dentro de `MainLayout` (header, navegación y footer consistentes).
  - Se ajustaron alturas y paddings para convivir correctamente con el AppBar sticky del layout.
  - No hubo cambios en rutas o controladores; siguen apuntando a estas vistas MUI.

### Comandos del Sistema ML

```bash
# Entrenar modelos
php artisan ml:train                   # Entrenar todo (posts + perfiles)
php artisan ml:train --posts           # Solo analizar posts
php artisan ml:train --profiles        # Solo actualizar perfiles
php artisan ml:train --clear-cache     # Limpiar caché después de entrenar

# Métricas y reportes
php artisan ml:metrics                 # Reporte básico (K=10, 7 días)
php artisan ml:metrics --k=20 --days=30 # Reporte personalizado
php artisan ml:metrics --export        # Exportar a JSON

# Limpiar caché ML
php artisan cache:clear --tags=ml
```

### Comandos de Backups

```bash
# Ejecutar backup
php artisan backup:run                 # Backup completo
php artisan backup:run --only-db       # Solo base de datos
php artisan backup:run --only-files    # Solo archivos

# Gestión de backups
php artisan backup:list                # Listar backups
php artisan backup:clean               # Limpiar backups antiguos
php artisan backup:monitor             # Verificar salud de backups
```

### Comandos de NPM

```bash
# Desarrollo
npm run dev                # Iniciar Vite dev server
npm run build              # Compilar para producción

# Composer
composer dev               # Iniciar todo (servidor, queue, logs, vite)
composer test              # Ejecutar tests
```

### Comandos de Docker

```bash
# Gestión de contenedores
docker-compose up -d       # Iniciar servicios en background
docker-compose down        # Detener servicios
docker-compose ps          # Ver estado de servicios
docker-compose logs -f     # Ver logs en tiempo real

# Ejecutar comandos en contenedores
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
docker-compose exec app composer install
docker-compose exec node npm install

# Acceder a contenedores
docker-compose exec app bash    # Acceder al contenedor de Laravel
docker-compose exec db mysql -u mdr -p  # Acceder a MySQL
```

### Comandos de Testing

```bash
# Ejecutar todos los tests
php artisan test

# Ejecutar tests específicos
php artisan test --filter=NombreTest
php artisan test tests/Feature/AuthTest.php

# Con cobertura
php artisan test --coverage

# Tests en paralelo
php artisan test --parallel
```

---

## 🧪 Testing

El proyecto incluye tests automatizados para garantizar la calidad del código.

### Ejecutar Tests

```bash
# Todos los tests
php artisan test

# Tests específicos
php artisan test --filter=TwoFactorTest
php artisan test --filter=DeviceTrackingTest
php artisan test --filter=ProfileSettingsTest

# Con output detallado
php artisan test --verbose
```

### Tests Implementados

- ✅ **Autenticación**: Login, registro, 2FA, OAuth
- ✅ **Dispositivos**: Tracking, gestión, revocación
- ✅ **Perfil**: Configuración, actualización, privacidad
- ✅ **Blog**: CRUD de posts, comentarios, likes
- ✅ **Admin**: Gestión de usuarios, contenido

### Cobertura de Tests

```bash
php artisan test --coverage --min=80
```

---

## 🚀 Despliegue

### Preparación para Producción

1. **Configurar Variables de Entorno**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tudominio.com

# Configurar base de datos de producción
DB_HOST=tu-servidor-db
DB_DATABASE=tu-base-datos
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-contraseña-segura

# Configurar Redis para producción
CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=tu-contraseña-redis
REDIS_PORT=6379

# Queue
QUEUE_CONNECTION=redis

# Session
SESSION_DRIVER=redis

# Configurar email de producción
MAIL_MAILER=smtp
MAIL_HOST=smtp.tuservidor.com
MAIL_PORT=587
MAIL_USERNAME=tu-email
MAIL_PASSWORD=tu-contraseña
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@tudominio.com"
MAIL_FROM_NAME="${APP_NAME}"

# ML System
ML_ENABLE_CACHING=true
ML_ENABLE_PRECOMPUTATION=true
```

2. **Optimizar Aplicación**

```bash
# Instalar dependencias de producción
composer install --optimize-autoloader --no-dev

# Compilar assets
npm run build

# Optimizar Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Entrenar modelos ML
php artisan ml:train

# Crear enlace simbólico
php artisan storage:link
```

3. **Configurar Permisos**

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

4. **Configurar Cron Jobs**

Agregar al crontab:

```bash
* * * * * cd /ruta/a/tu/proyecto && php artisan schedule:run >> /dev/null 2>&1
```

Tareas programadas incluyen:
- Backups automáticos diarios
- Entrenamiento de modelos ML
- Limpieza de caché antiguo
- Limpieza de logs

5. **Configurar Queue Worker con Supervisor**

Crear archivo `/etc/supervisor/conf.d/mdrconstrucciones-worker.conf`:

```ini
[program:mdrconstrucciones-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /ruta/a/tu/proyecto/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/ruta/a/tu/proyecto/storage/logs/worker.log
stopwaitsecs=3600
```

Luego:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start mdrconstrucciones-worker:*
```

6. **Configurar Nginx (Recomendado)**

Crear archivo `/etc/nginx/sites-available/mdrconstrucciones`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tudominio.com www.tudominio.com;
    root /ruta/a/tu/proyecto/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Habilitar sitio:
```bash
sudo ln -s /etc/nginx/sites-available/mdrconstrucciones /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

7. **Configurar SSL con Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

### Despliegue con Docker en Producción

1. **Crear `docker-compose.prod.yml`:**

```yaml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    volumes:
      - ./storage:/var/www/html/storage
      - ./bootstrap/cache:/var/www/html/bootstrap/cache
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
    volumes:
      - dbdata:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./public:/var/www/html/public
    depends_on:
      - app
    restart: unless-stopped

volumes:
  dbdata:
```

2. **Desplegar:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Scripts de Despliegue

El proyecto incluye scripts de despliegue:

**Linux/Mac:**
```bash
./deploy-staging.sh
```

**Windows:**
```bash
deploy-staging.bat
```

Estos scripts automatizan:
- Pull de cambios desde Git
- Instalación de dependencias
- Migraciones de base de datos
- Compilación de assets
- Limpieza y optimización de caché
- Reinicio de servicios

### Consideraciones de Seguridad

- ✅ Usar HTTPS en producción (SSL/TLS)
- ✅ Configurar CORS correctamente
- ✅ Habilitar rate limiting
- ✅ Configurar backups automáticos diarios
- ✅ Monitorear logs de errores
- ✅ Mantener dependencias actualizadas
- ✅ Usar contraseñas seguras para Redis y base de datos
- ✅ Configurar firewall (UFW)
- ✅ Deshabilitar funciones PHP peligrosas
- ✅ Configurar fail2ban para protección contra ataques
- ✅ Habilitar autenticación de dos factores para administradores
- ✅ Revisar permisos de archivos y directorios

### Monitoreo y Mantenimiento

**Logs importantes:**
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Queue worker logs
tail -f storage/logs/worker.log

# Supervisor logs
sudo tail -f /var/log/supervisor/supervisord.log
```

**Comandos de mantenimiento:**
```bash
# Limpiar logs antiguos
php artisan log:clear

# Verificar salud de backups
php artisan backup:monitor

# Ver métricas ML
php artisan ml:metrics

# Limpiar caché
php artisan cache:clear
php artisan view:clear
php artisan config:clear
```

---

## � Solución de Problemas Comunes

### Pantalla Blanca / Error 500

**Causa:** Problemas con caché, permisos o PWA.

**Solución:**
```bash
# Limpiar todo el caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Verificar permisos
chmod -R 775 storage bootstrap/cache

# Recompilar assets
npm run build
```

Ver `FIX_PANTALLA_BLANCA.md` para más detalles.

### Error de Conexión a Base de Datos

**Causa:** Configuración incorrecta en `.env` o servicio MySQL no iniciado.

**Solución:**
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar credenciales en .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mdrconstrucciones
DB_USERNAME=root
DB_PASSWORD=tu_password

# Probar conexión
php artisan tinker
>>> DB::connection()->getPdo();
```

### Error con Redis

**Causa:** Redis no instalado o no configurado correctamente.

**Solución:**
```bash
# Cambiar a file cache temporalmente
CACHE_STORE=file

# O instalar Redis
sudo apt install redis-server
sudo systemctl start redis-server

# Verificar conexión
redis-cli ping
# Debe retornar: PONG
```

### Errores de Permisos en Storage

**Causa:** Permisos incorrectos en directorios.

**Solución:**
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Vite no Compila / Hot Reload no Funciona

**Causa:** Puerto ocupado o configuración incorrecta.

**Solución:**
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar que el puerto 5173 esté libre
lsof -i :5173

# Iniciar Vite
npm run dev
```

### Docker: Contenedores no Inician

**Causa:** Puertos ocupados o configuración incorrecta.

**Solución:**
```bash
# Ver logs de error
docker-compose logs

# Verificar puertos disponibles
netstat -tulpn | grep -E '3306|8000|5173|8080'

# Reconstruir contenedores
docker-compose down
docker-compose up --build -d
```

### Sistema ML no Genera Recomendaciones

**Causa:** Modelos no entrenados o caché corrupto.

**Solución:**
```bash
# Entrenar modelos
php artisan ml:train --clear-cache

# Verificar métricas
php artisan ml:metrics

# Limpiar caché ML
php artisan cache:clear --tags=ml
```

### Queue Worker no Procesa Trabajos

**Causa:** Worker no iniciado o configuración incorrecta.

**Solución:**
```bash
# Verificar configuración
QUEUE_CONNECTION=database

# Iniciar worker
php artisan queue:work

# Ver trabajos fallidos
php artisan queue:failed

# Reintentar trabajos fallidos
php artisan queue:retry all
```

---

## �📚 Documentación Adicional

El proyecto incluye documentación detallada en el directorio `docs/`:

### Documentación Técnica

- **`docs/ML_SYSTEM.md`** - Sistema de Machine Learning completo
  - Arquitectura del sistema
  - Algoritmos implementados
  - Comandos y API
  - Métricas de evaluación

- **`docs/DEPLOYMENT_GUIDE.md`** - Guía de despliegue en producción
  - Configuración de servidores
  - Nginx, SSL, Supervisor
  - Optimizaciones

- **`DOCUMENTACION_CACHE_BUSQUEDAS.md`** - Sistema de caché de búsquedas
  - Tipos de caché implementados
  - Flujo de búsqueda con caché
  - Optimizaciones de performance

- **`GUIA_INSTALACION_REDIS.md`** - Instalación y configuración de Redis
  - Instalación en Linux
  - Configuración para producción
  - Testing y troubleshooting
### Guías de Solución de Problemas

- **`FIX_PANTALLA_BLANCA.md`** - Solución a pantalla blanca
- **`DOCKER_CONNECTION_FIX_SUMMARY.md`** - Solución a problemas de Docker

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo

- Seguir PSR-12 para código PHP
- Usar ESLint para código JavaScript/React
- Escribir tests para nuevas funcionalidades
- Documentar cambios importantes
- Usar commits descriptivos siguiendo Conventional Commits

---

## 📄 Licencia

Este proyecto es privado y propietario. Todos los derechos reservados © 2025 MDR Construcciones.

---

## 👥 Créditos

### Desarrollado por

**Roberto Osorio Vidal** para **MDR Construcciones**

### Tecnologías y Librerías

Agradecimientos especiales a los creadores y mantenedores de:

- [Laravel](https://laravel.com/) - Taylor Otwell y la comunidad Laravel
- [React](https://react.dev/) - Meta y la comunidad React
- [Inertia.js](https://inertiajs.com/) - Jonathan Reinink
- [Material-UI](https://mui.com/) - MUI Team
- [Vite](https://vitejs.dev/) - Evan You y el equipo de Vite
- [Spatie Laravel Backup](https://spatie.be/docs/laravel-backup) - Spatie
- [TinyMCE](https://www.tiny.cloud/) - Tiny Technologies Inc.

### Contacto

- **Website**: [https://mdrconstrucciones.com](https://mdrconstrucciones.com)
- **Email**: info@mdrconstrucciones.com

---

## 🔗 Enlaces Útiles

- **Documentación de Laravel**: https://laravel.com/docs
- **Documentación de React**: https://react.dev
- **Documentación de Inertia.js**: https://inertiajs.com
- **Documentación de Material-UI**: https://mui.com
- **Documentación de Docker**: https://docs.docker.com
- **Documentación de Redis**: https://redis.io/docs

---

## 📝 Notas de Versión

### Versión Actual: 2.0.0

**Características principales:**
- ✅ Sistema completo de autenticación con 2FA y OAuth
- ✅ Blog con editor WYSIWYG y sistema de comentarios
- ✅ Sistema ML de recomendaciones personalizadas
- ✅ Caché inteligente con soporte Redis
- ✅ PWA con soporte offline
- ✅ Backups automáticos
- ✅ Panel de administración completo
- ✅ Entorno Docker completamente configurado
- ✅ Sistema de búsqueda avanzada con caché
- ✅ Analytics y métricas detalladas

**Tecnologías:**
- Laravel 12.0
- React 18.2
- Material-UI 7.3
- PHP 8.2+
- MySQL 8.0
- Redis (opcional)
- Docker

---

<div align="center">

**Hecho con ❤️ por Roberto Osorio Vidal para MDR Construcciones**

⭐ Si te gusta este proyecto, considera darle una estrella en GitHub

---

© 2025 MDR Construcciones. Todos los derechos reservados.

</div>
