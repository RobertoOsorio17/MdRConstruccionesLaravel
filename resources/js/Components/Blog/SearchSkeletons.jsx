import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Skeleton,
    Stack,
    Grid
} from '@mui/material';
import { motion } from 'framer-motion';

// Premium design system
const THEME = {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    },
    surface: {
        primary: '#ffffff',
        secondary: '#f8fafc',
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }
};

// Search Result Card Skeleton
export const SearchResultSkeleton = ({ index = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
            }}
        >
            <Card
                sx={{
                    background: `linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.95) 0%, 
                        rgba(255, 255, 255, 0.9) 100%
                    )`,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                    boxShadow: THEME.shadows.md,
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, 
                            rgba(59, 130, 246, 0.02) 0%, 
                            rgba(147, 51, 234, 0.02) 100%
                        )`,
                        pointerEvents: 'none'
                    }
                }}
            >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Stack spacing={2}>
                        {/* Title Skeleton */}
                        <Skeleton
                            variant="text"
                            width="85%"
                            height={32}
                            sx={{
                                bgcolor: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: 1
                            }}
                        />

                        {/* Meta info skeleton */}
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Skeleton
                                variant="circular"
                                width={24}
                                height={24}
                                sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}
                            />
                            <Skeleton
                                variant="text"
                                width={120}
                                height={20}
                                sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}
                            />
                            <Skeleton
                                variant="text"
                                width={80}
                                height={20}
                                sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}
                            />
                        </Stack>

                        {/* Content skeleton */}
                        <Stack spacing={1}>
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={20}
                                sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)' }}
                            />
                            <Skeleton
                                variant="text"
                                width="90%"
                                height={20}
                                sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)' }}
                            />
                            <Skeleton
                                variant="text"
                                width="75%"
                                height={20}
                                sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)' }}
                            />
                        </Stack>

                        {/* Categories skeleton */}
                        <Stack direction="row" spacing={1}>
                            <Skeleton
                                variant="rounded"
                                width={80}
                                height={24}
                                sx={{ 
                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: 3
                                }}
                            />
                            <Skeleton
                                variant="rounded"
                                width={100}
                                height={24}
                                sx={{ 
                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: 3
                                }}
                            />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Search Results Grid Skeleton
export const SearchResultsGridSkeleton = ({ count = 6 }) => {
    return (
        <Grid container spacing={3}>
            {Array.from({ length: count }).map((_, index) => (
                <Grid key={index} size={{ xs: 12 }}>
                    <SearchResultSkeleton index={index} />
                </Grid>
            ))}
        </Grid>
    );
};

// Search Suggestions Skeleton
export const SearchSuggestionsSkeleton = ({ count = 5 }) => {
    // ✅ FIX: Pre-calculate widths outside render to avoid Math.random() causing re-renders
    const widths = React.useMemo(() =>
        Array.from({ length: count }, (_, i) => 60 + (i * 8) % 40),
        [count]
    );

    return (
        <Stack spacing={1} sx={{ p: 2 }}>
            {Array.from({ length: count }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
                        <Skeleton
                            variant="circular"
                            width={20}
                            height={20}
                            sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Skeleton
                            variant="text"
                            width={`${widths[index]}%`}
                            height={20}
                            sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}
                        />
                    </Stack>
                </motion.div>
            ))}
        </Stack>
    );
};

// Search Stats Skeleton
export const SearchStatsSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Skeleton
                    variant="text"
                    width={200}
                    height={24}
                    sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Skeleton
                    variant="text"
                    width={100}
                    height={20}
                    sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)' }}
                />
            </Stack>
        </motion.div>
    );
};

// Shimmer effect for enhanced loading animation
export const ShimmerSkeleton = ({ width = '100%', height = 20, borderRadius = 1 }) => {
    return (
        <Box
            sx={{
                width,
                height,
                borderRadius,
                background: `linear-gradient(
                    90deg,
                    rgba(59, 130, 246, 0.08) 0%,
                    rgba(59, 130, 246, 0.15) 50%,
                    rgba(59, 130, 246, 0.08) 100%
                )`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                '@keyframes shimmer': {
                    '0%': {
                        backgroundPosition: '-200% 0'
                    },
                    '100%': {
                        backgroundPosition: '200% 0'
                    }
                }
            }}
        />
    );
};

// Pulse loading indicator
export const PulseLoader = ({ size = 40, color = THEME.primary[500] }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
            }}
        >
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Box
                    sx={{
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            width: size * 0.6,
                            height: size * 0.6,
                            borderRadius: '50%',
                            backgroundColor: color,
                            opacity: 0.8
                        }}
                    />
                </Box>
            </motion.div>
        </Box>
    );
};

export default {
    SearchResultSkeleton,
    SearchResultsGridSkeleton,
    SearchSuggestionsSkeleton,
    SearchStatsSkeleton,
    ShimmerSkeleton,
    PulseLoader
};
