import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    LinearProgress,
    useTheme,
    alpha,
    IconButton
} from '@mui/material';
import {
    Warning as WarningIcon,
    ExitToApp as LogoutIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal de advertencia de inactividad
 * Muestra un countdown visual y opciones para extender o cerrar sesión
 */
const InactivityWarningModal = ({ 
    open, 
    remainingSeconds, 
    onExtendSession, 
    onLogout,
    warningDuration = 180 // 3 minutos en segundos
}) => {
    const theme = useTheme();
    const [playSound, setPlaySound] = useState(false);

    // Reproducir sonido de alerta cuando se abre el modal
    useEffect(() => {
        if (open && !playSound) {
            setPlaySound(true);
            // Opcional: reproducir sonido de alerta
            // const audio = new Audio('/sounds/alert.mp3');
            // audio.play().catch(e => console.log('Audio play failed:', e));
        }
        if (!open) {
            setPlaySound(false);
        }
    }, [open]);

    // Calcular porcentaje de progreso
    const progressPercentage = (remainingSeconds / warningDuration) * 100;

    // Formatear tiempo restante en MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Determinar color según tiempo restante
    const getProgressColor = () => {
        if (remainingSeconds > 120) return 'warning'; // > 2 min: amarillo
        if (remainingSeconds > 60) return 'error'; // > 1 min: naranja/rojo
        return 'error'; // < 1 min: rojo intenso
    };

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: alpha(theme.palette.background.paper, 0.98),
                    backdropFilter: 'blur(10px)',
                    border: `2px solid ${theme.palette.warning.main}`,
                    boxShadow: `0 0 40px ${alpha(theme.palette.warning.main, 0.3)}`
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: 'loop'
                        }}
                    >
                        <WarningIcon 
                            sx={{ 
                                fontSize: 40, 
                                color: 'warning.main',
                                filter: `drop-shadow(0 0 8px ${alpha(theme.palette.warning.main, 0.5)})`
                            }} 
                        />
                    </motion.div>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                            Sesión por expirar
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Tu sesión se cerrará por inactividad
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        No hemos detectado actividad en los últimos minutos. Por seguridad, 
                        tu sesión se cerrará automáticamente en:
                    </Typography>

                    {/* Countdown visual grande */}
                    <Box 
                        sx={{ 
                            textAlign: 'center', 
                            py: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
                            borderRadius: 2,
                            mb: 2
                        }}
                    >
                        <motion.div
                            animate={{
                                scale: remainingSeconds <= 10 ? [1, 1.1, 1] : 1
                            }}
                            transition={{
                                duration: 1,
                                repeat: remainingSeconds <= 10 ? Infinity : 0
                            }}
                        >
                            <Typography 
                                variant="h2" 
                                fontWeight="bold"
                                sx={{
                                    color: remainingSeconds <= 30 ? 'error.main' : 'warning.main',
                                    fontFamily: 'monospace',
                                    textShadow: `0 0 20px ${alpha(
                                        remainingSeconds <= 30 ? theme.palette.error.main : theme.palette.warning.main, 
                                        0.3
                                    )}`
                                }}
                            >
                                {formatTime(remainingSeconds)}
                            </Typography>
                        </motion.div>
                        <Typography variant="caption" color="text.secondary">
                            minutos restantes
                        </Typography>
                    </Box>

                    {/* Barra de progreso */}
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={progressPercentage}
                            color={getProgressColor()}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(theme.palette.divider, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    transition: 'transform 1s linear'
                                }
                            }}
                        />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Haz clic en <strong>"Continuar sesión"</strong> para seguir trabajando
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onLogout}
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Cerrar sesión ahora
                </Button>
                <Button
                    onClick={onExtendSession}
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                            boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Continuar sesión
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InactivityWarningModal;

