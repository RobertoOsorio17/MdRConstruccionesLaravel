import React, { useState, useCallback, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Container,
    Typography,
    Grid,
    Box,
    Chip,
    Stack,
    Paper,
    Button,
    InputBase,
    IconButton,
    Avatar,
    TextField
} from '@mui/material';
import {
    Search as SearchIcon,
    Schedule as ScheduleIcon,
    ArrowForward as ArrowForwardIcon,
    Category as CategoryIcon,
    Construction as ConstructionIcon,
    Kitchen as KitchenIcon,
    Bathtub as BathtubIcon,
    Lightbulb as LightbulbIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PostCard from '@/Components/Blog/PostCard';
import PostCardSkeleton from '@/Components/Blog/PostCardSkeleton';
import { AnimatedSearchBar, AnimatedCategoryChip, AnimatedNewsletterCard } from '@/Components/Blog/InteractiveElements';
import EnhancedSearchBar from '@/Components/Blog/EnhancedSearchBar';
import SearchFilters from '@/Components/Blog/SearchFilters';
import SearchResults from '@/Components/Blog/SearchResults';
import EnhancedPagination from '@/Components/Blog/EnhancedPagination';
import { useSearch } from '@/Hooks/useSearch';

// Premium design system with advanced color palette
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

  // Semantic colors
  semantic: {
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#047857',
      contrast: '#ffffff'
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
      contrast: '#ffffff'
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
      contrast: '#ffffff'
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#1d4ed8',
      contrast: '#ffffff'
    }
  },

  // Surface colors for depth
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(255, 255, 255, 0.95)'
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    dark: '#0f172a'
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
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    hero: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
    card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    cool: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    dark: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      accent: '0 20px 40px rgba(249, 115, 22, 0.15)',
      success: '0 20px 40px rgba(16, 185, 129, 0.15)'
    }
  },

  // Typography system
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      serif: ['Playfair Display', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
    },

    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
      '9xl': '8rem'      // 128px
    },

    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },

    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },

    // Semantic typography styles
    styles: {
      h1: {
        fontSize: '3rem',
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
        color: '#0f172a'
      },
      h2: {
        fontSize: '2.25rem',
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
        color: '#0f172a'
      },
      h3: {
        fontSize: '1.875rem',
        fontWeight: 600,
        lineHeight: 1.375,
        letterSpacing: '-0.025em',
        color: '#0f172a'
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.375,
        color: '#0f172a'
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
        color: '#0f172a'
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
        color: '#0f172a'
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.625,
        color: '#475569'
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
        color: '#64748b'
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.5,
        color: '#94a3b8'
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#64748b'
      }
    }
  }
};

// Enhanced Category icons mapping with premium styling
const getCategoryIcon = (slug, isSelected = false) => {
  const iconStyle = {
    fontSize: '1.2rem',
    filter: isSelected
      ? 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))'
      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const iconMap = {
    'construccion': <ConstructionIcon sx={iconStyle} />,
    'interiorismo': <LightbulbIcon sx={iconStyle} />,
    'reformas': <ConstructionIcon sx={iconStyle} />,
    'rehabilitacion': <ConstructionIcon sx={iconStyle} />,
    'cocinas': <KitchenIcon sx={iconStyle} />,
    'banos': <BathtubIcon sx={iconStyle} />
  };
  return iconMap[slug] || <CategoryIcon sx={iconStyle} />;
};

