# Production Configuration Checklist

## ✅ Environment Variables

### Critical Settings

#### 1. APP_ENV
```bash
APP_ENV=production
```
**Why:** Enables production optimizations and disables development features.

#### 2. APP_DEBUG
```bash
APP_DEBUG=false
```
**Why:** Prevents sensitive error information from being displayed to users.
- ❌ `APP_DEBUG=true` exposes stack traces, database queries, and environment variables
- ✅ `APP_DEBUG=false` shows generic error pages

#### 3. APP_KEY
```bash
APP_KEY=base64:RANDOM_32_BYTE_STRING
```
**Why:** Used for encryption, session security, and password hashing.
- Generate with: `php artisan key:generate --force`
- **Never** commit to version control
- Rotate if compromised

### Session Security

```bash
SESSION_DRIVER=database
SESSION_LIFETIME=15
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict
```

**Why:**
- `SESSION_SECURE_COOKIE=true`: Only send cookies over HTTPS
- `SESSION_HTTP_ONLY=true`: Prevent JavaScript access to cookies
- `SESSION_SAME_SITE=strict`: Prevent CSRF attacks
- `SESSION_ENCRYPT=true`: Encrypt session data

### Database

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=production_db
DB_USERNAME=production_user
DB_PASSWORD=STRONG_RANDOM_PASSWORD
```

**Security:**
- Use strong, unique passwords
- Limit database user permissions
- Use separate credentials for each environment

### Cache & Queue

```bash
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=STRONG_REDIS_PASSWORD
REDIS_PORT=6379
```

**Why:**
- Redis provides better performance than file-based cache
- Enables distributed caching across multiple servers

### Logging

```bash
LOG_CHANNEL=stack
LOG_LEVEL=warning
LOG_DEPRECATIONS_CHANNEL=null
```

**Why:**
- `LOG_LEVEL=warning`: Reduces log noise in production
- Only log warnings, errors, and critical issues

## 🔒 File Permissions

### Storage Directory
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

**Owner:** Web server user (e.g., `www-data`, `nginx`)

### Verify Permissions
```bash
# Check storage permissions
ls -la storage/

# Should show:
drwxrwxr-x  storage/app
drwxrwxr-x  storage/framework
drwxrwxr-x  storage/logs
```

### Security Best Practices
- ❌ Never use `chmod 777` (world-writable)
- ✅ Use `chmod 775` (owner and group writable)
- ✅ Ensure web server user owns the files

## 💾 Backup Configuration

### Laravel Backup (Spatie)

```bash
# config/backup.php
'destination' => [
    'disks' => [
        's3', // Use cloud storage, not local
    ],
],

'backup' => [
    'password' => env('BACKUP_ENCRYPTION_PASSWORD'),
    'compression' => 'gzip',
],
```

**Security:**
- ✅ Store backups in encrypted cloud storage (S3, Google Cloud)
- ❌ Never store backups in publicly accessible directories
- ✅ Use strong encryption passwords
- ✅ Test backup restoration regularly

### Backup Schedule
```bash
# app/Console/Kernel.php
$schedule->command('backup:clean')->daily()->at('01:00');
$schedule->command('backup:run')->daily()->at('02:00');
```

## 🌐 Web Server Configuration

### Nginx Example

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    root /var/www/html/public;
    index index.php;
    
    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers (handled by Laravel middleware)
    # But can be added here as backup
    
    # Hide Nginx version
    server_tokens off;
    
    # Prevent access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Prevent access to sensitive files
    location ~ /(\.env|\.git|composer\.json|composer\.lock|package\.json) {
        deny all;
    }
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

## 🔐 SSL/TLS Configuration

### Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d example.com -d www.example.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

### SSL Best Practices
- ✅ Use TLS 1.2 or higher
- ✅ Disable weak ciphers
- ✅ Enable HTTP/2
- ✅ Use HSTS (Strict-Transport-Security header)
- ✅ Test with [SSL Labs](https://www.ssllabs.com/ssltest/)

## 📊 Monitoring & Alerts

### Laravel Telescope (Disable in Production)

```bash
# .env
TELESCOPE_ENABLED=false
```

**Why:** Telescope exposes sensitive application data and should only be used in development.

### Error Tracking

Consider integrating:
- **Sentry**: Real-time error tracking
- **Bugsnag**: Error monitoring
- **Rollbar**: Exception tracking

```bash
# .env
SENTRY_LARAVEL_DSN=https://your-sentry-dsn
```

## 🚀 Performance Optimization

### Caching

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### OPcache Configuration

```ini
; php.ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
opcache.revalidate_freq=0
```

## 🔍 Pre-Deployment Checklist

### Environment
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` is set and unique
- [ ] All secrets are in environment variables (not in code)

### Security
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `SESSION_HTTP_ONLY=true`
- [ ] `SESSION_SAME_SITE=strict`
- [ ] SSL/TLS certificate is valid
- [ ] Security headers are configured
- [ ] CSRF protection is enabled

### Performance
- [ ] Configuration is cached (`php artisan config:cache`)
- [ ] Routes are cached (`php artisan route:cache`)
- [ ] Views are cached (`php artisan view:cache`)
- [ ] OPcache is enabled
- [ ] Redis is configured for cache and sessions

### Backups
- [ ] Backup system is configured
- [ ] Backups are encrypted
- [ ] Backups are stored off-site (cloud storage)
- [ ] Backup restoration has been tested

### Permissions
- [ ] `storage/` has correct permissions (775)
- [ ] `bootstrap/cache/` has correct permissions (775)
- [ ] Web server user owns the files
- [ ] No world-writable directories (777)

### Monitoring
- [ ] Error tracking is configured (Sentry, Bugsnag, etc.)
- [ ] Log rotation is configured
- [ ] Telescope is disabled
- [ ] Health check endpoint is configured

### Dependencies
- [ ] `composer install --no-dev --optimize-autoloader`
- [ ] `npm run build` (production build)
- [ ] All dependencies are up to date
- [ ] Security audit passed (`composer audit`, `npm audit`)

## 🆘 Emergency Procedures

### If APP_KEY is Compromised

1. Generate new key: `php artisan key:generate --force`
2. All users will be logged out
3. All encrypted data will need to be re-encrypted
4. Notify users to log in again

### If Database Credentials are Compromised

1. Change database password immediately
2. Update `.env` with new credentials
3. Restart application
4. Review database logs for suspicious activity

### If Backup Encryption Password is Lost

1. Backups cannot be restored
2. Create new backups with new password
3. Document password in secure password manager

---

**Last Updated:** 2025-11-02  
**Maintained By:** DevOps Team

