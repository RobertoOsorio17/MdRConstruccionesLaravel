/**
 * ResponsiveImage - Componente de imagen optimizada con lazy loading y srcset
 * 
 * Props:
 * - src: URL de la imagen principal
 * - alt: texto alternativo (requerido para accesibilidad)
 * - aspectRatio: ratio de aspecto (ej: '16/9', '4/3', '1/1')
 * - sizes: tamaños responsive para srcset
 * - lazy: habilitar lazy loading (por defecto true)
 * - objectFit: 'cover' | 'contain' | 'fill' (por defecto 'cover')
 * - priority: deshabilitar lazy loading para imágenes importantes
 * - fallback: imagen fallback si falla la carga
 * - onLoad: callback cuando la imagen carga
 * - onError: callback cuando falla la carga
 * 
 * Uso:
 * <ResponsiveImage
 *   src="/images/project.jpg"
 *   alt="Proyecto de construcción"
 *   aspectRatio="16/9"
 *   lazy
 * />
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useAppTheme } from '@/theme/ThemeProvider';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

const ResponsiveImage = ({
  src,
  alt,
  aspectRatio = '16/9',
  sizes,
  lazy = true,
  objectFit = 'cover',
  priority = false,
  fallback = null,
  onLoad,
  onError,
  sx = {},
  ...props
}) => {
  const { designSystem } = useAppTheme();
  const [imageState, setImageState] = useState('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Convertir aspect ratio a porcentaje
  const getAspectRatioPadding = () => {
    if (!aspectRatio) return 'auto';
    
    const [width, height] = aspectRatio.split('/').map(Number);
    return `${(height / width) * 100}%`;
  };

  // Lazy loading con Intersection Observer
  useEffect(() => {
    if (!lazy || priority) {
      // Cargar imagen inmediatamente
      loadImage();
      return;
    }

    // Configurar Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Cargar 50px antes de entrar al viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src, lazy, priority]);

  const loadImage = () => {
    if (!src) {
      setImageState('error');
      return;
    }

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageState('loaded');
      onLoad?.();
    };

    img.onerror = () => {
      if (fallback) {
        setCurrentSrc(fallback);
        setImageState('loading');
      } else {
        setImageState('error');
      }
      onError?.();
    };
  };

  // Skeleton mientras carga
  if (imageState === 'loading') {
    return (
      <Box
        ref={imgRef}
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: getAspectRatioPadding(),
          backgroundColor: designSystem.colors.secondary[100],
          borderRadius: 'inherit',
          overflow: 'hidden',
          ...sx
        }}
      >
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'none'
          }}
        />
      </Box>
    );
  }

  // Estado de error
  if (imageState === 'error') {
    return (
      <Box
        ref={imgRef}
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: getAspectRatioPadding(),
          backgroundColor: designSystem.colors.secondary[100],
          borderRadius: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
          ...sx
        }}
      >
        <BrokenImageIcon 
          sx={{ 
            fontSize: 48, 
            color: designSystem.colors.secondary[400],
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }} 
        />
      </Box>
    );
  }

  // Imagen cargada
  return (
    <Box
      ref={imgRef}
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: getAspectRatioPadding(),
        overflow: 'hidden',
        borderRadius: 'inherit',
        ...sx
      }}
    >
      <Box
        component="img"
        src={currentSrc}
        alt={alt}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        decoding="async"
        sizes={sizes}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: objectFit,
          transition: designSystem.transitions.presets.opacity,
        }}
        {...props}
      />
    </Box>
  );
};

export default ResponsiveImage;
