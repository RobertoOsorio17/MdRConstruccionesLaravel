/**
 * VerificationBadge - Badge de verificación rediseñado con tick profesional
 * 
 * @refactored Octubre 2025 - Diseño mejorado con sistema unificado
 */

import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { 
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import designSystem from '@/theme/designSystem';

// Removed - Using designSystem.colors instead

const VerificationBadge = ({ 
    user, 
    size = 'medium', 
    showText = false, 
    variant = 'icon',
    className = '',
    ...props 
}) => {
    const isVerified = user?.is_verified || false;
    const verifiedAt = user?.verified_at;
    
    // Size configurations
    const sizeConfig = {
        small: { iconSize: 18 },
        medium: { iconSize: 22 },
        large: { iconSize: 28 }
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    if (!isVerified) return null; // No mostrar nada si no está verificado

    // Tooltip content
    const tooltipContent = (
        <Box>
            <Typography variant="body2" fontWeight={600} color="inherit" sx={{ mb: 0.5 }}>
                ✓ Usuario Verificado
            </Typography>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.9 }}>
                Este usuario ha sido verificado por MDR Construcciones
            </Typography>
            {verifiedAt && (
                <Typography variant="caption" color="inherit" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                    Verificado el {new Date(verifiedAt).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </Typography>
            )}
        </Box>
    );

    return (
        <Tooltip 
            title={tooltipContent} 
            arrow 
            placement="top"
            slotProps={{
                popper: {
                    sx: {
                        '& .MuiTooltip-tooltip': {
                            bgcolor: designSystem.colors.primary[600],
                            color: 'white',
                            boxShadow: designSystem.shadows.lg,
                            borderRadius: designSystem.borders.radius.md,
                            padding: '12px 16px',
                            maxWidth: 280,
                        },
                        '& .MuiTooltip-arrow': {
                            color: designSystem.colors.primary[600],
                        }
                    }
                }
            }}
        >
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    duration: 0.6
                }}
                whileHover={{ scale: 1.1 }}
                className={className}
                style={{ display: 'inline-flex', alignItems: 'center' }}
                {...props}
            >
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: config.iconSize,
                        height: config.iconSize,
                        borderRadius: '50%',
                        background: designSystem.gradients.primary,
                        boxShadow: `0 0 0 2px white, 0 0 0 3px ${designSystem.colors.primary[500]}, ${designSystem.shadows.colored.primary}`,
                        cursor: 'pointer',
                        transition: designSystem.transitions.presets.allNormal,
                        '&:hover': {
                            transform: 'rotate(10deg)',
                            boxShadow: `0 0 0 2px white, 0 0 0 4px ${designSystem.colors.primary[600]}, ${designSystem.shadows.colored.primaryHover}`,
                        }
                    }}
                >
                    <CheckCircleIcon 
                        sx={{ 
                            fontSize: config.iconSize - 2,
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                        }} 
                    />
                </Box>
                {showText && (
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            ml: 0.5, 
                            fontWeight: 600,
                            color: designSystem.colors.primary[600]
                        }}
                    >
                        Verificado
                    </Typography>
                )}
            </motion.div>
        </Tooltip>
    );
};

export default VerificationBadge;
