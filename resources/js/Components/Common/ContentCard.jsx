/**
 * ContentCard - Card unificado para todo tipo de contenido
 * 
 * Este componente reemplaza PostCard, ServiceCard, ProjectCard y otros
 * con un único componente flexible que soporta múltiples tipos de contenido.
 * 
 * Tipos soportados:
 * - "post": Blog posts
 * - "service": Servicios
 * - "project": Proyectos
 * - "testimonial": Testimonios
 * - "generic": Contenido genérico
 * 
 * @example
 * <ContentCard
 *   type="post"
 *   image="/thumb.jpg"
 *   title="Título del post"
 *   excerpt="Descripción breve..."
 *   meta={{
 *     date: '2025-10-10',
 *     author: 'Roberto',
 *     category: 'Construcción',
 *     tags: ['renovación', 'diseño']
 *   }}
 *   actions={[
 *     { label: 'Leer más', href: '/post/1', variant: 'contained' }
 *   ]}
 *   variant="elevated"
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Euro as EuroIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import designSystem from '@/theme/designSystem';

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
};

const getDefaultImage = (type) => {
  const defaults = {
    post: '/images/default-blog-cover.svg',
    service: '/images/default-service.svg',
    project: '/images/default-project.svg',
    testimonial: '/images/default-avatar.svg',
    generic: '/images/default-card.svg',
  };
  return defaults[type] || defaults.generic;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ContentCard({
  type = 'generic',
  image,
  title,
  excerpt,
  description,
  meta = {},
  actions = [],
  variant = 'elevated',
  imageHeight = 200,
  href,
  onClick,
  elevation = 1,
  hoverable = true,
  loading = false,
  prefersReducedMotion = false,
}) {
  const theme = useTheme();

  // ============================================
  // VARIANT STYLES
  // ============================================

  const variantStyles = {
    elevated: {
      boxShadow: designSystem.shadows.sm,
      '&:hover': hoverable ? {
        boxShadow: designSystem.shadows.md,
        transform: 'translateY(-4px)',
      } : {},
    },
    
    flat: {
      boxShadow: 'none',
      border: `1px solid ${theme.palette.divider}`,
      '&:hover': hoverable ? {
        borderColor: theme.palette.primary.main,
        boxShadow: designSystem.shadows.sm,
      } : {},
    },
    
    outlined: {
      boxShadow: 'none',
      border: `2px solid ${theme.palette.divider}`,
      '&:hover': hoverable ? {
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
      } : {},
    },
  };

  // ============================================
  // META RENDERING
  // ============================================

  const renderMeta = () => {
    if (!meta || Object.keys(meta).length === 0) return null;

    return (
      <Stack
        direction="row"
        spacing={1.5}
        flexWrap="wrap"
        sx={{ mb: 1.5, color: 'text.secondary' }}
      >
        {/* Date */}
        {meta.date && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScheduleIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{formatDate(meta.date)}</Typography>
          </Box>
        )}

        {/* Author */}
        {meta.author && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{meta.author}</Typography>
          </Box>
        )}

        {/* Category */}
        {meta.category && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CategoryIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{meta.category}</Typography>
          </Box>
        )}

        {/* Location (for projects) */}
        {meta.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{meta.location}</Typography>
          </Box>
        )}

        {/* Budget (for projects) */}
        {meta.budget && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EuroIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{meta.budget}</Typography>
          </Box>
        )}

        {/* Rating (for services/testimonials) */}
        {meta.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
            <Typography variant="caption" fontWeight={600}>
              {meta.rating}
            </Typography>
          </Box>
        )}
      </Stack>
    );
  };

  // ============================================
  // TAGS RENDERING
  // ============================================

  const renderTags = () => {
    if (!meta.tags || meta.tags.length === 0) return null;

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
        {meta.tags.slice(0, 3).map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
              fontSize: '0.75rem',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          />
        ))}
        {meta.tags.length > 3 && (
          <Chip
            label={`+${meta.tags.length - 3}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        )}
      </Stack>
    );
  };

  // ============================================
  // ACTIONS RENDERING
  // ============================================

  const renderActions = () => {
    if (actions.length === 0 && !href) return null;

    return (
      <CardActions sx={{ px: 3, pb: 2.5 }}>
        <Stack direction="row" spacing={1} width="100%">
          {actions.map((action, index) => (
            <Button
              key={index}
              component={action.href ? Link : 'button'}
              href={action.href}
              onClick={action.onClick}
              variant={action.variant || 'text'}
              color={action.color || 'primary'}
              size={action.size || 'small'}
              endIcon={action.icon || <ArrowForwardIcon />}
              fullWidth={action.fullWidth}
              sx={{
                fontWeight: 600,
                ...(action.sx || {}),
              }}
            >
              {action.label}
            </Button>
          ))}
          
          {/* Default action si solo hay href */}
          {actions.length === 0 && href && (
            <Button
              component={Link}
              href={href}
              variant="text"
              color="primary"
              size="small"
              endIcon={<ArrowForwardIcon />}
            >
              Ver más
            </Button>
          )}
        </Stack>
      </CardActions>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  const MotionCard = prefersReducedMotion ? Card : motion.div;

  const cardContent = (
    <>
      {/* Image */}
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image || getDefaultImage(type)}
          alt={title}
          loading="lazy"
          sx={{
            objectFit: 'cover',
            backgroundColor: theme.palette.grey[200],
          }}
        />
      )}

      {/* Content */}
      <CardContent sx={{ px: 3, py: 2.5 }}>
        {/* Meta */}
        {renderMeta()}

        {/* Title */}
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 1.5,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Excerpt/Description */}
        {(excerpt || description) && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.6,
            }}
          >
            {excerpt || description}
          </Typography>
        )}

        {/* Tags */}
        {renderTags()}
      </CardContent>

      {/* Actions */}
      {renderActions()}
    </>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (prefersReducedMotion) {
    return (
      <Card
        elevation={elevation}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: designSystem.borders.radius.lg,
          transition: designSystem.transitions.presets.allNormal,
          ...variantStyles[variant],
        }}
        onClick={onClick}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card
        component={motion.div}
        whileHover={hoverable ? { y: -4 } : {}}
        elevation={elevation}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: designSystem.borders.radius.lg,
          transition: designSystem.transitions.presets.allNormal,
          cursor: onClick || href ? 'pointer' : 'default',
          ...variantStyles[variant],
        }}
        onClick={onClick}
      >
        {cardContent}
      </Card>
    </motion.div>
  );
}

// ============================================
// PROPTYPES
// ============================================

ContentCard.propTypes = {
  /** Tipo de contenido: 'post', 'service', 'project', 'testimonial', 'generic' */
  type: PropTypes.oneOf(['post', 'service', 'project', 'testimonial', 'generic']),
  
  /** URL de la imagen */
  image: PropTypes.string,
  
  /** Título (requerido) */
  title: PropTypes.string.isRequired,
  
  /** Extracto breve */
  excerpt: PropTypes.string,
  
  /** Descripción (alternativa a excerpt) */
  description: PropTypes.string,
  
  /** Metadata del contenido */
  meta: PropTypes.shape({
    date: PropTypes.string,
    author: PropTypes.string,
    category: PropTypes.string,
    location: PropTypes.string,
    budget: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  
  /** Acciones (botones) */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func,
      variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
      color: PropTypes.string,
      size: PropTypes.oneOf(['small', 'medium', 'large']),
      icon: PropTypes.node,
      fullWidth: PropTypes.bool,
      sx: PropTypes.object,
    })
  ),
  
  /** Variante visual: 'elevated', 'flat', 'outlined' */
  variant: PropTypes.oneOf(['elevated', 'flat', 'outlined']),
  
  /** Altura de la imagen en px */
  imageHeight: PropTypes.number,
  
  /** Href para enlace directo (si no se usan actions) */
  href: PropTypes.string,
  
  /** Callback onClick */
  onClick: PropTypes.func,
  
  /** Elevación de la card (0-24) */
  elevation: PropTypes.number,
  
  /** Si debe tener efecto hover */
  hoverable: PropTypes.bool,
  
  /** Estado de carga */
  loading: PropTypes.bool,
  
  /** Deshabilitar animaciones */
  prefersReducedMotion: PropTypes.bool,
};
