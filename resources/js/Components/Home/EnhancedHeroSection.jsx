import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Stack, Chip, useTheme
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayIcon,
  VolumeOff as VolumeOffIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EnhancedHeroSection = ({ socialProof, heroBenefits }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { prefersReducedMotion, getTransition, getVariants } = useReducedMotion();
  // Estados para el texto dinámico
  const words = ["hogares", "proyectos", "espacios"];
  const [wordIndex, setWordIndex] = useState(0);
  
  // Estados para el efecto del mouse
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Estado para el video
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Efecto para el texto dinámico
  useEffect(() => {
    if (!prefersReducedMotion) {
      const interval = setInterval(() => {
        setWordIndex(prevIndex => (prevIndex + 1) % words.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [prefersReducedMotion]);

  // Efecto para el mouse
  useEffect(() => {
    if (!prefersReducedMotion) {
      const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [prefersReducedMotion]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: '#0A1929',
        '@keyframes animate-gradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      {/* Video de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        {/* Placeholder para video - en producción sería un video real */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: `
              linear-gradient(45deg, rgba(11, 107, 203, 0.1) 0%, rgba(245, 165, 36, 0.1) 100%),
              url('https://images.unsplash.com/photo-1572120360610-d971b9d7767c?fm=webp&w=1920&q=80')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        
        {/* Video overlay - Superposición para legibilidad */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: isDark
              ? 'rgba(10, 25, 41, 0.85)'
              : 'rgba(10, 25, 41, 0.7)',
            zIndex: 2,
          }}
        />
      </Box>

      {/* Efectos de fondo dinámicos */}
      {!prefersReducedMotion && (
        <>
          {/* Grid animado */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 3,
              background: `
                linear-gradient(hsla(0,0%,100%,.03) 1px,transparent 1px),
                linear-gradient(90deg,hsla(0,0%,100%,.03) 1px,transparent 1px)
              `,
              backgroundSize: '60px 60px',
              '@keyframes grid-scroll': {
                '0%': { backgroundPosition: '0 0' },
                '100%': { backgroundPosition: '60px 60px' },
              },
              animation: 'grid-scroll 20s linear infinite',
              opacity: 0.6,
            }}
          />

          {/* Spotlight efecto del mouse */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 4,
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, hsla(210, 100%, 75%, 0.1), transparent 25%)`,
            }}
          />
        </>
      )}

      {/* Contenido principal */}
      <Container
        maxWidth={false}
        sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 960, lg: 1280, xl: 1600, xxl: 1800 },
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
          position: 'relative',
          zIndex: 5,
          py: { xs: 12, md: 16, xl: 20 },
        }}
      >
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Box
            sx={{
              background: 'rgba(10, 25, 41, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              p: { xs: 4, sm: 6, md: 8 },
              textAlign: 'center',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Título principal con texto dinámico */}
            <Box sx={{ overflow: 'hidden', mb: 4 }}>
              <Typography
                variant="h1"
                sx={{
                  color: 'grey.100',
                  fontSize: { xs: '3rem', md: '4.5rem', xl: '5.5rem' },
                  fontWeight: 900,
                  lineHeight: { xs: 1.1, md: 1.2 },
                  letterSpacing: '-0.02em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: { xs: '0.2rem', sm: '0.5rem' },
                  mb: 2,
                }}
              >
                Creamos
                <Box sx={{ 
                  display: 'inline-block', 
                  minWidth: { xs: 180, sm: 280, md: 350 }, 
                  textAlign: 'center' 
                }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={words[wordIndex]}
                      initial={prefersReducedMotion ? {} : { y: -30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={prefersReducedMotion ? {} : { y: 30, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      style={{
                        display: 'inline-block',
                        color: 'white',
                      }}
                    >
                      {words[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </Box>
                que
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(120deg, #F57C00, #FFC107, #F57C00)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'animate-gradient 5s ease-in-out infinite',
                  }}
                >
                  Perduran
                </Box>
              </Typography>
            </Box>

            {/* Subtítulo */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                maxWidth: '750px',
                mx: 'auto',
                color: 'grey.300',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                mb: 4,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.6,
              }}
            >
              Transformamos espacios con maestría artesanal y visión contemporánea. 
              Cada proyecto es una promesa de calidad que se cumple con pasión y precisión.
            </Typography>

            {/* Beneficios clave con iconos */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 2, md: 4 }}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 5 }}
            >
              {heroBenefits?.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'grey.300',
                  }}>
                    {benefit.icon === 'CheckIcon' && <CheckIcon sx={{ color: 'success.main', fontSize: '1.5rem' }} />}
                    {benefit.icon === 'ScheduleIcon' && <ScheduleIcon sx={{ color: 'info.main', fontSize: '1.5rem' }} />}
                    {benefit.icon === 'StarIcon' && <StarIcon sx={{ color: 'warning.main', fontSize: '1.5rem' }} />}
                    <Typography 
                      variant="body1" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
                    >
                      {benefit.text}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Stack>

            {/* Botones de acción */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 5 }}
            >
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  component={Link}
                  href="/contacto"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: { xs: 4, md: 6 },
                    py: { xs: 1.5, md: 2 },
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 700,
                    borderRadius: 3,
                    boxShadow: '0 10px 25px rgba(245, 165, 36, 0.4)',
                    textTransform: 'none',
                    '&:hover': {
                      boxShadow: '0 15px 35px rgba(245, 165, 36, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Comenzar Proyecto
                </Button>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/proyectos"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    color: 'white',
                    px: { xs: 4, md: 6 },
                    py: { xs: 1.5, md: 2 },
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 600,
                    borderRadius: 3,
                    borderWidth: 2,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: 'warning.main',
                      borderWidth: 2,
                      bgcolor: 'rgba(245, 165, 36, 0.1)',
                      color: 'warning.main',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Ver Proyectos
                </Button>
              </motion.div>
            </Stack>

            {/* Social proof mejorado */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 4 }}
                justifyContent="center"
                alignItems="center"
                divider={
                  <Box sx={{ 
                    width: { xs: '60px', sm: '1px' }, 
                    height: { xs: '1px', sm: '20px' },
                    bgcolor: 'rgba(255,255,255,0.3)' 
                  }} />
                }
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: 'warning.main', fontSize: '1.3rem' }} />
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'grey.200' }}>
                    {socialProof?.averageRating}/5 Valoración
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: 'success.main', fontSize: '1.3rem' }} />
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'grey.200' }}>
                    +{socialProof?.projectsCompleted} Proyectos
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'grey.200' }}>
                    🏆 {socialProof?.yearsOfExperience}+ Años
                  </Typography>
                </Box>
              </Stack>
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      {/* Indicador de scroll */}
      {!prefersReducedMotion && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 40, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 5 
        }}>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <KeyboardArrowDownIcon 
              sx={{ 
                fontSize: '3rem', 
                color: 'rgba(255,255,255,0.6)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }} 
            />
          </motion.div>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedHeroSection;