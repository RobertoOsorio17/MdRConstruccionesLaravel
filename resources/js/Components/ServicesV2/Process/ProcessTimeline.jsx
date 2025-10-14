import React from 'react';
import { Box, Container, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowForward } from '@mui/icons-material';
import designSystem from '@/theme/designSystem';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';
import { trackSectionView } from '@/Utils/trackEvent';
import GlassCard from '../Shared/GlassCard';

/**
 * ProcessTimeline Component
 * 
 * Timeline vertical/horizontal responsive que muestra los pasos del proceso de trabajo.
 * 
 * @param {Array} steps - Array de pasos del proceso
 *   Estructura: [{ 
 *     id: number, 
 *     title: string, 
 *     description: string, 
 *     icon: string (emoji o nombre de icono MUI),
 *     duration: string (opcional),
 *     deliverables: string[] (opcional)
 *   }]
 * @param {string} orientation - 'vertical' | 'horizontal' | 'auto' (default: 'auto')
 * @param {string} service - Slug del servicio para tracking
 */
const ProcessTimeline = ({
    steps = [],
    orientation = 'auto',
    service = ''
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.2,
        onIntersect: () => trackSectionView('process', service)
    });

    // Determinar orientación - siempre horizontal en desktop para aprovechar espacio
    const actualOrientation = orientation === 'auto'
        ? (isMobile ? 'vertical' : 'horizontal')
        : orientation;

    const isVertical = actualOrientation === 'vertical';

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const stepVariants = {
        hidden: { 
            opacity: 0, 
            y: isVertical ? 30 : 0,
            x: isVertical ? 0 : 30
        },
        visible: { 
            opacity: 1, 
            y: 0,
            x: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    if (!steps || steps.length === 0) {
        return null;
    }

    return (
        <Box
            ref={ref}
            sx={{
                py: { xs: designSystem.spacing[10], md: designSystem.spacing[20] },
                background: `linear-gradient(180deg,
                    ${designSystem.colors.surface.secondary} 0%,
                    ${designSystem.colors.primary[50]} 50%,
                    ${designSystem.colors.surface.primary} 100%)`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 30% 20%, ${designSystem.colors.primary[100]}30 0%, transparent 50%),
                                radial-gradient(circle at 70% 80%, ${designSystem.colors.accent.emerald[100]}20 0%, transparent 50%)`,
                    pointerEvents: 'none',
                    zIndex: 0
                }
            }}
        >
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <Typography
                        variant="h2"
                        align="center"
                        sx={{
                            fontWeight: 800,
                            mb: designSystem.spacing[2],
                            color: designSystem.colors.text.primary
                        }}
                    >
                        Nuestro Proceso de Trabajo
                    </Typography>
                    <Typography
                        variant="h6"
                        align="center"
                        sx={{
                            color: designSystem.colors.text.secondary,
                            mb: designSystem.spacing[8],
                            maxWidth: 700,
                            mx: 'auto'
                        }}
                    >
                        Un método probado que garantiza resultados excepcionales en cada proyecto
                    </Typography>
                </motion.div>

                {/* Timeline */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <Stack
                        direction={isVertical ? 'column' : 'row'}
                        spacing={isVertical ? 4 : 3}
                        sx={{
                            position: 'relative',
                            alignItems: isVertical ? 'stretch' : 'flex-start'
                        }}
                    >
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id || index}>
                                <motion.div
                                    variants={stepVariants}
                                    style={{
                                        flex: isVertical ? 'none' : 1,
                                        position: 'relative'
                                    }}
                                >
                                    <GlassCard
                                        variant="medium"
                                        hover={true}
                                        padding={5}
                                        sx={{
                                            height: '100%',
                                            position: 'relative',
                                            borderTop: `5px solid ${designSystem.colors.primary[500]}`,
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: `0 20px 60px rgba(0,0,0,0.15)`,
                                                borderTopColor: designSystem.colors.accent.emerald
                                            }
                                        }}
                                    >
                                        {/* Step Number Badge */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -24,
                                                left: designSystem.spacing[5],
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${designSystem.colors.primary[500]}, ${designSystem.colors.primary[700]})`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                                zIndex: 2,
                                                border: `3px solid ${designSystem.colors.surface.primary}`
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: designSystem.colors.text.inverse,
                                                    fontWeight: 800
                                                }}
                                            >
                                                {index + 1}
                                            </Typography>
                                        </Box>

                                        {/* Icon */}
                                        {step.icon && (
                                            <Box
                                                sx={{
                                                    fontSize: '3rem',
                                                    mb: designSystem.spacing[2],
                                                    mt: designSystem.spacing[2]
                                                }}
                                            >
                                                {step.icon}
                                            </Box>
                                        )}

                                        {/* Title */}
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                mb: designSystem.spacing[2],
                                                color: designSystem.colors.text.primary
                                            }}
                                        >
                                            {step.title}
                                        </Typography>

                                        {/* Duration */}
                                        {step.duration && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'inline-block',
                                                    px: designSystem.spacing[2],
                                                    py: designSystem.spacing[1],
                                                    borderRadius: designSystem.borders.radius.full,
                                                    background: designSystem.colors.accent.amber[100],
                                                    color: designSystem.colors.accent.amber[800],
                                                    fontWeight: 600,
                                                    mb: designSystem.spacing[2]
                                                }}
                                            >
                                                ⏱️ {step.duration}
                                            </Typography>
                                        )}

                                        {/* Description */}
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: designSystem.colors.text.secondary,
                                                mb: step.deliverables ? designSystem.spacing[3] : 0,
                                                lineHeight: 1.7
                                            }}
                                        >
                                            {step.description}
                                        </Typography>

                                        {/* Deliverables */}
                                        {step.deliverables && step.deliverables.length > 0 && (
                                            <Stack spacing={1} sx={{ mt: designSystem.spacing[2] }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: designSystem.colors.text.primary,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    Entregables:
                                                </Typography>
                                                {step.deliverables.map((deliverable, idx) => (
                                                    <Box
                                                        key={idx}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: 1
                                                        }}
                                                    >
                                                        <CheckCircle
                                                            sx={{
                                                                fontSize: '1rem',
                                                                color: designSystem.colors.accent.emerald[500],
                                                                mt: 0.3
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: designSystem.colors.text.secondary,
                                                                lineHeight: 1.5
                                                            }}
                                                        >
                                                            {deliverable}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                    </GlassCard>
                                </motion.div>

                                {/* Arrow Connector (except last item) */}
                                {index < steps.length - 1 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: designSystem.colors.primary[400],
                                            ...(isVertical ? {
                                                my: designSystem.spacing[2]
                                            } : {
                                                mx: designSystem.spacing[2],
                                                mt: designSystem.spacing[8]
                                            })
                                        }}
                                    >
                                        <ArrowForward
                                            sx={{
                                                fontSize: '2rem',
                                                transform: isVertical ? 'rotate(90deg)' : 'none'
                                            }}
                                        />
                                    </Box>
                                )}
                            </React.Fragment>
                        ))}
                    </Stack>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ProcessTimeline;

