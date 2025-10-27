import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Box,
    Alert,
    AlertTitle,
    Button,
    Typography,
    IconButton,
    Chip,
    Stack,
} from '@mui/material';
import {
    Warning as WarningIcon,
    ExitToApp as ExitIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';

export default function ImpersonationBanner() {
    const { impersonation } = usePage().props;
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        if (!impersonation?.expires_at) return;

        const updateTimer = () => {
            const now = new Date();
            const expires = new Date(impersonation.expires_at);
            const diff = expires - now;

            if (diff <= 0) {
                // Session expired, reload to trigger middleware redirect
                window.location.reload();
            } else {
                setTimeRemaining(Math.floor(diff / 1000)); // seconds
            }
        };

        // Update immediately
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [impersonation?.expires_at]);

    useEffect(() => {
        if (!impersonation?.isActive) return;

        const handleBeforeUnload = (e) => {
            // Attempt to terminate session with sendBeacon (non-blocking)
            const formData = new FormData();
            formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.content || '');

            navigator.sendBeacon(
                route('impersonation.stop'),
                formData
            );

            // Fallback: synchronous fetch (blocking)
            fetch(route('impersonation.stop'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'Content-Type': 'application/json',
                },
                keepalive: true,
            }).catch(() => {
                // Silently fail - middleware will handle cleanup
            });
        };

        // Handle page unload (close tab/window or navigate away)
        const handlePageHide = (e) => {
            if (impersonation?.isActive) {
                const formData = new FormData();
                formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.content || '');

                // Use sendBeacon for reliable delivery even when page is closing
                navigator.sendBeacon(
                    route('impersonation.stop'),
                    formData
                );
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [impersonation?.isActive]);

    const handleStopImpersonation = () => {
        router.post(route('impersonation.stop'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
        });
    };

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';

        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!impersonation?.isActive) {
        return null;
    }

    const isExpiringSoon = timeRemaining !== null && timeRemaining < 300; // Less than 5 minutes

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                boxShadow: 3,
            }}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
        >
            <Alert
                severity={isExpiringSoon ? 'error' : 'warning'}
                icon={<WarningIcon fontSize="large" />}
                sx={{
                    borderRadius: 0,
                    py: 1.5,
                    px: 3,
                    '& .MuiAlert-message': {
                        width: '100%',
                    },
                }}
                action={
                    <Button
                        color="inherit"
                        size="small"
                        variant="outlined"
                        startIcon={<ExitIcon />}
                        onClick={handleStopImpersonation}
                        sx={{
                            borderColor: 'currentColor',
                            '&:hover': {
                                borderColor: 'currentColor',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        Volver a Mi Cuenta
                    </Button>
                }
            >
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Box>
                        <AlertTitle sx={{ mb: 0.5, fontWeight: 600 }}>
                            Sesión de Impersonación Activa
                        </AlertTitle>
                        <Typography variant="body2">
                            Viendo la aplicación como{' '}
                            <strong>{impersonation.target?.name}</strong> ({impersonation.target?.email})
                            {' • '}
                            Iniciada por{' '}
                            <strong>{impersonation.impersonator?.name}</strong>
                        </Typography>
                    </Box>

                    <Chip
                        icon={<TimeIcon />}
                        label={`Expira en: ${formatTime(timeRemaining)}`}
                        color={isExpiringSoon ? 'error' : 'warning'}
                        variant="filled"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            animation: isExpiringSoon ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%, 100%': {
                                    opacity: 1,
                                },
                                '50%': {
                                    opacity: 0.7,
                                },
                            },
                        }}
                    />
                </Stack>
            </Alert>
        </Box>
    );
}

