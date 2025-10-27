/**
 * SectionContainer Component
 * 
 * Contenedor reutilizable para secciones de la landing con espaciado consistente,
 * animaciones de reveal y soporte para fondos alternos.
 * 
 * Props:
 * - children: ReactNode - Contenido de la sección
 * - title: string - Título de la sección (opcional)
 * - subtitle: string - Subtítulo de la sección (opcional)
 * - background: string - 'primary' | 'secondary' | 'gradient' | 'transparent'
 * - spacing: object - { top, bottom } usando keys de designSystem.spacing
 * - maxWidth: string - 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * - reveal: boolean - Activar animación de reveal al scroll
 * - centered: boolean - Centrar título y subtítulo
 */

import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import designSystem from '@/theme/designSystem';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';
import { trackSectionView } from '@/Utils/analytics';

const SectionContainer = ({
    children,
    title = null,
    subtitle = null,
    background = 'transparent',
    spacing = { top: 8, bottom: 8 },
    maxWidth = 'lg',
    reveal = true,
    centered = false,
    sectionId = null,
    service = null
}) => {
    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.2,
        triggerOnce: true,
        onIntersect: () => {
            if (sectionId && service) {
                trackSectionView(sectionId, service);
            }
        }
    });

    // Mapear background a estilos
    const getBackgroundStyles = () => {
        switch (background) {
            case 'primary':
                return {
                    bgcolor: designSystem.colors.surface.primary
                };
            case 'secondary':
                return {
                    bgcolor: designSystem.colors.surface.secondary
                };
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${designSystem.colors.primary[50]} 0%, ${designSystem.colors.surface.secondary} 100%)`
                };
            case 'dark':
                return {
                    bgcolor: designSystem.colors.surface.dark.primary,
                    color: designSystem.colors.text.inverse
                };
            default:
                return {
                    bgcolor: 'transparent'
                };
        }
    };

    // Animación de reveal
    const revealVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <Box
            ref={ref}
            component="section"
            sx={{
                ...getBackgroundStyles(),
                py: {
                    xs: designSystem.spacing[spacing.top] || designSystem.spacing[6],
                    md: designSystem.spacing[spacing.bottom] || designSystem.spacing[8]
                },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth={maxWidth}>
                <motion.div
                    initial={reveal ? 'hidden' : 'visible'}
                    animate={reveal && isVisible ? 'visible' : 'hidden'}
                    variants={revealVariants}
                >
                    {/* Header */}
                    {(title || subtitle) && (
                        <Box
                            sx={{
                                mb: designSystem.spacing[6],
                                textAlign: centered ? 'center' : 'left'
                            }}
                        >
                            {title && (
                                <Typography
                                    variant="h3"
                                    component="h2"
                                    sx={{
                                        fontWeight: 700,
                                        mb: subtitle ? designSystem.spacing[2] : 0,
                                        color: background === 'dark' 
                                            ? designSystem.colors.text.inverse 
                                            : designSystem.colors.text.primary
                                    }}
                                >
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: background === 'dark'
                                            ? designSystem.colors.text.inverse
                                            : designSystem.colors.text.secondary,
                                        maxWidth: centered ? 800 : '100%',
                                        mx: centered ? 'auto' : 0
                                    }}
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Content */}
                    {children}
                </motion.div>
            </Container>
        </Box>
    );
};

export default SectionContainer;

