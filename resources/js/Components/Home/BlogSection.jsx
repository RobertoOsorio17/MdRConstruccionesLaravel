import React from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, Chip, Stack, Avatar, useTheme, useMediaQuery 
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

// Fallback image from external CDN
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop&q=80';

// Normalize post shape to ensure fallbacks and consistent UI
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
    featured: p.featured || false,
  };
};

const BlogCard = ({ post, index, prefersReducedMotion }) => {
  const theme = useTheme();
  const norm = normalizePost(post);

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={prefersReducedMotion ? {} : { y: -8 }}
    >
      <Card
        component={Link}
        href={`/blog/${norm.slug}`}
        sx={{
          height: '100%',
          minHeight: { xs: 'auto', sm: 480, md: 500 }, // ✅ Fixed minimum height for consistency
          maxHeight: { xs: 'auto', sm: 500, md: 520 }, // ✅ Fixed maximum height to prevent overflow
          borderRadius: 4,
          overflow: 'hidden',
          textDecoration: 'none',
          display: 'flex', // ✅ Flex layout for consistent structure
          flexDirection: 'column', // ✅ Column layout
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            '& .blog-image': {
              transform: 'scale(1.05)',
            },
            '& .blog-title': {
              color: 'primary.main',
            },
            '& .read-more-btn': {
              transform: 'translateX(5px)',
            }
          }
        }}
      >
        {/* Imagen del post */}
        <Box sx={{
          position: 'relative',
          aspectRatio: '16 / 9',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          <CardMedia
            component="img"
            image={norm.image}
            alt={norm.title}
            loading="lazy"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
            className="blog-image"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Overlay con categoría */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)',
            }}
          />
          
          {/* Categoría */}
          <Chip
            label={norm.category || 'General'}
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              bgcolor: 'rgba(245, 165, 36, 0.95)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            }}
          />

          {/* Tiempo de lectura */}
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: '0.9rem !important' }} />}
            label={`${norm.readTime} min`}
            size="small"
            variant="outlined"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: 'text.secondary',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {/* Contenido */}
        <CardContent sx={{
          p: 3,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0 // ✅ Allow flex children to shrink properly
        }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {/* Fecha de publicación */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                flexShrink: 0 // ✅ Prevent date from shrinking
              }}
            >
              {new Date(norm.publishedAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>

            {/* Título */}
            <Typography
              variant="h6"
              component="h3"
              className="blog-title"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'color 0.3s ease',
                height: '2.6rem', // ✅ Fixed height for 2 lines (1.3 line-height * 2)
                flexShrink: 0 // ✅ Prevent title from shrinking
              }}
            >
              {norm.title}
            </Typography>

            {/* Excerpt */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: '4.8rem', // ✅ Fixed height for 3 lines (1.6 line-height * 3)
                flexShrink: 0 // ✅ Prevent excerpt from shrinking
              }}
            >
              {norm.excerpt}
            </Typography>

            {/* Footer del post */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                mt: 'auto', // ✅ Push footer to bottom
                pt: 2,
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                flexShrink: 0 // ✅ Prevent footer from shrinking
              }}
            >
              {/* Autor */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar
                  src={norm.author?.avatar || undefined}
                  alt={norm.author?.name || 'Autor'}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography
                  component={norm.author?.id ? Link : 'span'}
                  href={norm.author?.id ? `/user/${norm.author.id}` : undefined}
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    textDecoration: 'none',
                    cursor: post.author?.id ? 'pointer' : 'default',
                    '&:hover': post.author?.id ? {
                      color: 'primary.main',
                      textDecoration: 'underline'
                    } : {}
                  }}
                >
                  {post.author.name}
                </Typography>
              </Stack>

              {/* Enlace de lectura */}
              <Typography
                variant="body2"
                className="read-more-btn"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'transform 0.3s ease',
                }}
              >
                Leer más
                <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const BlogSection = ({ blogPosts, prefersReducedMotion = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mostrar solo los posts destacados, máximo 3
  const featuredPosts = blogPosts?.filter(post => post.featured)?.slice(0, 3) || [];

  if (featuredPosts.length === 0) return null;

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12, xl: 16 },
        bgcolor: isDark ? 'rgba(10, 15, 30, 0.95)' : 'white',
        position: 'relative',
      }}
    >
      {/* Patrón de fondo sutil */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.02,
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
          maxWidth: { xs: '100%', sm: 600, md: 960, lg: 1280, xl: 1600, xxl: 1800 },
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
          position: 'relative',
          zIndex: 1,
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
              Conocimiento y Autoridad
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
              Descubre las últimas tendencias, consejos de expertos y casos de éxito en construcción y reformas
            </Typography>
          </motion.div>
        </Box>

        {/* Grid de posts */}
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
          {featuredPosts.map((post, index) => (
            <BlogCard
              key={post.id || index}
              post={post}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </Box>

        {/* Botón para ver todos los artículos */}
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

        {/* Estadística de contenido */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box
            sx={{
              mt: { xs: 6, md: 8 },
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              bgcolor: 'grey.50',
              textAlign: 'center',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 4 }}
              justifyContent="center"
              alignItems="center"
            >
              <Stack alignItems="center" spacing={0.5}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {blogPosts?.length || 0}+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Artículos Publicados
                </Typography>
              </Stack>
              
              <Stack alignItems="center" spacing={0.5}>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  50K+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lectores Mensuales
                </Typography>
              </Stack>
              
              <Stack alignItems="center" spacing={0.5}>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  98%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valoración Positiva
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default BlogSection;