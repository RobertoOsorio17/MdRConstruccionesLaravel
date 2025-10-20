/**
 * Skeleton Components - Sistema de skeleton loaders
 * 
 * Componentes de skeleton para estados de carga que mejoran la UX
 * mostrando placeholders mientras se cargan los datos.
 * 
 * Características:
 * - Múltiples variantes: text, circular, rectangular, rounded
 * - Animación de pulso suave
 * - Respeta prefers-reduced-motion
 * - Componentes predefinidos para casos comunes
 * - Totalmente personalizable
 * 
 * Uso:
 * ```jsx
 * import { Skeleton, SkeletonCard, SkeletonList } from '@/Components/UI/Skeleton';
 * 
 * // Skeleton básico
 * <Skeleton variant="text" width="200px" />
 * 
 * // Skeleton de card
 * <SkeletonCard />
 * 
 * // Lista de skeletons
 * <SkeletonList count={3} />
 * ```
 */

import React from 'react';
import { Box } from '@mui/material';
import { colors, borders, spacing } from '@/theme/designSystem';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Base Skeleton Component
 */
export const Skeleton = ({
  variant = 'rectangular',
  width = '100%',
  height,
  borderRadius,
  animation = 'pulse',
  sx = {},
  ...props
}) => {
  const { prefersReducedMotion } = useReducedMotion();

  // Default heights by variant
  const defaultHeights = {
    text: '1em',
    circular: '40px',
    rectangular: '100px',
    rounded: '100px'
  };

  // Default border radius by variant
  const defaultBorderRadius = {
    text: borders.radius.sm,
    circular: '50%',
    rectangular: borders.radius.md,
    rounded: borders.radius.xl
  };

  const finalHeight = height || defaultHeights[variant];
  const finalBorderRadius = borderRadius || defaultBorderRadius[variant];

  // Animation keyframes
  const pulseAnimation = !prefersReducedMotion && animation === 'pulse' ? {
    '@keyframes pulse': {
      '0%': {
        opacity: 1
      },
      '50%': {
        opacity: 0.4
      },
      '100%': {
        opacity: 1
      }
    },
    animation: 'pulse 1.5s ease-in-out infinite'
  } : {};

  const waveAnimation = !prefersReducedMotion && animation === 'wave' ? {
    '@keyframes wave': {
      '0%': {
        transform: 'translateX(-100%)'
      },
      '100%': {
        transform: 'translateX(100%)'
      }
    },
    overflow: 'hidden',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, ${colors.surface.primary}, transparent)`,
      animation: 'wave 1.5s ease-in-out infinite'
    }
  } : {};

  return (
    <Box
      sx={{
        display: 'inline-block',
        width,
        height: finalHeight,
        backgroundColor: colors.secondary[200],
        borderRadius: finalBorderRadius,
        ...pulseAnimation,
        ...waveAnimation,
        ...sx
      }}
      {...props}
    />
  );
};

/**
 * Skeleton Text - Para líneas de texto
 */
export const SkeletonText = ({ lines = 1, spacing: lineSpacing = 1, ...props }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[lineSpacing] }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
          {...props}
        />
      ))}
    </Box>
  );
};

/**
 * Skeleton Avatar - Para avatares circulares
 */
export const SkeletonAvatar = ({ size = 40, ...props }) => {
  return (
    <Skeleton
      variant="circular"
      width={`${size}px`}
      height={`${size}px`}
      {...props}
    />
  );
};

/**
 * Skeleton Card - Para cards completas
 */
export const SkeletonCard = ({
  hasImage = true,
  imageHeight = '200px',
  hasAvatar = false,
  textLines = 3,
  ...props
}) => {
  return (
    <Box
      sx={{
        border: `1px solid ${colors.border.main}`,
        borderRadius: borders.radius.lg,
        overflow: 'hidden',
        ...props.sx
      }}
    >
      {/* Image */}
      {hasImage && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={imageHeight}
          borderRadius="0"
        />
      )}

      {/* Content */}
      <Box sx={{ padding: spacing[4] }}>
        {/* Header with avatar */}
        {hasAvatar && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2], mb: spacing[3] }}>
            <SkeletonAvatar size={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height="16px" />
              <Skeleton variant="text" width="40%" height="14px" sx={{ mt: spacing[1] }} />
            </Box>
          </Box>
        )}

        {/* Title */}
        <Skeleton variant="text" width="80%" height="24px" sx={{ mb: spacing[2] }} />

        {/* Description */}
        <SkeletonText lines={textLines} spacing={1.5} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: spacing[2], mt: spacing[3] }}>
          <Skeleton variant="rounded" width="100px" height="36px" />
          <Skeleton variant="rounded" width="100px" height="36px" />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Skeleton List - Para listas de items
 */
export const SkeletonList = ({ count = 3, spacing: itemSpacing = 2, itemHeight = '60px', ...props }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[itemSpacing] }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: spacing[2],
            border: `1px solid ${colors.border.main}`,
            borderRadius: borders.radius.md
          }}
        >
          <SkeletonAvatar size={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height="16px" />
            <Skeleton variant="text" width="40%" height="14px" sx={{ mt: spacing[1] }} />
          </Box>
          <Skeleton variant="rounded" width="80px" height="32px" />
        </Box>
      ))}
    </Box>
  );
};

/**
 * Skeleton Table - Para tablas
 */
export const SkeletonTable = ({ rows = 5, columns = 4, ...props }) => {
  return (
    <Box
      sx={{
        border: `1px solid ${colors.border.main}`,
        borderRadius: borders.radius.md,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: spacing[2],
          padding: spacing[2],
          backgroundColor: colors.surface.secondary,
          borderBottom: `1px solid ${colors.border.main}`
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" height="20px" />
        ))}
      </Box>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: spacing[2],
            padding: spacing[2],
            borderBottom: rowIndex < rows - 1 ? `1px solid ${colors.border.main}` : 'none'
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height="16px" />
          ))}
        </Box>
      ))}
    </Box>
  );
};

/**
 * Skeleton Grid - Para grids de cards
 */
export const SkeletonGrid = ({ count = 6, columns = 3, gap = 3, ...props }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: `repeat(2, 1fr)`,
          md: `repeat(${columns}, 1fr)`
        },
        gap: spacing[gap]
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} {...props} />
      ))}
    </Box>
  );
};

export default Skeleton;

