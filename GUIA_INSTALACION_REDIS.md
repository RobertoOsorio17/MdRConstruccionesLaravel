# 🚀 GUÍA DE INSTALACIÓN DE REDIS PARA PRODUCCIÓN

**Fecha:** 2025-10-11  
**Proyecto:** MDR Construcciones  
**Objetivo:** Configurar Redis para caché de alta performance

---

## 📊 **ESTADO ACTUAL**

### **Desarrollo (Windows):**
```env
CACHE_STORE=file  ✅ Configurado
```

**Razón:** Redis no está disponible nativamente en Windows. El driver `file` es la mejor opción para desarrollo.

### **Producción (Linux - Recomendado):**
```env
CACHE_STORE=redis  🎯 Objetivo
```

**Beneficios:**
- ⚡ **10x más rápido** que file cache
- 🔄 **Persistencia** opcional
- 📊 **Monitoreo** en tiempo real
- 🚀 **Escalabilidad** horizontal

---

## 🐧 **INSTALACIÓN EN LINUX (Ubuntu/Debian)**

### **Paso 1: Instalar Redis Server**

```bash
# Actualizar repositorios
sudo apt update

# Instalar Redis
sudo apt install redis-server -y

# Verificar instalación
redis-cli --version
```

**Salida esperada:**
```
redis-cli 7.0.12
```

---

### **Paso 2: Configurar Redis**

```bash
# Editar configuración
sudo nano /etc/redis/redis.conf
```

**Cambios recomendados:**

```conf
# 1. Bind a localhost (seguridad)
bind 127.0.0.1 ::1

# 2. Configurar contraseña (IMPORTANTE)
requirepass TU_CONTRASEÑA_SEGURA_AQUI

# 3. Configurar persistencia (opcional)
save 900 1      # Guardar si 1 key cambió en 15 min
save 300 10     # Guardar si 10 keys cambiaron en 5 min
save 60 10000   # Guardar si 10000 keys cambiaron en 1 min

# 4. Configurar memoria máxima
maxmemory 256mb
maxmemory-policy allkeys-lru

# 5. Habilitar logging
loglevel notice
logfile /var/log/redis/redis-server.log
```

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

---

### **Paso 3: Reiniciar Redis**

```bash
# Reiniciar servicio
sudo systemctl restart redis-server

# Habilitar inicio automático
sudo systemctl enable redis-server

# Verificar estado
sudo systemctl status redis-server
```

**Salida esperada:**
```
● redis-server.service - Advanced key-value store
   Loaded: loaded (/lib/systemd/system/redis-server.service; enabled)
   Active: active (running) since ...
```

---

### **Paso 4: Verificar Conexión**

```bash
# Conectar a Redis
redis-cli

# Autenticar (si configuraste contraseña)
AUTH TU_CONTRASEÑA_SEGURA_AQUI

# Probar comando
PING
```

**Salida esperada:**
```
PONG
```

---

### **Paso 5: Instalar Extensión PHP Redis**

```bash
# Instalar extensión
sudo apt install php-redis -y

# Verificar instalación
php -m | grep redis
```

**Salida esperada:**
```
redis
```

---

### **Paso 6: Reiniciar PHP-FPM**

```bash
# Para PHP 8.3
sudo systemctl restart php8.3-fpm

# Verificar
php -i | grep redis
```

---

## ⚙️ **CONFIGURACIÓN DE LARAVEL**

### **Archivo: `.env`**

```env
# Cache Configuration
CACHE_STORE=redis
CACHE_PREFIX=mdr_

# Redis Configuration
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=TU_CONTRASEÑA_SEGURA_AQUI
REDIS_PORT=6379
REDIS_DB=0

# Queue Configuration (opcional - usar Redis también)
QUEUE_CONNECTION=redis

# Session Configuration (opcional - usar Redis también)
SESSION_DRIVER=redis
```

---

### **Archivo: `config/database.php`**

Verificar que la configuración de Redis esté correcta:

```php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],

    'cache' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],
],
```

---

## 🧪 **TESTING**

### **Test 1: Verificar Conexión desde Laravel**

```bash
php artisan tinker
```

```php
// Test Redis connection
Redis::ping();
// Salida: "PONG"

// Test cache
Cache::put('test_key', 'test_value', 60);
Cache::get('test_key');
// Salida: "test_value"

// Verificar driver
Cache::getStore()->getRedis()->ping();
// Salida: "PONG"
```

---

### **Test 2: Verificar Performance**

```bash
php artisan tinker
```

```php
// Test sin caché
$start = microtime(true);
$results = app(\App\Services\SearchService::class)->search('reforma');
$time1 = microtime(true) - $start;
echo "Sin caché: " . ($time1 * 1000) . "ms\n";

// Test con caché (segunda llamada)
$start = microtime(true);
$results = app(\App\Services\SearchService::class)->search('reforma');
$time2 = microtime(true) - $start;
echo "Con caché: " . ($time2 * 1000) . "ms\n";

// Mejora
echo "Mejora: " . round((1 - $time2/$time1) * 100, 2) . "%\n";
```

**Salida esperada:**
```
Sin caché: 450ms
Con caché: 50ms
Mejora: 88.89%
```

---

## 📊 **MONITOREO**

### **Comando 1: Ver Estadísticas**

```bash
redis-cli
AUTH TU_CONTRASEÑA_SEGURA_AQUI
INFO stats
```

