import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Avatar,
  Button,
  useTheme,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import {
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Fallback image from external CDN
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop&q=80';

// Normalize different post shapes (backend vs. local mock data)
const normalizePost = (p = {}) => {
  const firstCategory = p.category || p?.categories?.[0]?.name || null;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    image: p.image || p.cover_image || FALLBACK_IMAGE,
    category: firstCategory,
    publishedAt: p.publishedAt || p.published_at,
    author: p.author || { name: 'Equipo MDR', avatar: null, id: null },
    readTime: p.readTime || Math.max(1, Math.round(((p.excerpt || '').split(' ').length) / 180)),
  };
};

const LatestPostCard = ({ post, index, prefersReducedMotion }) => {
  const theme = useTheme();
  const norm = normalizePost(post);
  const isDark = theme.palette.mode === 'dark';

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ height: '100%' }}
    >
      <Card
        component={Link}
        href={`/blog/${norm.slug}`}
        sx={{
          height: '100%',
          minHeight: 520,
          borderRadius: 4,
          overflow: 'hidden',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(12px)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(30,35,50,0.85) 0%, rgba(20,25,40,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,1) 100%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          boxShadow: isDark
            ? '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset'
            : '0 16px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: isDark
              ? '0 28px 56px rgba(0,0,0,0.7), 0 0 0 2px rgba(11, 107, 203, 0.4) inset'
              : '0 28px 56px rgba(0,0,0,0.18), 0 0 0 2px rgba(11, 107, 203, 0.3) inset',
            transform: 'translateY(-10px)',
            borderColor: 'primary.main',
            '& .lp-image': {
              transform: 'scale(1.1)',
              filter: 'brightness(1.05)',
            },
            '& .lp-gradient-overlay': {
              opacity: 0.6,
            },
            '& .lp-title': {
              color: 'primary.main',
            },
            '& .read-more-arrow': {
              transform: 'translateX(8px)',
              color: 'primary.dark',
            }
          },
        }}
      >
        {/* Image Container */}
        <Box sx={{
          position: 'relative',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <CardMedia
            component="img"
            image={norm.image}
            alt={norm.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="lp-image"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />

          {/* Gradient Overlay */}
          <Box
            className="lp-gradient-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
              opacity: 0.8,
              transition: 'opacity 0.4s ease',
            }}
          />

          {/* Read Time Badge */}
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: '0.9rem !important', color: 'primary.main' }} />}
            label={`${norm.readTime} min lectura`}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(10px)',
              fontWeight: 700,
              fontSize: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.5)',
            }}
          />
        </Box>

        {/* Content */}
        <CardContent sx={{
          p: 3,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}>
          {/* Date */}
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.7rem',
            }}
          >
            {norm.publishedAt
              ? new Date(norm.publishedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              : ''}
          </Typography>

          {/* Title */}
          <Typography
            variant="h6"
            className="lp-title"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.15rem', md: '1.25rem' },
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6rem',
              color: 'text.primary',
              transition: 'color 0.3s ease',
            }}
          >
            {norm.title}
          </Typography>

          {/* Excerpt */}
          {norm.excerpt && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.6,
                minHeight: '4.8rem',
              }}
            >
              {norm.excerpt}
            </Typography>
          )}

          {/* Footer */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              mt: 'auto',
              pt: 2,
              borderTop: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            }}
          >
            {/* Author */}
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Avatar
                src={norm.author?.avatar || undefined}
                alt={norm.author?.name || 'Autor'}
                sx={{ width: 36, height: 36 }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {norm.author?.name}
              </Typography>
            </Stack>

            {/* Read More Arrow */}
            <ArrowForwardIcon
              className="read-more-arrow"
              sx={{
                color: 'primary.main',
                fontSize: '1.25rem',
                transition: 'transform 0.3s ease',
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LatestPostsSection = ({ posts = [], prefersReducedMotion = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const items = (posts || []).slice(0, 3);

  if (!items.length) return null;

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        py: { xs: 10, md: 14 },
        bgcolor: isDark ? 'rgba(10, 15, 30, 0.95)' : 'grey.50',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.03,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, ${theme.palette.primary.main} 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, ${theme.palette.warning.main} 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px',
        }}
      />

      <Container
        maxWidth={false}
        sx={{
          maxWidth: { xs: '100%', sm: 640, md: 960, lg: 1280, xl: 1600 },
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Section Header */}
        <Box textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.2rem', md: '3rem', xl: '3.8rem' },
                  fontWeight: 700,
                  color: 'primary.main',
                  lineHeight: 1.2,
                }}
              >
                Últimos Artículos
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
              Descubre las últimas tendencias, consejos de expertos y casos de éxito en construcción y reformas
            </Typography>
          </motion.div>
        </Box>

        {/* Posts Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: {
              xs: 3,
              sm: 4,
              md: 5
            }
          }}
        >
          {items.map((post, idx) => (
            <LatestPostCard
              key={post.id || idx}
              post={post}
              index={idx}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </Box>

        {/* CTA Button */}
        <Box textAlign="center" sx={{ mt: { xs: 6, md: 8 } }}>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              component={Link}
              href="/blog"
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderWidth: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(11, 107, 203, 0.2)',
                },
                '&:active': {
                  transform: 'scale(0.98) translateY(0)',
                  transition: 'transform 0.1s ease',
                }
              }}
            >
              Ver Todos los Artículos
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default LatestPostsSection;

