import React, { useMemo } from 'react';
import { Box, Tooltip, Chip, useTheme } from '@mui/material';
import { AccessTime as ClockIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useInactivity } from '@/Contexts/InactivityContext';

/**
 * Componente que muestra el tiempo restante antes del cierre de sesión por inactividad
 * Se muestra en el menú superior del panel admin
 * 
 * Características:
 * - Muestra tiempo en formato MM:SS
 * - Cambia de color según el tiempo restante (verde → amarillo → rojo)
 * - Tooltip con información adicional
 * - Animación de pulso cuando queda poco tiempo
 */
const InactivityTimer = () => {
    const theme = useTheme();
    const { remainingTime, isWarningActive, totalTimeout } = useInactivity();

    // Debug: Log para verificar que el componente se renderiza
    React.useEffect(() => {




    }, []);

    React.useEffect(() => {

    }, [remainingTime]);

    // Formatear tiempo en MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calcular porcentaje de tiempo restante
    const percentage = useMemo(() => {
        return (remainingTime / totalTimeout) * 100;
    }, [remainingTime, totalTimeout]);

    // Determinar color según el tiempo restante
    const getColor = () => {
        if (isWarningActive) {
            // Durante la advertencia, usar colores más urgentes
            if (remainingTime <= 30) return 'error'; // Rojo intenso
            if (remainingTime <= 60) return 'error'; // Rojo
            return 'warning'; // Amarillo
        }

        // Antes de la advertencia
        if (percentage > 50) return 'success'; // Verde
        if (percentage > 25) return 'warning'; // Amarillo
        return 'error'; // Rojo
    };

    // Determinar si debe pulsar
    const shouldPulse = remainingTime <= 60 || isWarningActive;

    // Tooltip text
    const tooltipText = useMemo(() => {
        if (isWarningActive) {
            return `⚠️ Advertencia de inactividad: Tu sesión se cerrará en ${formatTime(remainingTime)}`;
        }
        
        const totalMins = Math.floor(totalTimeout / 60);
        return `Tiempo restante de sesión: ${formatTime(remainingTime)} de ${totalMins} minutos`;
    }, [remainingTime, isWarningActive, totalTimeout]);

    // Icono según el estado
    const icon = isWarningActive ? <WarningIcon /> : <ClockIcon />;

    return (
        <Tooltip title={tooltipText} arrow placement="bottom">
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'help'
                }}
            >
                <Chip
                    icon={icon}
                    label={formatTime(remainingTime)}
                    color={getColor()}
                    size="small"
                    variant={isWarningActive ? 'filled' : 'outlined'}
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        minWidth: '90px',
                        animation: shouldPulse ? 'pulse 1.5s ease-in-out infinite' : 'none',
                        '@keyframes pulse': {
                            '0%, 100%': {
                                opacity: 1,
                                transform: 'scale(1)'
                            },
                            '50%': {
                                opacity: 0.8,
                                transform: 'scale(1.05)'
                            }
                        },
                        // Glassmorphism effect
                        backdropFilter: 'blur(10px)',
                        backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${
                            getColor() === 'error' 
                                ? theme.palette.error.main
                                : getColor() === 'warning'
                                ? theme.palette.warning.main
                                : theme.palette.success.main
                        }`,
                        '& .MuiChip-icon': {
                            color: 'inherit'
                        },
                        '& .MuiChip-label': {
                            paddingLeft: '8px',
                            paddingRight: '12px'
                        },
                        // Efecto hover
                        '&:hover': {
                            transform: 'scale(1.05)',
                            transition: 'transform 0.2s ease-in-out'
                        }
                    }}
                />
            </Box>
        </Tooltip>
    );
};

export default InactivityTimer;

