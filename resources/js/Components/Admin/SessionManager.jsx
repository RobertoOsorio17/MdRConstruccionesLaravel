import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    LinearProgress,
    Alert,
    IconButton,
    Snackbar,
    Chip
} from '@mui/material';
import {
    Warning,
    Timer,
    Security,
    Refresh,
    Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';

const SessionManager = ({ user }) => {
    const [sessionData, setSessionData] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isExtending, setIsExtending] = useState(false);
    const [showExtendedNotice, setShowExtendedNotice] = useState(false);

    // Session timeout configuration (in seconds)
    const SESSION_TIMEOUT = 30 * 60; // 30 minutes
    const WARNING_THRESHOLD = 5 * 60; // 5 minutes warning

    // Check session status
    const checkSessionStatus = useCallback(async () => {
        try {
            const response = await fetch('/admin/auth/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                setSessionData(data);
                
                // Calculate time remaining
                if (data.session?.expires_at) {
                    const expiresAt = new Date(data.session.expires_at);
                    const now = new Date();
                    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
                    
                    setTimeRemaining(remaining);
                    setShowWarning(remaining <= WARNING_THRESHOLD && remaining > 0);
                }
            } else if (response.status === 401) {
                // Session expired, redirect to login
                router.visit('/admin/login');
            }
        } catch (error) {
            console.error('Error checking session status:', error);
        }
    }, []);

    // Extend session
    const extendSession = async () => {
        setIsExtending(true);
        
        try {
            const response = await fetch('/admin/auth/extend-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                setShowWarning(false);
                setShowExtendedNotice(true);
                
                // Update session data
                await checkSessionStatus();
                
                setTimeout(() => setShowExtendedNotice(false), 3000);
            } else {
                console.error('Failed to extend session');
            }
        } catch (error) {
            console.error('Error extending session:', error);
        } finally {
            setIsExtending(false);
        }
    };

    // Format time remaining
    const formatTimeRemaining = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const getProgressPercentage = () => {
        return Math.max(0, (timeRemaining / WARNING_THRESHOLD) * 100);
    };

    // Check session status periodically
    useEffect(() => {
        if (!user) return;

        checkSessionStatus();
        
        const interval = setInterval(checkSessionStatus, 30000); // Check every 30 seconds
        
        return () => clearInterval(interval);
    }, [user, checkSessionStatus]);

    // Update countdown timer
    useEffect(() => {
        if (!showWarning || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    // Session expired
                    router.visit('/admin/login');
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showWarning, timeRemaining]);

    if (!user || !sessionData) return null;

    return (
        <>
            {/* Session Warning Dialog */}
            <AnimatePresence>
                {showWarning && (
                    <Dialog
                        open={showWarning}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 193, 7, 0.3)',
                                borderRadius: 3,
                                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                            }
                        }}
                    >
                        <DialogTitle sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                            borderBottom: '1px solid rgba(255, 193, 7, 0.2)'
                        }}>
                            <Warning color="warning" />
                            <Typography variant="h6" fontWeight="bold">
                                Sesión por Expirar
                            </Typography>
                        </DialogTitle>
                        
                        <DialogContent sx={{ pt: 3 }}>
                            <Alert 
                                severity="warning" 
                                sx={{ mb: 3 }}
                                icon={<Timer />}
                            >
                                Tu sesión de administrador expirará en{' '}
                                <strong>{formatTimeRemaining(timeRemaining)}</strong>
                            </Alert>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Tiempo restante:
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={getProgressPercentage()}
                                    color="warning"
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: 'rgba(255, 193, 7, 0.2)'
                                    }}
                                />
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                                Por seguridad, las sesiones de administrador tienen un tiempo límite.
                                Puedes extender tu sesión o serás redirigido al login automáticamente.
                            </Typography>
                        </DialogContent>
                        
                        <DialogActions sx={{ p: 3, gap: 1 }}>
                            <Button
                                onClick={() => router.visit('/admin/login')}
                                color="inherit"
                                variant="outlined"
                            >
                                Cerrar Sesión
                            </Button>
                            <Button
                                onClick={extendSession}
                                variant="contained"
                                color="warning"
                                disabled={isExtending}
                                startIcon={isExtending ? <Refresh className="animate-spin" /> : <Security />}
                            >
                                {isExtending ? 'Extendiendo...' : 'Extender Sesión'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Session Extended Notice */}
            <Snackbar
                open={showExtendedNotice}
                autoHideDuration={3000}
                onClose={() => setShowExtendedNotice(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setShowExtendedNotice(false)}
                    severity="success"
                    variant="filled"
                    sx={{
                        backgroundColor: 'rgba(16, 185, 129, 0.9)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    Sesión extendida exitosamente
                </Alert>
            </Snackbar>

            {/* Session Info Chip (for debugging/admin info) */}
            {process.env.NODE_ENV === 'development' && sessionData && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        left: 16,
                        zIndex: 1000
                    }}
                >
                    <Chip
                        icon={<Timer />}
                        label={`Sesión: ${formatTimeRemaining(timeRemaining)}`}
                        variant="outlined"
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)'
                        }}
                    />
                </Box>
            )}
        </>
    );
};

export default SessionManager;
