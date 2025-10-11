import React from 'react';
import { Card, CardContent, Box, Skeleton, Stack } from '@mui/material';

// Premium design system colors
const THEME = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
  },
  border: {
    light: '#f1f5f9',
    main: '#e2e8f0',
  },
  surface: {
    primary: '#ffffff',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  }
};

const PostCardSkeleton = ({ index = 0 }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        height: '100%',
        border: `1px solid ${THEME.border.main}`,
        backgroundColor: THEME.surface.primary,
        boxShadow: THEME.shadows.sm,
        display: 'flex',
        flexDirection: 'column',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        animationDelay: `${index * 0.1}s`,
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.8,
          },
        },
      }}
    >
      {/* Image Skeleton */}
      <Box sx={{ position: 'relative' }}>
        <Skeleton
          variant="rectangular"
          height={200}
          sx={{
            bgcolor: THEME.primary[50],
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${THEME.primary[100]}, transparent)`,
              animation: 'shimmer 2s infinite',
            },
            '@keyframes shimmer': {
              '0%': {
                transform: 'translateX(-100%)',
              },
              '100%': {
                transform: 'translateX(100%)',
              },
            },
          }}
        />
        
        {/* Category Chip Skeleton */}
        <Skeleton
          variant="rounded"
          width={80}
          height={24}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 3,
          }}
        />
        
        {/* Reading Time Skeleton */}
        <Skeleton
          variant="rounded"
          width={60}
          height={24}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Content Skeleton */}
      <CardContent
        sx={{
          p: 4,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Title Skeleton */}
        <Box>
          <Skeleton
            variant="text"
            width="90%"
            height={28}
            sx={{
              bgcolor: THEME.primary[50],
              borderRadius: 1,
              mb: 0.5,
            }}
          />
          <Skeleton
            variant="text"
            width="70%"
            height={28}
            sx={{
              bgcolor: THEME.primary[50],
              borderRadius: 1,
            }}
          />
        </Box>

        {/* Excerpt Skeleton */}
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton
            variant="text"
            width="100%"
            height={20}
            sx={{
              bgcolor: THEME.primary[50],
              borderRadius: 1,
              mb: 0.5,
            }}
          />
          <Skeleton
            variant="text"
            width="100%"
            height={20}
            sx={{
              bgcolor: THEME.primary[50],
              borderRadius: 1,
              mb: 0.5,
            }}
          />
          <Skeleton
            variant="text"
            width="80%"
            height={20}
            sx={{
              bgcolor: THEME.primary[50],
              borderRadius: 1,
            }}
          />
        </Box>

        {/* Footer Skeleton */}
        <Box
          sx={{
            mt: 'auto',
            pt: 2,
            borderTop: `1px solid ${THEME.border.light}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Skeleton
                variant="circular"
                width={28}
                height={28}
                sx={{
                  bgcolor: THEME.primary[100],
                }}
              />
              <Box>
                <Skeleton
                  variant="text"
                  width={80}
                  height={16}
                  sx={{
                    bgcolor: THEME.primary[50],
                    borderRadius: 1,
                    mb: 0.25,
                  }}
                />
                <Skeleton
                  variant="text"
                  width={40}
                  height={12}
                  sx={{
                    bgcolor: THEME.primary[50],
                    borderRadius: 1,
                  }}
                />
              </Box>
            </Stack>
            <Skeleton
              variant="text"
              width={60}
              height={16}
              sx={{
                bgcolor: THEME.primary[50],
                borderRadius: 1,
              }}
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCardSkeleton;
