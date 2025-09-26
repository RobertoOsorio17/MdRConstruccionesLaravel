import React from 'react';
import {
    Box,
    Container,
    Typography,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Search as SearchIcon,
    Calculate as CalculateIcon,
    Build as BuildIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import AnimatedSection from './AnimatedSection';

const ProcessSection = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const steps = [
        {
            label: '1. Visita Gratuita',
            description: 'Nos desplazamos a tu domicilio para evaluar el proyecto y entender tus necesidades específicas.',
            icon: <SearchIcon sx={{ fontSize: 40 }} />,
            details: [
                'Análisis detallado del espacio',
                'Asesoramiento personalizado',
                'Mediciones precisas',
                'Sin compromiso'
            ]
        },
        {
            label: '2. Presupuesto Detallado',
            description: 'Elaboramos un presupuesto cerrado con todos los materiales, plazos y acabados incluidos.',
            icon: <CalculateIcon sx={{ fontSize: 40 }} />,
            details: [
                'Presupuesto cerrado sin sorpresas',
                'Calidades y marcas especificadas',
                'Planificación temporal detallada',
                'Garantía por escrito'
            ]
        },
        {
            label: '3. Ejecución de Obra',
            description: 'Nuestro equipo especializado ejecuta la reforma con la máxima calidad y cumpliendo los plazos.',
            icon: <BuildIcon sx={{ fontSize: 40 }} />,
            details: [
                'Equipo propio cualificado',
                'Supervisión constante',
                'Materiales de primera calidad',
                'Cumplimiento de plazos'
            ]
        },
        {
            label: '4. Entrega y Garantía',
            description: 'Entregamos tu reforma terminada con 2 años de garantía y servicio post-venta.',
            icon: <CheckIcon sx={{ fontSize: 40 }} />,
            details: [
                'Limpieza final incluida',
                'Revisión de calidad',
                'Garantía de 2 años',
                'Servicio post-venta'
            ]
        }
    ];

    return (
        <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
            <Container maxWidth="lg">
                <AnimatedSection direction="up" delay={0.2}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h2" gutterBottom>
                            Nuestro Proceso de Trabajo
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                            Un proceso probado y transparente que garantiza resultados excepcionales
                            en cada proyecto que realizamos.
                        </Typography>
                    </Box>
                </AnimatedSection>

                {isMobile ? (
                    // Mobile: Vertical stepper
                    <AnimatedSection direction="up" delay={0.4}>
                        <Stepper orientation="vertical" sx={{ bgcolor: 'transparent' }}>
                            {steps.map((step, index) => (
                                <Step key={index} active={true}>
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <Box
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: 60,
                                                    height: 60,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                {step.icon}
                                            </Box>
                                        )}
                                    >
                                        <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                                            {step.label}
                                        </Typography>
                                    </StepLabel>
                                    <StepContent>
                                        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
                                            <Typography variant="body1" sx={{ mb: 2 }}>
                                                {step.description}
                                            </Typography>
                                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                                {step.details.map((detail, idx) => (
                                                    <Typography
                                                        component="li"
                                                        key={idx}
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        {detail}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Paper>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    </AnimatedSection>
                ) : (
                    // Desktop: Horizontal cards
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                        {steps.map((step, index) => (
                            <AnimatedSection
                                key={index}
                                direction="up"
                                delay={0.3 + index * 0.1}
                                className="flex-1"
                            >
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        textAlign: 'center',
                                        position: 'relative',
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: 80,
                                            height: 80,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 3,
                                        }}
                                    >
                                        {step.icon}
                                    </Box>
                                    <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                                        {step.label}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 3 }}>
                                        {step.description}
                                    </Typography>
                                    <Box component="ul" sx={{ textAlign: 'left', pl: 2, m: 0 }}>
                                        {step.details.map((detail, idx) => (
                                            <Typography
                                                component="li"
                                                key={idx}
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 0.5 }}
                                            >
                                                {detail}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Paper>
                            </AnimatedSection>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default ProcessSection;