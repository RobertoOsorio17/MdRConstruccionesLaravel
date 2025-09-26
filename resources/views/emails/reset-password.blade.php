@component('mail::message')
# Recuperar Contraseña

Hola,

Has recibido este email porque hemos recibido una solicitud de recuperación de contraseña para tu cuenta en **MDR Construcciones**.

@component('mail::button', ['url' => $url, 'color' => 'primary'])
Restablecer Contraseña
@endcomponent

**Este enlace de recuperación expirará en {{ config('auth.passwords.'.config('auth.defaults.passwords').'.expire') }} minutos.**

Si no solicitaste recuperar tu contraseña, no necesitas realizar ninguna acción. Tu cuenta permanece segura.

---

### Consejos de Seguridad:
- Nunca compartas tu contraseña con nadie
- Usa una contraseña única y segura
- Si sospechas actividad no autorizada, contáctanos inmediatamente

**Equipo de MDR Construcciones**  
Email: info@mdrconstrucciones.com  
Teléfono: +34 123 456 789

@endcomponent