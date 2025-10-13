import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Tooltip } from '@mui/material';
import {
    Verified,
    EmojiEvents,
    Security,
    Star,
    WorkspacePremium,
    LocalShipping,
    Groups,
    Handshake,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const certifications = [
    {
        icon: <Verified />,
        title: 'ISO 9001',
        subtitle: 'Gestión de Calidad',
        color: '#3b82f6',
        description: 'Certificación internacional de calidad',
    },
    {
        icon: <Security />,
        title: 'ISO 14001',
        subtitle: 'Gestión Ambiental',
        color: '#10b981',
        description: 'Compromiso con el medio ambiente',
    },
    {
        icon: <WorkspacePremium />,
        title: 'CE Marking',
        subtitle: 'Normativa Europea',
        color: '#8b5cf6',
        description: 'Cumplimiento normativa UE',
    },
    {
        icon: <EmojiEvents />,
        title: 'Premio Excelencia',
        subtitle: 'Construcción 2024',
        color: '#f59e0b',
        description: 'Reconocimiento sector construcción',
    },
    {
        icon: <Star />,
        title: '5 Estrellas',
        subtitle: 'Certificado Google',
        color: '#ef4444',
        description: 'Valoración clientes verificados',
    },
    {
        icon: <LocalShipping />,
        title: 'Entrega Garantizada',
        subtitle: '100% Puntual',
        color: '#06b6d4',
        description: 'Cumplimiento de plazos',
    },
    {
        icon: <Groups />,
        title: 'CEPREVEN',
        subtitle: 'Prevención de Riesgos',
        color: '#6366f1',
        description: 'Seguridad laboral certificada',
    },
    {
        icon: <Handshake />,
        title: 'Garantía Total',
        subtitle: 'Hasta 5 Años',
        color: '#ec4899',
        description: 'Garantía extendida en todos los trabajos',
    },
];

const CertificationsBadges = () => {
    return (
        <Box
            sx={{
                py: { xs: 6, md: 8 },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.03,
                    backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3b82f6',
                            fontWeight: 700,
                            letterSpacing: 2,
                        }}
                    >
                        CONFIANZA Y CALIDAD
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
                        Certificaciones y Premios
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
                        Respaldados por las principales instituciones del sector
                    </Typography>
                </Box>
            </motion.div>

            {/* Certifications Grid */}
            <Grid container spacing={3}>
                {certifications.map((cert, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                type: 'spring',
                                stiffness: 100,
                            }}
                            whileHover={{
                                scale: 1.05,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <Tooltip
                                title={cert.description}
                                arrow
                                placement="top"
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            boxShadow: `0 12px 40px ${cert.color}30`,
                                            transform: 'translateY(-4px)',
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 4,
                                            background: `linear-gradient(90deg, ${cert.color} 0%, ${cert.color}DD 100%)`,
                                        },
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            textAlign: 'center',
                                            p: { xs: 2, md: 3 },
                                        }}
                                    >
                                        <motion.div
                                            animate={{
                                                rotate: [0, 5, -5, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 3,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: { xs: 50, md: 60 },
                                                    height: { xs: 50, md: 60 },
                                                    borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${cert.color}20 0%, ${cert.color}10 100%)`,
                                                    mb: 2,
                                                    color: cert.color,
                                                }}
                                            >
                                                {React.cloneElement(cert.icon, {
                                                    sx: { fontSize: { xs: 28, md: 32 } },
                                                })}
                                            </Box>
                                        </motion.div>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: { xs: '0.9rem', md: '1rem' },
                                                mb: 0.5,
                                                color: '#0f172a',
                                            }}
                                        >
                                            {cert.title}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                fontSize: { xs: '0.7rem', md: '0.75rem' },
                                            }}
                                        >
                                            {cert.subtitle}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Tooltip>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Trust Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <Card
                    sx={{
                        mt: 6,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: 'white',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Más de 15 años de excelencia en el sector
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    Reconocidos por las principales instituciones y con la confianza de más de 5,000 clientes satisfechos
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    justifyContent={{ xs: 'center', md: 'flex-end' }}
                                    flexWrap="wrap"
                                    gap={2}
                                >
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight={800}>
                                            500+
                                        </Typography>
                                        <Typography variant="caption">
                                            Proyectos
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight={800}>
                                            98%
                                        </Typography>
                                        <Typography variant="caption">
                                            Satisfacción
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight={800}>
                                            15+
                                        </Typography>
                                        <Typography variant="caption">
                                            Años
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
};

export default CertificationsBadges;
