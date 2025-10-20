import React from 'react';
import {
  Box, Container, Typography, Stack, Card, CardContent,
  useTheme, useMediaQuery, Grid
} from '@mui/material';

import { 
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  Handshake as HandshakeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const FeatureBlock = ({ feature, index, isReversed, prefersReducedMotion }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Iconos por tipo de característica
  const getFeatureIcon = (title) => {
    const iconMap = {
      'Calidad Premium': <StarIcon sx={{ fontSize: '3rem' }} />,
      'Materiales Premium': <SecurityIcon sx={{ fontSize: '3rem' }} />,
      'Garantía Extendida': <TrophyIcon sx={{ fontSize: '3rem' }} />,
      'Plazos Cumplidos': <ScheduleIcon sx={{ fontSize: '3rem' }} />,
      'Atención Personalizada': <HandshakeIcon sx={{ fontSize: '3rem' }} />,
      'Transparencia Total': <CheckIcon sx={{ fontSize: '3rem' }} />
    };
    return iconMap[title] || <CheckIcon sx={{ fontSize: '3rem' }} />;
  };

  return (
    <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center" sx={{ mb: { xs: 8, md: 12 } }}>
      {/* Imagen */}
      <Grid 
        size={{ xs: 12, md: 6 }}
        order={{ xs: 1, md: isReversed ? 2 : 1 }}
      >
        <motion.div
          initial={prefersReducedMotion ? {} : { 
            opacity: 0, 
            x: isReversed ? 50 : -50 
          }}
          whileInView={prefersReducedMotion ? {} : { 
            opacity: 1, 
            x: 0 
          }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.1,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                '& .feature-image': {
                  transform: 'scale(1.05)',
                },
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Imagen con overlay sutil */}
            <Box
              className="feature-image"
              sx={{
                width: '100%',
                height: { xs: 250, md: 350 },
                backgroundImage: `url(${feature.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(11, 107, 203, 0.1) 0%, rgba(245, 165, 36, 0.1) 100%)',
                }
              }}
            />

            {/* Icono flotante */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                width: 80,
                height: 80,
                bgcolor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                color: 'warning.main',
              }}
            >
              {getFeatureIcon(feature.title)}
            </Box>
          </Box>
        </motion.div>
      </Grid>

      {/* Contenido */}
      <Grid 
        size={{ xs: 12, md: 6 }}
        order={{ xs: 2, md: isReversed ? 1 : 2 }}
      >
        <motion.div
          initial={prefersReducedMotion ? {} : { 
            opacity: 0, 
            x: isReversed ? -50 : 50 
          }}
          whileInView={prefersReducedMotion ? {} : { 
            opacity: 1, 
            x: 0 
          }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.15,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <Box sx={{ pl: { md: isReversed ? 0 : 4 }, pr: { md: isReversed ? 4 : 0 } }}>
            {/* Título */}
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.5rem', xl: '3rem' },
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              {feature.title}
            </Typography>

            {/* Descripción */}
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: 'text.secondary',
                lineHeight: 1.7,
                mb: 4,
              }}
            >
              {feature.description}
            </Typography>

            {/* Puntos clave con iconos */}
            <Stack spacing={2}>
              {feature.highlights?.map((highlight, idx) => (
                <motion.div
                  key={idx}
                  initial={prefersReducedMotion ? {} : { 
                    opacity: 0, 
                    x: 20 
                  }}
                  whileInView={prefersReducedMotion ? {} : { 
                    opacity: 1, 
                    x: 0 
                  }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (index * 0.2) + (idx * 0.1),
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: '1.1rem', md: '1.2rem' },
                        fontWeight: 600,
                        color: 'text.primary',
                      }}
                    >
                      {highlight}
                    </Typography>
                  </Stack>
                </motion.div>
              ))}
            </Stack>
          </Box>
        </motion.div>
      </Grid>
    </Grid>
  );
};

const WhyChooseUsSection = ({ whyChooseUs, prefersReducedMotion = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!whyChooseUs || whyChooseUs.length === 0) return null;

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12, xl: 16 },
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'grey.50',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoración de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(11, 107, 203, 0.05) 0%, rgba(245, 165, 36, 0.05) 100%)',
          transform: 'rotate(45deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245, 165, 36, 0.03) 0%, rgba(11, 107, 203, 0.03) 100%)',
          transform: 'rotate(-30deg)',
        }}
      />

      <Container
        maxWidth={false}
        sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 960, lg: 1280, xl: 1600, xxl: 1800 },
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Título de sección */}
        <Box textAlign="center" sx={{ mb: { xs: 8, md: 10 } }}>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
              ¿Por Qué Somos Diferentes?
            </Typography>
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
              La diferenciación racional: más que una constructora, somos tu socio en cada transformación
            </Typography>
          </motion.div>
        </Box>

        {/* Features en layout zig-zag */}
        <Box>
          {whyChooseUs.map((feature, index) => (
            <FeatureBlock
              key={feature.id || index}
              feature={feature}
              index={index}
              isReversed={index % 2 !== 0}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </Box>

        {/* Estadísticas finales */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card
            elevation={0}
            sx={{
              mt: { xs: 6, md: 8 },
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(11, 107, 203, 0.05) 0%, rgba(245, 165, 36, 0.05) 100%)',
              border: '1px solid rgba(11, 107, 203, 0.1)',
              textAlign: 'center'
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                color: 'primary.main',
                mb: 2
              }}
            >
              Resultado: Tu Tranquilidad Total
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: 'text.secondary',
                lineHeight: 1.6,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Cuando eliges MDR Construcciones, no solo contratas un servicio. 
              Eliges un compromiso con la excelencia, la transparencia y el resultado perfecto.
            </Typography>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default WhyChooseUsSection;
