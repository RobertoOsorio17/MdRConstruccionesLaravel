import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Card, Stack, Chip } from '@mui/material';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    Phone,
    Architecture,
    Assignment,
    Construction,
    Verified,
} from '@mui/icons-material';

const timelineSteps = [
    {
        phase: 'Fase 1',
        title: 'Consulta Inicial',
        description: 'Contacto inicial para entender tus necesidades y objetivos del proyecto. Análisis de viabilidad y primeras impresiones.',
        icon: <Phone />,
        color: '#3b82f6',
        duration: '1-2 días',
        details: ['Reunión inicial', 'Análisis de necesidades', 'Propuesta preliminar'],
    },
    {
        phase: 'Fase 2',
        title: 'Visita Técnica',
        description: 'Evaluación exhaustiva en sitio para analizar el espacio, tomar medidas precisas y detectar posibles desafíos.',
        icon: <Architecture />,
        color: '#10b981',
        duration: '3-5 días',
        details: ['Inspección del sitio', 'Mediciones precisas', 'Análisis estructural', 'Reportefotográfico'],
    },
    {
        phase: 'Fase 3',
        title: 'Propuesta Detallada',
        description: 'Presentación de presupuesto detallado con planos, especificaciones técnicas y selección de materiales.',
        icon: <Assignment />,
        color: '#8b5cf6',
        duration: '5-7 días',
        details: ['Planos detallados', 'Presupuesto itemizado', 'Cronograma', 'Selección de materiales'],
    },
    {
        phase: 'Fase 4',
        title: 'Ejecución',
        description: 'Desarrollo del proyecto con seguimiento continuo, control de calidad y actualizaciones regulares sobre el progreso.',
        icon: <Construction />,
        color: '#f59e0b',
        duration: 'Variable',
        details: ['Gestión de permisos', 'Construcción/Reforma', 'Control de calidad', 'Seguimiento diario'],
    },
    {
        phase: 'Fase 5',
        title: 'Entrega Final',
        description: 'Revisión final exhaustiva, limpieza completa y entrega del proyecto con toda la documentación y garantías.',
        icon: <Verified />,
        color: '#ec4899',
        duration: '1-2 días',
        details: ['Inspección final', 'Limpieza total', 'Entrega de llaves', 'Documentación y garantías'],
    },
];

const Enhanced3DTimeline = () => {
    const containerRef = useRef(null);
    const [activeStep, setActiveStep] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center'],
    });

    return (
        <Box
            ref={containerRef}
            sx={{
                py: { xs: 6, md: 10 },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: '100%',
                    opacity: 0.03,
                    backgroundImage: 'linear-gradient(180deg, transparent 0%, #3b82f6 100%)',
                }}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <Box sx={{ textAlign: 'center', mb: 8, position: 'relative' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3b82f6',
                            fontWeight: 700,
                            letterSpacing: 2,
                        }}
                    >
                        METODOLOGÍA PROBADA
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            mt: 1,
                            mb: 2,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Proceso de Trabajo
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#64748b',
                            fontWeight: 400,
                            maxWidth: 600,
                            mx: 'auto',
                        }}
                    >
                        De la idea a la realidad en 5 fases estructuradas
                    </Typography>
                </Box>
            </motion.div>

            {/* Timeline */}
            <Box
                sx={{
                    position: 'relative',
                    maxWidth: 1000,
                    mx: 'auto',
                }}
            >
                {/* Center Line */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: { xs: '30px', md: '50%' },
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
                        transform: { md: 'translateX(-50%)' },
                        zIndex: 0,
                    }}
                />

                {/* Animated Progress Line */}
                <motion.div
                    style={{
                        position: 'absolute',
                        left: { xs: '30px', md: '50%' },
                        top: 0,
                        width: 4,
                        background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
                        transformOrigin: 'top',
                        scaleY: scrollYProgress,
                        zIndex: 1,
                    }}
                />

                {/* Steps */}
                <Stack spacing={{ xs: 4, md: 6 }}>
                    {timelineSteps.map((step, index) => {
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-100px' }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                onViewportEnter={() => setActiveStep(index)}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'row', md: isEven ? 'row' : 'row-reverse' },
                                        alignItems: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Content Card */}
                                    <Box
                                        sx={{
                                            flex: 1,
                                            pl: { xs: 2, md: isEven ? 0 : 4 },
                                            pr: { xs: 0, md: isEven ? 4 : 0 },
                                            ml: { xs: '60px', md: 0 },
                                        }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Card
                                                sx={{
                                                    p: 3,
                                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: `2px solid ${step.color}20`,
                                                    boxShadow: `0 8px 32px ${step.color}15`,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: 4,
                                                        background: `linear-gradient(90deg, ${step.color} 0%, ${step.color}CC 100%)`,
                                                    },
                                                }}
                                            >
                                                <Stack spacing={2}>
                                                    {/* Header */}
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Chip
                                                            label={step.phase}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: `${step.color}20`,
                                                                color: step.color,
                                                                fontWeight: 700,
                                                            }}
                                                        />
                                                        <Chip
                                                            label={step.duration}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: step.color,
                                                                color: step.color,
                                                            }}
                                                        />
                                                    </Stack>

                                                    {/* Title */}
                                                    <Typography
                                                        variant="h5"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: '#0f172a',
                                                        }}
                                                    >
                                                        {step.title}
                                                    </Typography>

                                                    {/* Description */}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#64748b',
                                                            lineHeight: 1.7,
                                                        }}
                                                    >
                                                        {step.description}
                                                    </Typography>

                                                    {/* Details */}
                                                    <Stack spacing={0.5}>
                                                        {step.details.map((detail, idx) => (
                                                            <Stack
                                                                key={idx}
                                                                direction="row"
                                                                spacing={1}
                                                                alignItems="center"
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: 6,
                                                                        height: 6,
                                                                        borderRadius: '50%',
                                                                        bgcolor: step.color,
                                                                    }}
                                                                />
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{ color: '#64748b' }}
                                                                >
                                                                    {detail}
                                                                </Typography>
                                                            </Stack>
                                                        ))}
                                                    </Stack>
                                                </Stack>
                                            </Card>
                                        </motion.div>
                                    </Box>

                                    {/* Icon Circle */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: { xs: '12px', md: '50%' },
                                            transform: { md: 'translateX(-50%)' },
                                            zIndex: 2,
                                        }}
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.4,
                                                delay: index * 0.1 + 0.2,
                                                type: 'spring',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: { xs: 60, md: 80 },
                                                    height: { xs: 60, md: 80 },
                                                    borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}DD 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    boxShadow: `0 8px 24px ${step.color}40`,
                                                    border: '4px solid white',
                                                }}
                                            >
                                                {React.cloneElement(step.icon, {
                                                    sx: { fontSize: { xs: 28, md: 36 } },
                                                })}
                                            </Box>
                                        </motion.div>
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
};

export default Enhanced3DTimeline;
