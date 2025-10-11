import React, { useState } from 'react';
import { 
  Box, Container, Typography, Card, CardContent, Avatar, Rating, 
  Stack, IconButton, Chip, useMediaQuery, useTheme 
} from '@mui/material';
import { 
  ArrowBackIos, ArrowForwardIos, FormatQuote,
  LocationOn as LocationIcon, Schedule as ScheduleIcon,
  Euro as EuroIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialsSection = ({ testimonials, prefersReducedMotion = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredTestimonials = testimonials.filter(t => t.featured);
  const totalTestimonials = featuredTestimonials.length;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
  };

  if (totalTestimonials === 0) return null;

  const currentTestimonial = featuredTestimonials[currentIndex];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12, xl: 16 },
        background: 'linear-gradient(135deg, rgba(11, 107, 203, 0.02) 0%, rgba(245, 165, 36, 0.02) 100%)',
        position: 'relative',
      }}
    >
      <Container
        maxWidth={false}
        sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 960, lg: 1280, xl: 1600, xxl: 1800 },
          px: { xs: 2, sm: 3, md: 4, xl: 6 }
        }}
      >
        {/* Título de sección */}
        <Box textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '2.2rem', md: '3rem', xl: '3.8rem' },
              fontWeight: 700,
              color: 'primary.main',
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Lo Que Dicen Nuestros Clientes
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            La prueba humana: testimonios reales de proyectos transformadores
          </Typography>
        </Box>

        {/* Carrusel de testimonios */}
        <Box sx={{ position: 'relative', maxWidth: 900, mx: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Layout de dos columnas */}
                <Stack direction={{ xs: 'column', md: 'row' }} sx={{ height: { xs: 'auto', md: 500 } }}>
                  {/* Columna izquierda: Imagen del proyecto (40%) */}
                  <Box 
                    sx={{ 
                      width: { xs: '100%', md: '40%' },
                      height: { xs: 300, md: '100%' },
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${currentTestimonial.projectImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.6s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    
                    {/* Overlay con detalles del proyecto */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                        color: 'white',
                        p: 2
                      }}
                    >
                      <Chip
                        label={currentTestimonial.project}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(245, 165, 36, 0.9)',
                          color: 'white',
                          fontWeight: 600,
                          mb: 1
                        }}
                      />
                      <Stack direction="row" spacing={1} sx={{ opacity: 0.9 }}>
                        <Typography variant="caption">📍 {currentTestimonial.location}</Typography>
                        <Typography variant="caption">⏱️ {currentTestimonial.duration}</Typography>
                      </Stack>
                    </Box>
                  </Box>

                  {/* Columna derecha: Testimonio (60%) */}
                  <Box sx={{ width: { xs: '100%', md: '60%' }, p: { xs: 3, md: 4 } }}>
                    <Stack spacing={3} sx={{ height: '100%', justifyContent: 'space-between' }}>
                      {/* Header con avatar y datos del cliente */}
                      <Stack 
                        direction="row" 
                        spacing={3}
                        alignItems="center"
                      >
                        {/* Avatar grande */}
                        <Avatar
                          src={currentTestimonial.avatar}
                          alt={currentTestimonial.name}
                          sx={{
                            width: 80,
                            height: 80,
                            border: '4px solid white',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                          }}
                        />

                        {/* Información del cliente */}
                        <Stack spacing={1}>
                          <Typography 
                            variant="h5" 
                            fontWeight={700}
                            color="primary.main"
                          >
                            {currentTestimonial.name}
                          </Typography>
                          
                          <Rating 
                            value={currentTestimonial.rating} 
                            readOnly 
                            size="small"
                            sx={{ '& .MuiRating-iconFilled': { color: 'warning.main' } }}
                          />
                        </Stack>
                      </Stack>

                      {/* Cita destacada */}
                      <Typography
                        variant="h4"
                        sx={{
                          fontSize: { xs: '1.3rem', md: '1.6rem' },
                          fontWeight: 500,
                          fontStyle: 'italic',
                          color: 'text.primary',
                          lineHeight: 1.4,
                          fontFamily: 'Georgia, serif',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -15,
                            left: 0,
                            width: 40,
                            height: 3,
                            bgcolor: 'warning.main',
                            borderRadius: 2
                          }
                        }}
                      >
                        "{currentTestimonial.quote}"
                      </Typography>

                      {/* Comentario expandido */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '1rem',
                          color: 'text.secondary',
                          lineHeight: 1.6
                        }}
                      >
                        {currentTestimonial.comment}
                      </Typography>

                      {/* Detalles del proyecto */}
                      <Stack 
                        direction="row"
                        spacing={3}
                        sx={{
                          pt: 2,
                          borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          💰 {currentTestimonial.investment}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Controles del carrusel */}
          {totalTestimonials > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: { xs: -20, md: -60 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-50%) scale(1.05)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: 50,
                  height: 50
                }}
              >
                <ArrowBackIos />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: { xs: -20, md: -60 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-50%) scale(1.05)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: 50,
                  height: 50
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}
        </Box>

        {/* Indicadores */}
        {totalTestimonials > 1 && (
          <Stack 
            direction="row" 
            justifyContent="center" 
            spacing={1}
            sx={{ mt: 4 }}
          >
            {featuredTestimonials.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: currentIndex === index ? 32 : 12,
                  height: 12,
                  borderRadius: 6,
                  bgcolor: currentIndex === index ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: currentIndex === index ? 'primary.main' : 'grey.400',
                  }
                }}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default TestimonialsSection;