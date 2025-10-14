/**
 * ServiceHero Component
 * 
 * Hero inmersivo para la landing de servicios con video/imagen background,
 * overlay glassmorphism, titular aspiracional, badges de confianza y CTAs.
 * 
 * Props:
 * - service: object - Datos del servicio { title, subtitle, excerpt, featured_image, video }
 * - badges: array - Badges de confianza [{ icon, label, value }]
 * - ctaConfig: object - Configuración de CTAs { primary, secondary }
 * - onOpenWizard: function - Callback para abrir wizard de cotización
 * - onShare: function - Callback para compartir
 * - onFavorite: function - Callback para favoritos
 * - isFavorite: boolean - Estado de favorito
 */

import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Chip,
    IconButton,
    Grid,
    useTheme
} from '@mui/material';
import {
    RequestQuote,
    Download,
    PlayCircleOutline,
    Favorite,
    FavoriteBorder,
    Share,
    CheckCircle,
    Star,
    Groups,
    Timer,
    EmojiEvents
} from '@mui/icons-material';
import { motion, useScroll, useTransform } from 'framer-motion';
import designSystem from '@/theme/designSystem';
import { useDeviceBreakpoints } from '@/Hooks/useDeviceBreakpoints';
import { trackCTAClick } from '@/Utils/trackEvent';
import AnimatedCounter from '../Shared/AnimatedCounter';

