/**
 * SectionContainer - Wrapper de secciones con padding y spacing consistente
 *
 * Este componente garantiza que todas las secciones del sitio tengan
 * padding vertical consistente y máximo ancho controlado.
 *
 * @example
 * <SectionContainer
 *   maxWidth="lg"
 *   py="large"
 *   backgroundColor="default"
 * >
 *   <Typography variant="h2">Título de sección</Typography>
 *   <Grid container spacing={3}>
 *     ... Contenido ...
 *   </Grid>
 * </SectionContainer>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import designSystem from '@/theme/designSystem';

// ============================================
// PADDING PRESETS
// ============================================

const paddingPresets = {
  // Padding vertical
  none: { xs: 0, md: 0 },
  small: { xs: 4, md: 6 },      // 32px móvil, 48px desktop
  medium: { xs: 6, md: 8 },     // 48px móvil, 64px desktop
  large: { xs: 8, md: 12 },     // 64px móvil, 96px desktop
  xlarge: { xs: 10, md: 16 },   // 80px móvil, 128px desktop
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function SectionContainer({
  children,
  maxWidth = 'lg',
  py = 'large',
  pt,
  pb,
  px,
  backgroundColor = 'default',
  backgroundGradient,
  backgroundImage,
  overlay,
  disableGutters = false,
  centerContent = false,
  component = 'section',
  sx = {},
  ...props
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ============================================
  // BACKGROUND STYLES
  // ============================================

  const getBackgroundStyles = () => {
    const styles = {};

    // Gradient background
    if (backgroundGradient) {
      const gradient = designSystem.gradients[backgroundGradient] || backgroundGradient;
      styles.background = gradient;
    }
    // Solid color background
    else if (backgroundColor !== 'default') {
      const bgColors = {
        primary: theme.palette.primary.main,
        secondary: theme.palette.secondary.main,
        surface: designSystem.colors.surface.secondary,
        paper: theme.palette.background.paper,
        dark: designSystem.colors.secondary[900],
        light: designSystem.colors.primary[50],
      };
      styles.backgroundColor = bgColors[backgroundColor] || backgroundColor;
    }
    // Default
    else {
      styles.backgroundColor = theme.palette.background.default;
    }

    return styles;
  };

  // ============================================
  // PADDING CALCULATION
  // ============================================

  const getPadding = () => {
    // Custom padding top/bottom
    if (pt !== undefined || pb !== undefined) {
      return {
        pt: pt !== undefined ? pt : (py === 'none' ? 0 : paddingPresets[py]?.xs || py),
        pb: pb !== undefined ? pb : (py === 'none' ? 0 : paddingPresets[py]?.xs || py),
      };
    }

    // Preset padding
    if (typeof py === 'string' && paddingPresets[py]) {
      return { py: paddingPresets[py] };
    }

    // Numeric padding
    return { py };
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Box
      component={component}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        ...getBackgroundStyles(),
        ...sx,
      }}
      {...props}
    >
      {/* Background Image Layer */}
      {backgroundImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />
      )}

      {/* Overlay Layer */}
      {overlay && (backgroundImage || backgroundGradient) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlay})`,
            zIndex: 1,
          }}
        />
      )}

      {/* Content Layer */}
      <Container
        maxWidth={maxWidth}
        disableGutters={disableGutters}
        sx={{
          position: 'relative',
          zIndex: 2,
          ...getPadding(),
          px: px !== undefined ? px : (disableGutters ? 0 : undefined),
          ...(centerContent && {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }),
        }}
      >
        {children}
      </Container>
    </Box>
  );
}

// ============================================
// PROPTYPES
// ============================================

SectionContainer.propTypes = {
  /** Contenido de la sección */
  children: PropTypes.node.isRequired,
  
  /** Máximo ancho del container: 'xs', 'sm', 'md', 'lg', 'xl', false */
  maxWidth: PropTypes.oneOfType([
    PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
    PropTypes.string,
  ]),
  
  /** Padding vertical preset: 'none', 'small', 'medium', 'large', 'xlarge' o número MUI spacing */
  py: PropTypes.oneOfType([
    PropTypes.oneOf(['none', 'small', 'medium', 'large', 'xlarge']),
    PropTypes.number,
  ]),
  
  /** Padding top custom (sobreescribe py) */
  pt: PropTypes.number,
  
  /** Padding bottom custom (sobreescribe py) */
  pb: PropTypes.number,
  
  /** Padding horizontal custom */
  px: PropTypes.number,
  
  /** Color de fondo: 'default', 'primary', 'secondary', 'surface', 'paper', 'dark', 'light' o custom */
  backgroundColor: PropTypes.string,
  
  /** Gradiente de fondo del designSystem o custom */
  backgroundGradient: PropTypes.string,
  
  /** Imagen de fondo URL */
  backgroundImage: PropTypes.string,
  
  /** Opacidad del overlay (0-1) */
  overlay: PropTypes.number,
  
  /** Deshabilitar padding horizontal del Container */
  disableGutters: PropTypes.bool,
  
  /** Centrar contenido horizontal y verticalmente */
  centerContent: PropTypes.bool,
  
  /** Elemento HTML a renderizar */
  component: PropTypes.string,
  
  /** Estilos adicionales de MUI sx prop */
  sx: PropTypes.object,
};

// ============================================
// VARIANT PRESETS (para uso rápido)
// ============================================

/**
 * SectionContainer con fondo primary y texto blanco
 */
export function PrimarySectionContainer({ children, ...props }) {
  return (
    <SectionContainer
      backgroundColor="primary"
      sx={{ color: 'white', ...props.sx }}
      {...props}
    >
      {children}
    </SectionContainer>
  );
}

/**
 * SectionContainer con gradiente hero
 */
export function HeroSectionContainer({ children, ...props }) {
  return (
    <SectionContainer
      backgroundGradient="hero"
      overlay={0.1}
      sx={{ color: 'white', ...props.sx }}
      {...props}
    >
      {children}
    </SectionContainer>
  );
}

/**
 * SectionContainer con fondo surface (gris claro)
 */
export function SurfaceSectionContainer({ children, ...props }) {
  return (
    <SectionContainer
      backgroundColor="surface"
      {...props}
    >
      {children}
    </SectionContainer>
  );
}