**Métricas importantes:**
- `total_connections_received` - Total de conexiones
- `total_commands_processed` - Total de comandos
- `keyspace_hits` - Cache hits
- `keyspace_misses` - Cache misses
- `used_memory_human` - Memoria usada

---

### **Comando 2: Ver Keys Activas**

```bash
redis-cli
AUTH TU_CONTRASEÑA_SEGURA_AQUI

# Ver todas las keys
KEYS *

# Ver keys de búsqueda
KEYS search_*

# Contar keys
DBSIZE
```

---

### **Comando 3: Monitor en Tiempo Real**

```bash
redis-cli
AUTH TU_CONTRASEÑA_SEGURA_AQUI
MONITOR
```

**Salida:** Muestra todos los comandos en tiempo real

---

## 🔒 **SEGURIDAD**

### **1. Firewall:**

```bash
# Permitir solo localhost
sudo ufw allow from 127.0.0.1 to any port 6379

# O permitir IP específica del servidor web
sudo ufw allow from IP_SERVIDOR_WEB to any port 6379
```

---

### **2. Contraseña Fuerte:**

```bash
# Generar contraseña segura
openssl rand -base64 32
```

**Ejemplo:**
```
Kx9mP2vL8nQ4rT6wY1zA3bC5dE7fG9hJ0kM
```

---

### **3. Deshabilitar Comandos Peligrosos:**

En `/etc/redis/redis.conf`:

```conf
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
rename-command CONFIG ""
```

---

## 🚀 **OPTIMIZACIONES**

### **1. Cache Warming (Precalentar Caché):**

```bash
php artisan tinker
```

```php
// Precalentar búsquedas populares
$popularQueries = ['reforma', 'cocina', 'baño', 'sostenible', 'pintura'];

foreach ($popularQueries as $query) {
    app(\App\Services\SearchService::class)->search($query);
    echo "Cached: $query\n";
}
```

---

### **2. Crear Comando Artisan:**

```bash
php artisan make:command WarmSearchCache
```

**Archivo:** `app/Console/Commands/WarmSearchCache.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SearchService;

class WarmSearchCache extends Command
{
    protected $signature = 'cache:warm-search';
    protected $description = 'Warm up search cache with popular queries';

    public function handle(SearchService $searchService)
    {
        $popularQueries = ['reforma', 'cocina', 'baño', 'sostenible', 'pintura'];
        
        $this->info('Warming search cache...');
        
        foreach ($popularQueries as $query) {
            $searchService->search($query);
            $this->line("✓ Cached: $query");
        }
        
        $this->info('Search cache warmed successfully!');
    }
}
```

**Uso:**
```bash
php artisan cache:warm-search
```

---

### **3. Programar Cache Warming:**

**Archivo:** `app/Console/Kernel.php`

```php
protected function schedule(Schedule $schedule)
{
    // Warm cache every hour
    $schedule->command('cache:warm-search')->hourly();
}
```

---

## 📈 **COMPARATIVA DE DRIVERS**

| Driver | Velocidad | Persistencia | Memoria | Producción |
|--------|-----------|--------------|---------|------------|
| **array** | ⚡⚡⚡⚡⚡ | ❌ | RAM | ❌ Testing |
| **file** | ⚡⚡ | ✅ | Disco | ⚠️ Dev |
| **database** | ⚡ | ✅ | DB | ❌ No |
| **redis** | ⚡⚡⚡⚡ | ✅ | RAM | ✅ **SÍ** |
| **memcached** | ⚡⚡⚡⚡ | ❌ | RAM | ✅ Sí |

---

## 🎯 **RECOMENDACIONES FINALES**

### **Desarrollo (Windows):**
```env
CACHE_STORE=file  ✅
```

### **Producción (Linux):**
```env
CACHE_STORE=redis  ✅
```

### **Checklist de Producción:**
- [ ] Redis instalado y corriendo
- [ ] Contraseña configurada
- [ ] Firewall configurado
- [ ] PHP Redis extension instalada
- [ ] Laravel configurado con Redis
- [ ] Tests ejecutados exitosamente
- [ ] Monitoreo configurado
- [ ] Cache warming programado

---

## 🆘 **TROUBLESHOOTING**

### **Error: "Connection refused"**

```bash
# Verificar que Redis esté corriendo
sudo systemctl status redis-server

# Reiniciar Redis
sudo systemctl restart redis-server
```

---

### **Error: "NOAUTH Authentication required"**

```bash
# Verificar contraseña en .env
cat .env | grep REDIS_PASSWORD

# Verificar contraseña en Redis
redis-cli
CONFIG GET requirepass
```

---

### **Error: "Extension not loaded"**

```bash
# Instalar extensión
sudo apt install php-redis

# Reiniciar PHP-FPM
sudo systemctl restart php8.3-fpm
```

---

## 📞 **SOPORTE**

### **Logs de Redis:**
```bash
sudo tail -f /var/log/redis/redis-server.log
```

### **Logs de Laravel:**
```bash
tail -f storage/logs/laravel.log
```

---

## 🎉 **CONCLUSIÓN**

**Desarrollo:** ✅ File cache configurado  
**Producción:** 📋 Guía completa para Redis

**Mejora esperada con Redis:**
- ⚡ **-88% tiempo de respuesta**
- 🚀 **+10x throughput**
- 📊 **Monitoreo en tiempo real**

---

**Desarrollado por:** Augment Agent  
**Fecha:** 2025-10-11  
**Versión:** 1.0 Final