const ServiceHero = ({
    service,
    badges = [],
    ctaConfig = {},
    onOpenWizard,
    onShare,
    onFavorite,
    isFavorite = false
}) => {
    const theme = useTheme();
    const { isMobile, isTablet } = useDeviceBreakpoints();
    const [videoPlaying, setVideoPlaying] = useState(false);

    // Parallax effect más pronunciado
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 250]);
    const opacity = useTransform(scrollY, [0, 400], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1, 1.2]);

    const handlePrimaryCTA = () => {
        if (onOpenWizard) {
            onOpenWizard();
        }
        trackCTAClick('primary', ctaConfig.primary?.label || 'Solicitar Asesoría', service?.slug);
    };

    const handleSecondaryCTA = () => {
        trackCTAClick('secondary', ctaConfig.secondary?.label || 'Descargar Dossier', service?.slug);
        // Implementar descarga de PDF
        if (ctaConfig.secondary?.onClick) {
            ctaConfig.secondary.onClick();
        }
    };

    const handleShare = () => {
        if (onShare) {
            onShare();
        }
        trackCTAClick('micro', 'Compartir', service?.slug);
    };

    const handleFavorite = () => {
        if (onFavorite) {
            onFavorite();
        }
        trackCTAClick('micro', isFavorite ? 'Quitar Favorito' : 'Añadir Favorito', service?.slug);
    };

    // Badges por defecto si no se proporcionan
    const defaultBadges = [
        { icon: <EmojiEvents />, label: 'Proyectos', value: '500+' },
        { icon: <Groups />, label: 'Satisfacción', value: '98%' },
        { icon: <Timer />, label: 'Experiencia', value: '15+' },
        { icon: <Star />, label: 'Garantía', value: '100%' }
    ];

    const displayBadges = badges.length > 0 ? badges : defaultBadges;

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: { xs: '70vh', md: '85vh', lg: '100vh' },
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                bgcolor: designSystem.colors.surface.dark.primary
            }}
        >
            {/* Background Image/Video con Parallax */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    y: isMobile ? 0 : y, // Desactivar parallax en mobile
                    scale: isMobile ? 1 : scale, // Zoom effect en desktop
                    zIndex: 0
                }}
            >
                {service?.video && videoPlaying ? (
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            filter: 'brightness(0.7) contrast(1.1)'
                        }}
                    >
                        <source src={service.video} type="video/mp4" />
                    </video>
                ) : (
                    <Box
                        component="img"
                        src={service?.featured_image || '/images/hero-default.jpg'}
                        alt={service?.title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: { xs: 'center', md: 'center' },
                            filter: 'brightness(0.7) contrast(1.1)'
                        }}
                    />
                )}

                {/* Overlay Gradient Premium - Más oscuro en mobile para mejor legibilidad */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: {
                            xs: `linear-gradient(180deg,
                                rgba(0,0,0,0.75) 0%,
                                rgba(0,0,0,0.6) 50%,
                                rgba(0,0,0,0.8) 100%)`,
                            md: `linear-gradient(135deg,
                                ${designSystem.colors.surface.overlayDark} 0%,
                                rgba(0,0,0,0.3) 50%,
                                rgba(0,0,0,0.6) 100%)`
                        }
                    }}
                />

                {/* Decorative Gradient Orbs */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '20%',
                        right: '10%',
                        width: { xs: '200px', md: '400px' },
                        height: { xs: '200px', md: '400px' },
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${designSystem.colors.primary[500]}40 0%, transparent 70%)`,
                        filter: 'blur(60px)',
                        pointerEvents: 'none',
                        display: { xs: 'none', md: 'block' }
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '5%',
                        width: { xs: '150px', md: '300px' },
                        height: { xs: '150px', md: '300px' },
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${designSystem.colors.secondary[500]}30 0%, transparent 70%)`,
                        filter: 'blur(50px)',
                        pointerEvents: 'none',
                        display: { xs: 'none', md: 'block' }
                    }}
                />
            </motion.div>

            {/* Content */}
            <Container
                maxWidth="lg"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    py: { xs: designSystem.spacing[6], md: designSystem.spacing[12] },
                    px: { xs: designSystem.spacing[3], md: designSystem.spacing[4] }
                }}
            >
                <motion.div
                    style={{ opacity }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 1,
                        ease: [0.4, 0, 0.2, 1],
                        staggerChildren: 0.1
                    }}
                >
                    <Grid container spacing={4} alignItems="center">
                        {/* Left Column: Content */}
                        <Grid item xs={12} lg={7}>
                            {/* Service Category Chip */}
                            {service?.category && (
                                <Chip
                                    label={service.category}
                                    sx={{
                                        mb: designSystem.spacing[3],
                                        bgcolor: designSystem.colors.accent.amber,
                                        color: designSystem.colors.text.primary,
                                        fontWeight: 700,
                                        fontSize: '0.875rem'
                                    }}
                                />
                            )}

                            {/* Title */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                            >
                                <Typography
                                    variant="h1"
                                    sx={{
                                        color: designSystem.colors.text.inverse,
                                        fontWeight: 800,
                                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                                        lineHeight: 1.1,
                                        mb: designSystem.spacing[3],
                                        textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                                        background: `linear-gradient(135deg, #fff 0%, ${designSystem.colors.primary[100]} 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {service?.title || 'Servicio Premium'}
                                </Typography>
                            </motion.div>

                            {/* Subtitle */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: designSystem.colors.text.inverse,
                                        fontWeight: 400,
                                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                                        mb: designSystem.spacing[6],
                                        opacity: 0.95,
                                        maxWidth: 600,
                                    lineHeight: 1.6,
                                    textShadow: '0 1px 5px rgba(0,0,0,0.5)'
                                }}
                            >
                                {service?.excerpt || 'Transformamos tus ideas en realidad con calidad y profesionalismo'}
                            </Typography>
                            </motion.div>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={designSystem.spacing[3]}
                                    sx={{ mb: designSystem.spacing[6] }}
                                >
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<RequestQuote />}
                                    onClick={handlePrimaryCTA}
                                    sx={{
                                        background: `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.accent.purple} 100%)`,
                                        color: designSystem.colors.text.inverse,
                                        px: designSystem.spacing[6],
                                        py: designSystem.spacing[3],
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                        borderRadius: designSystem.borders.radius.xl,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px) scale(1.02)',
                                            boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
                                            background: `linear-gradient(135deg, ${designSystem.colors.primary[700]} 0%, ${designSystem.colors.accent.purple} 100%)`
                                        }
                                    }}
                                >
                                    {ctaConfig.primary?.label || 'Solicitar Asesoría'}
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<Download />}
                                    onClick={handleSecondaryCTA}
                                    sx={{
                                        borderColor: designSystem.colors.text.inverse,
                                        color: designSystem.colors.text.inverse,
                                        borderWidth: 2,
                                        px: designSystem.spacing[6],
                                        py: designSystem.spacing[3],
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        borderRadius: designSystem.borders.radius.xl,
                                        backdropFilter: 'blur(10px)',
                                        background: 'rgba(255,255,255,0.05)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            borderColor: designSystem.colors.text.inverse,
                                            borderWidth: 2,
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 24px rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    {ctaConfig.secondary?.label || 'Descargar Dossier'}
                                </Button>
                            </Stack>
                            </motion.div>

                            {/* Action Icons */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                            >
                                <Stack direction="row" spacing={designSystem.spacing[2]}>
                                <IconButton
                                    onClick={handleFavorite}
                                    sx={{
                                        color: designSystem.colors.text.inverse,
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.2)'
                                        }
                                    }}
                                >
                                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                                </IconButton>
                                <IconButton
                                    onClick={handleShare}
                                    sx={{
                                        color: designSystem.colors.text.inverse,
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.2)'
                                        }
                                    }}
                                >
                                    <Share />
                                </IconButton>
                                {service?.video && !videoPlaying && (
                                    <IconButton
                                        onClick={() => setVideoPlaying(true)}
                                        sx={{
                                            color: designSystem.colors.text.inverse,
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.2)'
                                            }
                                        }}
                                    >
                                        <PlayCircleOutline />
                                    </IconButton>
                                )}
                            </Stack>
                            </motion.div>
                        </Grid>

                        {/* Right Column: Badges (Desktop only) */}
                        {!isMobile && !isTablet && (
                            <Grid item xs={12} lg={5}>
                                <Box
                                    sx={{
                                        ...designSystem.glassmorphism.medium,
                                        borderRadius: designSystem.borders.radius['2xl'],
                                        p: designSystem.spacing[6],
                                        boxShadow: designSystem.shadows.glass
                                    }}
                                >
                                    <Grid container spacing={3}>
                                        {displayBadges.map((badge, index) => (
                                            <Grid item xs={6} key={index}>
                                                <Stack spacing={1} alignItems="center" textAlign="center">
                                                    <Box
                                                        sx={{
                                                            color: designSystem.colors.accent.emerald,
                                                            fontSize: 40
                                                        }}
                                                    >
                                                        {badge.icon}
                                                    </Box>
                                                    <AnimatedCounter
                                                        value={parseInt(badge.value) || 0}
                                                        suffix={(badge.value || '').replace(/[0-9]/g, '')}
                                                        variant="h4"
                                                        color="inherit"
                                                        sx={{ color: designSystem.colors.text.inverse }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: designSystem.colors.text.inverse,
                                                            opacity: 0.8,
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </motion.div>
            </Container>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2
                }}
            >
                <Box
                    sx={{
                        width: 30,
                        height: 50,
                        border: `2px solid ${designSystem.colors.text.inverse}`,
                        borderRadius: designSystem.borders.radius.full,
                        display: 'flex',
                        justifyContent: 'center',
                        pt: 1
                    }}
                >
                    <Box
                        sx={{
                            width: 6,
                            height: 10,
                            bgcolor: designSystem.colors.text.inverse,
                            borderRadius: designSystem.borders.radius.full
                        }}
                    />
                </Box>
            </motion.div>
        </Box>
    );
};

export default ServiceHero;

