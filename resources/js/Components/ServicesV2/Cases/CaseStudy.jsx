/**
 * CaseStudy Component
 * 
 * Storytelling de caso de éxito con narrativa problema → solución → resultado.
 * Incluye galería before/after, KPIs destacados, testimonios y lightbox premium.
 * 
 * Props:
 * - caseData: object - Datos del caso {
 *     title, client, category, problem, solution, results,
 *     gallery: [{ before, after, caption }],
 *     kpis: [{ label, value, suffix }],
 *     testimonial: { author, role, avatar, quote, rating }
 *   }
 * - service: object - Datos del servicio para tracking
 */

import React, { useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Stack,
    Chip,
    Avatar,
    Rating,
    IconButton,
    Dialog,
    DialogContent,
    useTheme
} from '@mui/material';
import {
    Close,
    ArrowForward,
    CheckCircle,
    TrendingUp,
    Timer,
    AttachMoney,
    ZoomIn
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import designSystem from '@/theme/designSystem';
import SectionContainer from '../Shared/SectionContainer';
import GlassCard from '../Shared/GlassCard';
import AnimatedCounter from '../Shared/AnimatedCounter';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';
import { trackGallery } from '@/Utils/analytics';

const CaseStudy = ({
    caseData,
    service = {}
}) => {
    const theme = useTheme();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.2,
        triggerOnce: true
    });

    if (!caseData) return null;

    const {
        title,
        client,
        category,
        problem,
        solution,
        results,
        gallery = [],
        kpis = [],
        testimonial
    } = caseData;

    // KPIs por defecto
    const defaultKpis = [
        { label: 'Tiempo de Entrega', value: 45, suffix: ' días', icon: <Timer /> },
        { label: 'Ahorro Logrado', value: 25, suffix: '%', icon: <AttachMoney /> },
        { label: 'Satisfacción', value: 98, suffix: '%', icon: <TrendingUp /> }
    ];

    const displayKpis = kpis.length > 0 ? kpis : defaultKpis;

    const handleImageClick = (image) => {
        setLightboxImage(image);
        setLightboxOpen(true);
        trackGallery('open', 'case_study', service?.slug);
    };

    const handleLightboxClose = () => {
        setLightboxOpen(false);
        setLightboxImage(null);
    };

    return (
        <SectionContainer
            background="gradient"
            spacing={{ top: 10, bottom: 10 }}
            maxWidth="xl"
            sectionId="case_study"
            service={service?.slug}
        >
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                {/* Header */}
                <Box sx={{ mb: designSystem.spacing[8], textAlign: 'center' }}>
                    <Chip
                        label={category || 'Caso de Éxito'}
                        sx={{
                            mb: designSystem.spacing[2],
                            bgcolor: designSystem.colors.accent.emerald,
                            color: designSystem.colors.text.inverse,
                            fontWeight: 700
                        }}
                    />
                    <Typography variant="h3" fontWeight={800} gutterBottom>
                        {title}
                    </Typography>
                    {client && (
                        <Typography variant="h6" color="text.secondary">
                            Cliente: {client}
                        </Typography>
                    )}
                </Box>

                <Grid container spacing={6}>
                    {/* Left Column: Story */}
                    <Grid item xs={12} lg={6}>
                        <Stack spacing={6}>
                            {/* Problem */}
                            <GlassCard variant="medium" padding={6}>
                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: designSystem.borders.radius.lg,
                                                bgcolor: designSystem.colors.error[100],
                                                color: designSystem.colors.error[600],
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 24
                                            }}
                                        >
                                            ⚠️
                                        </Box>
                                        <Typography variant="h5" fontWeight={700}>
                                            El Desafío
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                                        {problem}
                                    </Typography>
                                </Stack>
                            </GlassCard>

                            {/* Solution */}
                            <GlassCard variant="medium" padding={6}>
                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: designSystem.borders.radius.lg,
                                                bgcolor: designSystem.colors.primary[100],
                                                color: designSystem.colors.primary[600],
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 24
                                            }}
                                        >
                                            💡
                                        </Box>
                                        <Typography variant="h5" fontWeight={700}>
                                            Nuestra Solución
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                                        {solution}
                                    </Typography>
                                </Stack>
                            </GlassCard>

                            {/* Results */}
                            <GlassCard variant="medium" padding={6}>
                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: designSystem.borders.radius.lg,
                                                bgcolor: designSystem.colors.success[100],
                                                color: designSystem.colors.success[600],
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 24
                                            }}
                                        >
                                            ✅
                                        </Box>
                                        <Typography variant="h5" fontWeight={700}>
                                            Resultados
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                                        {results}
                                    </Typography>
                                </Stack>
                            </GlassCard>
                        </Stack>
                    </Grid>

                    {/* Right Column: Gallery & KPIs */}
                    <Grid item xs={12} lg={6}>
                        <Stack spacing={6}>
                            {/* Gallery */}
                            {gallery.length > 0 && (
                                <GlassCard variant="medium" padding={4}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                                        Transformación Visual
                                    </Typography>
                                    <Swiper
                                        modules={[Navigation, Pagination, Autoplay, EffectFade]}
                                        navigation
                                        pagination={{ clickable: true }}
                                        autoplay={{ delay: 5000 }}
                                        effect="fade"
                                        loop
                                        style={{ borderRadius: designSystem.borders.radius.xl }}
                                    >
                                        {gallery.map((item, index) => (
                                            <SwiperSlide key={index}>
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        paddingTop: '66.67%', // 3:2 aspect ratio
                                                        cursor: 'pointer',
                                                        overflow: 'hidden',
                                                        borderRadius: designSystem.borders.radius.xl
                                                    }}
                                                    onClick={() => handleImageClick(item)}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={item.after || item.before}
                                                        alt={item.caption || `Imagen ${index + 1}`}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            transition: designSystem.transitions.presets.allNormal,
                                                            '&:hover': {
                                                                transform: 'scale(1.05)'
                                                            }
                                                        }}
                                                    />
                                                    {/* Zoom Icon */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 16,
                                                            right: 16,
                                                            bgcolor: 'rgba(0,0,0,0.6)',
                                                            borderRadius: designSystem.borders.radius.full,
                                                            p: 1,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        <ZoomIn />
                                                    </Box>
                                                    {/* Caption */}
                                                    {item.caption && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bgcolor: 'rgba(0,0,0,0.7)',
                                                                color: 'white',
                                                                p: 2
                                                            }}
                                                        >
                                                            <Typography variant="body2">
                                                                {item.caption}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </GlassCard>
                            )}

                            {/* KPIs */}
                            <GlassCard variant="medium" padding={6}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>
                                    Métricas Clave
                                </Typography>
                                <Grid container spacing={3}>
                                    {displayKpis.map((kpi, index) => (
                                        <Grid item xs={12} sm={4} key={index}>
                                            <Stack spacing={1} alignItems="center" textAlign="center">
                                                {kpi.icon && (
                                                    <Box sx={{ color: designSystem.colors.primary[600], fontSize: 32 }}>
                                                        {kpi.icon}
                                                    </Box>
                                                )}
                                                <AnimatedCounter
                                                    value={kpi.value}
                                                    suffix={kpi.suffix || ''}
                                                    variant="h4"
                                                    fontWeight={800}
                                                    sx={{ color: designSystem.colors.primary[600] }}
                                                />
                                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                    {kpi.label}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    ))}
                                </Grid>
                            </GlassCard>

                            {/* Testimonial */}
                            {testimonial && (
                                <GlassCard variant="strong" padding={6}>
                                    <Stack spacing={3}>
                                        <Rating value={testimonial.rating || 5} readOnly size="large" />
                                        <Typography variant="body1" fontStyle="italic" lineHeight={1.8}>
                                            "{testimonial.quote}"
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={testimonial.avatar} alt={testimonial.author} />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {testimonial.author}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {testimonial.role}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </GlassCard>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </motion.div>

            {/* Lightbox */}
            <Dialog
                open={lightboxOpen}
                onClose={handleLightboxClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0,0,0,0.95)',
                        boxShadow: 'none'
                    }
                }}
            >
                <IconButton
                    onClick={handleLightboxClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: 'white',
                        zIndex: 1
                    }}
                >
                    <Close />
                </IconButton>
                <DialogContent sx={{ p: 0 }}>
                    {lightboxImage && (
                        <Box
                            component="img"
                            src={lightboxImage.after || lightboxImage.before}
                            alt={lightboxImage.caption}
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '90vh',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </SectionContainer>
    );
};

export default CaseStudy;