// Enhanced visual accent components
const DecorativeElement = ({ variant = 'dots', color = THEME.primary[200] }) => {
  if (variant === 'dots') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 20,
          height: 20,
          background: `radial-gradient(circle, ${color} 2px, transparent 2px)`,
          backgroundSize: '8px 8px',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />
    );
  }

  if (variant === 'gradient-line') {
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${THEME.primary[500]} 0%, ${THEME.accent.purple} 50%, ${THEME.accent.orange} 100%)`,
          borderRadius: 1,
          opacity: 0.8
        }}
      />
    );
  }

  return null;
};

const PerfectBlogIndex = ({
    posts = {},
    featured_posts = [],
    categories = [],
    filters = {}
}) => {
    // State management
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || '');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [showEnhancedSearch, setShowEnhancedSearch] = useState(false);

    // Enhanced search hook
    const {
        query: searchQuery,
        updateQuery,
        navigateToResults,
        reset: resetSearch
    } = useSearch(filters?.search || '', {
        category: filters?.category,
        ...filters
    });

    // Helper functions
    const getPostImage = (post) => {
        return post.cover_image ||
               post.featured_image ||
               post.image ||
               '/images/default-blog-cover.svg';
    };

    const categoryCounts = useMemo(() => {
        const list = posts?.data || [];
        const counts = {};
        list.forEach(post => {
            (post.categories || []).forEach(category => {
                counts[category.slug] = (counts[category.slug] || 0) + 1;
            });
        });
        return counts;
    }, [posts]);

    const getCategoryCount = (slug) => categoryCounts[slug] || 0;

    // Event handlers
    const handleSearch = useCallback((e) => {
        e.preventDefault();
        router.get('/blog', {
            ...filters,
            search: searchTerm.trim() || undefined,
            category: selectedCategory || undefined
        }, { preserveState: true });
    }, [searchTerm, selectedCategory, filters]);

    const handleCategoryFilter = useCallback((categorySlug) => {
        setSelectedCategory(categorySlug === selectedCategory ? '' : categorySlug);
        router.get('/blog', {
            ...filters,
            search: searchTerm || undefined,
            category: categorySlug === selectedCategory ? undefined : categorySlug
        }, { preserveState: true });
    }, [selectedCategory, searchTerm, filters]);

    const handleNewsletterSubmit = useCallback((e) => {
        e.preventDefault();
        // Newsletter subscription logic would go here
        console.log('Newsletter subscription:', newsletterEmail);
        setNewsletterEmail('');
    }, [newsletterEmail]);

    // Get featured posts
    const mainFeaturedPost = featured_posts[0];
    const popularPosts = featured_posts.slice(1, 4);

    return (
        <MainLayout>
            <Head title="Blog de Construcción - MDR Construcciones">
                <meta name="description" content="Consejos, tendencias y guías sobre construcción y reformas. Descubre cómo construir y renovar con expertos." />
                <link rel="canonical" href="/blog" />
                <meta property="og:title" content="Blog de Construcción - MDR Construcciones" />
                <meta property="og:description" content="Consejos, tendencias y guías sobre construcción y reformas." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="/blog" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Blog de Construcción - MDR Construcciones" />
                <meta name="twitter:description" content="Consejos, tendencias y guías sobre construcción y reformas." />
            </Head>

            {/* Enhanced Hero Section with Optimized Spacing */}
            <Container
                maxWidth="xl"
                sx={{
                    px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }
                }}
            >
                {mainFeaturedPost && (
                    <Box sx={{
                        pt: { xs: 2, sm: 3, md: 4, lg: 5 },
                        pb: { xs: 4, sm: 5, md: 6, lg: 7 }
                    }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Link href={`/blog/${mainFeaturedPost.slug}`} style={{ textDecoration: 'none' }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        borderRadius: { xs: 3, md: 4 },
                                        overflow: 'hidden',
                                        height: { xs: 400, sm: 500, md: 600 },
                                        cursor: 'pointer',
                                        boxShadow: `${THEME.shadows.xl}, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                            zIndex: 1,
                                            borderRadius: { xs: 3, md: 4 }
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-8px) scale(1.01)',
                                            boxShadow: `${THEME.shadows['2xl']}, 0 0 60px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2)`,
                                            '&::before': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                >
                                    {/* Background Image */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundImage: `url(${getPostImage(mainFeaturedPost)})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
                                            transition: 'all 0.6s ease',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                                                zIndex: 1
                                            },
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                inset: 0,
                                                background: `
                                                    linear-gradient(135deg,
                                                        rgba(15, 23, 42, 0.85) 0%,
                                                        rgba(30, 41, 59, 0.7) 30%,
                                                        rgba(51, 65, 85, 0.6) 60%,
                                                        rgba(15, 23, 42, 0.8) 100%
                                                    ),
                                                    radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                                                    radial-gradient(circle at 70% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)
                                                `,
                                                zIndex: 2
                                            }
                                        }}
                                    />

                                    {/* Category Badge */}
                                    <Box sx={{ position: 'absolute', top: { xs: 16, md: 24 }, left: { xs: 16, md: 24 }, zIndex: 3 }}>
                                        <Chip
                                            label="Post Destacado"
                                            sx={{
                                                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(234, 88, 12, 0.9) 100%)',
                                                color: THEME.text.inverse,
                                                fontWeight: THEME.typography.fontWeight.semibold,
                                                fontSize: THEME.typography.fontSize.xs,
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 6px 25px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Category Badge for main category */}
                                    {mainFeaturedPost.categories?.[0] && (
                                        <Box sx={{ position: 'absolute', top: { xs: 16, md: 24 }, right: { xs: 16, md: 24 }, zIndex: 3 }}>
                                            <Chip
                                                label="Interiorismo"
                                                sx={{
                                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                                    color: THEME.text.inverse,
                                                    fontWeight: THEME.typography.fontWeight.medium,
                                                    fontSize: THEME.typography.fontSize.xs,
                                                    backdropFilter: 'blur(15px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    )}

                                    {/* Content Overlay */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            p: { xs: 3, sm: 4, md: 6 },
                                            zIndex: 2,
                                            color: 'white'
                                        }}
                                    >
                                        <Typography
                                            variant="h1"
                                            sx={{
                                                ...THEME.typography.styles.h1,
                                                fontWeight: THEME.typography.fontWeight.extrabold,
                                                mb: 2,
                                                lineHeight: THEME.typography.lineHeight.tight,
                                                fontSize: { xs: THEME.typography.fontSize['2xl'], sm: THEME.typography.fontSize['3xl'], md: THEME.typography.fontSize['5xl'] },
                                                letterSpacing: THEME.typography.letterSpacing.tight,
                                                textShadow: '0 4px 12px rgba(0,0,0,0.6)',
                                                color: THEME.text.inverse,
                                                fontFamily: THEME.typography.fontFamily.sans.join(', ')
                                            }}
                                        >
                                            {mainFeaturedPost.title}
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                ...THEME.typography.styles.body1,
                                                mb: 3,
                                                lineHeight: THEME.typography.lineHeight.relaxed,
                                                opacity: 0.95,
                                                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                                                display: { xs: 'none', sm: 'block' },
                                                fontSize: { sm: THEME.typography.fontSize.lg, md: THEME.typography.fontSize.xl },
                                                fontWeight: THEME.typography.fontWeight.medium,
                                                color: THEME.text.inverse,
                                                maxWidth: '80%'
                                            }}
                                        >
                                            {mainFeaturedPost.excerpt}
                                        </Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Avatar
                                                    src={mainFeaturedPost.author?.avatar}
                                                    sx={{ width: 40, height: 40, border: '2px solid white' }}
                                                />
                                                <Box>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: THEME.typography.fontWeight.semibold,
                                                            fontSize: THEME.typography.fontSize.sm,
                                                            color: THEME.text.inverse,
                                                            lineHeight: THEME.typography.lineHeight.snug
                                                        }}
                                                    >
                                                        {mainFeaturedPost.author?.name || 'Admin MDR'}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            opacity: 0.85,
                                                            fontSize: THEME.typography.fontSize.xs,
                                                            color: THEME.text.inverse,
                                                            fontWeight: THEME.typography.fontWeight.normal
                                                        }}
                                                    >
                                                        {mainFeaturedPost.published_at} • {mainFeaturedPost.reading_time || '5'} min lectura
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <Button
                                                endIcon={<ArrowForwardIcon />}
                                                sx={{
                                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                                                    color: THEME.text.inverse,
                                                    px: 4,
                                                    py: 1.5,
                                                    fontWeight: THEME.typography.fontWeight.semibold,
                                                    fontSize: THEME.typography.fontSize.sm,
                                                    borderRadius: 3,
                                                    backdropFilter: 'blur(15px)',
                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    zIndex: 3,
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: '-100%',
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                        transition: 'left 0.6s ease'
                                                    },
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                                                        color: THEME.text.primary,
                                                        transform: 'translateY(-2px) translateX(4px)',
                                                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                                                        '&::before': {
                                                            left: '100%'
                                                        }
                                                    }
                                                }}
                                            >
                                                Leer Completo
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Link>
                        </motion.div>
                    </Box>
                )}

                {/* Enhanced Category Chips with Better Spacing */}
                <Box sx={{
                    pb: { xs: 4, sm: 5, md: 6, lg: 8 },
                    px: { xs: 0, sm: 1 }
                }}>
                    <Stack
                        direction="row"
                        spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
                        sx={{
                            overflowX: 'auto',
                            pb: { xs: 1, sm: 1.5 },
                            px: { xs: 0.5, sm: 0 },
                            '&::-webkit-scrollbar': { display: 'none' },
                            scrollbarWidth: 'none',
                            // Add subtle fade effect at edges
                            maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                        }}
                    >
                        {categories.map((category, index) => (
                            <AnimatedCategoryChip
                                key={category.id}
                                label={category.name}
                                selected={selectedCategory === category.slug}
                                onClick={() => handleCategoryFilter(category.slug)}
                                index={index}
                            />
                        ))}
                    </Stack>
                </Box>
            </Container>

            {/* Main Content Layout with Enhanced Spacing */}
            <Container
                maxWidth="xl"
                sx={{
                    px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
                    py: { xs: 2, md: 4 }
                }}
            >
                <Grid
                    container
                    spacing={{ xs: 4, sm: 5, md: 6, lg: 8 }}
                    sx={{
                        alignItems: 'flex-start',
                        justifyContent: 'center'
                    }}
                >
                    {/* Main Content Column with Optimized Width */}
                    <Grid
                        size={{ xs: 12, lg: 8 }}
                        sx={{
                            maxWidth: { lg: '100%' },
                            pr: { lg: 2 }
                        }}
                    >
                        <Box
                            component="main"
                            role="main"
                            aria-label="Contenido principal del blog"
                        >
                            {/* Enhanced Section Header with Visual Accents */}
                            <Box sx={{ position: 'relative', mb: 4 }}>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        ...THEME.typography.styles.h2,
                                        fontWeight: THEME.typography.fontWeight.bold,
                                        color: THEME.text.primary,
                                        mb: 1,
                                        fontSize: { xs: THEME.typography.fontSize['2xl'], md: THEME.typography.fontSize['3xl'] },
                                        lineHeight: THEME.typography.lineHeight.tight,
                                        letterSpacing: THEME.typography.letterSpacing.tight,
                                        position: 'relative',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: -8,
                                            left: 0,
                                            width: 60,
                                            height: 4,
                                            background: `linear-gradient(90deg, ${THEME.primary[500]} 0%, ${THEME.accent.purple} 50%, ${THEME.accent.orange} 100%)`,
                                            borderRadius: 2,
                                            boxShadow: `0 2px 8px rgba(59, 130, 246, 0.3)`
                                        }
                                    }}
                                >
                                    Todos los Artículos
                                </Typography>

                                {/* Decorative dots pattern */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: 0,
                                        width: 40,
                                        height: 40,
                                        background: `radial-gradient(circle, ${THEME.primary[200]} 1.5px, transparent 1.5px)`,
                                        backgroundSize: '8px 8px',
                                        opacity: 0.4,
                                        pointerEvents: 'none',
                                        borderRadius: '50%'
                                    }}
                                />
                            </Box>

                            {/* Enhanced Search Bar with Advanced Features */}
                            <Box sx={{
                                mb: { xs: 4, md: 5 },
                                position: 'relative'
                            }}>
                                <EnhancedSearchBar
                                    placeholder="Buscar artículos, categorías, autores..."
                                    showFilters={true}
                                    showHistory={true}
                                    showPopular={true}
                                    onResultSelect={(result) => {
                                        if (result.slug) {
                                            router.get(`/blog/${result.slug}`);
                                        }
                                    }}
                                />

                                {/* Search Filters */}
                                <Box sx={{ mt: 3 }}>
                                    <SearchFilters
                                        filters={filters}
                                        categories={categories}
                                        authors={[]} // Add authors data if available
                                        onFiltersChange={(newFilters) => {
                                            router.get('/blog', {
                                                ...filters,
                                                ...newFilters
                                            }, { preserveState: true });
                                        }}
                                        onClearFilters={() => {
                                            router.get('/blog', {}, { preserveState: true });
                                        }}
                                    />
                                </Box>

                                {/* Subtle background accent */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: -20,
                                        transform: 'translateY(-50%)',
                                        width: 100,
                                        height: 100,
                                        background: `radial-gradient(circle, ${THEME.primary[100]} 0%, transparent 70%)`,
                                        opacity: 0.3,
                                        pointerEvents: 'none',
                                        zIndex: -1
                                    }}
                                />
                            </Box>

                            {/* Enhanced Posts Grid with Optimized Spacing */}
                            {posts?.loading ? (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: 'repeat(2, 1fr)',
                                            md: 'repeat(2, 1fr)',
                                            lg: 'repeat(3, 1fr)'
                                        },
                                        gap: {
                                            xs: 3,
                                            sm: 4,
                                            md: 5,
                                            lg: 6
                                        },
                                        mt: { xs: 3, md: 4 },
                                        mb: { xs: 5, md: 6, lg: 8 },
                                        px: { xs: 0, sm: 1 }
                                    }}
                                >
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <PostCardSkeleton key={index} index={index} />
                                    ))}
                                </Box>
                            ) : posts?.data && posts.data.length > 0 ? (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: 'repeat(2, 1fr)',
                                            md: 'repeat(2, 1fr)',
                                            lg: 'repeat(3, 1fr)'
                                        },
                                        gap: {
                                            xs: 3,
                                            sm: 4,
                                            md: 5,
                                            lg: 6
                                        },
                                        mt: { xs: 3, md: 4 },
                                        mb: { xs: 5, md: 6, lg: 8 },
                                        px: { xs: 0, sm: 1 }
                                    }}
                                >
                                    {posts.data.map((post, index) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.1,
                                                duration: 0.6,
                                                ease: [0.4, 0, 0.2, 1]
                                            }}
                                            style={{ height: '100%' }}
                                        >
                                            <PostCard post={post} getPostImage={getPostImage} />
                                        </motion.div>
                                    ))}
                                </Box>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Box sx={{
                                        textAlign: 'center',
                                        py: { xs: 6, md: 8 },
                                        px: 2,
                                        background: `linear-gradient(145deg, ${THEME.surface.secondary} 0%, ${THEME.surface.primary} 100%)`,
                                        borderRadius: 4,
                                        border: `1px solid ${THEME.border.light}`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: `radial-gradient(circle at center, ${THEME.primary[50]} 0%, transparent 70%)`,
                                            opacity: 0.5,
                                            pointerEvents: 'none'
                                        }
                                    }}>
                                        <Typography variant="h6" sx={{
                                            color: THEME.text.secondary,
                                            mb: 2,
                                            fontWeight: 600,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            📝 No se encontraron artículos
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: THEME.text.muted,
                                            position: 'relative',
                                            zIndex: 1,
                                            maxWidth: 400,
                                            mx: 'auto',
                                            lineHeight: 1.6
                                        }}>
                                            Intenta con otros términos de búsqueda o explora nuestras categorías para descubrir contenido interesante.
                                        </Typography>
                                    </Box>
                                </motion.div>
                            )}

                            {/* Enhanced Pagination System */}
                            {posts?.last_page > 1 && (
                                <Box sx={{ mt: { xs: 6, md: 8 } }}>
                                    <EnhancedPagination
                                        currentPage={posts.current_page}
                                        lastPage={posts.last_page}
                                        total={posts.total}
                                        perPage={posts.per_page}
                                        from={posts.from}
                                        to={posts.to}
                                        onPageChange={(page) => {
                                            router.get('/blog', {
                                                ...filters,
                                                page,
                                                search: searchTerm || undefined,
                                                category: selectedCategory || undefined
                                            }, { preserveState: true });
                                        }}
                                        onPerPageChange={(perPage) => {
                                            router.get('/blog', {
                                                ...filters,
                                                per_page: perPage,
                                                page: 1, // Reset to first page when changing per page
                                                search: searchTerm || undefined,
                                                category: selectedCategory || undefined
                                            }, { preserveState: true });
                                        }}
                                        showPerPageSelector={true}
                                        showGoToPage={true}
                                        showResultsInfo={true}
                                        showScrollToTop={true}
                                        perPageOptions={[6, 12, 18, 24, 36]}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Grid>
                    {/* Enhanced Sidebar with Optimized Layout */}
                    <Grid
                        size={{ xs: 12, lg: 4 }}
                        sx={{
                            maxWidth: { lg: '100%' },
                            pl: { lg: 2 }
                        }}
                    >
                        <Box
                            component="aside"
                            role="complementary"
                            aria-label="Barra lateral con contenido relacionado"
                            sx={{
                                position: 'sticky',
                                top: { xs: 16, md: 24, lg: 32 },
                                pt: { xs: 4, lg: 0 }
                            }}
                        >
                            <Stack spacing={{ xs: 4, md: 5, lg: 6 }}>
                                {/* Enhanced Newsletter Widget with Animations */}
                                <AnimatedNewsletterCard
                                    onSubmit={async (email) => {
                                        // Newsletter subscription logic would go here
                                        console.log('Newsletter subscription:', email);
                                        // Simulate API call
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                    }}
                                />

                                {/* Enhanced Categories with Glassmorphism */}
                                {categories.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.4 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                borderRadius: 4,
                                                background: `
                                                    linear-gradient(145deg,
                                                        rgba(255, 255, 255, 0.9) 0%,
                                                        rgba(255, 255, 255, 0.7) 100%
                                                    )
                                                `,
                                                backdropFilter: 'blur(20px) saturate(180%)',
                                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                                border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                boxShadow: `
                                                    ${THEME.shadows.lg},
                                                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                                                    0 0 0 1px rgba(255, 255, 255, 0.1)
                                                `,
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s ease',
                                                    pointerEvents: 'none'
                                                },
                                                '&:hover': {
                                                    transform: 'translateY(-4px) scale(1.01)',
                                                    boxShadow: `
                                                        ${THEME.shadows.xl},
                                                        0 0 40px rgba(59, 130, 246, 0.15),
                                                        inset 0 1px 0 rgba(255, 255, 255, 0.5),
                                                        0 0 0 1px rgba(255, 255, 255, 0.2)
                                                    `,
                                                    '&::before': {
                                                        opacity: 1
                                                    }
                                                }
                                            }}
                                        >
                                        <Typography
                                            variant="h6"
                                            component="h3"
                                            id="categories-heading"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 3,
                                                color: THEME.text.primary
                                            }}
                                        >
                                            Categorías
                                        </Typography>
                                        <Stack
                                            spacing={1}
                                            role="group"
                                            aria-labelledby="categories-heading"
                                        >
                                            {categories.map((category, index) => {
                                                const count = getCategoryCount(category.slug);
                                                const isSelected = selectedCategory === category.slug;
                                                return (
                                                    <motion.div
                                                        key={category.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{
                                                            duration: 0.4,
                                                            delay: index * 0.1,
                                                            ease: [0.4, 0, 0.2, 1]
                                                        }}
                                                        whileHover={{ scale: 1.02, x: 4 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Box
                                                            onClick={() => handleCategoryFilter(category.slug)}
                                                            role="button"
                                                            tabIndex={0}
                                                            aria-label={`Filtrar por categoría ${category.name}${isSelected ? ' (seleccionado)' : ''}`}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    handleCategoryFilter(category.slug);
                                                                }
                                                            }}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                p: 2.5,
                                                                borderRadius: 3,
                                                                cursor: 'pointer',
                                                                background: isSelected
                                                                    ? `linear-gradient(135deg, ${THEME.primary[100]} 0%, ${THEME.primary[50]} 100%)`
                                                                    : 'rgba(255, 255, 255, 0.3)',
                                                                border: '1px solid',
                                                                borderColor: isSelected ? THEME.primary[300] : 'rgba(255, 255, 255, 0.2)',
                                                                backdropFilter: 'blur(8px)',
                                                                WebkitBackdropFilter: 'blur(8px)',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: '-100%',
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)`,
                                                                    transition: 'left 0.6s ease',
                                                                    pointerEvents: 'none'
                                                                },
                                                                '&:hover': {
                                                                    background: isSelected
                                                                        ? `linear-gradient(135deg, ${THEME.primary[200]} 0%, ${THEME.primary[100]} 100%)`
                                                                        : `linear-gradient(135deg, ${THEME.primary[50]} 0%, rgba(255, 255, 255, 0.5) 100%)`,
                                                                    borderColor: THEME.primary[400],
                                                                    boxShadow: `0 4px 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                                                                    transform: 'translateY(-1px)',
                                                                    '&::before': {
                                                                        left: '100%'
                                                                    }
                                                                },
                                                                '&:focus': {
                                                                    outline: `2px solid ${THEME.primary[500]}`,
                                                                    outlineOffset: 2,
                                                                    borderColor: THEME.primary[500],
                                                                    boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.2)`
                                                                },
                                                                '&:focus:not(:focus-visible)': {
                                                                    outline: 'none',
                                                                    boxShadow: 'none'
                                                                }
                                                            }}
                                                        >
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Box sx={{
                                                                color: isSelected ? THEME.primary[600] : THEME.text.secondary,
                                                                p: 1,
                                                                borderRadius: 2,
                                                                background: isSelected
                                                                    ? `linear-gradient(135deg, ${THEME.primary[100]} 0%, ${THEME.primary[50]} 100%)`
                                                                    : 'rgba(255, 255, 255, 0.5)',
                                                                backdropFilter: 'blur(4px)',
                                                                transition: 'all 0.3s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                '& svg': {
                                                                    fontSize: '1.2rem',
                                                                    filter: isSelected ? 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))' : 'none'
                                                                }
                                                            }}>
                                                                {getCategoryIcon(category.slug, isSelected)}
                                                            </Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    color: isSelected ? THEME.primary : THEME.text.primary
                                                                }}
                                                            >
                                                                {category.name}
                                                            </Typography>
                                                        </Stack>
                                                        <Chip
                                                            label={count}
                                                            size="small"
                                                            sx={{
                                                                background: isSelected
                                                                    ? `linear-gradient(135deg, ${THEME.primary[600]} 0%, ${THEME.primary[500]} 100%)`
                                                                    : 'rgba(255, 255, 255, 0.7)',
                                                                color: isSelected ? 'white' : THEME.text.secondary,
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                height: 28,
                                                                minWidth: 36,
                                                                backdropFilter: 'blur(6px)',
                                                                WebkitBackdropFilter: 'blur(6px)',
                                                                border: isSelected
                                                                    ? 'none'
                                                                    : `1px solid rgba(255, 255, 255, 0.3)`,
                                                                boxShadow: isSelected
                                                                    ? `0 2px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                                                                    : `0 1px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:hover': {
                                                                    transform: 'scale(1.05)',
                                                                    boxShadow: isSelected
                                                                        ? `0 4px 12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                                                                        : `0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)`
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                    </motion.div>
                                                );
                                            })}
                                        </Stack>
                                    </Paper>
                                    </motion.div>
                                )}

                                {/* Popular Posts with Glassmorphism */}
                                {popularPosts.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.6 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                borderRadius: 4,
                                                background: `
                                                    linear-gradient(145deg,
                                                        rgba(255, 255, 255, 0.85) 0%,
                                                        rgba(255, 255, 255, 0.65) 100%
                                                    )
                                                `,
                                                backdropFilter: 'blur(15px) saturate(160%)',
                                                WebkitBackdropFilter: 'blur(15px) saturate(160%)',
                                                border: `1px solid rgba(255, 255, 255, 0.25)`,
                                                boxShadow: `
                                                    ${THEME.shadows.md},
                                                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                                                `,
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `
                                                        ${THEME.shadows.lg},
                                                        0 0 30px rgba(59, 130, 246, 0.1),
                                                        inset 0 1px 0 rgba(255, 255, 255, 0.4)
                                                    `
                                                }
                                            }}
                                        >
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                mb: 3,
                                                color: THEME.text.primary,
                                                position: 'relative',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: -8,
                                                    left: 0,
                                                    width: 40,
                                                    height: 3,
                                                    background: `linear-gradient(90deg, ${THEME.primary[500]} 0%, ${THEME.primary[300]} 100%)`,
                                                    borderRadius: 2
                                                }
                                            }}>
                                                Posts Populares
                                            </Typography>
                                        <Stack spacing={3}>
                                            {popularPosts.map((post, index) => (
                                                <motion.div
                                                    key={post.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                gap: 2,
                                                                p: 2,
                                                                borderRadius: 2,
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    backgroundColor: THEME.background,
                                                                    transform: 'translateX(2px)'
                                                                }
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: 64,
                                                                    height: 64,
                                                                    borderRadius: 2,
                                                                    backgroundImage: `url(${getPostImage(post)})`,
                                                                    backgroundSize: 'cover',
                                                                    backgroundPosition: 'center',
                                                                    flexShrink: 0
                                                                }}
                                                            />
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        mb: 1,
                                                                        lineHeight: 1.3,
                                                                        color: THEME.text.primary,
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                >
                                                                    {post.title}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: THEME.text.muted,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1
                                                                    }}
                                                                >
                                                                    <ScheduleIcon sx={{ fontSize: 12 }} />
                                                                    {post.reading_time || '5'} min lectura
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </Stack>
                                    </Paper>
                                    </motion.div>
                                )}

                                {/* Quick Links with Glassmorphism */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: 4,
                                            background: `
                                                linear-gradient(145deg,
                                                    rgba(255, 255, 255, 0.8) 0%,
                                                    rgba(255, 255, 255, 0.6) 100%
                                                )
                                            `,
                                            backdropFilter: 'blur(12px) saturate(140%)',
                                            WebkitBackdropFilter: 'blur(12px) saturate(140%)',
                                            border: `1px solid rgba(255, 255, 255, 0.2)`,
                                            boxShadow: `
                                                ${THEME.shadows.sm},
                                                inset 0 1px 0 rgba(255, 255, 255, 0.25)
                                            `,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                                boxShadow: `
                                                    ${THEME.shadows.md},
                                                    0 0 25px rgba(59, 130, 246, 0.08),
                                                    inset 0 1px 0 rgba(255, 255, 255, 0.35)
                                                `
                                            }
                                        }}
                                    >
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            mb: 3,
                                            color: THEME.text.primary,
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: -8,
                                                left: 0,
                                                width: 30,
                                                height: 2,
                                                background: `linear-gradient(90deg, ${THEME.accent.orange} 0%, ${THEME.accent.amber} 100%)`,
                                                borderRadius: 1
                                            }
                                        }}>
                                            Enlaces Rápidos
                                        </Typography>
                                    <Stack spacing={2}>
                                        <Link href="/servicios" style={{ textDecoration: 'none' }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: THEME.text.secondary,
                                                    transition: 'color 0.2s ease',
                                                    '&:hover': { color: THEME.primary }
                                                }}
                                            >
                                                Nuestros Servicios
                                            </Typography>
                                        </Link>
                                        <Link href="/proyectos" style={{ textDecoration: 'none' }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: THEME.text.secondary,
                                                    transition: 'color 0.2s ease',
                                                    '&:hover': { color: THEME.primary }
                                                }}
                                            >
                                                Proyectos Realizados
                                            </Typography>
                                        </Link>
                                        <Link href="/contacto" style={{ textDecoration: 'none' }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: THEME.text.secondary,
                                                    transition: 'color 0.2s ease',
                                                    '&:hover': { color: THEME.primary }
                                                }}
                                            >
                                                Contacto
                                            </Typography>
                                        </Link>
                                    </Stack>
                                </Paper>
                                </motion.div>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </MainLayout>
    );
};

export default PerfectBlogIndex;
