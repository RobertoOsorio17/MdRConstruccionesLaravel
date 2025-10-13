/**
 * TrustHighlights Component
 * 
 * Sección de confianza con métricas clave animadas, logos de clientes
 * y certificaciones. Refuerza credibilidad y autoridad.
 * 
 * Props:
 * - metrics: array - Métricas clave [{ label, value, suffix, icon, color }]
 * - clientLogos: array - Logos de clientes [{ name, logo, url }]
 * - certifications: array - Certificaciones [{ name, badge, description }]
 * - service: object - Datos del servicio para tracking
 */

import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Stack,
    Tooltip,
    Avatar
} from '@mui/material';
import {
    TrendingUp,
    EmojiEvents,
    Verified,
    Groups,
    Star,
    CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import designSystem from '@/theme/designSystem';
import SectionContainer from '../Shared/SectionContainer';
import GlassCard from '../Shared/GlassCard';
import AnimatedCounter from '../Shared/AnimatedCounter';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';

const TrustHighlights = ({
    metrics = [],
    clientLogos = [],
    certifications = [],
    service = {}
}) => {
    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.3,
        triggerOnce: true
    });

    // Métricas por defecto
    const defaultMetrics = [
        {
            label: 'Proyectos Completados',
            value: 500,
            suffix: '+',
            icon: <EmojiEvents />,
            color: designSystem.colors.accent.amber
        },
        {
            label: 'Clientes Satisfechos',
            value: 98,
            suffix: '%',
            icon: <Star />,
            color: designSystem.colors.accent.emerald
        },
        {
            label: 'Años de Experiencia',
            value: 15,
            suffix: '+',
            icon: <TrendingUp />,
            color: designSystem.colors.primary[600]
        },
        {
            label: 'Metros Cuadrados',
            value: 125000,
            suffix: ' m²',
            icon: <Groups />,
            color: designSystem.colors.accent.purple
        }
    ];

    const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

    // Animación stagger para las cards
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <SectionContainer
            title="Confianza Respaldada por Resultados"
            subtitle="Más de una década transformando espacios con excelencia y profesionalismo"
            background="secondary"
            spacing={{ top: 10, bottom: 10 }}
            maxWidth="xl"
            centered={true}
            sectionId="trust"
            service={service?.slug}
        >
            {/* Metrics Grid */}
            <motion.div
                ref={ref}
                variants={containerVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
            >
                <Grid container spacing={4} sx={{ mb: designSystem.spacing[8] }}>
                    {displayMetrics.map((metric, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div variants={itemVariants}>
                                <GlassCard
                                    variant="medium"
                                    hover={true}
                                    elevation={2}
                                    padding={6}
                                >
                                    <Stack spacing={2} alignItems="center" textAlign="center">
                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: designSystem.borders.radius.full,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: metric.color || designSystem.colors.primary[100],
                                                color: designSystem.colors.text.inverse,
                                                fontSize: 32,
                                                mb: designSystem.spacing[2]
                                            }}
                                        >
                                            {metric.icon}
                                        </Box>

                                        {/* Counter */}
                                        <AnimatedCounter
                                            value={metric.value}
                                            suffix={metric.suffix || ''}
                                            variant="h3"
                                            fontWeight={800}
                                            sx={{
                                                background: `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.accent.purple} 100%)`,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text'
                                            }}
                                        />

                                        {/* Label */}
                                        <Typography
                                            variant="body1"
                                            fontWeight={600}
                                            color="text.secondary"
                                        >
                                            {metric.label}
                                        </Typography>
                                    </Stack>
                                </GlassCard>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </motion.div>

            {/* Client Logos */}
            {clientLogos.length > 0 && (
                <Box sx={{ mb: designSystem.spacing[8] }}>
                    <Typography
                        variant="h6"
                        textAlign="center"
                        color="text.secondary"
                        sx={{ mb: designSystem.spacing[4] }}
                    >
                        Confían en Nosotros
                    </Typography>
                    <Grid container spacing={3} justifyContent="center" alignItems="center">
                        {clientLogos.map((client, index) => (
                            <Grid item xs={6} sm={4} md={2} key={index}>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Tooltip title={client.name} arrow>
                                        <Box
                                            component="img"
                                            src={client.logo}
                                            alt={client.name}
                                            sx={{
                                                width: '100%',
                                                height: 60,
                                                objectFit: 'contain',
                                                filter: 'grayscale(100%)',
                                                opacity: 0.6,
                                                transition: designSystem.transitions.presets.allNormal,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    filter: 'grayscale(0%)',
                                                    opacity: 1
                                                }
                                            }}
                                        />
                                    </Tooltip>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <Box>
                    <Typography
                        variant="h6"
                        textAlign="center"
                        color="text.secondary"
                        sx={{ mb: designSystem.spacing[4] }}
                    >
                        Certificaciones y Reconocimientos
                    </Typography>
                    <Grid container spacing={3} justifyContent="center">
                        {certifications.map((cert, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <GlassCard variant="light" hover={false} padding={4}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            {/* Badge */}
                                            <Avatar
                                                src={cert.badge}
                                                alt={cert.name}
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    bgcolor: designSystem.colors.primary[100]
                                                }}
                                            >
                                                <Verified sx={{ color: designSystem.colors.primary[600] }} />
                                            </Avatar>

                                            {/* Info */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {cert.name}
                                                </Typography>
                                                {cert.description && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {cert.description}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Check Icon */}
                                            <CheckCircle
                                                sx={{
                                                    color: designSystem.colors.success[600],
                                                    fontSize: 28
                                                }}
                                            />
                                        </Stack>
                                    </GlassCard>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </SectionContainer>
    );
};

export default TrustHighlights;

