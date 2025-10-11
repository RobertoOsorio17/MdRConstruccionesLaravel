import React, { useState, useEffect, lazy, Suspense } from 'react';
import DOMPurify from 'dompurify';
import axios from 'axios';

import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Card,
    CardContent,
    Avatar,
    Chip,
    Breadcrumbs,
    Link as MuiLink,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    IconButton,
    Skeleton,
    Badge,
    Tooltip,
    Fade,
    Zoom,
    Slide
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckIcon,
    Star as StarIcon,
    Phone as PhoneIcon,
    WhatsApp as WhatsAppIcon,
    Email as EmailIcon,
    Schedule as ScheduleIcon,
    Security as SecurityIcon,
    Build as BuildIcon,
    Bathtub as BathtubIcon,
    Kitchen as KitchenIcon,
    Apartment as ApartmentIcon,
    FormatPaint as PaintIcon,
    ElectricalServices as ElectricalIcon,
    Construction as ConstructionIcon,
    Share as ShareIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    AccessTime as TimeIcon,
    TrendingUp as TrendingIcon,
    Verified as VerifiedIcon,
    ArrowForward as ArrowForwardIcon,
    NavigateNext as NavigateNextIcon,
    Home as HomeIcon,
    RequestQuote as QuoteIcon,
    PhotoLibrary as GalleryIcon,
    Reviews as ReviewsIcon
} from '@mui/icons-material';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';

// Note: Enhanced components can be added later for additional features

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
        800: '#1e40af',
        900: '#1e3a8a',
    },
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
        900: '#0f172a',
    },
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        500: '#22c55e',
        600: '#16a34a',
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        500: '#f59e0b',
        600: '#d97706',
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        500: '#ef4444',
        600: '#dc2626',
    }
};

const getServiceIcon = (iconName, size = 60) => {
    const icons = {
        'Bathtub': <BathtubIcon sx={{ fontSize: size }} />,
        'Kitchen': <KitchenIcon sx={{ fontSize: size }} />,
        'Apartment': <ApartmentIcon sx={{ fontSize: size }} />,
        'FormatPaint': <PaintIcon sx={{ fontSize: size }} />,
        'ElectricalServices': <ElectricalIcon sx={{ fontSize: size }} />,
        'Construction': <ConstructionIcon sx={{ fontSize: size }} />,
    };
    return icons[iconName] || <BuildIcon sx={{ fontSize: size }} />;
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
};

