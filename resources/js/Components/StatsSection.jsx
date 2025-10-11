import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Paper,
} from '@mui/material';
import AnimatedSection from './AnimatedSection';
import AnimatedCounter from './AnimatedCounter';

const StatsSection = () => {
    const stats = [
        {
            number: 150,
            suffix: '+',
            label: 'Reformas Completadas',
        },
        {
            number: 8,
            suffix: '+',
            label: 'Años de Experiencia',
        },
        {
            number: 98,
            suffix: '%',
            label: 'Clientes Satisfechos',
        },
        {
            number: 2,
            label: 'Años de Garantía',
        },
    ];

    return (
        <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
            <Container maxWidth="lg">
                <AnimatedSection direction="up" delay={0.2}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h2" gutterBottom sx={{ color: 'white' }}>
                            Números que Hablan por Nosotros
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
                            Más de 8 años construyendo confianza y transformando espacios
                            con la máxima calidad y profesionalidad.
                        </Typography>
                    </Box>
                </AnimatedSection>

                <Grid container spacing={4}>
                    {stats.map((stat, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <AnimatedSection direction="scale" delay={0.4 + index * 0.1}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                                        },
                                    }}
                                >
                                    <AnimatedCounter
                                        end={stat.number}
                                        suffix={stat.suffix || ''}
                                        label={stat.label}
                                        duration={2.5}
                                    />
                                </Paper>
                            </AnimatedSection>
                        </Grid>
                    ))}
                </Grid>

                <AnimatedSection direction="up" delay={0.8}>
                    <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <Typography variant="h6" sx={{ opacity: 0.9, fontStyle: 'italic' }}>
                            "La confianza de nuestros clientes es nuestro mayor logro"
                        </Typography>
                    </Box>
                </AnimatedSection>
            </Container>
        </Box>
    );
};

export default StatsSection;