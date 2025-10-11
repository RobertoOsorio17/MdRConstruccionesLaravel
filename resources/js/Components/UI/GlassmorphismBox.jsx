/**
 * GlassmorphismBox - Componente reutilizable para efectos glassmorphism
 * 
 * Props:
 * - variant: 'light' | 'medium' | 'strong' | 'dark' - Intensidad del efecto
 * - blur: número - Intensidad del blur en px
 * - opacity: número - Opacidad del fondo (0-1)
 * - children: contenido del componente
 * - sx: estilos adicionales de MUI
 * - component: elemento HTML a renderizar (por defecto 'div')
 * 
 * Uso:
 * <GlassmorphismBox variant="medium">
 *   Contenido aquí
 * </GlassmorphismBox>
 */

import React from 'react';
import { Box } from '@mui/material';
import { useAppTheme } from '@/theme/ThemeProvider';

const GlassmorphismBox = ({
  children,
  variant = 'medium',
  blur,
  opacity,
  component = 'div',
  sx = {},
  ...props
}) => {
  const { designSystem, isDark } = useAppTheme();

  // Obtener preset del variant o usar valores personalizados
  const getGlassStyles = () => {
    // Si se pasan blur y opacity personalizados
    if (blur !== undefined && opacity !== undefined) {
      return {
        background: `rgba(${isDark ? '0, 0, 0' : '255, 255, 255'}, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid rgba(${isDark ? '255, 255, 255' : '255, 255, 255'}, ${opacity * 0.5})`,
        boxShadow: designSystem.shadows.glass
      };
    }

    // Usar presets
    const preset = designSystem.glassmorphism[variant] || designSystem.glassmorphism.medium;
    
    // Ajustar para dark mode
    if (isDark) {
      return {
        ...preset,
        background: preset.background.replace('255, 255, 255', '255, 255, 255'),
        border: `1px solid rgba(255, 255, 255, 0.1)`
      };
    }

    return preset;
  };

  const glassStyles = getGlassStyles();

  return (
    <Box
      component={component}
      sx={{
        ...glassStyles,
        position: 'relative',
        overflow: 'hidden',
        transition: designSystem.transitions.presets.allNormal,
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassmorphismBox;
