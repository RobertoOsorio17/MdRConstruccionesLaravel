import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    Avatar,
} from '@mui/material';
import {
    Verified as VerifiedIcon,
    Security as SecurityIcon,
    Schedule as ScheduleIcon,
    SupportAgent as SupportIcon,
    EmojiEvents as TrophyIcon,
    LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import AnimatedSection from './AnimatedSection';

const TrustSection = () => {
    const guarantees = [
        {
            icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
            title: 'Garantía 2 Años',
            description: 'Cobertura completa en mano de obra y materiales durante 2 años.',
            color: '#4CAF50',
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 40 }} />,
            title: 'Presupuesto Cerrado',
            description: 'Sin sorpresas. El precio final es exactamente el acordado.',
            color: '#2196F3',
        },
        {
            icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
            title: 'Entrega en Plazo',
            description: 'Cumplimos religiosamente los tiempos acordados en cada proyecto.',
            color: '#FF9800',
        },
        {
            icon: <SupportIcon sx={{ fontSize: 40 }} />,
            title: 'Servicio Post-Venta',
            description: 'Atención continua después de la entrega para tu tranquilidad.',
            color: '#9C27B0',
        },
        {
            icon: <TrophyIcon sx={{ fontSize: 40 }} />,
            title: 'Calidad Certificada',
            description: 'Todos nuestros materiales y trabajos cumplen las normativas vigentes.',
            color: '#F44336',
        },
        {
            icon: <DeliveryIcon sx={{ fontSize: 40 }} />,
            title: 'Limpieza Incluida',
            description: 'Entregamos tu reforma completamente limpia y lista para usar.',
            color: '#607D8B',
        },
    ];

    return (
        <Box sx={{ py: 8, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                <AnimatedSection direction="up" delay={0.2}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h2" gutterBottom>
                            Nuestras Garantías
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                            Trabajamos con total transparencia y ofrecemos las mejores garantías del sector
                            para tu completa tranquilidad.
                        </Typography>
                    </Box>
                </AnimatedSection>

                <Grid container spacing={4}>
                    {guarantees.map((guarantee, index) => (
                        <Grid item xs={12} md={6} lg={4} key={index}>
                            <AnimatedSection direction="up" delay={0.3 + index * 0.1}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: guarantee.color,
                                                width: 80,
                                                height: 80,
                                                mx: 'auto',
                                                mb: 3,
                                            }}
                                        >
                                            {guarantee.icon}
                                        </Avatar>
                                        <Typography variant="h5" fontWeight={600} gutterBottom>
                                            {guarantee.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {guarantee.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </AnimatedSection>
                        </Grid>
                    ))}
                </Grid>

                <AnimatedSection direction="up" delay={0.8}>
                    <Box
                        sx={{
                            mt: 8,
                            p: 4,
                            bgcolor: 'warning.main',
                            borderRadius: 3,
                            textAlign: 'center',
                            color: 'black',
                        }}
                    >
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            🎯 Compromiso Total
                        </Typography>
                        <Typography variant="h6">
                            Si no cumplimos alguna de nuestras garantías,{' '}
                            <strong>te devolvemos el dinero</strong>. Así de seguros estamos de nuestro trabajo.
                        </Typography>
                    </Box>
                </AnimatedSection>
            </Container>
        </Box>
    );
};

export default TrustSection;