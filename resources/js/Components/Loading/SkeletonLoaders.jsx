import React from 'react';
import { Box, Paper, Skeleton, Stack, useTheme } from '@mui/material';

/**
 * Skeleton Loader para tarjetas de posts en formato fila
 */
export const PostRowSkeleton = ({ count = 1 }) => {
    const theme = useTheme();

    return (
        <Stack spacing={4}>
            {Array.from({ length: count }).map((_, index) => (
                <Paper
                    key={index}
                    elevation={0}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                        p: 0
                    }}
                >
                    {/* Imagen Skeleton */}
                    <Box
                        sx={{
                            width: { xs: '100%', md: 320 },
                            height: { xs: 200, md: 240 },
                            position: 'relative'
                        }}
                    >
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            animation="wave"
                            sx={{ borderRadius: 0 }}
                        />
                    </Box>

                    {/* Contenido Skeleton */}
                    <Box 
                        sx={{ 
                            flex: 1, 
                            p: { xs: 3, md: 4 },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {/* Header con categoría y fecha */}
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Skeleton variant="rounded" width={80} height={24} />
                            <Skeleton variant="text" width={120} height={16} />
                        </Stack>

                        {/* Título */}
                        <Skeleton 
                            variant="text" 
                            width="90%" 
                            height={32}
                            sx={{ fontSize: '1.5rem' }}
                        />
                        <Skeleton 
                            variant="text" 
                            width="75%" 
                            height={32}
                            sx={{ fontSize: '1.5rem' }}
                        />

                        {/* Excerpt */}
                        <Stack spacing={1}>
                            <Skeleton variant="text" width="100%" height={20} />
                            <Skeleton variant="text" width="95%" height={20} />
                            <Skeleton variant="text" width="80%" height={20} />
                        </Stack>

                        {/* Footer con autor y stats */}
                        <Stack 
                            direction="row" 
                            alignItems="center" 
                            justifyContent="space-between"
                            sx={{ mt: 'auto' }}
                        >
                            {/* Autor */}
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Skeleton variant="circular" width={32} height={32} />
                                <Stack spacing={0.5}>
                                    <Skeleton variant="text" width={100} height={16} />
                                    <Skeleton variant="text" width={60} height={14} />
                                </Stack>
                            </Stack>

                            {/* Stats */}
                            <Stack direction="row" alignItems="center" spacing={3}>
                                <Skeleton variant="text" width={50} height={16} />
                                <Skeleton variant="text" width={40} height={16} />
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            ))}
        </Stack>
    );
};

/**
 * Skeleton para tarjetas de posts compactas (trending)
 */
export const PostCardSkeleton = ({ count = 3 }) => {
    return (
        <Stack direction="row" spacing={4}>
            {Array.from({ length: count }).map((_, index) => (
                <Paper
                    key={index}
                    elevation={0}
                    sx={{
                        flex: 1,
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    {/* Imagen */}
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={220}
                        animation="wave"
                    />

                    {/* Contenido */}
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={1.5}>
                            <Skeleton variant="rounded" width={80} height={24} />
                            <Skeleton variant="text" width="90%" height={24} />
                            <Skeleton variant="text" width="75%" height={24} />
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width="100%" height={16} />
                                <Skeleton variant="text" width="85%" height={16} />
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Skeleton variant="circular" width={24} height={24} />
                                <Skeleton variant="text" width={80} height={14} />
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            ))}
        </Stack>
    );
};

/**
 * Skeleton para el hero post
 */
export const HeroPostSkeleton = () => {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                minHeight: 500
            }}
        >
            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ height: '100%' }}>
                {/* Imagen */}
                <Box sx={{ flex: { md: 7 }, height: { xs: 300, md: 500 } }}>
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        animation="wave"
                    />
                </Box>
                
                {/* Contenido */}
                <Box sx={{ 
                    flex: { md: 5 }, 
                    p: { xs: 4, md: 6 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <Stack spacing={3}>
                        <Skeleton variant="text" width="90%" height={48} />
                        <Skeleton variant="text" width="85%" height={48} />
                        <Stack spacing={1}>
                            <Skeleton variant="text" width="100%" height={20} />
                            <Skeleton variant="text" width="95%" height={20} />
                            <Skeleton variant="text" width="80%" height={20} />
                        </Stack>
                        <Skeleton variant="rounded" width={200} height={48} />
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
};

/**
 * Skeleton para la búsqueda avanzada
 */
export const SearchSkeleton = () => {
    return (
        <Paper
            elevation={2}
            sx={{
                borderRadius: 6,
                p: 2,
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" sx={{ flex: 1 }} height={24} />
            </Stack>
        </Paper>
    );
};