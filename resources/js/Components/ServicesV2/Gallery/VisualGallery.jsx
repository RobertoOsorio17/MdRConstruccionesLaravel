import React, { useState } from 'react';
import { Box, Container, Typography, ImageList, ImageListItem, Chip, Stack, Dialog, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Close, ChevronLeft, ChevronRight, ZoomIn } from '@mui/icons-material';
import designSystem from '@/theme/designSystem';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';
import { trackSectionView, trackGallery } from '@/Utils/analytics';

/**
 * VisualGallery Component
 * 
 * Galería masonry responsive con lightbox y filtros por categoría.
 * 
 * @param {Array} images - Array de imágenes
 *   Estructura: [{ 
 *     id: number, 
 *     url: string, 
 *     thumbnail: string (opcional),
 *     title: string, 
 *     category: string,
 *     description: string (opcional)
 *   }]
 * @param {Array} categories - Array de categorías para filtrado (opcional)
 * @param {number} columns - Número de columnas (default: auto-responsive)
 * @param {string} service - Slug del servicio para tracking
 */
const VisualGallery = ({ 
    images = [], 
    categories = [],
    columns = null,
    service = ''
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.2,
        onIntersect: () => trackSectionView('gallery', service)
    });

    // Determinar número de columnas
    const cols = columns || (isMobile ? 1 : isTablet ? 2 : 3);

    // Filtrar imágenes por categoría
    const filteredImages = selectedCategory === 'all' 
        ? images 
        : images.filter(img => img.category === selectedCategory);

    // Handlers
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        trackGallery('filter', { category }, service);
    };

    const handleImageClick = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        trackGallery('open', { image_id: filteredImages[index].id }, service);
    };

    const handleCloseLightbox = () => {
        setLightboxOpen(false);
        trackGallery('close', {}, service);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
        trackGallery('navigate', { direction: 'prev' }, service);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
        trackGallery('navigate', { direction: 'next' }, service);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <Box
            ref={ref}
            sx={{
                py: { xs: designSystem.spacing[10], md: designSystem.spacing[16] },
                background: designSystem.colors.surface.primary
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
                        Galería de Proyectos
                    </Typography>
                    <Typography
                        variant="h6"
                        align="center"
                        sx={{
                            color: designSystem.colors.text.secondary,
                            mb: designSystem.spacing[6],
                            maxWidth: 700,
                            mx: 'auto'
                        }}
                    >
                        Explora nuestros trabajos más destacados y descubre la calidad que nos define
                    </Typography>
                </motion.div>

                {/* Category Filters */}
                {categories && categories.length > 0 && (
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            mb: designSystem.spacing[6],
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        <Chip
                            label="Todos"
                            onClick={() => handleCategoryChange('all')}
                            color={selectedCategory === 'all' ? 'primary' : 'default'}
                            sx={{
                                fontWeight: selectedCategory === 'all' ? 700 : 400,
                                transition: designSystem.transitions.allFast
                            }}
                        />
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                onClick={() => handleCategoryChange(category)}
                                color={selectedCategory === category ? 'primary' : 'default'}
                                sx={{
                                    fontWeight: selectedCategory === category ? 700 : 400,
                                    transition: designSystem.transitions.allFast
                                }}
                            />
                        ))}
                    </Stack>
                )}

                {/* Masonry Grid */}
                <ImageList
                    variant="masonry"
                    cols={cols}
                    gap={designSystem.spacing[2]}
                >
                    {filteredImages.map((image, index) => (
                        <ImageListItem
                            key={image.id || index}
                            component={motion.div}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <Box
                                onClick={() => handleImageClick(index)}
                                sx={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    borderRadius: designSystem.borders.radius.lg,
                                    overflow: 'hidden',
                                    '&:hover .overlay': {
                                        opacity: 1
                                    },
                                    '&:hover img': {
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                <img
                                    src={image.thumbnail || image.url}
                                    alt={image.title}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        display: 'block',
                                        transition: designSystem.transitions.allNormal,
                                        borderRadius: designSystem.borders.radius.lg
                                    }}
                                />
                                
                                {/* Hover Overlay */}
                                <Box
                                    className="overlay"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
                                        opacity: 0,
                                        transition: designSystem.transitions.allNormal,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        padding: designSystem.spacing[3]
                                    }}
                                >
                                    <ZoomIn
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: '3rem',
                                            color: designSystem.colors.text.inverse
                                        }}
                                    />
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: designSystem.colors.text.inverse,
                                            fontWeight: 700
                                        }}
                                    >
                                        {image.title}
                                    </Typography>
                                    {image.category && (
                                        <Chip
                                            label={image.category}
                                            size="small"
                                            sx={{
                                                mt: 1,
                                                alignSelf: 'flex-start',
                                                background: designSystem.colors.primary[500],
                                                color: designSystem.colors.text.inverse
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </ImageListItem>
                    ))}
                </ImageList>

                {/* Lightbox */}
                <Dialog
                    open={lightboxOpen}
                    onClose={handleCloseLightbox}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: 'rgba(0, 0, 0, 0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: 'none'
                        }
                    }}
                    BackdropProps={{
                        sx: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)'
                        }
                    }}
                >
                    <AnimatePresence mode="wait">
                        {lightboxOpen && filteredImages[currentImageIndex] && (
                            <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box sx={{ position: 'relative', p: 4 }}>
                                    {/* Close Button */}
                                    <IconButton
                                        onClick={handleCloseLightbox}
                                        sx={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 16,
                                            color: designSystem.colors.text.inverse,
                                            zIndex: 2,
                                            background: 'rgba(0,0,0,0.5)',
                                            '&:hover': {
                                                background: 'rgba(0,0,0,0.7)'
                                            }
                                        }}
                                    >
                                        <Close />
                                    </IconButton>

                                    {/* Navigation Buttons */}
                                    {filteredImages.length > 1 && (
                                        <>
                                            <IconButton
                                                onClick={handlePrevImage}
                                                sx={{
                                                    position: 'absolute',
                                                    left: 16,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: designSystem.colors.text.inverse,
                                                    background: 'rgba(0,0,0,0.5)',
                                                    '&:hover': {
                                                        background: 'rgba(0,0,0,0.7)'
                                                    }
                                                }}
                                            >
                                                <ChevronLeft fontSize="large" />
                                            </IconButton>
                                            <IconButton
                                                onClick={handleNextImage}
                                                sx={{
                                                    position: 'absolute',
                                                    right: 16,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: designSystem.colors.text.inverse,
                                                    background: 'rgba(0,0,0,0.5)',
                                                    '&:hover': {
                                                        background: 'rgba(0,0,0,0.7)'
                                                    }
                                                }}
                                            >
                                                <ChevronRight fontSize="large" />
                                            </IconButton>
                                        </>
                                    )}

                                    {/* Image */}
                                    <img
                                        src={filteredImages[currentImageIndex].url}
                                        alt={filteredImages[currentImageIndex].title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '80vh',
                                            objectFit: 'contain',
                                            borderRadius: designSystem.borders.radius.lg
                                        }}
                                    />

                                    {/* Image Info */}
                                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: designSystem.colors.text.inverse,
                                                fontWeight: 700,
                                                mb: 1
                                            }}
                                        >
                                            {filteredImages[currentImageIndex].title}
                                        </Typography>
                                        {filteredImages[currentImageIndex].description && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: designSystem.colors.text.inverse,
                                                    opacity: 0.8
                                                }}
                                            >
                                                {filteredImages[currentImageIndex].description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Dialog>
            </Container>
        </Box>
    );
};

export default VisualGallery;

