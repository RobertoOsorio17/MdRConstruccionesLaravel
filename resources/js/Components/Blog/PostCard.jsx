import React, { memo, useState } from 'react';
import { Card, CardMedia, CardContent, Box, Typography, Stack, Chip, Avatar, Skeleton, IconButton, Tooltip } from '@mui/material';
import { Link, usePage, router } from '@inertiajs/react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import axios from 'axios';
import { useAppTheme } from '@/theme/ThemeProvider';
import ResponsiveImage from '@/Components/UI/ResponsiveImage';

// Premium design system with advanced color palette and typography
const THEME = {
  // Primary palette with multiple shades
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Secondary palette
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },

  // Accent colors
  accent: {
    orange: '#f97316',
    emerald: '#10b981',
    purple: '#8b5cf6',
    rose: '#f43f5e',
    amber: '#f59e0b'
  },

  // Surface colors for depth
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(255, 255, 255, 0.95)'
  },

  // Text colors with improved hierarchy
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    muted: '#94a3b8',
    disabled: '#cbd5e1',
    inverse: '#ffffff'
  },

  // Border colors
  border: {
    light: '#f1f5f9',
    main: '#e2e8f0',
    strong: '#cbd5e1',
    focus: '#3b82f6'
  },

  // Premium gradients
  gradients: {
    card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    glass: 'linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)'
  },

  // Shadow system
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    colored: {
      primary: '0 20px 40px rgba(59, 130, 246, 0.15)',
      accent: '0 20px 40px rgba(249, 115, 22, 0.15)'
    }
  },

  // Typography system
  typography: {
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625
    }
  }
};