const floatingVariants = {
    animate: {
        y: [-10, 10, -10],
        rotate: [-2, 2, -2],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export default function ServiceShow({ service, relatedServices = [], seo = {}, auth = null }) {
    const [expanded, setExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        service: service.title,
        property_type: '',
        property_size: '',
        budget_range: '',
        timeline: '',
        description: '',
        privacy_accepted: false,
    });

    // ✅ FIX: Pre-calculate floating element positions outside render
    const floatingElements = React.useMemo(() => [
        { top: '10%', left: '5%', width: 100, height: 100 },
        { top: '30%', left: '80%', width: 150, height: 150 },
        { top: '60%', left: '15%', width: 120, height: 120 },
        { top: '20%', left: '90%', width: 90, height: 90 },
        { top: '75%', left: '70%', width: 130, height: 130 },
        { top: '50%', left: '40%', width: 80, height: 80 },
        { top: '85%', left: '25%', width: 110, height: 110 },
        { top: '40%', left: '60%', width: 95, height: 95 },
    ], []);

    useEffect(() => {
        setMounted(true);
        // Check favorite status when component mounts
        checkFavoriteStatus();
    }, []);

    const checkFavoriteStatus = async () => {
        try {
            const response = await axios.get(`/api/services/${service.slug}/favorite-status`);
            if (response.data.success) {
                setIsFavorite(response.data.favorited);
                setFavoritesCount(response.data.favorites_count || 0);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/presupuesto', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleFavoriteToggle = async () => {
        if (!auth?.user) {
            // Redirect to login if not authenticated
            window.location.href = '/login';
            return;
        }

        if (isTogglingFavorite) return;

        setIsTogglingFavorite(true);

        try {
            const response = await axios.post(`/api/services/${service.slug}/favorite`);

            if (response.data.success) {
                setIsFavorite(response.data.favorited);
                setFavoritesCount(response.data.favorites_count || 0);

                // Optional: Show success message
                console.log(response.data.message);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Optional: Show error message
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: service.title,
                    text: service.excerpt,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const features = [
        { icon: <CheckIcon />, text: 'Presupuesto gratuito y sin compromiso', highlight: true },
        { icon: <ScheduleIcon />, text: 'Visita técnica incluida', highlight: false },
        { icon: <VerifiedIcon />, text: 'Materiales de primera calidad', highlight: true },
        { icon: <SecurityIcon />, text: 'Garantía de 2 años', highlight: false },
        { icon: <BuildIcon />, text: 'Equipo profesional propio', highlight: true },
        { icon: <TimeIcon />, text: 'Cumplimiento de plazos', highlight: false },
        { icon: <CheckIcon />, text: 'Limpieza final incluida', highlight: false },
        { icon: <StarIcon />, text: 'Servicio post-venta', highlight: true }
    ];

    const stats = [
        { label: 'Proyectos Completados', value: '150+', icon: <TrendingIcon /> },
        { label: 'Años de Experiencia', value: '10+', icon: <VerifiedIcon /> },
        { label: 'Satisfacción Cliente', value: '98%', icon: <StarIcon /> },
        { label: 'Garantía', value: '2 años', icon: <SecurityIcon /> }
    ];

    return (
        <MainLayout>
            <Head title={seo.title || `${service.title} - MDR Construcciones`} />

            {/* Premium Background with Floating Elements */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg,
                        ${THEME.primary[50]} 0%,
                        rgba(255, 255, 255, 0.95) 30%,
                        ${THEME.secondary[50]} 70%,
                        rgba(255, 255, 255, 0.9) 100%
                    )`,
                    zIndex: -2,
                    pointerEvents: 'none'
                }}
            >
                {/* Animated Background Elements */}
                {mounted && (
                    <>
                        {floatingElements.map((element, i) => (
                            <motion.div
                                key={i}
                                variants={floatingVariants}
                                animate="animate"
                                style={{
                                    position: 'absolute',
                                    top: element.top,
                                    left: element.left,
                                    width: `${element.width}px`,
                                    height: `${element.height}px`,
                                    background: `radial-gradient(circle, ${THEME.primary[200]}30 0%, transparent 70%)`,
                                    borderRadius: '50%',
                                    filter: 'blur(2px)',
                                }}
                            />
                        ))}
                    </>
                )}
            </Box>

            {/* Glassmorphism Breadcrumbs */}
            <Container maxWidth="lg" sx={{ pt: 3, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            background: `linear-gradient(145deg,
                                rgba(255, 255, 255, 0.9) 0%,
                                rgba(255, 255, 255, 0.7) 100%
                            )`,
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                            borderRadius: 3,
                            mb: 4
                        }}
                    >
                        <Breadcrumbs
                            aria-label="breadcrumb"
                            separator={<NavigateNextIcon fontSize="small" />}
                            sx={{
                                '& .MuiBreadcrumbs-separator': {
                                    color: THEME.primary[400]
                                }
                            }}
                        >
                            <MuiLink
                                component={Link}
                                href="/"
                                sx={{
                                    color: THEME.secondary[600],
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    '&:hover': {
                                        color: THEME.primary[600]
                                    }
                                }}
                            >
                                <HomeIcon fontSize="small" />
                                Inicio
                            </MuiLink>
                            <MuiLink
                                component={Link}
                                href="/servicios"
                                sx={{
                                    color: THEME.secondary[600],
                                    textDecoration: 'none',
                                    '&:hover': {
                                        color: THEME.primary[600]
                                    }
                                }}
                            >
                                Servicios
                            </MuiLink>
                            <Typography
                                sx={{
                                    color: THEME.primary[600],
                                    fontWeight: 600
                                }}
                            >
                                {service.title}
                            </Typography>
                        </Breadcrumbs>
                    </Paper>
                </motion.div>
            </Container>

            {/* Premium Hero Section */}
            <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 1 }}>
                <AnimatePresence>
                    {mounted && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Grid container spacing={6} alignItems="center">
                                <Grid item xs={12} lg={8}>
                                    <motion.div variants={itemVariants}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: { xs: 4, md: 6 },
                                                background: `linear-gradient(145deg,
                                                    rgba(255, 255, 255, 0.95) 0%,
                                                    rgba(255, 255, 255, 0.85) 100%
                                                )`,
                                                backdropFilter: 'blur(20px) saturate(180%)',
                                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                                border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                borderRadius: 4,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '4px',
                                                    background: `linear-gradient(90deg,
                                                        ${THEME.primary[500]} 0%,
                                                        ${THEME.primary[400]} 50%,
                                                        ${THEME.primary[600]} 100%
                                                    )`
                                                }
                                            }}
                                        >
                                            {/* Service Header */}
                                            <Stack spacing={4}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                                    {/* Service Icon */}
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 100,
                                                                height: 100,
                                                                borderRadius: '20px',
                                                                background: `linear-gradient(135deg,
                                                                    ${THEME.primary[500]} 0%,
                                                                    ${THEME.primary[600]} 100%
                                                                )`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                boxShadow: `0 8px 32px ${THEME.primary[500]}40`,
                                                                position: 'relative',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    inset: 0,
                                                                    borderRadius: '20px',
                                                                    padding: '2px',
                                                                    background: `linear-gradient(135deg,
                                                                        rgba(255, 255, 255, 0.3) 0%,
                                                                        transparent 50%,
                                                                        rgba(255, 255, 255, 0.1) 100%
                                                                    )`,
                                                                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                                                    maskComposite: 'xor'
                                                                }
                                                            }}
                                                        >
                                                            {getServiceIcon(service.icon, 48)}
                                                        </Box>
                                                    </motion.div>

                                                    {/* Service Title and Actions */}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                                            <Box>
                                                                <Typography
                                                                    variant="h1"
                                                                    sx={{
                                                                        fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                                                                        fontWeight: 800,
                                                                        color: THEME.secondary[900],
                                                                        lineHeight: 1.2,
                                                                        mb: 1
                                                                    }}
                                                                >
                                                                    {service.title}
                                                                </Typography>

                                                                {service.featured && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ delay: 0.5 }}
                                                                    >
                                                                        <Chip
                                                                            icon={<StarIcon />}
                                                                            label="Servicio Destacado"
                                                                            sx={{
                                                                                background: `linear-gradient(135deg,
                                                                                    ${THEME.warning[500]} 0%,
                                                                                    ${THEME.warning[600]} 100%
                                                                                )`,
                                                                                color: 'white',
                                                                                fontWeight: 600,
                                                                                '& .MuiChip-icon': {
                                                                                    color: 'white'
                                                                                }
                                                                            }}
                                                                        />
                                                                    </motion.div>
                                                                )}
                                                            </Box>

                                                            {/* Action Buttons */}
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}>
                                                                    <IconButton
                                                                        onClick={handleFavoriteToggle}
                                                                        disabled={isTogglingFavorite}
                                                                        sx={{
                                                                            background: `linear-gradient(145deg,
                                                                                rgba(255, 255, 255, 0.9) 0%,
                                                                                rgba(255, 255, 255, 0.7) 100%
                                                                            )`,
                                                                            backdropFilter: 'blur(10px)',
                                                                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                                            opacity: isTogglingFavorite ? 0.7 : 1,
                                                                            '&:hover': {
                                                                                background: `linear-gradient(145deg,
                                                                                    rgba(255, 255, 255, 1) 0%,
                                                                                    rgba(255, 255, 255, 0.9) 100%
                                                                                )`,
                                                                                transform: 'translateY(-2px)'
                                                                            },
                                                                            '&:disabled': {
                                                                                transform: 'none',
                                                                                opacity: 0.6
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isFavorite ?
                                                                            <FavoriteIcon sx={{ color: THEME.error[500] }} /> :
                                                                            <FavoriteBorderIcon sx={{ color: THEME.secondary[600] }} />
                                                                        }
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Compartir servicio">
                                                                    <IconButton
                                                                        onClick={handleShare}
                                                                        sx={{
                                                                            background: `linear-gradient(145deg,
                                                                                rgba(255, 255, 255, 0.9) 0%,
                                                                                rgba(255, 255, 255, 0.7) 100%
                                                                            )`,
                                                                            backdropFilter: 'blur(10px)',
                                                                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                                            '&:hover': {
                                                                                background: `linear-gradient(145deg,
                                                                                    rgba(255, 255, 255, 1) 0%,
                                                                                    rgba(255, 255, 255, 0.9) 100%
                                                                                )`,
                                                                                transform: 'translateY(-2px)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ShareIcon sx={{ color: THEME.secondary[600] }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </Stack>

                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                color: THEME.secondary[600],
                                                                lineHeight: 1.6,
                                                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                                                mb: 3
                                                            }}
                                                        >
                                                            {service.excerpt}
                                                        </Typography>

                                                        {/* CTA Buttons */}
                                                        <Stack
                                                            direction={{ xs: 'column', sm: 'row' }}
                                                            spacing={2}
                                                        >
                                                            <Button
                                                                variant="contained"
                                                                size="large"
                                                                startIcon={<QuoteIcon />}
                                                                sx={{
                                                                    py: 1.5,
                                                                    px: 4,
                                                                    background: `linear-gradient(135deg,
                                                                        ${THEME.primary[500]} 0%,
                                                                        ${THEME.primary[600]} 100%
                                                                    )`,
                                                                    borderRadius: 3,
                                                                    fontWeight: 600,
                                                                    fontSize: '1.1rem',
                                                                    textTransform: 'none',
                                                                    boxShadow: `0 8px 25px ${THEME.primary[500]}40`,
                                                                    '&:hover': {
                                                                        background: `linear-gradient(135deg,
                                                                            ${THEME.primary[600]} 0%,
                                                                            ${THEME.primary[700]} 100%
                                                                        )`,
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: `0 12px 35px ${THEME.primary[500]}50`
                                                                    }
                                                                }}
                                                            >
                                                                Solicitar Presupuesto
                                                            </Button>

                                                            <Button
                                                                variant="outlined"
                                                                size="large"
                                                                startIcon={<WhatsAppIcon />}
                                                                sx={{
                                                                    py: 1.5,
                                                                    px: 4,
                                                                    borderRadius: 3,
                                                                    fontWeight: 600,
                                                                    fontSize: '1.1rem',
                                                                    textTransform: 'none',
                                                                    borderColor: THEME.success[500],
                                                                    color: THEME.success[600],
                                                                    background: `linear-gradient(145deg,
                                                                        rgba(255, 255, 255, 0.9) 0%,
                                                                        rgba(255, 255, 255, 0.7) 100%
                                                                    )`,
                                                                    backdropFilter: 'blur(10px)',
                                                                    '&:hover': {
                                                                        borderColor: THEME.success[600],
                                                                        background: `linear-gradient(145deg,
                                                                            ${THEME.success[50]} 0%,
                                                                            rgba(255, 255, 255, 0.9) 100%
                                                                        )`,
                                                                        transform: 'translateY(-2px)'
                                                                    }
                                                                }}
                                                            >
                                                                WhatsApp
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </motion.div>
                                </Grid>

                                {/* Stats and Features Sidebar */}
                                <Grid item xs={12} lg={4}>
                                    <Stack spacing={3}>
                                        {/* Stats Cards */}
                                        <motion.div variants={itemVariants}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 4,
                                                    background: `linear-gradient(145deg,
                                                        rgba(255, 255, 255, 0.95) 0%,
                                                        rgba(255, 255, 255, 0.85) 100%
                                                    )`,
                                                    backdropFilter: 'blur(20px) saturate(180%)',
                                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                    borderRadius: 4,
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: THEME.secondary[900],
                                                        mb: 3,
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Nuestros Números
                                                </Typography>

                                                <Grid container spacing={2}>
                                                    {stats.map((stat, index) => (
                                                        <Grid item xs={6} key={index}>
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: 0.6 + index * 0.1 }}
                                                            >
                                                                <Card
                                                                    sx={{
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        background: `linear-gradient(135deg,
                                                                            ${THEME.primary[50]} 0%,
                                                                            rgba(255, 255, 255, 0.8) 100%
                                                                        )`,
                                                                        border: `1px solid ${THEME.primary[200]}`,
                                                                        borderRadius: 3,
                                                                        transition: 'all 0.3s ease',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-4px)',
                                                                            boxShadow: `0 8px 25px ${THEME.primary[500]}20`
                                                                        }
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            width: 40,
                                                                            height: 40,
                                                                            borderRadius: '50%',
                                                                            background: `linear-gradient(135deg,
                                                                                ${THEME.primary[500]} 0%,
                                                                                ${THEME.primary[600]} 100%
                                                                            )`,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            mx: 'auto',
                                                                            mb: 1,
                                                                            color: 'white'
                                                                        }}
                                                                    >
                                                                        {React.cloneElement(stat.icon, { fontSize: 'small' })}
                                                                    </Box>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            fontWeight: 800,
                                                                            color: THEME.primary[600],
                                                                            fontSize: '1.25rem'
                                                                        }}
                                                                    >
                                                                        {stat.value}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: THEME.secondary[600],
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 500
                                                                        }}
                                                                    >
                                                                        {stat.label}
                                                                    </Typography>
                                                                </Card>
                                                            </motion.div>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Paper>
                                        </motion.div>

                                        {/* Features List */}
                                        <motion.div variants={itemVariants}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 4,
                                                    background: `linear-gradient(145deg,
                                                        rgba(255, 255, 255, 0.95) 0%,
                                                        rgba(255, 255, 255, 0.85) 100%
                                                    )`,
                                                    backdropFilter: 'blur(20px) saturate(180%)',
                                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                    borderRadius: 4,
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: THEME.secondary[900],
                                                        mb: 3,
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    ¿Qué Incluye?
                                                </Typography>

                                                <List dense sx={{ p: 0 }}>
                                                    {features.map((feature, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.8 + index * 0.1 }}
                                                        >
                                                            <ListItem
                                                                sx={{
                                                                    px: 0,
                                                                    py: 1,
                                                                    borderRadius: 2,
                                                                    mb: 0.5,
                                                                    ...(feature.highlight && {
                                                                        background: `linear-gradient(135deg,
                                                                            ${THEME.success[50]} 0%,
                                                                            rgba(255, 255, 255, 0.5) 100%
                                                                        )`,
                                                                        border: `1px solid ${THEME.success[200]}`
                                                                    })
                                                                }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 24,
                                                                            height: 24,
                                                                            borderRadius: '50%',
                                                                            background: feature.highlight ?
                                                                                `linear-gradient(135deg, ${THEME.success[500]} 0%, ${THEME.success[600]} 100%)` :
                                                                                `linear-gradient(135deg, ${THEME.primary[500]} 0%, ${THEME.primary[600]} 100%)`,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: 'white'
                                                                        }}
                                                                    >
                                                                        {React.cloneElement(feature.icon, { fontSize: 'small' })}
                                                                    </Box>
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={feature.text}
                                                                    primaryTypographyProps={{
                                                                        variant: 'body2',
                                                                        fontWeight: feature.highlight ? 600 : 500,
                                                                        color: feature.highlight ? THEME.success[700] : THEME.secondary[700]
                                                                    }}
                                                                />
                                                                {feature.highlight && (
                                                                    <Chip
                                                                        label="Premium"
                                                                        size="small"
                                                                        sx={{
                                                                            background: `linear-gradient(135deg,
                                                                                ${THEME.success[500]} 0%,
                                                                                ${THEME.success[600]} 100%
                                                                            )`,
                                                                            color: 'white',
                                                                            fontSize: '0.7rem',
                                                                            height: 20
                                                                        }}
                                                                    />
                                                                )}
                                                            </ListItem>
                                                        </motion.div>
                                                    ))}
                                                </List>
                                            </Paper>
                                        </motion.div>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>

            {/* Detailed Content Section */}
            <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 1 }}>
                <Grid container spacing={6}>
                    <Grid item xs={12} lg={8}>
                        {/* Service Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 4, md: 6 },
                                    mb: 6,
                                    background: `linear-gradient(145deg,
                                        rgba(255, 255, 255, 0.95) 0%,
                                        rgba(255, 255, 255, 0.85) 100%
                                    )`,
                                    backdropFilter: 'blur(20px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                                    borderRadius: 4,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg,
                                            ${THEME.secondary[400]} 0%,
                                            ${THEME.secondary[500]} 50%,
                                            ${THEME.secondary[600]} 100%
                                        )`
                                    }
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: THEME.secondary[900],
                                        mb: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '12px',
                                            background: `linear-gradient(135deg,
                                                ${THEME.secondary[500]} 0%,
                                                ${THEME.secondary[600]} 100%
                                            )`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}
                                    >
                                        <ReviewsIcon />
                                    </Box>
                                    Descripción del Servicio
                                </Typography>

                                <Box
                                    sx={{
                                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                                            color: THEME.primary[600],
                                            fontWeight: 600,
                                            mt: 3,
                                            mb: 2,
                                            '&:first-of-type': {
                                                mt: 0
                                            }
                                        },
                                        '& p': {
                                            mb: 2,
                                            lineHeight: 1.7,
                                            color: THEME.secondary[700],
                                            fontSize: '1.1rem'
                                        },
                                        '& ul, & ol': {
                                            pl: 3,
                                            mb: 2,
                                            '& li': {
                                                mb: 1,
                                                color: THEME.secondary[700],
                                                fontSize: '1.05rem'
                                            }
                                        },
                                        '& strong': {
                                            color: THEME.primary[600],
                                            fontWeight: 600
                                        },
                                        '& blockquote': {
                                            borderLeft: `4px solid ${THEME.primary[500]}`,
                                            pl: 3,
                                            py: 2,
                                            my: 3,
                                            background: `linear-gradient(135deg,
                                                ${THEME.primary[50]} 0%,
                                                rgba(255, 255, 255, 0.5) 100%
                                            )`,
                                            borderRadius: '0 8px 8px 0',
                                            fontStyle: 'italic',
                                            color: THEME.primary[700]
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.body) }}
                                />
                            </Paper>
                        </motion.div>

                        {/* FAQ Section */}
                        {service.faq && service.faq.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 4, md: 6 },
                                        background: `linear-gradient(145deg,
                                            rgba(255, 255, 255, 0.95) 0%,
                                            rgba(255, 255, 255, 0.85) 100%
                                        )`,
                                        backdropFilter: 'blur(20px) saturate(180%)',
                                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                                        borderRadius: 4,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: `linear-gradient(90deg,
                                                ${THEME.warning[400]} 0%,
                                                ${THEME.warning[500]} 50%,
                                                ${THEME.warning[600]} 100%
                                            )`
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: THEME.secondary[900],
                                            mb: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '12px',
                                                background: `linear-gradient(135deg,
                                                    ${THEME.warning[500]} 0%,
                                                    ${THEME.warning[600]} 100%
                                                )`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}
                                        >
                                            <ExpandMoreIcon />
                                        </Box>
                                        Preguntas Frecuentes
                                    </Typography>

                                    <Stack spacing={2}>
                                        {service.faq.map((faq, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <Accordion
                                                    expanded={expanded === `panel${index}`}
                                                    onChange={handleAccordionChange(`panel${index}`)}
                                                    sx={{
                                                        background: `linear-gradient(145deg,
                                                            rgba(255, 255, 255, 0.9) 0%,
                                                            rgba(255, 255, 255, 0.7) 100%
                                                        )`,
                                                        backdropFilter: 'blur(10px)',
                                                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                        borderRadius: '12px !important',
                                                        boxShadow: 'none',
                                                        '&:before': {
                                                            display: 'none'
                                                        },
                                                        '&.Mui-expanded': {
                                                            margin: '8px 0',
                                                            background: `linear-gradient(145deg,
                                                                ${THEME.primary[50]} 0%,
                                                                rgba(255, 255, 255, 0.9) 100%
                                                            )`,
                                                            border: `1px solid ${THEME.primary[200]}`
                                                        }
                                                    }}
                                                >
                                                    <AccordionSummary
                                                        expandIcon={
                                                            <ExpandMoreIcon
                                                                sx={{
                                                                    color: THEME.primary[600],
                                                                    transition: 'transform 0.3s ease'
                                                                }}
                                                            />
                                                        }
                                                        sx={{
                                                            '& .MuiAccordionSummary-content': {
                                                                margin: '16px 0'
                                                            }
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: THEME.secondary[800],
                                                                fontSize: '1.1rem'
                                                            }}
                                                        >
                                                            {faq.question}
                                                        </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails
                                                        sx={{
                                                            pt: 0,
                                                            pb: 3
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                color: THEME.secondary[700],
                                                                lineHeight: 1.6,
                                                                fontSize: '1rem'
                                                            }}
                                                        >
                                                            {faq.answer}
                                                        </Typography>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </motion.div>
                                        ))}
                                    </Stack>
                                </Paper>
                            </motion.div>
                        )}
                    </Grid>

                    {/* Sidebar with Quote Form and Related Services */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={4}>
                            {/* Premium Quote Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        background: `linear-gradient(145deg,
                                            ${THEME.primary[500]} 0%,
                                            ${THEME.primary[600]} 100%
                                        )`,
                                        color: 'white',
                                        borderRadius: 4,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: `radial-gradient(circle at top right,
                                                rgba(255, 255, 255, 0.1) 0%,
                                                transparent 50%
                                            )`,
                                            pointerEvents: 'none'
                                        }
                                    }}
                                >
                                    <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 1
                                                }}
                                            >
                                                Solicita tu Presupuesto
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    opacity: 0.9,
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                Respuesta en menos de 24 horas
                                            </Typography>
                                        </Box>

                                        <Box component="form" onSubmit={handleSubmit}>
                                            <Stack spacing={3}>
                                                <TextField
                                                    fullWidth
                                                    label="Nombre completo"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    error={!!errors.name}
                                                    helperText={errors.name}
                                                    required
                                                    variant="filled"
                                                    sx={{
                                                        '& .MuiFilledInput-root': {
                                                            bgcolor: 'rgba(255,255,255,0.15)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255,255,255,0.2)'
                                                            },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'rgba(255,255,255,0.2)'
                                                            }
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: 'rgba(255,255,255,0.8)'
                                                        },
                                                        '& .MuiFilledInput-input': {
                                                            color: 'white'
                                                        }
                                                    }}
                                                />

                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    error={!!errors.email}
                                                    helperText={errors.email}
                                                    required
                                                    variant="filled"
                                                    sx={{
                                                        '& .MuiFilledInput-root': {
                                                            bgcolor: 'rgba(255,255,255,0.15)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255,255,255,0.2)'
                                                            },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'rgba(255,255,255,0.2)'
                                                            }
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: 'rgba(255,255,255,0.8)'
                                                        },
                                                        '& .MuiFilledInput-input': {
                                                            color: 'white'
                                                        }
                                                    }}
                                                />

                                                <TextField
                                                    fullWidth
                                                    label="Teléfono"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    error={!!errors.phone}
                                                    helperText={errors.phone}
                                                    required
                                                    variant="filled"
                                                    sx={{
                                                        '& .MuiFilledInput-root': {
                                                            bgcolor: 'rgba(255,255,255,0.15)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255,255,255,0.2)'
                                                            },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'rgba(255,255,255,0.2)'
                                                            }
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: 'rgba(255,255,255,0.8)'
                                                        },
                                                        '& .MuiFilledInput-input': {
                                                            color: 'white'
                                                        }
                                                    }}
                                                />

                                                <TextField
                                                    fullWidth
                                                    label="Describe tu proyecto"
                                                    multiline
                                                    rows={3}
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    error={!!errors.description}
                                                    helperText={errors.description}
                                                    required
                                                    variant="filled"
                                                    sx={{
                                                        '& .MuiFilledInput-root': {
                                                            bgcolor: 'rgba(255,255,255,0.15)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255,255,255,0.2)'
                                                            },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'rgba(255,255,255,0.2)'
                                                            }
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: 'rgba(255,255,255,0.8)'
                                                        },
                                                        '& .MuiFilledInput-input': {
                                                            color: 'white'
                                                        }
                                                    }}
                                                />

                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={data.privacy_accepted}
                                                            onChange={(e) => setData('privacy_accepted', e.target.checked)}
                                                            sx={{
                                                                color: 'rgba(255,255,255,0.8)',
                                                                '&.Mui-checked': {
                                                                    color: 'white'
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                                            Acepto la{' '}
                                                            <MuiLink
                                                                component={Link}
                                                                href="/politica-privacidad"
                                                                sx={{
                                                                    color: THEME.warning[300],
                                                                    textDecoration: 'underline'
                                                                }}
                                                            >
                                                                política de privacidad
                                                            </MuiLink>
                                                        </Typography>
                                                    }
                                                />

                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    fullWidth
                                                    size="large"
                                                    disabled={processing}
                                                    sx={{
                                                        py: 1.5,
                                                        fontSize: '1.1rem',
                                                        fontWeight: 600,
                                                        background: `linear-gradient(135deg,
                                                            ${THEME.warning[500]} 0%,
                                                            ${THEME.warning[600]} 100%
                                                        )`,
                                                        borderRadius: 3,
                                                        textTransform: 'none',
                                                        boxShadow: `0 8px 25px ${THEME.warning[500]}40`,
                                                        '&:hover': {
                                                            background: `linear-gradient(135deg,
                                                                ${THEME.warning[600]} 0%,
                                                                ${THEME.warning[700]} 100%
                                                            )`,
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: `0 12px 35px ${THEME.warning[500]}50`
                                                        },
                                                        '&:disabled': {
                                                            background: 'rgba(255,255,255,0.3)',
                                                            color: 'rgba(255,255,255,0.7)'
                                                        }
                                                    }}
                                                >
                                                    {processing ? 'Enviando...' : 'Solicitar Presupuesto Gratis'}
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </motion.div>

                            {/* Related Services */}
                            {relatedServices && relatedServices.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            background: `linear-gradient(145deg,
                                                rgba(255, 255, 255, 0.95) 0%,
                                                rgba(255, 255, 255, 0.85) 100%
                                            )`,
                                            backdropFilter: 'blur(20px) saturate(180%)',
                                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                                            borderRadius: 4,
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                color: THEME.secondary[900],
                                                mb: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <ArrowForwardIcon sx={{ color: THEME.primary[500] }} />
                                            Servicios Relacionados
                                        </Typography>

                                        <Stack spacing={2}>
                                            {relatedServices.map((relatedService, index) => (
                                                <motion.div
                                                    key={relatedService.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                >
                                                    <Card
                                                        component={Link}
                                                        href={`/servicios/${relatedService.slug}`}
                                                        sx={{
                                                            textDecoration: 'none',
                                                            background: `linear-gradient(145deg,
                                                                rgba(255, 255, 255, 0.9) 0%,
                                                                rgba(255, 255, 255, 0.7) 100%
                                                            )`,
                                                            backdropFilter: 'blur(10px)',
                                                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                            borderRadius: 3,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px) translateX(8px)',
                                                                boxShadow: `0 8px 25px ${THEME.primary[500]}20`,
                                                                border: `1px solid ${THEME.primary[200]}`
                                                            }
                                                        }}
                                                    >
                                                        <CardContent sx={{ p: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Box
                                                                    sx={{
                                                                        width: 48,
                                                                        height: 48,
                                                                        borderRadius: '12px',
                                                                        background: `linear-gradient(135deg,
                                                                            ${THEME.primary[500]} 0%,
                                                                            ${THEME.primary[600]} 100%
                                                                        )`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: 'white'
                                                                    }}
                                                                >
                                                                    {getServiceIcon(relatedService.icon, 24)}
                                                                </Box>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography
                                                                        variant="subtitle1"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            color: THEME.secondary[800],
                                                                            mb: 0.5
                                                                        }}
                                                                    >
                                                                        {relatedService.title}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            color: THEME.secondary[600],
                                                                            fontSize: '0.9rem'
                                                                        }}
                                                                    >
                                                                        {relatedService.excerpt.substring(0, 80)}...
                                                                    </Typography>
                                                                </Box>
                                                                <ArrowForwardIcon
                                                                    sx={{
                                                                        color: THEME.primary[500],
                                                                        fontSize: 20
                                                                    }}
                                                                />
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </motion.div>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* Enhanced Features Section - Can be added later */}
        </MainLayout>
    );
}