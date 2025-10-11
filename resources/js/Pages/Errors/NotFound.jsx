import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Paper,
    Grid,
    Card,
    CardContent,
    IconButton,
    Chip,
    Skeleton
} from '@mui/material';
import {
    Home as HomeIcon,
    Article as BlogIcon,
    Build as ServicesIcon,
    ContactMail as ContactIcon,
    Search as SearchIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import { Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

// Lazy load heavy components for better LCP
const AnimatedBackground = lazy(() => import('@/Components/Errors/AnimatedBackground'));
const EnhancedSearch = lazy(() => import('@/Components/Errors/EnhancedSearch'));
const LCPMonitor = lazy(() => import('@/Components/Performance/LCPMonitor'));

// Premium design system
const THEME = {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    },
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        500: '#ef4444',
        600: '#dc2626',
    }
};

const NotFound = ({ popularPosts = [], categories = [], recentPosts = [] }) => {
    const [enhancedFeaturesLoaded, setEnhancedFeaturesLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Delay loading of non-critical features to improve LCP
    useEffect(() => {
        // Preload critical resources
        const preloadTimer = setTimeout(() => {
            // Preload the lazy components
            import('@/Components/Errors/AnimatedBackground');
            import('@/Components/Errors/EnhancedSearch');
        }, 50);

        const enhancedTimer = setTimeout(() => {
            setEnhancedFeaturesLoaded(true);
        }, 200); // Slightly longer delay to ensure LCP is complete

        return () => {
            clearTimeout(preloadTimer);
            clearTimeout(enhancedTimer);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/blog', { search: searchQuery.trim() });
        }
    };

    const handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.get('/');
        }
    };

    // Quick navigation items
    const quickNavItems = [
        { label: 'Inicio', icon: HomeIcon, href: '/', color: THEME.primary[500] },
        { label: 'Blog', icon: BlogIcon, href: '/blog', color: '#10b981' },
        { label: 'Servicios', icon: ServicesIcon, href: '/services', color: '#f59e0b' },
        { label: 'Contacto', icon: ContactIcon, href: '/contact', color: '#ef4444' },
    ];

    return (
        <MainLayout>
            {/* LCP Performance Monitor (development only) */}
            {process.env.NODE_ENV === 'development' && (
                <Suspense fallback={null}>
                    <LCPMonitor />
                </Suspense>
            )}

            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#fafafa', // Simple background for faster rendering
                    position: 'relative',
                    py: { xs: 4, md: 8 }
                }}
            >
                {/* Lazy load animated background after LCP */}
                {enhancedFeaturesLoaded && (
                    <Suspense fallback={null}>
                        <AnimatedBackground />
                    </Suspense>
                )}

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={4} alignItems="center">
                        {/* Main 404 Content - Optimized for LCP */}
                        <Grid item xs={12} lg={6}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: { xs: 4, md: 6 },
                                    bgcolor: 'white',
                                    borderRadius: 3,
                                    border: '1px solid #e2e8f0',
                                    // Remove heavy effects for faster rendering
                                    ...(enhancedFeaturesLoaded && {
                                        background: `linear-gradient(145deg,
                                            rgba(255, 255, 255, 0.95) 0%,
                                            rgba(255, 255, 255, 0.9) 100%
                                        )`,
                                        backdropFilter: 'blur(20px) saturate(180%)',
                                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                                    })
                                }}
                            >
                                {/* Critical content rendered immediately */}
                                <Stack spacing={4} alignItems="center" textAlign="center">
                                    {/* Large 404 - This is likely the LCP element */}
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: { xs: '6rem', md: '8rem', lg: '10rem' },
                                            fontWeight: 900,
                                            color: THEME.error[500],
                                            lineHeight: 0.8,
                                            textShadow: '0 4px 8px rgba(239, 68, 68, 0.2)',
                                            // Ensure text renders immediately
                                            fontDisplay: 'swap'
                                        }}
                                    >
                                        404
                                    </Typography>

                                    <Stack spacing={2} alignItems="center">
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontWeight: 700,
                                                color: THEME.text.primary,
                                                fontSize: { xs: '1.5rem', md: '2rem' }
                                            }}
                                        >
                                            ¡Página no encontrada!
                                        </Typography>

                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: THEME.text.secondary,
                                                maxWidth: 500,
                                                lineHeight: 1.6,
                                                fontSize: { xs: '1rem', md: '1.1rem' }
                                            }}
                                        >
                                            Lo sentimos, la página que buscas no existe o ha sido movida.
                                            Pero no te preocupes, te ayudamos a encontrar lo que necesitas.
                                        </Typography>

                                        <Chip
                                            label="Error 404 - Recurso no encontrado"
                                            color="error"
                                            variant="outlined"
                                            sx={{ mt: 1 }}
                                        />
                                    </Stack>

                                    {/* Critical action buttons */}
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={2}
                                        sx={{ mt: 4 }}
                                    >
                                        <Button
                                            variant="outlined"
                                            startIcon={<BackIcon />}
                                            onClick={handleGoBack}
                                            size="large"
                                            sx={{
                                                borderColor: THEME.text.muted,
                                                color: THEME.text.secondary,
                                                '&:hover': {
                                                    borderColor: THEME.primary[500],
                                                    color: THEME.primary[600]
                                                }
                                            }}
                                        >
                                            Volver Atrás
                                        </Button>

                                        <Button
                                            variant="contained"
                                            component={Link}
                                            href="/"
                                            startIcon={<HomeIcon />}
                                            size="large"
                                            sx={{
                                                bgcolor: THEME.primary[500],
                                                '&:hover': {
                                                    bgcolor: THEME.primary[600]
                                                }
                                            }}
                                        >
                                            Ir al Inicio
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* Secondary Content - Load after LCP */}
                        <Grid item xs={12} lg={6}>
                            {enhancedFeaturesLoaded ? (
                                <Suspense fallback={
                                    <Stack spacing={2}>
                                        <Skeleton variant="rectangular" height={60} />
                                        <Skeleton variant="rectangular" height={200} />
                                        <Skeleton variant="rectangular" height={150} />
                                    </Stack>
                                }>
                                    <EnhancedSearch
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        handleSearch={handleSearch}
                                        popularPosts={popularPosts}
                                        categories={categories}
                                        recentPosts={recentPosts}
                                    />
                                </Suspense>
                            ) : (
                                // Simple fallback content for immediate render
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 4,
                                        bgcolor: 'white',
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <Stack spacing={3}>
                                        <Typography variant="h6" color={THEME.text.primary}>
                                            Navegación Rápida
                                        </Typography>

                                        <Grid container spacing={2}>
                                            {quickNavItems.map((item, index) => (
                                                <Grid item xs={6} sm={3} key={item.label}>
                                                    <Card
                                                        component={Link}
                                                        href={item.href}
                                                        sx={{
                                                            p: 2,
                                                            textAlign: 'center',
                                                            textDecoration: 'none',
                                                            transition: 'transform 0.2s ease',
                                                            '&:hover': {
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: 2
                                                            }
                                                        }}
                                                    >
                                                        <item.icon
                                                            sx={{
                                                                fontSize: 32,
                                                                color: item.color,
                                                                mb: 1
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontSize: '0.9rem',
                                                                color: THEME.text.primary
                                                            }}
                                                        >
                                                            {item.label}
                                                        </Typography>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Stack>
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </MainLayout>
    );
};

export default NotFound;
