/**
 * SkeletonGrid - Grid de skeleton loaders para estados de carga
 * 
 * Props:
 * - count: número de items a mostrar (por defecto 6)
 * - columns: configuración de columnas responsive (por defecto {xs: 1, sm: 2, md: 3})
 * - variant: 'card' | 'list' | 'post' | 'custom' - Tipo de skeleton
 * - height: altura del skeleton (por defecto 200)
 * - spacing: espaciado entre items (por defecto 3)
 * 
 * Uso:
 * <SkeletonGrid variant="post" count={6} />
 */

import React from 'react';
import { Grid, Card, CardContent, Skeleton, Box, Stack } from '@mui/material';
import { useAppTheme } from '@/theme/ThemeProvider';

const SkeletonGrid = ({
  count = 6,
  columns = { xs: 1, sm: 2, md: 3 },
  variant = 'card',
  height = 200,
  spacing = 3,
  ...props
}) => {
  const { designSystem } = useAppTheme();

  // Skeleton variants
  const renderSkeleton = () => {
    switch (variant) {
      case 'post':
        return (
          <Card
            elevation={0}
            sx={{
              borderRadius: designSystem.borders.radius.lg,
              border: `1px solid ${designSystem.colors.border.main}`,
              overflow: 'hidden'
            }}
          >
            {/* Image skeleton */}
            <Skeleton
              variant="rectangular"
              height={height}
              animation="wave"
              sx={{
                bgcolor: designSystem.colors.secondary[100]
              }}
            />
            
            <CardContent sx={{ p: 3 }}>
              {/* Category chip */}
              <Skeleton
                variant="rounded"
                width={80}
                height={24}
                animation="wave"
                sx={{
                  mb: 2,
                  borderRadius: designSystem.borders.radius.full
                }}
              />
              
              {/* Title */}
              <Skeleton
                variant="text"
                animation="wave"
                sx={{
                  fontSize: '1.5rem',
                  mb: 1
                }}
              />
              <Skeleton
                variant="text"
                width="80%"
                animation="wave"
                sx={{
                  fontSize: '1.5rem',
                  mb: 2
                }}
              />
              
              {/* Excerpt */}
              <Skeleton variant="text" animation="wave" sx={{ mb: 0.5 }} />
              <Skeleton variant="text" animation="wave" sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="60%" animation="wave" sx={{ mb: 3 }} />
              
              {/* Author section */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Skeleton
                  variant="circular"
                  width={32}
                  height={32}
                  animation="wave"
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width={100} animation="wave" />
                  <Skeleton variant="text" width={60} animation="wave" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <Card
            elevation={0}
            sx={{
              borderRadius: designSystem.borders.radius.md,
              border: `1px solid ${designSystem.colors.border.main}`,
              p: 2
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton
                variant="circular"
                width={48}
                height={48}
                animation="wave"
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" animation="wave" />
                <Skeleton variant="text" width="40%" animation="wave" />
              </Box>
              <Skeleton
                variant="rectangular"
                width={80}
                height={36}
                animation="wave"
                sx={{ borderRadius: designSystem.borders.radius.md }}
              />
            </Stack>
          </Card>
        );

      case 'custom':
        return (
          <Skeleton
            variant="rectangular"
            height={height}
            animation="wave"
            sx={{
              borderRadius: designSystem.borders.radius.lg,
              bgcolor: designSystem.colors.secondary[100]
            }}
          />
        );

      case 'card':
      default:
        return (
          <Card
            elevation={0}
            sx={{
              borderRadius: designSystem.borders.radius.lg,
              border: `1px solid ${designSystem.colors.border.main}`,
              overflow: 'hidden'
            }}
          >
            <Skeleton
              variant="rectangular"
              height={height}
              animation="wave"
              sx={{
                bgcolor: designSystem.colors.secondary[100]
              }}
            />
            <CardContent>
              <Skeleton variant="text" animation="wave" sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" animation="wave" />
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Grid container spacing={spacing} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item {...columns} key={index}>
          {renderSkeleton()}
        </Grid>
      ))}
    </Grid>
  );
};

export default SkeletonGrid;
