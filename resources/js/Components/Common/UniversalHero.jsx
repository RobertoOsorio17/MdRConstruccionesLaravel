/**
 * UniversalHero - Componente Hero unificado para todas las páginas
 * 
 * Este componente reemplaza los múltiples heros inconsistentes del sitio
 * con un único componente flexible que soporta 3 variantes principales.
 * 
 * Variantes:
 * - "primary": Hero principal (Home, Servicios destacados) - 70vh, gradiente, 2 CTAs
 * - "secondary": Hero secundario (Proyectos, Categorías) - 50vh, color sólido, 1 CTA
 * - "minimal": Hero minimalista (Posts, Páginas internas) - 30vh, simple, solo título
 * 
 * @example
 * <UniversalHero
 *   variant="primary"
 *   title="Construimos tus sueños"
 *   subtitle="Expertos en construcción desde hace 25 años"
 *   cta={{
 *     primary: { text: 'Contáctanos', href: '/contacto' },
 *     secondary: { text: 'Ver proyectos', href: '/proyectos' }
 *   }}
 *   backgroundImage="/hero-bg.jpg"
 *   badges={[
 *     { icon: '⭐', value: '5/5', text: 'Rating' },
 *     { icon: '✅', value: '500+', text: 'Proyectos' }
 *   ]}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon,
  KeyboardArrowRight as ChevronRightIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import designSystem from '@/theme/designSystem';

// ============================================
// ANIMATION VARIANTS
// ============================================

const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  },
  
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  
  badge: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function UniversalHero({
  variant = 'primary',
  title,
  subtitle,
  description,
  cta = {},
  backgroundImage,
  backgroundColor,
  gradient = 'hero',
  overlay = 0.5,
  badges = [],
  breadcrumbs = [],
  align = 'center',
  height,
  prefersReducedMotion = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // ============================================
  // VARIANT CONFIGURATIONS
  // ============================================

  const variantConfig = {
    primary: {
      height: height || (isMobile ? '60vh' : isTablet ? '65vh' : '70vh'),
      minHeight: '500px',
      showGradient: true,
      showCTAs: true,
      showBadges: true,
      titleSize: isMobile ? 'h3' : 'h1',
      subtitleSize: isMobile ? 'h6' : 'h4',
      ctaSize: 'large',
      contentMaxWidth: 'md',
    },
    
    secondary: {
      height: height || (isMobile ? '40vh' : isTablet ? '45vh' : '50vh'),
      minHeight: '350px',
      showGradient: false,
      showCTAs: true,
      showBadges: false,
      titleSize: isMobile ? 'h4' : 'h2',
      subtitleSize: isMobile ? 'body1' : 'h5',
      ctaSize: 'medium',
      contentMaxWidth: 'lg',
    },
    
    minimal: {
      height: height || (isMobile ? '25vh' : '30vh'),
      minHeight: '200px',
      showGradient: false,
      showCTAs: false,
      showBadges: false,
      titleSize: isMobile ? 'h5' : 'h3',
      subtitleSize: 'body2',
      ctaSize: 'medium',
      contentMaxWidth: 'lg',
    },
  };

  const config = variantConfig[variant];

  // ============================================
  // BACKGROUND STYLES
  // ============================================

  const getBackgroundStyles = () => {
    const baseStyles = {
      position: 'relative',
      height: config.height,
      minHeight: config.minHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    // Gradient background
    if (config.showGradient && gradient) {
      const gradientValue = designSystem.gradients[gradient] || gradient;
      baseStyles.background = gradientValue;
    }
    // Solid color background
    else if (backgroundColor) {
      baseStyles.backgroundColor = backgroundColor;
    }
    // Default
    else {
      baseStyles.backgroundColor = theme.palette.background.paper;
    }

    return baseStyles;
  };

  // ============================================
  // RENDER
  // ============================================

  const MotionBox = prefersReducedMotion ? Box : motion.div;
  const MotionStack = prefersReducedMotion ? Stack : motion.div;

  return (
    <Box sx={getBackgroundStyles()}>
      {/* Background Image Layer */}
      {backgroundImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />
      )}

      {/* Overlay Layer */}
      {(backgroundImage || config.showGradient) && overlay > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlay})`,
            zIndex: 1,
          }}
        />
      )}

      {/* Content Layer */}
      <Container
        maxWidth={config.contentMaxWidth}
        sx={{
          position: 'relative',
          zIndex: 2,
          py: { xs: 6, md: 8 },
        }}
      >
        <MotionBox
          component={prefersReducedMotion ? 'div' : motion.div}
          variants={!prefersReducedMotion ? animations.container : undefined}
          initial={!prefersReducedMotion ? 'hidden' : undefined}
          animate={!prefersReducedMotion ? 'visible' : undefined}
        >
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <MotionBox
              component={prefersReducedMotion ? 'div' : motion.div}
              variants={!prefersReducedMotion ? animations.item : undefined}
              sx={{ mb: 3 }}
            >
              <Breadcrumbs
                separator={<ChevronRightIcon fontSize="small" />}
                sx={{
                  color: config.showGradient || backgroundImage ? 'white' : 'text.secondary',
                  '& .MuiBreadcrumbs-separator': {
                    color: config.showGradient || backgroundImage ? 'white' : 'text.secondary',
                  },
                }}
              >
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <MuiLink
                    component="span"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'inherit',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
                    Inicio
                  </MuiLink>
                </Link>
                {breadcrumbs.map((crumb, index) => (
                  index === breadcrumbs.length - 1 ? (
                    <Typography
                      key={index}
                      color="inherit"
                      sx={{ fontWeight: 500 }}
                    >
                      {crumb.label}
                    </Typography>
                  ) : (
                    <Link key={index} href={crumb.href} style={{ textDecoration: 'none' }}>
                      <MuiLink
                        component="span"
                        color="inherit"
                        sx={{
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {crumb.label}
                      </MuiLink>
                    </Link>
                  )
                ))}
              </Breadcrumbs>
            </MotionBox>
          )}

          {/* Content */}
          <Box
            sx={{
              textAlign: align,
              maxWidth: variant === 'primary' ? 800 : '100%',
              mx: align === 'center' ? 'auto' : 0,
            }}
          >
            {/* Title */}
            <MotionBox
              component={prefersReducedMotion ? 'div' : motion.div}
              variants={!prefersReducedMotion ? animations.item : undefined}
            >
              <Typography
                variant={config.titleSize}
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: config.showGradient || backgroundImage ? 'white' : 'text.primary',
                  mb: 2,
                  textShadow:
                    config.showGradient || backgroundImage
                      ? '2px 2px 4px rgba(0,0,0,0.3)'
                      : 'none',
                }}
              >
                {title}
              </Typography>
            </MotionBox>

            {/* Subtitle */}
            {subtitle && (
              <MotionBox
                component={prefersReducedMotion ? 'div' : motion.div}
                variants={!prefersReducedMotion ? animations.item : undefined}
              >
                <Typography
                  variant={config.subtitleSize}
                  sx={{
                    color: config.showGradient || backgroundImage
                      ? alpha('#ffffff', 0.95)
                      : 'text.secondary',
                    mb: description ? 2 : 4,
                    fontWeight: 500,
                  }}
                >
                  {subtitle}
                </Typography>
              </MotionBox>
            )}

            {/* Description */}
            {description && (
              <MotionBox
                component={prefersReducedMotion ? 'div' : motion.div}
                variants={!prefersReducedMotion ? animations.item : undefined}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: config.showGradient || backgroundImage
                      ? alpha('#ffffff', 0.9)
                      : 'text.secondary',
                    mb: 4,
                    maxWidth: 600,
                    mx: align === 'center' ? 'auto' : 0,
                  }}
                >
                  {description}
                </Typography>
              </MotionBox>
            )}

            {/* CTAs */}
            {config.showCTAs && (cta.primary || cta.secondary) && (
              <MotionStack
                component={prefersReducedMotion ? Stack : motion.div}
                variants={!prefersReducedMotion ? animations.item : undefined}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  justifyContent: align === 'center' ? 'center' : 'flex-start',
                  mb: config.showBadges && badges.length > 0 ? 4 : 0,
                }}
              >
                {cta.primary && (
                  <Button
                    component={cta.primary.href ? Link : 'button'}
                    href={cta.primary.href}
                    onClick={cta.primary.onClick}
                    variant="contained"
                    color="primary"
                    size={config.ctaSize}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      boxShadow: designSystem.shadows.lg,
                      '&:hover': {
                        boxShadow: designSystem.shadows.xl,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {cta.primary.text || cta.primary.label}
                  </Button>
                )}

                {cta.secondary && (
                  <Button
                    component={cta.secondary.href ? Link : 'button'}
                    href={cta.secondary.href}
                    onClick={cta.secondary.onClick}
                    variant={config.showGradient || backgroundImage ? 'outlined' : 'text'}
                    color={config.showGradient || backgroundImage ? 'inherit' : 'primary'}
                    size={config.ctaSize}
                    sx={{
                      color: config.showGradient || backgroundImage ? 'white' : undefined,
                      borderColor: config.showGradient || backgroundImage ? 'white' : undefined,
                      '&:hover': {
                        borderColor: config.showGradient || backgroundImage ? 'white' : undefined,
                        backgroundColor:
                          config.showGradient || backgroundImage
                            ? alpha('#ffffff', 0.1)
                            : undefined,
                      },
                    }}
                  >
                    {cta.secondary.text || cta.secondary.label}
                  </Button>
                )}
              </MotionStack>
            )}

            {/* Badges */}
            {config.showBadges && badges.length > 0 && (
              <MotionStack
                component={prefersReducedMotion ? Stack : motion.div}
                variants={!prefersReducedMotion ? animations.item : undefined}
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: align === 'center' ? 'center' : 'flex-start',
                  flexWrap: 'wrap',
                  mt: 4,
                }}
              >
                {badges.map((badge, index) => (
                  <MotionBox
                    key={index}
                    component={prefersReducedMotion ? Box : motion.div}
                    variants={!prefersReducedMotion ? animations.badge : undefined}
                  >
                    <Chip
                      icon={badge.icon ? <span>{badge.icon}</span> : undefined}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight={700}>
                            {badge.value}
                          </Typography>
                          {badge.text && (
                            <Typography variant="caption">{badge.text}</Typography>
                          )}
                        </Stack>
                      }
                      sx={{
                        backgroundColor: alpha('#ffffff', 0.2),
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 600,
                        px: 2,
                        py: 2.5,
                        '& .MuiChip-icon': {
                          fontSize: '1.25rem',
                        },
                      }}
                    />
                  </MotionBox>
                ))}
              </MotionStack>
            )}
          </Box>
        </MotionBox>
      </Container>

      {/* Decorative Bottom Wave (optional for primary variant) */}
      {variant === 'primary' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            zIndex: 1,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: theme.palette.background.default,
              clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 100%)',
            },
          }}
        />
      )}
    </Box>
  );
}

// ============================================
// PROPTYPES
// ============================================

UniversalHero.propTypes = {
  /** Variante del hero: 'primary', 'secondary', o 'minimal' */
  variant: PropTypes.oneOf(['primary', 'secondary', 'minimal']),
  
  /** Título principal (requerido) */
  title: PropTypes.string.isRequired,
  
  /** Subtítulo (opcional) */
  subtitle: PropTypes.string,
  
  /** Descripción adicional (opcional) */
  description: PropTypes.string,
  
  /** CTAs (opcional) */
  cta: PropTypes.shape({
    primary: PropTypes.shape({
      text: PropTypes.string,
      label: PropTypes.string,
      href: PropTypes.string,
      onClick: PropTypes.func,
    }),
    secondary: PropTypes.shape({
      text: PropTypes.string,
      label: PropTypes.string,
      href: PropTypes.string,
      onClick: PropTypes.func,
    }),
  }),
  
  /** URL de imagen de fondo (opcional) */
  backgroundImage: PropTypes.string,
  
  /** Color de fondo sólido (opcional) */
  backgroundColor: PropTypes.string,
  
  /** Nombre del gradiente del designSystem o gradiente custom (opcional) */
  gradient: PropTypes.string,
  
  /** Opacidad del overlay (0-1) */
  overlay: PropTypes.number,
  
  /** Badges para mostrar (opcional) */
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      value: PropTypes.string.isRequired,
      text: PropTypes.string,
    })
  ),
  
  /** Breadcrumbs (opcional) */
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ),
  
  /** Alineación del contenido */
  align: PropTypes.oneOf(['left', 'center', 'right']),
  
  /** Altura custom (opcional) */
  height: PropTypes.string,
  
  /** Deshabilitar animaciones para usuarios con preferencias de movimiento reducido */
  prefersReducedMotion: PropTypes.bool,
};
