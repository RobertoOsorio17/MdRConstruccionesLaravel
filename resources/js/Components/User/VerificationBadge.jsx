import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { 
    Verified as VerifiedIcon,
    Shield as ShieldIcon,
    Star as StarIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const THEME = {
    primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
    },
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f'
    },
    secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
    }
};

const VerificationBadge = ({ 
    user, 
    size = 'medium', 
    showText = true, 
    variant = 'default',
    className = '',
    ...props 
}) => {
    const isVerified = user?.is_verified || false;
    const verifiedAt = user?.verified_at;
    
    // Size configurations
    const sizeConfig = {
        small: {
            iconSize: 16,
            fontSize: '0.75rem',
            padding: '2px 6px',
            height: 20
        },
        medium: {
            iconSize: 20,
            fontSize: '0.875rem',
            padding: '4px 8px',
            height: 24
        },
        large: {
            iconSize: 24,
            fontSize: '1rem',
            padding: '6px 12px',
            height: 32
        }
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    // Variant configurations
    const variantConfig = {
        default: {
            verified: {
                backgroundColor: `${THEME.primary[500]}15`,
                color: THEME.primary[600],
                borderColor: THEME.primary[200],
                icon: VerifiedIcon
            },
            unverified: {
                backgroundColor: `${THEME.secondary[400]}10`,
                color: THEME.secondary[500],
                borderColor: THEME.secondary[200],
                icon: ShieldIcon
            }
        },
        premium: {
            verified: {
                backgroundColor: `linear-gradient(135deg, ${THEME.primary[500]}20, ${THEME.success[500]}20)`,
                color: THEME.primary[600],
                borderColor: THEME.primary[300],
                icon: StarIcon
            },
            unverified: {
                backgroundColor: `${THEME.secondary[400]}10`,
                color: THEME.secondary[500],
                borderColor: THEME.secondary[200],
                icon: ShieldIcon
            }
        },
        minimal: {
            verified: {
                backgroundColor: 'transparent',
                color: THEME.primary[600],
                borderColor: 'transparent',
                icon: VerifiedIcon
            },
            unverified: {
                backgroundColor: 'transparent',
                color: THEME.secondary[400],
                borderColor: 'transparent',
                icon: ShieldIcon
            }
        }
    };

    const currentVariant = variantConfig[variant] || variantConfig.default;
    const badgeConfig = isVerified ? currentVariant.verified : currentVariant.unverified;
    const IconComponent = badgeConfig.icon;

    // Tooltip content
    const tooltipContent = isVerified ? (
        <Box>
            <Typography variant="body2" fontWeight="bold" color="inherit">
                Usuario Verificado
            </Typography>
            <Typography variant="caption" color="inherit">
                Este usuario ha sido verificado por MDR Construcciones
            </Typography>
            {verifiedAt && (
                <Typography variant="caption" color="inherit" display="block" sx={{ mt: 0.5 }}>
                    Verificado el {new Date(verifiedAt).toLocaleDateString('es-ES')}
                </Typography>
            )}
        </Box>
    ) : (
        <Box>
            <Typography variant="body2" fontWeight="bold" color="inherit">
                Usuario No Verificado
            </Typography>
            <Typography variant="caption" color="inherit">
                Este usuario aún no ha sido verificado
            </Typography>
        </Box>
    );

    if (variant === 'minimal') {
        return (
            <Tooltip title={tooltipContent} arrow placement="top">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={className}
                    {...props}
                >
                    <IconComponent 
                        sx={{ 
                            fontSize: config.iconSize,
                            color: badgeConfig.color,
                            filter: isVerified ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))' : 'none'
                        }} 
                    />
                </motion.div>
            </Tooltip>
        );
    }

    return (
        <Tooltip title={tooltipContent} arrow placement="top">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30,
                    delay: 0.1 
                }}
                className={className}
                {...props}
            >
                <Chip
                    icon={
                        <motion.div
                            animate={isVerified ? { 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            } : {}}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                repeatDelay: 3 
                            }}
                        >
                            <IconComponent sx={{ fontSize: `${config.iconSize}px !important` }} />
                        </motion.div>
                    }
                    label={showText ? (isVerified ? 'Verificado' : 'No Verificado') : ''}
                    size={size}
                    sx={{
                        height: config.height,
                        fontSize: config.fontSize,
                        fontWeight: 600,
                        background: badgeConfig.backgroundColor,
                        color: badgeConfig.color,
                        border: `1px solid ${badgeConfig.borderColor}`,
                        backdropFilter: 'blur(10px)',
                        boxShadow: isVerified 
                            ? `0 4px 12px ${THEME.primary[500]}25, 0 2px 4px ${THEME.primary[500]}15`
                            : `0 2px 8px ${THEME.secondary[500]}15`,
                        '& .MuiChip-icon': {
                            color: 'inherit',
                            marginLeft: '4px'
                        },
                        '& .MuiChip-label': {
                            paddingLeft: showText ? '4px' : 0,
                            paddingRight: '8px',
                            fontWeight: 'inherit'
                        },
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: isVerified 
                                ? `0 6px 16px ${THEME.primary[500]}30, 0 4px 8px ${THEME.primary[500]}20`
                                : `0 4px 12px ${THEME.secondary[500]}20`,
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                />
            </motion.div>
        </Tooltip>
    );
};

export default VerificationBadge;
