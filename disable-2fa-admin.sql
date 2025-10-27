-- Desactivar 2FA para admin@test.com
-- Ejecutar con: mysql -u root -p nombre_base_datos < disable-2fa-admin.sql
-- O desde Laravel Sail: ./vendor/bin/sail mysql < disable-2fa-admin.sql

-- Verificar usuario antes de desactivar
SELECT 
    id,
    name,
    email,
    CASE WHEN two_factor_secret IS NOT NULL THEN 'Sí' ELSE 'No' END as '2FA Habilitado',
    two_factor_confirmed_at as 'Confirmado el'
FROM users 
WHERE email = 'admin@test.com';

-- Desactivar 2FA
UPDATE users 
SET 
    two_factor_secret = NULL,
    two_factor_recovery_codes = NULL,
    two_factor_confirmed_at = NULL
WHERE email = 'admin@test.com';

-- Verificar que se desactivó correctamente
SELECT 
    id,
    name,
    email,
    CASE WHEN two_factor_secret IS NOT NULL THEN 'Sí' ELSE 'No' END as '2FA Habilitado',
    two_factor_confirmed_at as 'Confirmado el'
FROM users 
WHERE email = 'admin@test.com';

-- Mensaje de confirmación
SELECT '✅ 2FA desactivado exitosamente para admin@test.com' as 'Resultado';

