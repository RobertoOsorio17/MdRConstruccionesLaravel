import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Dialog,
    DialogContent,
    useTheme,
    useMediaQuery,
    Stack
} from '@mui/material';
import {
    Close as CloseIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGallery = ({ images = [] }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setSelectedImage(images[index]);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const nextImage = () => {
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    const prevImage = () => {
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    if (!images || images.length === 0) return null;

    return (
        <>
            {/* Gallery Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                        md: images.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
                    },
                    gap: 2,
                    mt: 3
                }}
            >
                {images.slice(0, 6).map((image, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Box
                            onClick={() => openLightbox(index)}
                            sx={{
                                position: 'relative',
                                paddingTop: '66.67%',
                                borderRadius: 3,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease',
                                    zIndex: 1
                                },
                                '&:hover::before': {
                                    opacity: 1
                                },
                                '&:hover .zoom-icon': {
                                    opacity: 1
                                }
                            }}
                        >
                            <img
                                src={image.url || image}
                                alt={image.alt || `Galería imagen ${index + 1}`}
                                loading="lazy"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            <Box
                                className="zoom-icon"
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 2,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                }}
                            >
                                <IconButton
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 1)',
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                >
                                    <ZoomInIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </motion.div>
                ))}
            </Box>

            {/* Lightbox Dialog */}
            <Dialog
                open={Boolean(selectedImage)}
                onClose={closeLightbox}
                maxWidth="lg"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(20px)',
                        m: { xs: 0, md: 2 }
                    }
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    {/* Close Button */}
                    <IconButton
                        onClick={closeLightbox}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 2,
                            color: 'white',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.2)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={prevImage}
                                sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 2,
                                    color: 'white',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.2)'
                                    }
                                }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <IconButton
                                onClick={nextImage}
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 2,
                                    color: 'white',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.2)'
                                    }
                                }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </>
                    )}

                    {/* Image */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: { xs: '100vh', md: '80vh' },
                                    p: { xs: 2, md: 4 }
                                }}
                            >
                                <img
                                    src={selectedImage?.url || selectedImage}
                                    alt={selectedImage?.alt || 'Imagen ampliada'}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        </motion.div>
                    </AnimatePresence>

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                px: 3,
                                py: 1,
                                borderRadius: 3,
                                fontSize: '0.9rem'
                            }}
                        >
                            {currentIndex + 1} / {images.length}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImageGallery;
