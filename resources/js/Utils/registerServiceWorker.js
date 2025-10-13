/**
 * Service Worker Registration
 * 
 * Registra el Service Worker para habilitar funcionalidades PWA:
 * - Caché de recursos
 * - Funcionamiento offline
 * - Instalación en dispositivo
 */

export const registerServiceWorker = () => {
    // Solo registrar en producción
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });

                console.log('[SW] Service Worker registered successfully:', registration.scope);

                // Manejar actualizaciones del Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Hay una nueva versión disponible
                            console.log('[SW] New version available');
                            
                            // Mostrar notificación al usuario (opcional)
                            if (window.confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        }
                    });
                });

                // Recargar cuando el Service Worker toma control
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                        refreshing = true;
                        window.location.reload();
                    }
                });

            } catch (error) {
                console.error('[SW] Service Worker registration failed:', error);
            }
        });
    }
};

/**
 * Unregister Service Worker
 * Útil para desarrollo o debugging
 */
export const unregisterServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
            await registration.unregister();
            console.log('[SW] Service Worker unregistered');
        }
        
        // Limpiar cachés
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('[SW] Caches cleared');
        }
    }
};

/**
 * Check if app is running as PWA
 */
export const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
};

/**
 * Prompt user to install PWA
 */
let deferredPrompt = null;

export const setupPWAInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir el prompt automático
        e.preventDefault();
        
        // Guardar el evento para usarlo después
        deferredPrompt = e;
        
        console.log('[PWA] Install prompt available');
        
        // Disparar evento personalizado para que la UI pueda mostrar botón de instalación
        window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App installed successfully');
        deferredPrompt = null;
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
};

/**
 * Show PWA install prompt
 */
export const showPWAInstallPrompt = async () => {
    if (!deferredPrompt) {
        console.log('[PWA] Install prompt not available');
        return false;
    }

    // Mostrar el prompt
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('[PWA] User choice:', outcome);
    
    // Limpiar el prompt
    deferredPrompt = null;
    
    return outcome === 'accepted';
};

/**
 * Check for Service Worker updates
 */
export const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
            await registration.update();
            console.log('[SW] Checked for updates');
        }
    }
};

/**
 * Clear all caches
 */
export const clearAllCaches = async () => {
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[SW] All caches cleared');
        
        // Notificar al Service Worker
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        }
    }
};

export default {
    registerServiceWorker,
    unregisterServiceWorker,
    isPWA,
    setupPWAInstallPrompt,
    showPWAInstallPrompt,
    checkForUpdates,
    clearAllCaches
};

