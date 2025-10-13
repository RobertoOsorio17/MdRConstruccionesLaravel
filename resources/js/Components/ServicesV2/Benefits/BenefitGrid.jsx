/**
 * BenefitGrid Component
 * 
 * Grid de beneficios del servicio con iconografía personalizada,
 * títulos impactantes, datos cuantificables y microcopy persuasivo.
 * 
 * Props:
 * - benefits: array - Beneficios [{ icon, title, description, metric, color }]
 * - columns: number - Número de columnas (2, 3, 4)
 * - service: object - Datos del servicio para tracking
 */

import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Stack
} from '@mui/material';
import {
    Speed,
    Security,
    Savings,
    EmojiEvents,
    VerifiedUser,
    TrendingUp,
    AutoAwesome,
    Handshake
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import designSystem from '@/theme/designSystem';
import SectionContainer from '../Shared/SectionContainer';
import GlassCard from '../Shared/GlassCard';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';

const BenefitGrid = ({
    benefits = [],
    columns = 3,
    service = {}
}) => {
    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.2,
        triggerOnce: true
    });

    // Beneficios por defecto
    const defaultBenefits = [
        {
            icon: <Speed />,
            title: 'Entrega Rápida',
            description: 'Cumplimos plazos sin comprometer calidad. Metodología ágil y equipos especializados.',
            metric: '95% a tiempo',
            color: designSystem.colors.accent.emerald
        },
        {
            icon: <Security />,
            title: 'Garantía Total',
            description: 'Respaldamos nuestro trabajo con garantías extendidas y seguros completos.',
            metric: '10 años',
            color: designSystem.colors.primary[600]
        },
        {
            icon: <Savings />,
            title: 'Mejor Precio',
            description: 'Optimizamos recursos sin sacrificar estándares. Transparencia en cada presupuesto.',
            metric: 'Hasta 30% ahorro',
            color: designSystem.colors.accent.amber
        },
        {
            icon: <EmojiEvents />,
            title: 'Calidad Premium',
            description: 'Materiales certificados y acabados de primera. Excelencia en cada detalle.',
            metric: 'ISO 9001',
            color: designSystem.colors.accent.purple
        },
        {
            icon: <VerifiedUser />,
            title: 'Equipo Certificado',
            description: 'Profesionales con formación continua y certificaciones internacionales.',
            metric: '100% certificados',
            color: designSystem.colors.info[600]
        },
        {
            icon: <Handshake />,
            title: 'Atención Personalizada',
            description: 'Gestor dedicado para tu proyecto. Comunicación directa y transparente.',
            metric: '24/7 disponible',
            color: designSystem.colors.success[600]
        }
    ];

    const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;

    // Calcular columnas responsive
    const gridColumns = {
        xs: 12,
        sm: columns === 2 ? 6 : 12,
        md: columns === 4 ? 6 : 12 / columns,
        lg: 12 / columns
    };

    // Animación stagger
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
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <SectionContainer
            title="¿Por Qué Elegirnos?"
            subtitle="Beneficios que marcan la diferencia en cada proyecto"
            background="primary"
            spacing={{ top: 10, bottom: 10 }}
            maxWidth="xl"
            centered={true}
            sectionId="benefits"
            service={service?.slug}
        >
            <motion.div
                ref={ref}
                variants={containerVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
            >
                <Grid container spacing={4}>
                    {displayBenefits.map((benefit, index) => (
                        <Grid item {...gridColumns} key={index}>
                            <motion.div variants={itemVariants}>
                                <GlassCard
                                    variant="medium"
                                    hover={true}
                                    elevation={2}
                                    padding={6}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 4,
                                            background: `linear-gradient(90deg, ${benefit.color || designSystem.colors.primary[600]} 0%, ${designSystem.colors.accent.purple} 100%)`,
                                            opacity: 0,
                                            transition: designSystem.transitions.presets.allNormal
                                        },
                                        '&:hover::before': {
                                            opacity: 1
                                        }
                                    }}
                                >
                                    <Stack spacing={3} sx={{ height: '100%' }}>
                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                width: 72,
                                                height: 72,
                                                borderRadius: designSystem.borders.radius.xl,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `linear-gradient(135deg, ${benefit.color || designSystem.colors.primary[600]} 0%, ${benefit.color || designSystem.colors.primary[700]} 100%)`,
                                                color: designSystem.colors.text.inverse,
                                                fontSize: 36,
                                                boxShadow: `0 8px 24px ${benefit.color || designSystem.colors.primary[600]}40`,
                                                transition: designSystem.transitions.presets.allNormal,
                                                '&:hover': {
                                                    transform: 'scale(1.1) rotate(5deg)'
                                                }
                                            }}
                                        >
                                            {benefit.icon}
                                        </Box>

                                        {/* Title */}
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            sx={{
                                                color: designSystem.colors.text.primary
                                            }}
                                        >
                                            {benefit.title}
                                        </Typography>

                                        {/* Description */}
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{
                                                flex: 1,
                                                lineHeight: 1.7
                                            }}
                                        >
                                            {benefit.description}
                                        </Typography>

                                        {/* Metric */}
                                        {benefit.metric && (
                                            <Box
                                                sx={{
                                                    mt: 'auto',
                                                    pt: designSystem.spacing[3],
                                                    borderTop: `1px solid ${designSystem.colors.border.light}`
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <AutoAwesome
                                                        sx={{
                                                            color: benefit.color || designSystem.colors.primary[600],
                                                            fontSize: 20
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={700}
                                                        sx={{
                                                            color: benefit.color || designSystem.colors.primary[600]
                                                        }}
                                                    >
                                                        {benefit.metric}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        )}
                                    </Stack>
                                </GlassCard>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </motion.div>

            {/* Bottom CTA */}
            <Box
                sx={{
                    mt: designSystem.spacing[8],
                    textAlign: 'center',
                    p: designSystem.spacing[6],
                    borderRadius: designSystem.borders.radius['2xl'],
                    background: `linear-gradient(135deg, ${designSystem.colors.primary[50]} 0%, ${designSystem.colors.accent.purple}20 100%)`,
                    border: `1px solid ${designSystem.colors.border.light}`
                }}
            >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    ¿Listo para transformar tu proyecto?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Descubre cómo podemos ayudarte a alcanzar tus objetivos
                </Typography>
            </Box>
        </SectionContainer>
    );
};

export default BenefitGrid;

