import React from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, Stack, Chip, IconButton, useTheme, useMediaQuery 
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  Build as BuildIcon,
  Kitchen as KitchenIcon,
  Bathtub as BathtubIcon,
  Home as HomeIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

const ServiceCard = ({ service, index, prefersReducedMotion }) => {
  const theme = useTheme();
  
  // Iconos por categoría
  const getServiceIcon = (category) => {
    const iconMap = {
      'reformas': <BuildIcon sx={{ fontSize: '3rem' }} />,
      'cocinas': <KitchenIcon sx={{ fontSize: '3rem' }} />,
      'baños': <BathtubIcon sx={{ fontSize: '3rem' }} />,
      'construccion': <HomeIcon sx={{ fontSize: '3rem' }} />
    };
    return iconMap[category?.toLowerCase()] || <BuildIcon sx={{ fontSize: '3rem' }} />;
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={prefersReducedMotion ? {} : { y: -8 }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: prefersReducedMotion ? 'none' : 'scale(1.02) rotateY(2deg)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            '& .service-image': {
              transform: 'scale(1.1)',
            },
            '& .service-overlay': {
              opacity: 1,
            },
            '& .service-benefits': {
              opacity: 1,
              transform: 'translateY(0)',
            },
            '& .service-icon': {
              transform: 'rotate(360deg) scale(1.1)',
              color: theme.palette.warning.main,
            }
          }
        }}
      >
        {/* Imagen de fondo */}
        <CardMedia
          component="div"
          className="service-image"
          sx={{
            height: 280,
            backgroundImage: `url(${service.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Overlay con gradiente */}
          <Box
            className="service-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(11, 107, 203, 0.8) 0%, rgba(245, 165, 36, 0.6) 100%)',
              opacity: 0,
              transition: 'opacity 0.4s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              p: 3
            }}
          >
            {/* Beneficios que aparecen en hover */}
            <Stack
              className="service-benefits"
              spacing={1}
              sx={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'all 0.4s ease 0.1s',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                ¿Por qué elegirnos?
              </Typography>
              {service.benefits?.slice(0, 3).map((benefit, idx) => (
                <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                  <CheckIcon sx={{ fontSize: '1.2rem', color: 'white' }} />
                  <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                    {benefit}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Icono flotante */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 60,
              height: 60,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Box
              className="service-icon"
              sx={{
                color: 'primary.main',
                transition: 'all 0.6s ease',
              }}
            >
              {getServiceIcon(service.category)}
            </Box>
          </Box>

          {/* Chip de categoría */}
          <Chip
            label={service.category}
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.7rem'
            }}
          />
        </CardMedia>

        {/* Contenido */}
        <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            {/* Título */}
            <Typography 
              variant="h5" 
              component="h3"
              fontWeight={700}
              color="primary.main"
              sx={{
                fontSize: { xs: '1.3rem', md: '1.5rem' },
                lineHeight: 1.3
              }}
            >
              {service.title}
            </Typography>

            {/* Descripción */}
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                lineHeight: 1.6,
                flexGrow: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {service.description}
            </Typography>

            {/* Precio desde */}
            {service.priceFrom && (
              <Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: '0.9rem' }}
                >
                  Desde
                </Typography>
                <Typography 
                  variant="h6" 
                  color="warning.main"
                  fontWeight={700}
                  sx={{ fontSize: '1.3rem' }}
                >
                  {service.priceFrom}
                </Typography>
              </Box>
            )}

            {/* Botón de acción */}
            <Button
              component={Link}
              href={`/servicios/${service.slug}`}
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(11, 107, 203, 0.3)',
                }
              }}
            >
              Saber Más
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FeaturedServicesSection = ({ services, prefersReducedMotion = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Filtrar servicios destacados, máximo 4
  const featuredServices = services?.filter(service => service.featured)?.slice(0, 4) || [];

  if (featuredServices.length === 0) return null;

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12, xl: 16 },
        bgcolor: 'grey.50',
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
              Nuestros Servicios Especializados
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
              ¿Qué hacemos exactamente? Descubre nuestras especialidades y cómo podemos transformar tu espacio
            </Typography>
          </motion.div>
        </Box>

        {/* Grid de servicios */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {featuredServices.map((service, index) => (
            <Grid item xs={12} sm={6} lg={3} key={service.id || index}>
              <ServiceCard 
                service={service} 
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            </Grid>
          ))}
        </Grid>

        {/* Botón para ver todos los servicios */}
        <Box textAlign="center" sx={{ mt: { xs: 6, md: 8 } }}>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              component={Link}
              href="/servicios"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(11, 107, 203, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 30px rgba(11, 107, 203, 0.4)',
                },
                '&:active': {
                  transform: 'scale(0.98) translateY(0)',
                  transition: 'transform 0.1s ease',
                }
              }}
            >
              Explorar Todos los Servicios
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedServicesSection;