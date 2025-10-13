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
    Slide,
    useMediaQuery,
    useTheme
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
import ImageGallery from '@/Components/Services/ImageGallery';
import { StatCard } from '@/Components/Services/AnimatedCounter';
import StickyCTAButton from '@/Components/Services/StickyCTAButton';

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

const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

const slideInLeftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const slideInRightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

export default function ServiceShow({ service, relatedServices = [], prevService = null, nextService = null, seo = {}, auth = null }) {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

    const [expanded, setExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);
    const [readProgress, setReadProgress] = useState(0);

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

        // Read progress tracker
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setReadProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
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

            {/* Read Progress Bar */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: `${readProgress}%`,
                    height: 3,
                    bgcolor: THEME.primary[500],
                    zIndex: 9999,
                    transition: 'width 0.1s ease',
                    boxShadow: `0 0 10px ${THEME.primary[500]}80`
                }}
            />

            {/* Premium Background with Floating Elements */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
                        : `linear-gradient(135deg,
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
                {mounted && isMdUp && (
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
                                    filter: 'blur(40px)',
                                }}
                            />
                        ))}
                    </>
                )}
            </Box>

            {/* Breadcrumbs Navigation */}
            <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        sx={{
                            '& .MuiBreadcrumbs-separator': {
                                color: THEME.secondary[400]
                            }
                        }}
                    >
                        <MuiLink
                            component={Link}
                            href="/"
                            underline="hover"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: THEME.secondary[600],
                                '&:hover': {
                                    color: THEME.primary[600]
                                }
                            }}
                        >
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                            Inicio
                        </MuiLink>
                        <MuiLink
                            component={Link}
                            href="/servicios"
                            underline="hover"
                            sx={{
                                color: THEME.secondary[600],
                                '&:hover': {
                                    color: THEME.primary[600]
                                }
                            }}
                        >
                            Servicios
                        </MuiLink>
                        <Typography
                            color="text.primary"
                            sx={{
                                fontWeight: 600,
                                color: THEME.primary[600]
                            }}
                        >
                            {service.title}
                        </Typography>
                    </Breadcrumbs>
                </motion.div>
            </Container>

            {/* Premium Hero Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: 'relative', zIndex: 1 }}>
                {/* Featured Image */}
                {service.featured_image && (
                    <motion.div
                        variants={scaleInVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Box
                            component="img"
                            src={service.featured_image}
                            alt={service.title}
                            sx={{
                                width: '100%',
                                height: { xs: 200, sm: 300, md: 400 },
                                objectFit: 'cover',
                                borderRadius: 4,
                                mb: 4,
                                boxShadow: `0 20px 60px ${THEME.primary[500]}20`
                            }}
                        />
                    </motion.div>
                )}

                <Grid container spacing={{ xs: 3, sm: 4, md: 5, lg: 6 }} alignItems="flex-start">
                    <Grid item xs={12} md={8} lg={8}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: { xs: 3, sm: 4, md: 6 },
                                                background: (theme) => theme.palette.mode === 'dark'
                                                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                                    : `linear-gradient(145deg,
                                                        rgba(255, 255, 255, 0.95) 0%,
                                                        rgba(255, 255, 255, 0.85) 100%
                                                    )`,
                                                backdropFilter: 'blur(20px) saturate(180%)',
                                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                                border: (theme) => theme.palette.mode === 'dark'
                                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                                    : `1px solid rgba(255, 255, 255, 0.3)`,
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
                                                                width: { xs: 64, sm: 80, md: 100 },
                                                                height: { xs: 64, sm: 80, md: 100 },
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

                                                                <Tooltip title={shareSuccess ? "¡Enlace copiado!" : "Compartir servicio"}>
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
                                                                component={Link}
                                                                href="/contacto"
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
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    '&::before': {
                                                                        content: '""',
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: '-100%',
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                                        transition: 'left 0.5s'
                                                                    },
                                                                    '&:hover': {
                                                                        background: `linear-gradient(135deg,
                                                                            ${THEME.primary[600]} 0%,
                                                                            ${THEME.primary[700]} 100%
                                                                        )`,
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: `0 12px 35px ${THEME.primary[500]}50`,
                                                                        '&::before': {
                                                                            left: '100%'
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                Solicitar Presupuesto
                                                            </Button>

                                                            <Button
                                                                component="a"
                                                                href="https://wa.me/34123456789"
                                                                target="_blank"
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
                                                                    borderWidth: 2,
                                                                    '&:hover': {
                                                                        borderColor: THEME.success[600],
                                                                        borderWidth: 2,
                                                                        background: `linear-gradient(145deg,
                                                                            ${THEME.success[50]} 0%,
                                                                            rgba(255, 255, 255, 0.9) 100%
                                                                        )`,
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: `0 8px 25px ${THEME.success[500]}30`
                                                                    }
                                                                }}
                                                            >
                                                                Contactar WhatsApp
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </motion.div>
                                </Grid>

                                {/* Stats and Features Sidebar */}
                                <Grid item xs={12} md={4} lg={4}>
                                    <motion.div
                                        initial={{ opacity: 0, x: 40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                    <Stack spacing={3}>
                                        {/* Stats Cards */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
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
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Nuestros Números
                                                </Typography>

                                                <Grid container spacing={2}>
                                                    {stats.map((stat, index) => (
                                                        <Grid item xs={12} sm={6} key={index}>
                                                            <StatCard
                                                                stat={stat}
                                                                index={index}
                                                                theme={THEME}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Paper>
                                        </motion.div>

                                        {/* Features List */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.4 }}
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
                                    </motion.div>
                                </Grid>
                            </Grid>
            </Container>

            {/* Detailed Content Section */}
            <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 1 }}>
                <Grid container spacing={{ xs: 3, sm: 4, md: 5, lg: 6 }}>
                    <Grid item xs={12} md={8} lg={8}>
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

                    {/* Sidebar with CTA and Related Services */}
                    <Grid item xs={12} md={4} lg={4}>
                        <Stack spacing={4}>
                            {/* Premium CTA Card */}
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
                                                rgba(255, 255, 255, 0.15) 0%,
                                                transparent 60%
                                            )`,
                                            pointerEvents: 'none'
                                        },
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                            opacity: 0.3,
                                            pointerEvents: 'none'
                                        }
                                    }}
                                >
                                    <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.3, type: "spring" }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: '50%',
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto 16px',
                                                        backdropFilter: 'blur(10px)',
                                                        border: '2px solid rgba(255, 255, 255, 0.3)'
                                                    }}
                                                >
                                                    <QuoteIcon sx={{ fontSize: 40 }} />
                                                </Box>
                                            </motion.div>

                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 1
                                                }}
                                            >
                                                ¿Interesado en este servicio?
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    opacity: 0.95,
                                                    fontSize: '1rem',
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                Contáctanos para recibir un presupuesto personalizado sin compromiso
                                            </Typography>
                                        </Box>

                                        <Stack spacing={2}>
                                            <Button
                                                component={Link}
                                                href="/contacto"
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                startIcon={<EmailIcon />}
                                                sx={{
                                                    py: 1.8,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    background: 'white',
                                                    color: THEME.primary[600],
                                                    borderRadius: 3,
                                                    textTransform: 'none',
                                                    boxShadow: `0 8px 25px rgba(0,0,0,0.15)`,
                                                    '&:hover': {
                                                        background: 'rgba(255, 255, 255, 0.95)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: `0 12px 35px rgba(0,0,0,0.2)`
                                                    }
                                                }}
                                            >
                                                Ir a Contacto
                                            </Button>

                                            <Button
                                                component="a"
                                                href="https://wa.me/34123456789"
                                                target="_blank"
                                                variant="outlined"
                                                size="large"
                                                fullWidth
                                                startIcon={<WhatsAppIcon />}
                                                sx={{
                                                    py: 1.8,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    borderRadius: 3,
                                                    textTransform: 'none',
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                    color: 'white',
                                                    borderWidth: 2,
                                                    '&:hover': {
                                                        borderColor: 'white',
                                                        borderWidth: 2,
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                WhatsApp Directo
                                            </Button>
                                        </Stack>

                                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                                        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                    24h
                                                </Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                    Respuesta
                                                </Typography>
                                            </Box>
                                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                    Gratis
                                                </Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                    Presupuesto
                                                </Typography>
                                            </Box>
                                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                    100%
                                                </Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                    Garantía
                                                </Typography>
                                            </Box>
                                        </Stack>
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
                                                                transform: 'translateY(-4px)',
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

            {/* Image Gallery Section */}
            {service.images && service.images.length > 0 && (
                <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 4, md: 6 },
                                background: (theme) => theme.palette.mode === 'dark'
                                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                    : `linear-gradient(145deg,
                                        rgba(255, 255, 255, 0.95) 0%,
                                        rgba(255, 255, 255, 0.85) 100%
                                    )`,
                                backdropFilter: 'blur(20px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                border: (theme) => theme.palette.mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : `1px solid rgba(255, 255, 255, 0.3)`,
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
                                        ${THEME.success[400]} 0%,
                                        ${THEME.success[500]} 50%,
                                        ${THEME.success[600]} 100%
                                    )`
                                }
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : THEME.secondary[900],
                                    mb: 2,
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
                                            ${THEME.success[500]} 0%,
                                            ${THEME.success[600]} 100%
                                        )`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    <GalleryIcon />
                                </Box>
                                Galería del Servicio
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : THEME.secondary[600],
                                    mb: 3
                                }}
                            >
                                Descubre ejemplos reales de nuestro trabajo y resultados
                            </Typography>

                            <ImageGallery images={service.images} />
                        </Paper>
                    </motion.div>
                </Container>
            )}

            {/* Testimonials Section */}
            {service.testimonials && service.testimonials.length > 0 && (
                <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 1 }}>
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
                                    <ReviewsIcon />
                                </Box>
                                Testimonios de Clientes
                            </Typography>

                            <Grid container spacing={3}>
                                {service.testimonials.map((testimonial, index) => (
                                    <Grid item xs={12} md={6} key={index}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <Card
                                                sx={{
                                                    background: `linear-gradient(145deg,
                                                        rgba(255, 255, 255, 0.9) 0%,
                                                        rgba(255, 255, 255, 0.7) 100%
                                                    )`,
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                    borderRadius: 3,
                                                    height: '100%'
                                                }}
                                            >
                                                <CardContent sx={{ p: 3 }}>
                                                    <Stack spacing={2}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <StarIcon
                                                                    key={i}
                                                                    sx={{
                                                                        fontSize: 20,
                                                                        color: i < (testimonial.rating || 5)
                                                                            ? THEME.warning[500]
                                                                            : THEME.secondary[300]
                                                                    }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                color: THEME.secondary[700],
                                                                fontStyle: 'italic',
                                                                lineHeight: 1.6
                                                            }}
                                                        >
                                                            "{testimonial.comment}"
                                                        </Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    bgcolor: THEME.primary[500]
                                                                }}
                                                            >
                                                                {testimonial.name?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        color: THEME.secondary[800]
                                                                    }}
                                                                >
                                                                    {testimonial.name}
                                                                </Typography>
                                                                {testimonial.project && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{ color: THEME.secondary[600] }}
                                                                    >
                                                                        {testimonial.project}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </motion.div>
                </Container>
            )}

            {/* Service Navigation (Prev/Next) */}
            {(prevService || nextService) && (
                <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
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
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                spacing={2}
                            >
                                {prevService ? (
                                    <Button
                                        component={Link}
                                        href={`/servicios/${prevService.slug}`}
                                        variant="outlined"
                                        startIcon={<NavigateNextIcon sx={{ transform: 'rotate(180deg)' }} />}
                                        sx={{
                                            flex: 1,
                                            py: 1.5,
                                            borderRadius: 2,
                                            borderColor: THEME.primary[300],
                                            color: THEME.primary[600],
                                            textTransform: 'none',
                                            justifyContent: 'flex-start',
                                            '&:hover': {
                                                borderColor: THEME.primary[500],
                                                background: `linear-gradient(135deg,
                                                    ${THEME.primary[50]} 0%,
                                                    rgba(255, 255, 255, 0.9) 100%
                                                )`,
                                                transform: 'translateX(-4px)'
                                            }
                                        }}
                                    >
                                        <Stack alignItems="flex-start" sx={{ textAlign: 'left' }}>
                                            <Typography variant="caption" sx={{ color: THEME.secondary[500] }}>
                                                Anterior
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: THEME.primary[700]
                                                }}
                                            >
                                                {prevService.title}
                                            </Typography>
                                        </Stack>
                                    </Button>
                                ) : <Box sx={{ flex: 1 }} />}

                                {nextService ? (
                                    <Button
                                        component={Link}
                                        href={`/servicios/${nextService.slug}`}
                                        variant="outlined"
                                        endIcon={<NavigateNextIcon />}
                                        sx={{
                                            flex: 1,
                                            py: 1.5,
                                            borderRadius: 2,
                                            borderColor: THEME.primary[300],
                                            color: THEME.primary[600],
                                            textTransform: 'none',
                                            justifyContent: 'flex-end',
                                            '&:hover': {
                                                borderColor: THEME.primary[500],
                                                background: `linear-gradient(135deg,
                                                    ${THEME.primary[50]} 0%,
                                                    rgba(255, 255, 255, 0.9) 100%
                                                )`,
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                    >
                                        <Stack alignItems="flex-end" sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" sx={{ color: THEME.secondary[500] }}>
                                                Siguiente
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: THEME.primary[700]
                                                }}
                                            >
                                                {nextService.title}
                                            </Typography>
                                        </Stack>
                                    </Button>
                                ) : <Box sx={{ flex: 1 }} />}
                            </Stack>
                        </Paper>
                    </motion.div>
                </Container>
            )}

            {/* Process/Workflow Section */}
            <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Chip
                            label="Nuestro Proceso"
                            sx={{
                                mb: 2,
                                background: `linear-gradient(135deg, ${THEME.primary[500]} 0%, ${THEME.primary[600]} 100%)`,
                                color: 'white',
                                fontWeight: 600,
                                px: 2
                            }}
                        />
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                color: THEME.secondary[900],
                                mb: 2
                            }}
                        >
                            ¿Cómo Trabajamos?
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: THEME.secondary[600],
                                maxWidth: 600,
                                mx: 'auto',
                                lineHeight: 1.6
                            }}
                        >
                            Proceso simple y transparente para tu tranquilidad
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {[
                            {
                                step: '01',
                                title: 'Consulta Inicial',
                                description: 'Contáctanos y cuéntanos sobre tu proyecto. Analizamos tus necesidades.',
                                icon: <PhoneIcon sx={{ fontSize: 32 }} />,
                                color: THEME.primary
                            },
                            {
                                step: '02',
                                title: 'Visita y Presupuesto',
                                description: 'Visitamos el sitio, tomamos medidas y preparamos un presupuesto detallado.',
                                icon: <ScheduleIcon sx={{ fontSize: 32 }} />,
                                color: THEME.success
                            },
                            {
                                step: '03',
                                title: 'Ejecución',
                                description: 'Iniciamos los trabajos con materiales de primera calidad y equipo profesional.',
                                icon: <BuildIcon sx={{ fontSize: 32 }} />,
                                color: THEME.warning
                            },
                            {
                                step: '04',
                                title: 'Entrega',
                                description: 'Finalizamos con limpieza total y garantía de 2 años en todos los trabajos.',
                                icon: <VerifiedIcon sx={{ fontSize: 32 }} />,
                                color: THEME.success
                            }
                        ].map((process, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            height: '100%',
                                            background: `linear-gradient(145deg,
                                                rgba(255, 255, 255, 0.95) 0%,
                                                rgba(255, 255, 255, 0.85) 100%
                                            )`,
                                            backdropFilter: 'blur(20px) saturate(180%)',
                                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                            border: `2px solid ${process.color[200]}`,
                                            borderRadius: 4,
                                            position: 'relative',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: `0 16px 40px ${process.color[500]}30`,
                                                border: `2px solid ${process.color[400]}`
                                            }
                                        }}
                                    >
                                        {/* Step Number */}
                                        <Typography
                                            variant="h2"
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: 20,
                                                fontWeight: 900,
                                                fontSize: '4rem',
                                                color: `${process.color[200]}60`,
                                                lineHeight: 1
                                            }}
                                        >
                                            {process.step}
                                        </Typography>

                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                width: 72,
                                                height: 72,
                                                borderRadius: '50%',
                                                background: `linear-gradient(135deg,
                                                    ${process.color[500]} 0%,
                                                    ${process.color[600]} 100%
                                                )`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                mb: 3,
                                                boxShadow: `0 8px 24px ${process.color[500]}40`,
                                                position: 'relative',
                                                zIndex: 1
                                            }}
                                        >
                                            {process.icon}
                                        </Box>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                color: THEME.secondary[800],
                                                mb: 1.5
                                            }}
                                        >
                                            {process.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: THEME.secondary[600],
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {process.description}
                                        </Typography>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            </Container>

            {/* Final CTA Section */}
            <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 8 },
                            background: `linear-gradient(145deg,
                                ${THEME.primary[500]} 0%,
                                ${THEME.primary[700]} 100%
                            )`,
                            borderRadius: 6,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '-50%',
                                right: '-20%',
                                width: '60%',
                                height: '200%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            },
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                                pointerEvents: 'none'
                            }
                        }}
                    >
                        <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 900,
                                            color: 'white',
                                            mb: 2,
                                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                                        }}
                                    >
                                        ¿Listo para Empezar?
                                    </Typography>
                                </motion.div>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        maxWidth: 700,
                                        mx: 'auto',
                                        lineHeight: 1.6,
                                        mb: 4
                                    }}
                                >
                                    Solicita tu presupuesto gratuito y sin compromiso hoy mismo
                                </Typography>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    sx={{ justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <Button
                                        component={Link}
                                        href="/contacto"
                                        variant="contained"
                                        size="large"
                                        startIcon={<QuoteIcon />}
                                        sx={{
                                            py: 2,
                                            px: 5,
                                            background: 'white',
                                            color: THEME.primary[600],
                                            borderRadius: 4,
                                            fontWeight: 700,
                                            fontSize: '1.2rem',
                                            textTransform: 'none',
                                            boxShadow: `0 12px 40px rgba(0,0,0,0.2)`,
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.95)',
                                                transform: 'translateY(-4px) scale(1.02)',
                                                boxShadow: `0 16px 50px rgba(0,0,0,0.3)`
                                            }
                                        }}
                                    >
                                        Contactar Ahora
                                    </Button>

                                    <Button
                                        component="a"
                                        href="https://wa.me/34123456789"
                                        target="_blank"
                                        variant="outlined"
                                        size="large"
                                        startIcon={<WhatsAppIcon />}
                                        sx={{
                                            py: 2,
                                            px: 5,
                                            borderRadius: 4,
                                            fontWeight: 700,
                                            fontSize: '1.2rem',
                                            textTransform: 'none',
                                            borderColor: 'white',
                                            color: 'white',
                                            borderWidth: 2,
                                            '&:hover': {
                                                borderWidth: 2,
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                transform: 'translateY(-4px) scale(1.02)',
                                                boxShadow: `0 8px 30px rgba(0,0,0,0.2)`
                                            }
                                        }}
                                    >
                                        WhatsApp
                                    </Button>
                                </Stack>
                            </Box>

                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={3}
                                sx={{
                                    justifyContent: 'center',
                                    pt: 4,
                                    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                {[
                                    { icon: <CheckIcon />, text: 'Presupuesto Gratuito' },
                                    { icon: <VerifiedIcon />, text: 'Garantía de 2 Años' },
                                    { icon: <StarIcon />, text: '98% Satisfacción' }
                                ].map((feature, index) => (
                                    <Stack
                                        key={index}
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ color: 'white' }}
                                    >
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {React.cloneElement(feature.icon, { fontSize: 'small' })}
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {feature.text}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>
                </motion.div>
            </Container>

            {/* Sticky CTA Button */}
            <StickyCTAButton
                onQuoteClick={() => {
                    window.location.href = '/contacto';
                }}
            />

            {/* Enhanced Features Section - Can be added later */}
        </MainLayout>
    );
}