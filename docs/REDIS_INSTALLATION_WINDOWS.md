# 🚀 Instalación de Redis en Windows (WAMP)

## 📋 OPCIÓN 1: Memurai (Recomendado para Windows)

Memurai es un port nativo de Redis para Windows, totalmente compatible.

### Pasos:

1. **Descargar Memurai Developer Edition (Gratis)**
   - Ir a: https://www.memurai.com/get-memurai
   - Descargar: Memurai Developer Edition (gratis)

2. **Instalar**
   - Ejecutar el instalador
   - Seguir el asistente de instalación
   - Por defecto se instala en: `C:\Program Files\Memurai\`

3. **Verificar que está corriendo**
   ```bash
   # Abrir PowerShell como Administrador
   Get-Service Memurai
   
   # Debería mostrar: Status = Running
   ```

4. **Probar conexión**
   ```bash
   # En PowerShell
   cd "C:\Program Files\Memurai"
   .\memurai-cli.exe ping
   
   # Debería responder: PONG
   ```

---

## 📋 OPCIÓN 2: Redis para Windows (Microsoft Archive)

### Pasos:

1. **Descargar Redis**
   - Ir a: https://github.com/microsoftarchive/redis/releases
   - Descargar: `Redis-x64-3.0.504.msi` (última versión estable)

2. **Instalar**
   - Ejecutar el instalador MSI
   - Marcar: "Add the Redis installation folder to the PATH environment variable"
   - Marcar: "Run the Redis server as a Windows Service"

3. **Verificar instalación**
   ```bash
   # En CMD o PowerShell
   redis-cli --version
   ```

4. **Iniciar servicio**
   ```bash
   # En PowerShell como Administrador
   Start-Service Redis
   
   # Verificar estado
   Get-Service Redis
   ```

5. **Probar conexión**
   ```bash
   redis-cli ping
   # Debería responder: PONG
   ```

---

## 📋 OPCIÓN 3: WSL2 + Redis (Más complejo pero más actualizado)

### Pasos:

1. **Instalar WSL2**
   ```powershell
   # En PowerShell como Administrador
   wsl --install
   ```

2. **Instalar Redis en WSL2**
   ```bash
   # Dentro de WSL2 (Ubuntu)
   sudo apt update
   sudo apt install redis-server
   
   # Iniciar Redis
   sudo service redis-server start
   
   # Verificar
   redis-cli ping
   ```

3. **Configurar acceso desde Windows**
   ```bash
   # Editar configuración de Redis
   sudo nano /etc/redis/redis.conf
   
   # Cambiar:
   bind 127.0.0.1 ::1
   # Por:
   bind 0.0.0.0
   
   # Reiniciar
   sudo service redis-server restart
   ```

4. **Obtener IP de WSL2**
   ```bash
   # En WSL2
   ip addr show eth0 | grep inet
   ```

5. **Actualizar .env en Laravel**
   ```env
   REDIS_HOST=172.x.x.x  # IP de WSL2
   ```

---

## ✅ VERIFICAR CONFIGURACIÓN EN LARAVEL

Una vez instalado Redis, ejecutar:

```bash
# 1. Limpiar cachés
php artisan cache:clear
php artisan config:clear

# 2. Probar conexión Redis desde Laravel
php artisan tinker

# En tinker:
>>> Illuminate\Support\Facades\Redis::connection()->ping()
# Debería devolver: "PONG"

>>> Cache::put('test', 'value', 60)
>>> Cache::get('test')
# Debería devolver: "value"

>>> exit
```

---

## 🔧 CONFIGURACIÓN RECOMENDADA

### Para desarrollo local (WAMP):

**Opción A: Memurai (Más fácil)**
- ✅ Instalación simple con MSI
- ✅ Servicio de Windows automático
- ✅ Compatible 100% con Redis
- ✅ Gratis para desarrollo

**Opción B: Redis Microsoft Archive**
- ✅ Versión oficial portada
- ⚠️ Versión antigua (3.0.504)
- ✅ Servicio de Windows

**Opción C: WSL2**
- ✅ Versión más reciente de Redis
- ⚠️ Configuración más compleja
- ⚠️ Requiere WSL2 instalado

---

## 🚨 TROUBLESHOOTING

### Error: "Class Redis not found"
**Solución:** Ya está configurado con Predis en `.env`:
```env
REDIS_CLIENT=predis
```

### Error: "Connection refused"
**Solución:** Redis no está corriendo
```bash
# Windows Service
Start-Service Redis
# O
Start-Service Memurai

# WSL2
sudo service redis-server start
```

### Error: "No connection could be made"
**Solución:** Verificar firewall de Windows
```powershell
# Permitir Redis en firewall
New-NetFirewallRule -DisplayName "Redis" -Direction Inbound -LocalPort 6379 -Protocol TCP -Action Allow
```

### Error: "Authentication required"
**Solución:** Configurar password en `.env`
```env
REDIS_PASSWORD=tu_password_aqui
```

---

## 📊 VERIFICAR RENDIMIENTO

Una vez instalado, verificar que Redis está funcionando:

```bash
# Monitor en tiempo real
redis-cli monitor

# Ver estadísticas
redis-cli info stats

# Ver memoria usada
redis-cli info memory
```

---

## 🎯 SIGUIENTE PASO

Después de instalar Redis, ejecutar:

```bash
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 💡 RECOMENDACIÓN

Para WAMP en Windows, **Memurai** es la opción más simple y confiable:
1. Descarga rápida
2. Instalación automática
3. Servicio de Windows
4. Sin configuración adicional
5. Compatible 100% con Redis

**Link de descarga:** https://www.memurai.com/get-memurai

