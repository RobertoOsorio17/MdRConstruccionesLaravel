# Notification Sound

## Archivo Requerido

Coloca un archivo de sonido llamado `notification.mp3` en este directorio.

## Recomendaciones

- **Formato:** MP3 (compatible con todos los navegadores)
- **Duración:** 0.5 - 2 segundos
- **Volumen:** Moderado (no muy alto)
- **Tipo:** Sonido sutil y profesional (ding, chime, bell)

## Fuentes Gratuitas

Puedes descargar sonidos gratuitos de:

1. **Freesound.org** - https://freesound.org/
   - Busca: "notification", "ding", "chime", "bell"
   - Licencia: Creative Commons

2. **Zapsplat.com** - https://www.zapsplat.com/
   - Categoría: UI Sounds > Notifications
   - Licencia: Gratuita con atribución

3. **Mixkit.co** - https://mixkit.co/free-sound-effects/notification/
   - Sonidos de notificación gratuitos
   - Licencia: Gratuita sin atribución

## Ejemplo de Sonido Recomendado

**Nombre:** "Subtle Notification Chime"
**Características:**
- Duración: 1 segundo
- Tono: Agudo pero suave
- Volumen: Medio-bajo
- Efecto: Profesional y no intrusivo

## Alternativa: Usar Data URI

Si no quieres usar un archivo externo, puedes usar un data URI en el componente:

```javascript
const notificationSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLZiTYIGWi77OeeSwwMUKXi8LdjHAU5kdXyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgc7y2Yk2CBlou+znmksLDFCl4vC3YxwFOZHV8sx5LAUkd8fw3ZBAC...';
```

## Nota

El componente `NotificationCenter.jsx` ya está configurado para usar el archivo:
```javascript
<audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
```

Si el archivo no existe, el sonido simplemente no se reproducirá (sin errores).

