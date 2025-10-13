import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * LazyImage Component
 * 
 * Componente optimizado para carga lazy de imágenes con:
 * - Intersection Observer API
 * - Placeholder skeleton
 * - Fade-in animation
 * - Error handling
 * - Responsive srcset support
 * 
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} thumbnail - URL de thumbnail (opcional)
 * @param {object} sx - Estilos MUI
 * @param {string} aspectRatio - Ratio de aspecto (ej: '16/9', '4/3', '1/1')
 * @param {function} onClick - Handler de click
 * @param {object} srcSet - Objeto con URLs para diferentes tamaños
 */
const LazyImage = ({
    src,
    alt = '',
    thumbnail = null,
    sx = {},
    aspectRatio = '16/9',
    onClick = null,
    srcSet = null,
    priority = false,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority); // Si es priority, cargar inmediatamente
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    useEffect(() => {
        // Si es priority, no usar Intersection Observer
        if (priority) {
            setIsInView(true);
            return;
        }

        // Configurar Intersection Observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        // Dejar de observar una vez que está en vista
                        if (observerRef.current && imgRef.current) {
                            observerRef.current.unobserve(imgRef.current);
                        }
                    }
                });
            },
            {
                rootMargin: '50px', // Empezar a cargar 50px antes de que entre en viewport
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observerRef.current.observe(imgRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [priority]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    // Construir srcSet si se proporciona
    const buildSrcSet = () => {
        if (!srcSet) return undefined;
        
        return Object.entries(srcSet)
            .map(([size, url]) => `${url} ${size}`)
            .join(', ');
    };

    return (
        <Box
            ref={imgRef}
            sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: aspectRatio,
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                ...sx
            }}
            onClick={onClick}
            {...props}
        >
            {/* Skeleton Placeholder */}
            {!isLoaded && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.05)'
                    }}
                />
            )}

            {/* Thumbnail (low quality placeholder) */}
            {thumbnail && !isLoaded && isInView && (
                <Box
                    component="img"
                    src={thumbnail}
                    alt={alt}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(10px)',
                        transform: 'scale(1.1)'
                    }}
                />
            )}

            {/* Main Image */}
            {isInView && !hasError && (
                <motion.img
                    src={src}
                    srcSet={buildSrcSet()}
                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading={priority ? 'eager' : 'lazy'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            )}

            {/* Error State */}
            {hasError && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                    }}
                >
                    ⚠️ Error al cargar imagen
                </Box>
            )}
        </Box>
    );
};

export default LazyImage;

