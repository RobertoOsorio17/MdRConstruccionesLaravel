import React, { useState, useEffect } from 'react';
import { Box, Button, Snackbar, Alert, IconButton } from '@mui/material';
import { Close as CloseIcon, GetApp as InstallIcon } from '@mui/icons-material';
import { showPWAInstallPrompt, isPWA } from '@/Utils/registerServiceWorker';
import designSystem from '@/theme/designSystem';

/**
 * PWA Install Prompt Component
 * 
 * Muestra un banner/snackbar invitando al usuario a instalar la PWA.
 * Solo se muestra si:
 * - El navegador soporta PWA
 * - La app no está ya instalada
 * - El usuario no ha rechazado previamente
 */
const InstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Verificar si ya está instalada
        if (isPWA()) {
            setIsInstalled(true);
            return;
        }

        // Verificar si el usuario ya rechazó el prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedDate = new Date(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
            
            // Mostrar de nuevo después de 7 días
            if (daysSinceDismissed < 7) {
                return;
            }
        }

        // Escuchar evento de disponibilidad de instalación
        const handleInstallAvailable = () => {
            setShowPrompt(true);
        };

        const handleInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
        };

        window.addEventListener('pwa-install-available', handleInstallAvailable);
        window.addEventListener('pwa-installed', handleInstalled);

        return () => {
            window.removeEventListener('pwa-install-available', handleInstallAvailable);
            window.removeEventListener('pwa-installed', handleInstalled);
        };
    }, []);

    const handleInstall = async () => {
        const accepted = await showPWAInstallPrompt();
        
        if (accepted) {
            setShowPrompt(false);
        } else {
            handleDismiss();
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    };

    if (isInstalled || !showPrompt) {
        return null;
    }

    return (
        <Snackbar
            open={showPrompt}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{
                bottom: { xs: 80, md: 24 }, // Evitar conflicto con StickyCTA
                '& .MuiSnackbarContent-root': {
                    minWidth: { xs: '90vw', sm: 'auto' }
                }
            }}
        >
            <Alert
                severity="info"
                variant="filled"
                icon={<InstallIcon />}
                action={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleInstall}
                            sx={{
                                fontWeight: 'bold',
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                                }
                            }}
                        >
                            Instalar
                        </Button>
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={handleDismiss}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                }
                sx={{
                    background: `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.primary[800]} 100%)`,
                    boxShadow: designSystem.shadows.xl,
                    '& .MuiAlert-message': {
                        fontSize: '0.95rem',
                        fontWeight: 500
                    }
                }}
            >
                Instala MDR Construcciones para acceso rápido y funcionalidad offline
            </Alert>
        </Snackbar>
    );
};

export default InstallPrompt;

