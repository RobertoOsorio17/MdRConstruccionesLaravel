import React from 'react';
import { Box, Container, Typography, Grid, Button, Stack, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Verified, Security, ThumbUp, EmojiEvents, CheckCircle } from '@mui/icons-material';
import designSystem from '@/theme/designSystem';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';
import { trackSectionView, trackCTAClick } from '@/Utils/analytics';
import GlassCard from '../Shared/GlassCard';

/**
 * GuaranteesBlock Component
 * 
 * Grid de garantías con iconos de seguridad, badges de certificación y CTA de confianza.
 * 
 * @param {Array} guarantees - Array de garantías
 *   Estructura: [{ 
 *     id: number, 
 *     title: string, 
 *     description: string, 
 *     icon: string (nombre de icono MUI o emoji),
 *     badge: string (opcional)
 *   }]
 * @param {Object} ctaConfig - Configuración del CTA final
 * @param {Function} onCTAClick - Handler para el CTA
 * @param {string} service - Slug del servicio para tracking
 */
const GuaranteesBlock = ({ 
    guarantees = [], 
    ctaConfig = {},
    onCTAClick = () => {},
    service = ''
}) => {
    const theme = useTheme();
    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.2,
        onIntersect: () => trackSectionView('guarantees', service)
    });

    // Iconos predefinidos
    const iconMap = {
        'Verified': Verified,
        'Security': Security,
        'ThumbUp': ThumbUp,
        'EmojiEvents': EmojiEvents,
        'CheckCircle': CheckCircle
    };

    // Garantías por defecto si no se proporcionan
    const defaultGuarantees = [
        {
            id: 1,
            title: 'Garantía de Calidad',
            description: 'Todos nuestros trabajos están respaldados por garantía extendida de hasta 10 años.',
            icon: 'Verified',
            badge: '10 años'
        },
        {
            id: 2,
            title: 'Seguro de Responsabilidad',
            description: 'Cobertura completa de seguro de responsabilidad civil y daños.',
            icon: 'Security',
            badge: 'Asegurado'
        },
        {
            id: 3,
            title: 'Satisfacción Garantizada',
            description: 'Si no quedas satisfecho, trabajamos hasta que lo estés. Sin costo adicional.',
            icon: 'ThumbUp',
            badge: '100%'
        },
        {
            id: 4,
            title: 'Certificaciones Oficiales',
            description: 'Cumplimos con todas las normativas y certificaciones del sector.',
            icon: 'EmojiEvents',
            badge: 'ISO 9001'
        }
    ];

    const displayGuarantees = guarantees.length > 0 ? guarantees : defaultGuarantees;

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    const handleCTA = () => {
        trackCTAClick('guarantee_cta', ctaConfig.text || 'Solicitar Información', service);
        onCTAClick();
    };

    return (
        <Box
            ref={ref}
            sx={{
                py: { xs: designSystem.spacing[10], md: designSystem.spacing[20] },
                background: `linear-gradient(135deg,
                    ${designSystem.colors.primary[50]} 0%,
                    ${designSystem.colors.accent.emerald[50]} 50%,
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
                    background: `radial-gradient(circle at 20% 30%, ${designSystem.colors.accent.emerald[100]}40 0%, transparent 50%),
                                radial-gradient(circle at 80% 70%, ${designSystem.colors.primary[100]}30 0%, transparent 50%)`,
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
                        Nuestras Garantías
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
                        Trabajamos con total transparencia y respaldamos cada proyecto con garantías sólidas
                    </Typography>
                </motion.div>

                {/* Guarantees Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <Grid container spacing={5} sx={{ mb: designSystem.spacing[10] }}>
                        {displayGuarantees.map((guarantee, index) => {
                            const IconComponent = iconMap[guarantee.icon] || CheckCircle;
                            
                            return (
                                <Grid item xs={12} sm={6} md={3} key={guarantee.id || index}>
                                    <motion.div variants={itemVariants}>
                                        <GlassCard
                                            variant="medium"
                                            hover={true}
                                            padding={5}
                                            sx={{
                                                height: '100%',
                                                textAlign: 'center',
                                                position: 'relative',
                                                borderTop: `5px solid ${designSystem.colors.accent.emerald[500]}`,
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-12px) scale(1.02)',
                                                    boxShadow: `0 24px 64px rgba(0,0,0,0.15)`,
                                                    borderTopColor: designSystem.colors.accent.emerald[600],
                                                    '& .guarantee-icon': {
                                                        transform: 'scale(1.1) rotate(5deg)',
                                                        boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
                                                    }
                                                }
                                            }}
                                        >
                                            {/* Badge */}
                                            {guarantee.badge && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -16,
                                                        right: designSystem.spacing[3],
                                                        px: designSystem.spacing[3],
                                                        py: designSystem.spacing[1.5],
                                                        borderRadius: designSystem.borders.radius.full,
                                                        background: `linear-gradient(135deg, ${designSystem.colors.accent.emerald[500]}, ${designSystem.colors.accent.emerald[700]})`,
                                                        color: designSystem.colors.text.inverse,
                                                        fontSize: '0.875rem',
                                                        fontWeight: 800,
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                                        border: `2px solid ${designSystem.colors.surface.primary}`
                                                    }}
                                                >
                                                    {guarantee.badge}
                                                </Box>
                                            )}

                                            {/* Icon */}
                                            <Box
                                                className="guarantee-icon"
                                                sx={{
                                                    width: 96,
                                                    height: 96,
                                                    borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${designSystem.colors.accent.emerald[100]}, ${designSystem.colors.accent.emerald[300]})`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto',
                                                    mb: designSystem.spacing[4],
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                <IconComponent
                                                    sx={{
                                                        fontSize: '3rem',
                                                        color: designSystem.colors.accent.emerald[700]
                                                    }}
                                                />
                                            </Box>

                                            {/* Title */}
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: designSystem.spacing[2],
                                                    color: designSystem.colors.text.primary
                                                }}
                                            >
                                                {guarantee.title}
                                            </Typography>

                                            {/* Description */}
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: designSystem.colors.text.secondary,
                                                    lineHeight: 1.7
                                                }}
                                            >
                                                {guarantee.description}
                                            </Typography>
                                        </GlassCard>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <GlassCard
                        variant="strong"
                        padding={8}
                        sx={{
                            textAlign: 'center',
                            background: `linear-gradient(135deg,
                                ${designSystem.colors.primary[500]},
                                ${designSystem.colors.accent.purple},
                                ${designSystem.colors.primary[700]})`,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                                pointerEvents: 'none'
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 900,
                                    mb: designSystem.spacing[3],
                                    color: designSystem.colors.text.inverse,
                                    fontSize: { xs: '1.75rem', md: '2.5rem' }
                                }}
                            >
                                {ctaConfig.title || '¿Listo para empezar tu proyecto?'}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: designSystem.colors.text.inverse,
                                    opacity: 0.95,
                                    mb: designSystem.spacing[6],
                                    maxWidth: 700,
                                    mx: 'auto',
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}
                            >
                                {ctaConfig.subtitle || 'Contáctanos hoy y descubre cómo podemos ayudarte a alcanzar tus objetivos con total garantía y profesionalismo.'}
                            </Typography>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={3}
                                sx={{
                                    justifyContent: 'center'
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleCTA}
                                    sx={{
                                        background: designSystem.colors.text.inverse,
                                        color: designSystem.colors.primary[700],
                                        fontWeight: 800,
                                        px: designSystem.spacing[8],
                                        py: designSystem.spacing[3],
                                        fontSize: '1.125rem',
                                        borderRadius: designSystem.borders.radius.full,
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                                        '&:hover': {
                                            background: designSystem.colors.surface.primary,
                                            transform: 'translateY(-4px) scale(1.05)',
                                            boxShadow: '0 16px 56px rgba(0,0,0,0.4)'
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {ctaConfig.text || 'Solicitar Información'}
                                </Button>
                            </Stack>
                        </Box>
                    </GlassCard>
                </motion.div>
            </Container>
        </Box>
    );
};

export default GuaranteesBlock;