// Enhanced Image Component with Fallback
const PostCardImage = ({ post, getPostImage }) => {
  const [imageState, setImageState] = useState('loading'); // 'loading', 'loaded', 'error'
  const [imageSrc, setImageSrc] = useState(null);

  React.useEffect(() => {
    const image = getPostImage ? getPostImage(post) : (post.cover_image || post.featured_image || post.image);
    setImageSrc(image);
    setImageState(image ? 'loading' : 'error');
  }, [post, getPostImage]);

  const handleImageLoad = () => {
    setImageState('loaded');
  };

  const handleImageError = () => {
    setImageState('error');
  };

  const renderFallback = () => (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 aspect ratio
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${THEME.primary[50]} 0%, ${THEME.primary[100]} 100%)`,
        color: THEME.primary[400],
        flexDirection: 'column',
        gap: 1
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <BrokenImageIcon sx={{ fontSize: 48, opacity: 0.6 }} />
        <Typography variant="caption" sx={{ color: THEME.primary[500], fontWeight: 500, display: 'block', mt: 1 }}>
          Imagen no disponible
        </Typography>
      </Box>
    </Box>
  );

  const renderSkeleton = () => (
    <Skeleton
      variant="rectangular"
      height={200}
      sx={{
        bgcolor: THEME.primary[50],
        '&::after': {
          background: `linear-gradient(90deg, transparent, ${THEME.primary[100]}, transparent)`
        }
      }}
    />
  );

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: 200,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
          zIndex: 1,
          opacity: 0,
          transition: 'opacity 0.3s ease'
        },
        '&:hover::before': {
          opacity: 1
        }
      }}
    >
      {imageState === 'loading' && renderSkeleton()}
      {imageState === 'error' && renderFallback()}
      {imageState === 'loaded' && imageSrc && (
        <CardMedia
          component="img"
          height="200"
          image={imageSrc}
          alt={post.title}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sx={{
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            objectFit: 'cover',
            filter: 'brightness(1.0) contrast(1.05)',
            '&:hover': {
              transform: 'scale(1.05)',
              filter: 'brightness(1.1) contrast(1.1)'
            }
          }}
          loading="lazy"
        />
      )}
      {imageSrc && imageState === 'loading' && (
        <CardMedia
          component="img"
          height="200"
          image={imageSrc}
          alt={post.title}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            objectFit: 'cover',
            filter: 'brightness(1.0) contrast(1.05)',
            opacity: 0,
            '&:hover': {
              transform: 'scale(1.05)',
              filter: 'brightness(1.1) contrast(1.1)'
            }
          }}
          loading="lazy"
        />
      )}
    </Box>
  );
};

const PostCard = memo(({ post, getPostImage }) => {
  const firstCategory = (post.categories || [])[0];
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarks_count || 0);
  const [loadingInteraction, setLoadingInteraction] = useState(false);

  const { auth } = usePage().props;
  const { designSystem } = useAppTheme();

  // ✅ FIX: Use reading_time from backend or calculate from word count, not character count
  const readingTime = React.useMemo(() => {
    // Prefer backend-calculated reading time
    if (post.reading_time && post.reading_time > 0) {
      return post.reading_time;
    }

    // Fallback: Calculate from content (words, not characters)
    // Average reading speed: 200 words per minute
    const content = post.content || post.excerpt || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(wordCount / 200);
    return Math.max(1, minutes);
  }, [post.reading_time, post.content, post.excerpt]);

  const formattedDate = React.useMemo(() => {
    // ✅ FIX: Validate date before parsing
    if (!post.created_at && !post.published_at) return 'Fecha desconocida';

    // Prefer published_at over created_at for published posts
    const dateString = post.published_at || post.created_at;
    const date = new Date(dateString);

    // ✅ FIX: Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return 'Fecha inválida';
    }

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.ceil(diffDays / 30)} meses`;
    return `Hace ${Math.ceil(diffDays / 365)} años`;
  }, [post.created_at, post.published_at]);

  // Handle like functionality
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!auth.user) {
      // ✅ FIX: Use Inertia router instead of full page reload
      router.visit('/login', {
        preserveState: true,
        preserveScroll: true
      });
      return;
    }

    if (loadingInteraction) return;

    setLoadingInteraction(true);
    try {
      const response = await axios.post(`/posts/${post.slug}/like`);
      if (response.data.success) {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoadingInteraction(false);
    }
  };

  // Handle bookmark functionality
  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!auth.user) {
      // ✅ FIX: Use Inertia router instead of full page reload
      router.visit('/login', {
        preserveState: true,
        preserveScroll: true
      });
      return;
    }

    if (loadingInteraction) return;

    setLoadingInteraction(true);
    try {
      const response = await axios.post(`/posts/${post.slug}/bookmark`);
      if (response.data.success) {
        setIsBookmarked(response.data.isBookmarked);
        setBookmarksCount(response.data.bookmarksCount);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoadingInteraction(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        height: '100%',
        cursor: 'pointer',
        border: `1px solid ${THEME.border.main}`,
        backgroundColor: THEME.surface.primary,
        boxShadow: `${THEME.shadows.sm}, 0 0 0 1px rgba(255, 255, 255, 0.05)`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          zIndex: 1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          borderRadius: 4,
          zIndex: 0
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `${THEME.shadows.colored.primary}, 0 0 0 1px ${THEME.primary[200]}, 0 0 40px rgba(59, 130, 246, 0.15)`,
          borderColor: THEME.primary[300],
          '&::before': {
            opacity: 0.8
          },
          '&::after': {
            opacity: 1
          },
          '& .card-content': {
            transform: 'translateY(-2px)'
          }
        },
        '&:active': {
          transform: 'translateY(-4px) scale(1.01)',
          transition: 'all 0.1s ease'
        },
        '&:focus-visible': {
          outline: `3px solid ${THEME.primary[400]}`,
          outlineOffset: '2px',
          transform: 'translateY(-4px)',
          boxShadow: `${THEME.shadows.colored.primary}, 0 0 0 1px ${THEME.primary[200]}, 0 0 20px rgba(59, 130, 246, 0.3)`
        },
        '@media (hover: none)': {
          '&:hover': {
            transform: 'none',
            boxShadow: THEME.shadows.sm,
            borderColor: THEME.border.main,
            '&::before': {
              opacity: 0
            },
            '&::after': {
              opacity: 0
            },
            '& .card-content': {
              transform: 'none'
            }
          }
        },
      }}
      component={Link}
      href={`/blog/${post.slug}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <ResponsiveImage
          src={getPostImage ? getPostImage(post) : (post.cover_image || post.featured_image || post.image)}
          alt={post.title}
          aspectRatio="16/9"
          lazy={true}
          objectFit="cover"
          sx={{
            transition: designSystem.transitions.presets.transform,
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
        {firstCategory && (
          <Chip
            size="small"
            label={firstCategory.name}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontWeight: THEME.typography.fontWeight.semibold,
              fontSize: THEME.typography.fontSize.xs,
              zIndex: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                transform: 'translateY(-1px)'
              }
            }}
          />
        )}

        {/* Reading Time Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 2,
            fontSize: THEME.typography.fontSize.xs,
            fontWeight: THEME.typography.fontWeight.medium,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <ScheduleIcon sx={{ fontSize: 12 }} />
          {readingTime} min
        </Box>
      </Box>
      <CardContent
        className="card-content"
        sx={{
          p: 4,
          position: 'relative',
          zIndex: 2,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,1) 100%)',
          backdropFilter: 'blur(5px)',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'transform 0.3s ease'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: THEME.typography.fontWeight.semibold,
            lineHeight: THEME.typography.lineHeight.snug,
            color: THEME.text.primary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: THEME.typography.fontSize.lg,
            transition: 'color 0.2s ease',
            minHeight: '2.5rem',
            '&:hover': {
              color: THEME.primary[600]
            }
          }}
        >
          {post.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: THEME.text.secondary,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: THEME.typography.lineHeight.relaxed,
            fontSize: THEME.typography.fontSize.sm,
            fontWeight: THEME.typography.fontWeight.normal,
            flexGrow: 1,
            minHeight: '4.5rem'
          }}
        >
          {post.excerpt || 'Descubre más sobre este interesante artículo de construcción y reformas.'}
        </Typography>
        <Box
          sx={{
            mt: 'auto',
            pt: 2,
            borderTop: `1px solid ${THEME.border.light}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                src={post.author?.avatar}
                sx={{
                  width: 28,
                  height: 28,
                  border: `2px solid ${THEME.border.light}`,
                  fontSize: '0.75rem',
                  fontWeight: THEME.typography.fontWeight.semibold
                }}
              >
                {(post.author?.name || 'A')[0]}
              </Avatar>
              <Box>
                <Typography
                  component={post.author?.id ? Link : 'span'}
                  href={post.author?.id ? `/user/${post.author.id}` : undefined}
                  variant="caption"
                  sx={{
                    color: THEME.text.secondary,
                    fontWeight: THEME.typography.fontWeight.semibold,
                    fontSize: THEME.typography.fontSize.xs,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    lineHeight: 1.2,
                    textDecoration: 'none',
                    cursor: post.author?.id ? 'pointer' : 'default',
                    '&:hover': post.author?.id ? {
                      color: THEME.primary[600],
                      textDecoration: 'underline'
                    } : {}
                  }}
                >
                  {post.author?.name || 'Admin MDR'}
                  {post.author?.is_verified && (
                    <VerifiedIcon
                      sx={{
                        color: '#1976d2',
                        fontSize: '0.75rem'
                      }}
                    />
                  )}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: THEME.text.muted,
                    fontSize: '0.6875rem',
                    display: 'block',
                    lineHeight: 1.2
                  }}
                >
                  Autor
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ScheduleIcon sx={{ fontSize: 14, color: THEME.text.muted }} />
              <Typography
                variant="caption"
                sx={{
                  color: THEME.text.muted,
                  fontSize: THEME.typography.fontSize.xs,
                  fontWeight: THEME.typography.fontWeight.medium
                }}
              >
                {formattedDate}
              </Typography>
            </Stack>
          </Stack>

          {/* Interaction buttons */}
          {auth.user && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${THEME.border.light}`
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={isLiked ? "Quitar me gusta" : "Me gusta"}>
                  <IconButton
                    onClick={handleLike}
                    disabled={loadingInteraction}
                    size="small"
                    sx={{
                      minWidth: 44,
                      minHeight: 44,
                      color: isLiked ? THEME.accent.rose : THEME.text.muted,
                      transition: designSystem.transitions.presets.allNormal,
                      '&:hover': {
                        color: THEME.accent.rose,
                        backgroundColor: `${THEME.accent.rose}15`,
                        transform: 'scale(1.1)'
                      },
                      '&:active': {
                        transform: 'scale(0.95)'
                      }
                    }}
                  >
                    {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isBookmarked ? "Quitar de guardados" : "Guardar"}>
                  <IconButton
                    onClick={handleBookmark}
                    disabled={loadingInteraction}
                    size="small"
                    sx={{
                      minWidth: 44,
                      minHeight: 44,
                      color: isBookmarked ? THEME.primary[600] : THEME.text.muted,
                      transition: designSystem.transitions.presets.allNormal,
                      '&:hover': {
                        color: THEME.primary[600],
                        backgroundColor: `${THEME.primary[600]}15`,
                        transform: 'scale(1.1)'
                      },
                      '&:active': {
                        transform: 'scale(0.95)'
                      }
                    }}
                  >
                    {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {likesCount > 0 && (
                  <Typography variant="caption" sx={{ color: THEME.text.muted, fontSize: '0.7rem' }}>
                    {likesCount} {likesCount === 1 ? 'me gusta' : 'me gusta'}
                  </Typography>
                )}
                {bookmarksCount > 0 && (
                  <Typography variant="caption" sx={{ color: THEME.text.muted, fontSize: '0.7rem' }}>
                    {bookmarksCount} guardado{bookmarksCount !== 1 ? 's' : ''}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

export default PostCard;
