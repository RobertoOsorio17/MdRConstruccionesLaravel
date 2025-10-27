import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import InactivityWarningModal from './InactivityWarningModal';
import { useInactivity } from '@/Contexts/InactivityContext';

/**
 * Sistema de detección de inactividad para el panel de administración
 * 
 * Características:
 * - Monitorea actividad del usuario (mouse, teclado, scroll, touch)
 * - Cierra sesión automáticamente después de X minutos de inactividad
 * - Muestra advertencia Y minutos antes del cierre
 * - Sincroniza con backend mediante heartbeat
 * - Soporta múltiples pestañas (usando localStorage)
 * - Registra cierre de sesión por inactividad en audit logs
 */
const InactivityDetector = ({
    enabled = true,
    inactivityTimeout = 15 * 60 * 1000, // 15 minutos en ms
    warningTime = 3 * 60 * 1000, // 3 minutos antes en ms
    heartbeatInterval = 2 * 60 * 1000, // Heartbeat cada 2 minutos
    debug = false
}) => {
    const [showWarning, setShowWarning] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    // Usar el contexto de inactividad para compartir estado con otros componentes
    const { updateRemainingTime, setWarningActive } = useInactivity();

    // Debug: Log al montar el componente
    useEffect(() => {
        if (debug) console.log('[InactivityDetector] Component mounted with config:', {
            enabled,
            inactivityTimeout,
            warningTime,
            heartbeatInterval,
            debug
        });
    }, []);
    
    // Referencias para timers
    const inactivityTimerRef = useRef(null);
    const warningTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);
    const heartbeatSuppressedRef = useRef(false);
    const lastActivityRef = useRef(Date.now());
    const debounceTimeoutRef = useRef(null); // ✅ FIX: Ref para el timeout del debounce
    
    // Clave para localStorage (sincronización entre pestañas)
    const STORAGE_KEY = 'admin_last_activity';
    const SESSION_ACTIVE_KEY = 'admin_session_active';

    /**
     * Log de debug
     */
    const log = useCallback((...args) => {
        if (debug) {
            console.log('[InactivityDetector]', ...args);
        }
    }, [debug]);

    /**
     * Manejar cierre de sesión
     */
    const handleLogout = useCallback(async (isServerExpired = false) => {
        log('Logging out, server expired:', isServerExpired);
        
        // Limpiar todos los timers
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        
        // Marcar sesión como inactiva en localStorage
        try {
            localStorage.setItem(SESSION_ACTIVE_KEY, 'false');
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            log('localStorage error:', e);
        }
        
        // Registrar logout por inactividad en backend
        if (!isServerExpired) {
            try {
                await axios.post('/admin/logout-inactivity', {
                    reason: 'inactivity_timeout',
                    timestamp: Date.now()
                });
            } catch (error) {
                log('Failed to log inactivity logout:', error);
            }
        }
        
        // ✅ SECURITY FIX: Use message key instead of arbitrary text
        router.post('/logout', {}, {
            onSuccess: () => {
                window.location.href = '/login?message=session_expired_inactivity';
            }
        });
    }, [log]);

    /**
     * Enviar heartbeat al backend para mantener sesión activa
     */
    const sendHeartbeat = useCallback(async () => {
        if (!enabled || heartbeatSuppressedRef.current) {
            return;
        }

        try {
            await axios.post('/admin/heartbeat', {
                timestamp: Date.now()
            });
            log('Heartbeat sent successfully');
        } catch (error) {
            log('Heartbeat failed:', error);

            // Si el heartbeat falla (sesión expirada en backend), cerrar sesión
            if (error.response?.status === 401) {
                handleLogout(true);
            }
            // ✅ FIX: Handle 409 Conflict (concurrent session) - force logout
            else if (error.response?.status === 409) {
                const responseData = error.response?.data;

                if (responseData?.security_alert) {
                    // Security alert - different device detected
                    log('SECURITY ALERT: Concurrent session from different device');

                    // Show alert to user before logout
                    if (window.confirm(
                        `⚠️ ALERTA DE SEGURIDAD\n\n` +
                        `Se ha detectado otra sesión activa desde un dispositivo diferente.\n` +
                        `IP de la otra sesión: ${responseData.other_session_ip || 'desconocida'}\n\n` +
                        `Esto podría indicar que alguien más tiene acceso a tu cuenta.\n\n` +
                        `¿Quieres cerrar TODAS las sesiones por seguridad?`
                    )) {
                        // User wants to close all sessions
                        log('User chose to close all sessions');
                        // TODO: Implement endpoint to close all user sessions
                        handleLogout(true);
                    } else {
                        // User cancelled - just logout this session
                        handleLogout(true);
                    }
                } else {
                    // Regular concurrent session (same device)
                    log('Concurrent session detected (same device), forcing logout');
                    handleLogout(true);
                }
            }
            // Suppress heartbeat on authorization/CSRF failures
            else if (error.response?.status === 403 || error.response?.status === 419) {
                log('Heartbeat suppressed due to authorization/CSRF failure');
                heartbeatSuppressedRef.current = true;
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                }
            }
            // ✅ FIX: Don't throw on other errors, just log them
            else {
                log('Heartbeat error (non-critical):', error.response?.status, error.message);
            }
        }
    }, [enabled, handleLogout, log]);

    /**
     * Actualizar timestamp de última actividad
     */
    const updateLastActivity = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;
        
        // Guardar en localStorage para sincronizar entre pestañas
        try {
            localStorage.setItem(STORAGE_KEY, now.toString());
            localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
        } catch (e) {
            log('localStorage error:', e);
        }
        
        log('Activity detected, last activity updated:', new Date(now).toLocaleTimeString());
    }, [log]);

    /**
     * Resetear todos los timers
     */
    const resetTimers = useCallback(() => {
        log('Resetting all timers');

        // Limpiar timers existentes
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }

        // Ocultar modal de advertencia si está visible
        setShowWarning(false);
        setWarningActive(false);

        // Actualizar última actividad
        updateLastActivity();

        // Resetear tiempo restante al máximo
        const totalSeconds = Math.floor(inactivityTimeout / 1000);
        setRemainingSeconds(totalSeconds);
        updateRemainingTime(totalSeconds);

        // ✅ FIX: No usar setTimeout - la verificación se hace en el interval principal
        // Esto asegura que el timer funcione incluso cuando la pestaña no está activa

    }, [inactivityTimeout, updateLastActivity, updateRemainingTime, setWarningActive, log]);
    /**
     * Extender sesión (resetear timers)
     */
    const handleExtendSession = useCallback(() => {
        log('Session extended by user');
        resetTimers();
        sendHeartbeat(); // Enviar heartbeat inmediatamente
    }, [resetTimers, sendHeartbeat]);

    /**
     * Manejar eventos de actividad del usuario
     */
    const handleActivity = useCallback(() => {
        log('Activity detected by event listener');

        // Si el modal de advertencia está visible, no resetear automáticamente
        // El usuario debe hacer clic en "Continuar sesión"
        if (showWarning) {
            log('Warning modal is visible, ignoring activity');
            return;
        }

        log('Resetting timers due to user activity');
        resetTimers();
    }, [showWarning, resetTimers, log]);

    /**
     * ✅ FIX: Debounced activity handler corregido
     * Usa useRef para mantener el timeout persistente entre renders
     */
    const debouncedActivityHandler = useCallback(() => {
        // Limpiar timeout anterior si existe
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Configurar nuevo timeout
        debounceTimeoutRef.current = setTimeout(() => {
            handleActivity();
        }, 500); // Debounce de 500ms
    }, [handleActivity]);

    /**
     * Sincronizar actividad entre pestañas
     */
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                const lastActivity = parseInt(e.newValue, 10);
                const timeSinceActivity = Date.now() - lastActivity;
                
                log('Activity detected in another tab, time since:', timeSinceActivity);
                
                // Si hay actividad reciente en otra pestaña, resetear timers
                if (timeSinceActivity < 5000) { // Menos de 5 segundos
                    resetTimers();
                }
            }
            
            // Si otra pestaña cerró la sesión, cerrar esta también
            if (e.key === SESSION_ACTIVE_KEY && e.newValue === 'false') {
                log('Session closed in another tab');
                handleLogout(true);
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [resetTimers, handleLogout, log]);

    /**
     * ✅ FIX: Verificación principal basada en timestamps
     * Este interval verifica cada segundo el tiempo transcurrido y ejecuta acciones
     * Funciona correctamente incluso cuando la pestaña no está activa
     */
    useEffect(() => {
        if (!enabled) return;

        const checkInterval = setInterval(() => {
            const timeSinceActivity = Date.now() - lastActivityRef.current;
            const remaining = Math.max(0, Math.floor((inactivityTimeout - timeSinceActivity) / 1000));
            const timeUntilWarning = Math.max(0, Math.floor(((inactivityTimeout - warningTime) - timeSinceActivity) / 1000));

            // Verificar si debemos mostrar advertencia
            if (timeUntilWarning <= 0 && !showWarning) {
                log('Warning time reached (timestamp-based), showing modal');
                setShowWarning(true);
                setWarningActive(true);
            }

            // Verificar si debemos hacer logout
            if (remaining <= 0) {
                log('Inactivity timeout reached (timestamp-based), logging out');
                handleLogout(false);
                return;
            }

            // Actualizar tiempo restante
            if (showWarning) {
                // Durante advertencia, mostrar tiempo hasta logout
                const warningRemaining = Math.max(0, Math.floor((warningTime - (timeSinceActivity - (inactivityTimeout - warningTime))) / 1000));
                setRemainingSeconds(warningRemaining);
                updateRemainingTime(warningRemaining);
            } else {
                // Antes de advertencia, mostrar tiempo total restante
                setRemainingSeconds(remaining);
                updateRemainingTime(remaining);
            }
        }, 1000);

        return () => clearInterval(checkInterval);
    }, [enabled, inactivityTimeout, warningTime, showWarning, updateRemainingTime, setWarningActive, handleLogout, log]);

    /**
     * Configurar event listeners para detectar actividad
     */
    useEffect(() => {
        if (!enabled) {
            log('Inactivity detector disabled');
            return;
        }

        log('Inactivity detector enabled, timeout:', inactivityTimeout / 1000, 'seconds');
        heartbeatSuppressedRef.current = false;

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, debouncedActivityHandler, { passive: true });
        });

        // Iniciar timers
        resetTimers();

        // Iniciar heartbeat interval
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);
        sendHeartbeat(); // Enviar heartbeat inicial

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, debouncedActivityHandler);
            });

            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        };
    }, [enabled, inactivityTimeout, resetTimers, debouncedActivityHandler, sendHeartbeat, heartbeatInterval, log]);

    return (
        <InactivityWarningModal
            open={showWarning}
            remainingSeconds={remainingSeconds}
            onExtendSession={handleExtendSession}
            onLogout={() => handleLogout(false)}
            warningDuration={warningTime / 1000}
        />
    );
};

export default InactivityDetector;
