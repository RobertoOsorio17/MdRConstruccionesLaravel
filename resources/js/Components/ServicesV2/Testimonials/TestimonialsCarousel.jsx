import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Typography, Avatar, Rating, Stack, IconButton, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, FormatQuote, Pause, PlayArrow } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import designSystem from '@/theme/designSystem';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';
import { trackSectionView, trackTestimonialView } from '@/Utils/analytics';
import GlassCard from '../Shared/GlassCard';

/**
 * TestimonialsCarousel Component
 * 
 * Carousel de testimonios con autoplay, navegación y rating.
 * 
 * @param {Array} testimonials - Array de testimonios
 *   Estructura: [{ 
 *     id: number, 
 *     rating: number (1-5), 
 *     comment: string, 
 *     author_name: string,
 *     author_role: string (opcional),
 *     author_avatar: string (opcional),
 *     created_at: string (opcional)
 *   }]
 * @param {boolean} autoplay - Activar autoplay (default: true)
 * @param {number} autoplayDelay - Delay del autoplay en ms (default: 5000)
 * @param {string} service - Slug del servicio para tracking
 */
const TestimonialsCarousel = ({
    testimonials = [],
    autoplay = true,
    autoplayDelay = 5000,
    service = ''
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const swiperRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(autoplay);

    // Detectar preferencia de movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.2,
        onIntersect: () => trackSectionView('testimonials', service)
    });

    // Pausar autoplay si el usuario prefiere movimiento reducido
    useEffect(() => {
        if (prefersReducedMotion && swiperRef.current?.swiper?.autoplay) {
            swiperRef.current.swiper.autoplay.stop();
            setIsPlaying(false);
        }
    }, [prefersReducedMotion]);

    // Handlers
    const handleSlideChange = (swiper) => {
        const currentTestimonial = testimonials[swiper.activeIndex];
        if (currentTestimonial) {
            trackTestimonialView(currentTestimonial.id, service);
        }
    };

    const toggleAutoplay = () => {
        if (swiperRef.current?.swiper?.autoplay) {
            if (isPlaying) {
                swiperRef.current.swiper.autoplay.stop();
            } else {
                swiperRef.current.swiper.autoplay.start();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Helper para describir rating
    const getRatingLabel = (value) => {
        return `${value} ${value === 1 ? 'estrella' : 'estrellas'} de 5`;
    };

    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    return (
        <Box
            ref={ref}
            sx={{
                py: { xs: designSystem.spacing[10], md: designSystem.spacing[16] },
                background: `linear-gradient(180deg, 
                    ${designSystem.colors.surface.primary} 0%, 
                    ${designSystem.colors.surface.secondary} 100%)`
            }}
        >
            <Container maxWidth="lg">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <Typography
                        variant="h2"
                        align="center"
                        sx={{
                            fontWeight: 800,
                            mb: designSystem.spacing[2],
                            color: designSystem.colors.text.primary
                        }}
                    >
                        Lo Que Dicen Nuestros Clientes
                    </Typography>
                    <Typography
                        variant="h6"
                        align="center"
                        sx={{
                            color: designSystem.colors.text.secondary,
                            mb: designSystem.spacing[8],
                            maxWidth: 700,
                            mx: 'auto'
                        }}
                    >
                        Testimonios reales de clientes satisfechos que confiaron en nosotros
                    </Typography>
                </motion.div>

                {/* Carousel */}
                <Box sx={{ position: 'relative' }}>
                    {/* Play/Pause Button */}
                    {autoplay && !prefersReducedMotion && (
                        <Tooltip title={isPlaying ? 'Pausar testimonios' : 'Reanudar testimonios'}>
                            <IconButton
                                onClick={toggleAutoplay}
                                aria-label={isPlaying ? 'Pausar carrusel de testimonios' : 'Reanudar carrusel de testimonios'}
                                sx={{
                                    position: 'absolute',
                                    top: -60,
                                    right: 0,
                                    zIndex: 20,
                                    background: designSystem.colors.primary[500],
                                    color: designSystem.colors.text.inverse,
                                    boxShadow: designSystem.shadows.colored.primary,
                                    '&:hover': {
                                        background: designSystem.colors.primary[600],
                                        transform: 'scale(1.1)'
                                    },
                                    '&:focus-visible': {
                                        outline: `2px solid ${designSystem.colors.primary[600]}`,
                                        outlineOffset: '2px'
                                    },
                                    transition: designSystem.transitions.allFast
                                }}
                            >
                                {isPlaying ? <Pause /> : <PlayArrow />}
                            </IconButton>
                        </Tooltip>
                    )}

                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        breakpoints={{
                            960: {
                                slidesPerView: 2,
                                spaceBetween: 30
                            },
                            1280: {
                                slidesPerView: 3,
                                spaceBetween: 30
                            }
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true
                        }}
                        autoplay={!prefersReducedMotion && autoplay ? {
                            delay: autoplayDelay,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        } : false}
                        loop={testimonials.length > 3}
                        onSlideChange={handleSlideChange}
                        style={{
                            paddingBottom: '50px'
                        }}
                    >
                        {testimonials.map((testimonial, index) => (
                            <SwiperSlide key={testimonial.id || index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <GlassCard
                                        variant="medium"
                                        hover={true}
                                        padding={4}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Quote Icon */}
                                        <FormatQuote
                                            aria-hidden="true"
                                            sx={{
                                                position: 'absolute',
                                                top: designSystem.spacing[2],
                                                right: designSystem.spacing[2],
                                                fontSize: '4rem',
                                                color: designSystem.colors.primary[200],
                                                opacity: 0.3,
                                                transform: 'rotate(180deg)'
                                            }}
                                        />

                                        {/* Rating */}
                                        <Rating
                                            value={testimonial.rating || 5}
                                            readOnly
                                            precision={0.5}
                                            getLabelText={getRatingLabel}
                                            sx={{
                                                mb: designSystem.spacing[2],
                                                '& .MuiRating-iconFilled': {
                                                    color: designSystem.colors.accent.amber[500]
                                                }
                                            }}
                                        />

                                        {/* Comment */}
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: designSystem.colors.text.primary,
                                                mb: designSystem.spacing[3],
                                                lineHeight: 1.7,
                                                fontStyle: 'italic',
                                                flex: 1,
                                                position: 'relative',
                                                zIndex: 1
                                            }}
                                        >
                                            "{testimonial.comment}"
                                        </Typography>

                                        {/* Author Info */}
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                            sx={{
                                                pt: designSystem.spacing[2],
                                                borderTop: `1px solid ${designSystem.colors.border.light}`
                                            }}
                                        >
                                            <Avatar
                                                src={testimonial.author_avatar}
                                                alt={testimonial.author_name}
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    border: `2px solid ${designSystem.colors.primary[500]}`
                                                }}
                                            >
                                                {testimonial.author_name?.charAt(0) || 'C'}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: designSystem.colors.text.primary
                                                    }}
                                                >
                                                    {testimonial.author_name}
                                                </Typography>
                                                {testimonial.author_role && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: designSystem.colors.text.secondary
                                                        }}
                                                    >
                                                        {testimonial.author_role}
                                                    </Typography>
                                                )}
                                                {testimonial.created_at && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            color: designSystem.colors.text.muted,
                                                            mt: 0.5
                                                        }}
                                                    >
                                                        {new Date(testimonial.created_at).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'long'
                                                        })}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    </GlassCard>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation Buttons (Desktop) */}
                    {!isMobile && testimonials.length > 3 && (
                        <>
                            <IconButton
                                onClick={() => swiperRef.current?.swiper?.slidePrev()}
                                aria-label="Ver testimonio anterior"
                                sx={{
                                    position: 'absolute',
                                    left: -60,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 10,
                                    background: designSystem.colors.primary[500],
                                    color: designSystem.colors.text.inverse,
                                    boxShadow: designSystem.shadows.colored.primary,
                                    '&:hover': {
                                        background: designSystem.colors.primary[600],
                                        transform: 'translateY(-50%) scale(1.1)'
                                    },
                                    '&:focus-visible': {
                                        outline: `2px solid ${designSystem.colors.primary[600]}`,
                                        outlineOffset: '2px'
                                    },
                                    transition: designSystem.transitions.allFast
                                }}
                            >
                                <ChevronLeft />
                            </IconButton>
                            <IconButton
                                onClick={() => swiperRef.current?.swiper?.slideNext()}
                                aria-label="Ver siguiente testimonio"
                                sx={{
                                    position: 'absolute',
                                    right: -60,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 10,
                                    background: designSystem.colors.primary[500],
                                    color: designSystem.colors.text.inverse,
                                    boxShadow: designSystem.shadows.colored.primary,
                                    '&:hover': {
                                        background: designSystem.colors.primary[600],
                                        transform: 'translateY(-50%) scale(1.1)'
                                    },
                                    '&:focus-visible': {
                                        outline: `2px solid ${designSystem.colors.primary[600]}`,
                                        outlineOffset: '2px'
                                    },
                                    transition: designSystem.transitions.allFast
                                }}
                            >
                                <ChevronRight />
                            </IconButton>
                        </>
                    )}
                </Box>
            </Container>

            {/* Custom Swiper Pagination Styles */}
            <style jsx global>{`
                .swiper-pagination-bullet {
                    background: ${designSystem.colors.primary[500]};
                    opacity: 0.3;
                    width: 10px;
                    height: 10px;
                }
                .swiper-pagination-bullet-active {
                    opacity: 1;
                    width: 30px;
                    border-radius: 5px;
                }
            `}</style>
        </Box>
    );
};

export default TestimonialsCarousel;

