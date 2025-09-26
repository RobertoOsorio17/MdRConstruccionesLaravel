import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Card, CardContent, Slider, 
  FormControl, InputLabel, Select, MenuItem, Button,
  Stack, Chip, Alert, Paper, LinearProgress
} from '@mui/material';
import { 
  Calculate as CalculatorIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';

const InvestmentGuideSection = ({ prefersReducedMotion = false }) => {
  const [projectType, setProjectType] = useState('integral');
  const [area, setArea] = useState(100);
  const [qualityLevel, setQualityLevel] = useState('premium');
  const [showResult, setShowResult] = useState(false);
  const [estimatedRange, setEstimatedRange] = useState({ min: 0, max: 0 });

  // Configuración de tipos de proyecto
  const projectTypes = {
    cocina: {
      name: 'Reforma de Cocina',
      basePrice: 800,
      description: 'Transformación completa de tu cocina',
      icon: '🍳'
    },
    bano: {
      name: 'Reforma de Baño',
      basePrice: 900,
      description: 'Renovación integral del baño',
      icon: '🛁'
    },
    integral: {
      name: 'Reforma Integral',
      basePrice: 600,
      description: 'Transformación completa del hogar',
      icon: '🏠'
    },
    fachada: {
      name: 'Rehabilitación de Fachadas',
      basePrice: 400,
      description: 'Renovación exterior y aislamiento',
      icon: '🏢'
    }
  };

  // Niveles de calidad con multiplicadores
  const qualityLevels = {
    estandar: {
      name: 'Estándar',
      multiplier: 0.8,
      description: 'Calidad sólida con acabados funcionales',
      features: ['Materiales estándar', 'Acabados funcionales', 'Garantía 2 años']
    },
    premium: {
      name: 'Premium',
      multiplier: 1.0,
      description: 'Equilibrio perfecto entre calidad y precio',
      features: ['Materiales de calidad', 'Acabados superiores', 'Garantía 5 años']
    },
    lujo: {
      name: 'Lujo',
      multiplier: 1.4,
      description: 'La máxima calidad y exclusividad',
      features: ['Materiales premium', 'Acabados de lujo', 'Garantía 10 años']
    }
  };

  // Calcular estimación cuando cambien los valores
  useEffect(() => {
    const basePrice = projectTypes[projectType].basePrice;
    const multiplier = qualityLevels[qualityLevel].multiplier;
    
    const baseEstimate = area * basePrice * multiplier;
    const minPrice = Math.round(baseEstimate * 0.85);
    const maxPrice = Math.round(baseEstimate * 1.15);
    
    setEstimatedRange({ min: minPrice, max: maxPrice });
    setShowResult(true);
  }, [projectType, area, qualityLevel]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12, xl: 16 },
        bgcolor: 'grey.50',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        {/* Título de la sección */}
        <Box textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
              <CalculatorIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2.2rem', md: '3rem', xl: '3.8rem' },
                  fontWeight: 700,
                  color: 'primary.main',
                  lineHeight: 1.2,
                }}
              >
                Guía de Inversión
              </Typography>
            </Stack>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Descubre la inversión estimada para tu proyecto.
              <br />
              <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Transparencia desde el primer día.
              </Typography>
            </Typography>
          </motion.div>
        </Box>

        <Stack spacing={4} direction={{ xs: 'column', lg: 'row' }} alignItems="stretch">
          {/* Panel de configuración */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ flex: 1 }}
          >
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.8)',
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: 'primary.main' }}>
                  Configura tu Proyecto
                </Typography>

                <Stack spacing={4}>
                  {/* Tipo de proyecto */}
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Proyecto</InputLabel>
                    <Select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      label="Tipo de Proyecto"
                    >
                      {Object.entries(projectTypes).map(([key, type]) => (
                        <MenuItem key={key} value={key}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <span style={{ fontSize: '1.2rem' }}>{type.icon}</span>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {type.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {type.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Área del proyecto */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Área del proyecto: {area} m²
                    </Typography>
                    <Slider
                      value={area}
                      onChange={(e, newValue) => setArea(newValue)}
                      min={20}
                      max={500}
                      step={10}
                      marks={[
                        { value: 20, label: '20m²' },
                        { value: 100, label: '100m²' },
                        { value: 200, label: '200m²' },
                        { value: 500, label: '500m²' }
                      ]}
                      sx={{
                        '& .MuiSlider-thumb': {
                          bgcolor: 'warning.main'
                        },
                        '& .MuiSlider-track': {
                          bgcolor: 'warning.main'
                        },
                        '& .MuiSlider-rail': {
                          bgcolor: 'grey.300'
                        }
                      }}
                    />
                  </Box>

                  {/* Nivel de calidad */}
                  <FormControl fullWidth>
                    <InputLabel>Nivel de Calidad</InputLabel>
                    <Select
                      value={qualityLevel}
                      onChange={(e) => setQualityLevel(e.target.value)}
                      label="Nivel de Calidad"
                    >
                      {Object.entries(qualityLevels).map(([key, level]) => (
                        <MenuItem key={key} value={key}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {level.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {level.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel de resultados */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ flex: 1 }}
          >
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(245, 165, 36, 0.2)',
                border: '2px solid',
                borderColor: 'warning.main',
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Efecto de fondo */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 200,
                  height: 200,
                  background: 'linear-gradient(135deg, rgba(245, 165, 36, 0.1) 0%, rgba(245, 165, 36, 0.05) 100%)',
                  borderRadius: '50%',
                  transform: 'translate(50%, -50%)'
                }}
              />
              
              <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <TrendingUpIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    Tu Inversión Estimada
                  </Typography>
                </Stack>

                <AnimatePresence mode="wait">
                  {showResult && (
                    <motion.div
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Stack spacing={3}>
                        {/* Rango de precio */}
                        <Box textAlign="center">
                          <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
                            {formatPrice(estimatedRange.min)} - {formatPrice(estimatedRange.max)}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            Rango de inversión estimado para tu proyecto
                          </Typography>
                        </Box>

                        {/* Detalles del proyecto */}
                        <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Detalles de tu configuración:
                          </Typography>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Tipo de proyecto:</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {projectTypes[projectType].name}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Área:</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {area} m²
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Nivel de calidad:</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {qualityLevels[qualityLevel].name}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Paper>

                        {/* Características incluidas */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                            ✨ Incluido en el nivel {qualityLevels[qualityLevel].name}:
                          </Typography>
                          <Stack spacing={1}>
                            {qualityLevels[qualityLevel].features.map((feature, index) => (
                              <Stack key={index} direction="row" alignItems="center" spacing={1}>
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="body2">{feature}</Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>

                        {/* Aviso importante */}
                        <Alert 
                          icon={<InfoIcon />} 
                          severity="info" 
                          sx={{ borderRadius: 2 }}
                        >
                          Esta es una estimación orientativa. El presupuesto final dependerá 
                          de las características específicas de tu proyecto.
                        </Alert>

                        {/* CTA */}
                        <Button
                          component={Link}
                          href="/contacto"
                          variant="contained"
                          size="large"
                          fullWidth
                          sx={{
                            py: 2,
                            borderRadius: 3,
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            bgcolor: 'warning.main',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(245, 165, 36, 0.3)',
                            '&:hover': {
                              bgcolor: 'warning.dark',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 30px rgba(245, 165, 36, 0.4)',
                            },
                            '&:active': {
                              transform: 'scale(0.98) translateY(0)',
                              transition: 'transform 0.1s ease',
                            }
                          }}
                        >
                          Solicitar Presupuesto Detallado Gratuito
                        </Button>
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </Stack>

        {/* Mensaje de transparencia */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box textAlign="center" sx={{ mt: 6 }}>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
                maxWidth: 600,
                mx: 'auto',
                '& .highlight': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              }}
            >
              En MDR Construcciones creemos en la 
              <span className="highlight">transparencia total</span>.
              <br />
              Sin sorpresas, sin letra pequeña, solo honestidad profesional.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default InvestmentGuideSection;