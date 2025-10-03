# 🏗️ MDR Construcciones - Plataforma Web Integral

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-5.x-007FFF?style=for-the-badge&logo=mui&logoColor=white)

**Plataforma web moderna y completa para empresa de construcción con gestión de proyectos, blog, servicios y panel administrativo**

[Características](#-características-principales) •
[Instalación](#-instalación) •
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
- 📱 **Responsive Design**: Optimizado para dispositivos móviles, tablets y desktop

La plataforma está construida con **Laravel 11** en el backend y **React 18** con **Inertia.js** en el frontend, proporcionando una experiencia de usuario fluida tipo SPA (Single Page Application) con las ventajas del renderizado del lado del servidor.

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

- ✅ **Material-UI v5** para componentes
- ✅ **Diseño Responsive** (mobile-first)
- ✅ **Tema Personalizable** (light/dark mode)
- ✅ **Animaciones Suaves**
- ✅ **Loading States** y Skeleton Screens
- ✅ **Error Boundaries** para manejo de errores
- ✅ **Optimización de Rendimiento**
  - Lazy loading de componentes
  - Code splitting
  - Optimización de imágenes
  - Caché de assets

---

## 🛠️ Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Laravel** | 11.28.1 | Framework PHP principal |
| **PHP** | 8.3.14 | Lenguaje de programación |
| **MySQL** | 8.0+ | Base de datos relacional |
| **Laravel Fortify** | ^1.24 | Autenticación (login, 2FA, password reset) |
| **Laravel Sanctum** | ^4.0 | API token authentication |
| **Laravel Socialite** | ^5.16 | OAuth social login |
| **pragmarx/google2fa-laravel** | ^2.2 | Two-factor authentication |
| **jenssegers/agent** | ^2.6 | Device detection y user agent parsing |
| **intervention/image** | ^3.0 | Procesamiento de imágenes |

### Frontend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **React** | 18.3.1 | Librería UI |
| **Inertia.js** | ^2.0 | Adaptador SPA para Laravel |
| **Material-UI (MUI)** | 5.16.7 | Framework de componentes UI |
| **Vite** | 7.1.5 | Build tool y dev server |
| **Axios** | ^1.7.9 | Cliente HTTP |
| **date-fns** | ^4.1.0 | Manipulación de fechas |
| **DOMPurify** | ^3.2.2 | Sanitización de HTML |
| **TinyMCE** | ^7.5.1 | Editor WYSIWYG |
| **Recharts** | ^2.15.0 | Gráficos y visualizaciones |

### Herramientas de Desarrollo

- **Composer** - Gestor de dependencias PHP
- **NPM/Yarn** - Gestor de dependencias JavaScript
- **Laravel Pint** - Code style fixer
- **PHPUnit** - Testing framework
- **Laravel Telescope** - Debugging tool (dev)

---

## 📦 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **PHP** >= 8.3
- **Composer** >= 2.0
- **Node.js** >= 18.x
- **NPM** >= 9.x (o Yarn >= 1.22)
- **MySQL** >= 8.0 (o MariaDB >= 10.3)
- **Git** >= 2.0

### Extensiones PHP Requeridas

```bash
php -m | grep -E 'pdo|mbstring|openssl|tokenizer|xml|ctype|json|bcmath|fileinfo|gd'
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

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/mdrconstrucciones.git
cd mdrconstrucciones
```

### 2. Instalar Dependencias PHP

```bash
composer install
```

### 3. Instalar Dependencias JavaScript

```bash
npm install
# o si usas Yarn
yarn install
```

### 4. Configurar Variables de Entorno

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

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mdrconstrucciones
DB_USERNAME=root
DB_PASSWORD=

# Configuración de Email (opcional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@mdrconstrucciones.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 5. Crear Base de Datos

```bash
# Conectar a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE mdrconstrucciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 6. Ejecutar Migraciones y Seeders

```bash
# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders (datos de prueba)
php artisan db:seed

# O todo en un comando
php artisan migrate:fresh --seed
```

### 7. Crear Enlace Simbólico para Storage

```bash
php artisan storage:link
```

### 8. Compilar Assets

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción (optimizado)
npm run build
```

### 9. Iniciar Servidor de Desarrollo

```bash
# Terminal 1: Servidor Laravel
php artisan serve

# Terminal 2: Vite dev server (si usas npm run dev)
npm run dev
```

La aplicación estará disponible en: **http://localhost:8000**

### 10. Credenciales de Acceso por Defecto

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

### Configuración de Queue (Opcional)

Para procesar trabajos en segundo plano (emails, notificaciones):

```env
QUEUE_CONNECTION=database
```

Luego ejecuta el worker:

```bash
php artisan queue:work
```

---

## 📁 Estructura del Proyecto

```
mdrconstrucciones/
├── app/
│   ├── Actions/              # Acciones reutilizables (Fortify)
│   ├── Console/              # Comandos Artisan personalizados
│   ├── Http/
│   │   ├── Controllers/      # Controladores de la aplicación
│   │   │   ├── Admin/        # Controladores del panel admin
│   │   │   ├── Auth/         # Controladores de autenticación
│   │   │   ├── Blog/         # Controladores del blog
│   │   │   └── ...
│   │   ├── Middleware/       # Middleware personalizado
│   │   └── Requests/         # Form requests para validación
│   ├── Models/               # Modelos Eloquent
│   ├── Notifications/        # Notificaciones personalizadas
│   ├── Policies/             # Políticas de autorización
│   ├── Providers/            # Service providers
│   └── Services/             # Servicios de negocio
│       └── DeviceTrackingService.php
├── bootstrap/                # Archivos de arranque
├── config/                   # Archivos de configuración
│   ├── fortify.php           # Configuración de autenticación
│   ├── services.php          # Configuración de OAuth
│   └── ...
├── database/
│   ├── factories/            # Factories para testing
│   ├── migrations/           # Migraciones de base de datos
│   └── seeders/              # Seeders de datos iniciales
├── public/                   # Archivos públicos
│   ├── build/                # Assets compilados (Vite)
│   ├── images/               # Imágenes públicas
│   └── storage/              # Enlace simbólico a storage
├── resources/
│   ├── css/                  # Estilos CSS
│   │   ├── app.css           # Estilos principales
│   │   └── tinymce-content.css
│   ├── js/                   # Código JavaScript/React
│   │   ├── Components/       # Componentes React reutilizables
│   │   │   ├── Admin/        # Componentes del admin
│   │   │   ├── Blog/         # Componentes del blog
│   │   │   ├── Profile/      # Componentes de perfil
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
│   │   │   └── ...
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
│   ├── framework/            # Archivos del framework
│   └── logs/                 # Logs de la aplicación
├── tests/                    # Tests automatizados
│   ├── Feature/              # Tests de funcionalidad
│   └── Unit/                 # Tests unitarios
├── .env.example              # Ejemplo de variables de entorno
├── composer.json             # Dependencias PHP
├── package.json              # Dependencias JavaScript
├── phpunit.xml               # Configuración de PHPUnit
├── vite.config.js            # Configuración de Vite
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

# Crear archivos
php artisan make:controller NombreController
php artisan make:model Nombre -m       # Con migración
php artisan make:migration create_tabla_table
php artisan make:seeder NombreSeeder
php artisan make:request NombreRequest
php artisan make:policy NombrePolicy
```

### Comandos de NPM

```bash
# Desarrollo
npm run dev                # Iniciar Vite dev server
npm run build              # Compilar para producción

# Linting y formato
npm run lint               # Verificar código
npm run format             # Formatear código
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

# Configurar email de producción
MAIL_MAILER=smtp
MAIL_HOST=smtp.tuservidor.com
# ... resto de configuración
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

5. **Configurar Queue Worker**

Usar Supervisor para mantener el worker activo:

```ini
[program:mdrconstrucciones-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /ruta/a/tu/proyecto/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/ruta/a/tu/proyecto/storage/logs/worker.log
```

### Consideraciones de Seguridad

- ✅ Usar HTTPS en producción
- ✅ Configurar CORS correctamente
- ✅ Habilitar rate limiting
- ✅ Configurar backups automáticos
- ✅ Monitorear logs de errores
- ✅ Mantener dependencias actualizadas

---

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

---

## 📄 Licencia

Este proyecto es privado y propietario. Todos los derechos reservados © 2025 MDR Construcciones.

---

## 👥 Créditos

### Desarrollado por

**MDR Construcciones - Equipo de Desarrollo**

### Tecnologías y Librerías

Agradecimientos especiales a los creadores y mantenedores de:

- [Laravel](https://laravel.com/) - Taylor Otwell y la comunidad Laravel
- [React](https://react.dev/) - Meta y la comunidad React
- [Inertia.js](https://inertiajs.com/) - Jonathan Reinink
- [Material-UI](https://mui.com/) - MUI Team
- [Vite](https://vitejs.dev/) - Evan You y el equipo de Vite



---

<div align="center">

**Hecho con ❤️ por Toberto Osorio Vidal para Mdr Construcciones**

⭐ Si te gusta este proyecto, considera darle una estrella en GitHub

</div>
