/**
 * GlassCard Component
 * 
 * Card con efecto glassmorphism reutilizable para toda la aplicación.
 * Usa tokens del design system para consistencia visual.
 * 
 * Props:
 * - children: ReactNode - Contenido del card
 * - variant: string - 'light' | 'medium' | 'strong' | 'dark'
 * - hover: boolean - Activar efectos hover
 * - elevation: number - Nivel de elevación (0-3)
 * - padding: number - Padding usando keys de designSystem.spacing
 * - borderRadius: string - Border radius usando keys de designSystem.borders.radius
 */

import React from 'react';
import { Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import designSystem from '@/theme/designSystem';

const GlassCard = ({
    children,
    variant = 'medium',
    hover = true,
    elevation = 1,
    padding = 4,
    borderRadius = 'xl',
    sx = {},
    ...cardProps
}) => {
    // Mapear variant a glassmorphism preset
    const glassStyles = designSystem.glassmorphism[variant] || designSystem.glassmorphism.medium;

    // Mapear elevation a shadow
    const elevationShadows = {
        0: 'none',
        1: designSystem.shadows.md,
        2: designSystem.shadows.lg,
        3: designSystem.shadows.xl
    };

    const hoverVariants = {
        initial: { y: 0, scale: 1 },
        hover: {
            y: -8,
            scale: 1.02,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <Card
            component={motion.div}
            variants={hover ? hoverVariants : {}}
            initial="initial"
            whileHover={hover ? "hover" : {}}
            sx={{
                ...glassStyles,
                borderRadius: designSystem.borders.radius[borderRadius],
                boxShadow: elevationShadows[elevation],
                transition: designSystem.transitions.presets.allNormal,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': hover ? {
                    boxShadow: designSystem.shadows.colored.primary
                } : {},
                ...sx
            }}
            {...cardProps}
        >
            <CardContent
                sx={{
                    p: designSystem.spacing[padding],
                    '&:last-child': {
                        pb: designSystem.spacing[padding]
                    }
                }}
            >
                {children}
            </CardContent>
        </Card>
    );
};

export default GlassCard;

