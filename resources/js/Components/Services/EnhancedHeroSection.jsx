import React, { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Chip,
    Grid,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Breadcrumbs,
    Tooltip,
    useTheme,
    useMediaQuery,
    Link as MuiLink,
} from '@mui/material';
import {
    RequestQuote,
    WhatsApp,
    Star,
    Phone,
    Email,
    NavigateNext,
    Home,
    Favorite,
    FavoriteBorder,
    Share,
    KeyboardArrowDown,
    EmojiEvents,
    Groups,
    Timer,
    Verified,
    TrendingUp,
    CheckCircle,
    Speed,
} from '@mui/icons-material';

const EnhancedHeroSection = ({
    service,
    achievements = [],
    onFavoriteToggle,
    onShare,
    isFavorite = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const heroRef = useRef(null);

    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
    const contentY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

    // Default achievements if not provided
    const defaultAchievements = [
        { icon: <EmojiEvents />, value: '500+', label: 'Proyectos Completados', color: '#f59e0b' },
        { icon: <Groups />, value: '98%', label: 'Clientes Satisfechos', color: '#10b981' },
        { icon: <Timer />, value: '15+', label: 'Años Experiencia', color: '#3b82f6' },
        { icon: <Verified />, value: '100%', label: 'Garantizados', color: '#8b5cf6' },
    ];

    const stats = achievements.length > 0 ? achievements : defaultAchievements;

    return (
        <Box
            ref={heroRef}
            sx={{
                position: 'relative',
                minHeight: { xs: '90vh', sm: '85vh', md: '100vh' },
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                bgcolor: '#0f172a',
            }}
        >
            {/* Animated Background Image with Parallax */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: heroOpacity,
                    scale: heroScale,
                }}
            >
                {service.featured_image ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.75) 50%, rgba(15,23,42,0.90) 100%)',
                                zIndex: 1,
                            }
                        }}
                    >
                        <Box
                            component="img"
                            src={service.featured_image}
                            alt={service.title}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        }}
                    />
                )}
            </motion.div>

            {/* Decorative Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    zIndex: 1,
                }}
            >
                {/* Grid Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                    }}
                />
                {/* Gradient Orbs */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '10%',
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '10%',
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
            </Box>

            {/* Main Content */}
            <Container
                maxWidth="xl"
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    py: { xs: 6, md: 8 },
                }}
            >
                {/* Breadcrumbs */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Breadcrumbs
                        separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(255,255,255,0.4)' }} />}
                        sx={{ mb: { xs: 3, md: 4 } }}
                    >
                        <MuiLink
                            component={Link}
                            href="/"
                            underline="hover"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: { xs: '0.875rem', md: '1rem' },
                                transition: 'color 0.3s',
                                '&:hover': { color: 'white' }
                            }}
                        >
                            <Home sx={{ mr: 0.5, fontSize: 18 }} />
                            Inicio
                        </MuiLink>
                        <MuiLink
                            component={Link}
                            href="/servicios"
                            underline="hover"
                            sx={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: { xs: '0.875rem', md: '1rem' },
                                transition: 'color 0.3s',
                                '&:hover': { color: 'white' }
                            }}
                        >
                            Servicios
                        </MuiLink>
                        <Typography
                            color="white"
                            sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                        >
                            {service.title}
                        </Typography>
                    </Breadcrumbs>
                </motion.div>

                <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
                    {/* Left Column - Main Content */}
                    <Grid item xs={12} lg={7}>
                        <motion.div
                            style={{ y: contentY }}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            {/* Featured Badge */}
                            {service.featured && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Chip
                                        icon={<Star />}
                                        label="Servicio Destacado"
                                        sx={{
                                            mb: 3,
                                            bgcolor: 'rgba(251, 191, 36, 0.15)',
                                            backdropFilter: 'blur(10px)',
                                            color: '#fbbf24',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                            fontWeight: 600,
                                            fontSize: { xs: '0.875rem', md: '1rem' },
                                            py: { xs: 2, md: 2.5 },
                                            '& .MuiChip-icon': { color: '#fbbf24' }
                                        }}
                                    />
                                </motion.div>
                            )}

                            {/* Title with Gradient */}
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem', lg: '4.5rem' },
                                    fontWeight: 900,
                                    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: { xs: 2, md: 3 },
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {service.title}
                            </Typography>

                            {/* Excerpt */}
                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'rgba(255,255,255,0.85)',
                                    mb: { xs: 3, md: 4 },
                                    fontWeight: 400,
                                    lineHeight: 1.6,
                                    fontSize: { xs: '1.125rem', md: '1.5rem' },
                                    maxWidth: 650,
                                }}
                            >
                                {service.excerpt}
                            </Typography>

                            {/* Key Features Pills */}
                            <Stack
                                direction="row"
                                spacing={1.5}
                                flexWrap="wrap"
                                gap={1.5}
                                sx={{ mb: { xs: 4, md: 5 } }}
                            >
                                {[
                                    { icon: <CheckCircle />, text: 'Garantía Total' },
                                    { icon: <Speed />, text: 'Entrega Rápida' },
                                    { icon: <Verified />, text: 'Certificado' },
                                ].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        <Chip
                                            icon={feature.icon}
                                            label={feature.text}
                                            sx={{
                                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                color: 'white',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                fontWeight: 500,
                                                py: 2,
                                                '& .MuiChip-icon': {
                                                    color: '#10b981',
                                                    fontSize: 18,
                                                }
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </Stack>

                            {/* CTA Buttons */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ mb: 3 }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    style={{ flex: isMobile ? 1 : 'auto' }}
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<RequestQuote />}
                                        component={Link}
                                        href="/contacto"
                                        fullWidth={isMobile}
                                        sx={{
                                            px: { xs: 3, md: 5 },
                                            py: { xs: 1.75, md: 2 },
                                            fontSize: { xs: '1rem', md: '1.125rem' },
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 15px 50px rgba(59, 130, 246, 0.5)',
                                            }
                                        }}
                                    >
                                        Solicitar Presupuesto Gratis
                                    </Button>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    style={{ flex: isMobile ? 1 : 'auto' }}
                                >
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<WhatsApp />}
                                        component="a"
                                        href="https://wa.me/34123456789"
                                        target="_blank"
                                        fullWidth={isMobile}
                                        sx={{
                                            px: { xs: 3, md: 5 },
                                            py: { xs: 1.75, md: 2 },
                                            fontSize: { xs: '1rem', md: '1.125rem' },
                                            fontWeight: 700,
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                            borderWidth: 2,
                                            color: 'white',
                                            backdropFilter: 'blur(10px)',
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                borderColor: '#10b981',
                                                borderWidth: 2,
                                                bgcolor: 'rgba(16, 185, 129, 0.15)',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}
                                    >
                                        WhatsApp Directo
                                    </Button>
                                </motion.div>
                            </Stack>

                            {/* Action Buttons */}
                            <Stack direction="row" spacing={2} alignItems="center">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}>
                                            <IconButton
                                                onClick={onFavoriteToggle}
                                                sx={{
                                                    color: isFavorite ? '#ef4444' : 'rgba(255,255,255,0.6)',
                                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                                        transform: 'scale(1.1)',
                                                    }
                                                }}
                                            >
                                                {isFavorite ? <Favorite /> : <FavoriteBorder />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Compartir servicio">
                                            <IconButton
                                                onClick={onShare}
                                                sx={{
                                                    color: 'rgba(255,255,255,0.6)',
                                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                                        transform: 'scale(1.1)',
                                                    }
                                                }}
                                            >
                                                <Share />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </motion.div>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'rgba(255,255,255,0.5)',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Respuesta en menos de 24h
                                </Typography>
                            </Stack>
                        </motion.div>
                    </Grid>

                    {/* Right Column - Stats Cards */}
                    <Grid item xs={12} lg={5}>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            <Grid container spacing={2}>
                                {stats.map((stat, index) => (
                                    <Grid item xs={6} key={index}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.6 + index * 0.1 }}
                                            whileHover={{
                                                scale: 1.05,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <Card
                                                sx={{
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                                    borderRadius: 3,
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        background: 'rgba(255, 255, 255, 0.12)',
                                                        borderColor: stat.color || '#3b82f6',
                                                        boxShadow: `0 8px 32px ${stat.color || '#3b82f6'}40`,
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{
                                                    textAlign: 'center',
                                                    py: { xs: 2.5, md: 3.5 },
                                                }}>
                                                    <Avatar
                                                        sx={{
                                                            width: { xs: 48, md: 56 },
                                                            height: { xs: 48, md: 56 },
                                                            bgcolor: `${stat.color || '#3b82f6'}20`,
                                                            color: stat.color || '#3b82f6',
                                                            mx: 'auto',
                                                            mb: 2,
                                                            border: `2px solid ${stat.color || '#3b82f6'}40`,
                                                        }}
                                                    >
                                                        {React.cloneElement(stat.icon, {
                                                            sx: { fontSize: { xs: 24, md: 28 } }
                                                        })}
                                                    </Avatar>
                                                    <Typography
                                                        variant="h3"
                                                        sx={{
                                                            color: 'white',
                                                            fontWeight: 800,
                                                            fontSize: { xs: '2rem', md: '2.5rem' },
                                                            mb: 0.5,
                                                        }}
                                                    >
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'rgba(255,255,255,0.7)',
                                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {stat.label}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Trust Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                            >
                                <Card
                                    sx={{
                                        mt: 3,
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar
                                                sx={{
                                                    bgcolor: 'rgba(16, 185, 129, 0.2)',
                                                    color: '#10b981',
                                                }}
                                            >
                                                <Verified />
                                            </Avatar>
                                            <Box flex={1}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={700}
                                                    sx={{ color: 'white', mb: 0.5 }}
                                                >
                                                    Empresa Certificada
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                                                >
                                                    ISO 9001 · Más de 5000 clientes satisfechos
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 1.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.5
                }}
                style={{
                    position: 'absolute',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 3,
                }}
            >
                <Stack alignItems="center" spacing={1}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.6)',
                            textTransform: 'uppercase',
                            letterSpacing: 2,
                            fontSize: '0.75rem',
                        }}
                    >
                        Descubre más
                    </Typography>
                    <KeyboardArrowDown
                        sx={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: 32,
                        }}
                    />
                </Stack>
            </motion.div>
        </Box>
    );
};

export default EnhancedHeroSection;
