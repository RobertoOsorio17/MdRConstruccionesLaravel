import React from 'react';
import {
    Box,
    Container,
    Skeleton,
    Stack,
    Paper,
    CircularProgress,
    Typography,
    Fade
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
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
    }
};

const AuthLoadingState = ({ 
    message = "Verificando permisos...", 
    showProgress = true,
    variant = "full" // "full", "inline", "minimal"
}) => {
    if (variant === "minimal") {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            </Box>
        );
    }

    if (variant === "inline") {
        return (
            <Fade in timeout={300}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        p: 3,
                        background: `linear-gradient(145deg, 
                            rgba(255, 255, 255, 0.9) 0%, 
                            rgba(255, 255, 255, 0.7) 100%
                        )`,
                        backdropFilter: 'blur(10px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                        borderRadius: 2,
                    }}
                >
                    {showProgress && (
                        <CircularProgress 
                            size={24} 
                            sx={{ color: THEME.primary[500] }}
                        />
                    )}
                    <Typography 
                        variant="body2" 
                        sx={{ color: THEME.text.secondary }}
                    >
                        {message}
                    </Typography>
                </Box>
            </Fade>
        );
    }

    // Full page loading state
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, 
                    ${THEME.primary[50]} 0%, 
                    rgba(255, 255, 255, 0.9) 100%
                )`,
                p: 2
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            background: `linear-gradient(145deg, 
                                rgba(255, 255, 255, 0.95) 0%, 
                                rgba(255, 255, 255, 0.9) 100%
                            )`,
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `radial-gradient(circle at center, ${THEME.primary[100]} 0%, transparent 70%)`,
                                opacity: 0.5,
                                pointerEvents: 'none'
                            }
                        }}
                    >
                        <Stack spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                            {/* Loading Animation */}
                            <motion.div
                                animate={{ 
                                    rotate: 360,
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `conic-gradient(from 0deg, 
                                            ${THEME.primary[500]} 0deg, 
                                            ${THEME.primary[300]} 180deg, 
                                            ${THEME.primary[500]} 360deg
                                        )`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            inset: 4,
                                            borderRadius: '50%',
                                            background: 'white',
                                        }
                                    }}
                                >
                                    <CircularProgress 
                                        size={40} 
                                        sx={{ 
                                            color: THEME.primary[500],
                                            position: 'relative',
                                            zIndex: 1
                                        }}
                                    />
                                </Box>
                            </motion.div>

                            {/* Loading Message */}
                            <Stack spacing={2} alignItems="center">
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: THEME.text.primary,
                                        mb: 1
                                    }}
                                >
                                    {message}
                                </Typography>
                                
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: THEME.text.secondary,
                                        maxWidth: 400,
                                        lineHeight: 1.6
                                    }}
                                >
                                    Por favor espera mientras verificamos tus permisos y preparamos tu experiencia.
                                </Typography>
                            </Stack>

                            {/* Loading Progress Skeleton */}
                            <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
                                <Skeleton 
                                    variant="rectangular" 
                                    height={8} 
                                    sx={{ borderRadius: 1 }}
                                />
                                <Stack direction="row" spacing={2}>
                                    <Skeleton 
                                        variant="rectangular" 
                                        height={6} 
                                        sx={{ flex: 2, borderRadius: 1 }}
                                    />
                                    <Skeleton 
                                        variant="rectangular" 
                                        height={6} 
                                        sx={{ flex: 1, borderRadius: 1 }}
                                    />
                                </Stack>
                            </Stack>
                        </Stack>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

// Navigation Loading Skeleton
export const NavigationLoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Stack spacing={1} sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
            </Stack>
        </Stack>
    </Box>
);

// Menu Loading Skeleton
export const MenuLoadingSkeleton = () => (
    <Stack spacing={1} sx={{ p: 1 }}>
        {[1, 2, 3].map((item) => (
            <Stack key={item} direction="row" spacing={2} alignItems="center" sx={{ p: 1 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="70%" />
            </Stack>
        ))}
    </Stack>
);

// Dashboard Loading Skeleton
export const DashboardLoadingSkeleton = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
            {/* Header */}
            <Stack spacing={2}>
                <Skeleton variant="text" width="30%" height={40} />
                <Skeleton variant="text" width="60%" height={24} />
            </Stack>

            {/* Stats Cards */}
            <Stack direction="row" spacing={3}>
                {[1, 2, 3, 4].map((item) => (
                    <Paper key={item} sx={{ p: 3, flex: 1 }}>
                        <Stack spacing={2}>
                            <Skeleton variant="circular" width={48} height={48} />
                            <Skeleton variant="text" width="80%" />
                            <Skeleton variant="text" width="60%" />
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            {/* Content Area */}
            <Stack direction="row" spacing={3}>
                <Box sx={{ flex: 2 }}>
                    <Paper sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Skeleton variant="text" width="40%" height={32} />
                            {[1, 2, 3, 4, 5].map((item) => (
                                <Stack key={item} direction="row" spacing={2} alignItems="center">
                                    <Skeleton variant="rectangular" width={60} height={40} />
                                    <Stack spacing={1} sx={{ flex: 1 }}>
                                        <Skeleton variant="text" width="80%" />
                                        <Skeleton variant="text" width="60%" />
                                    </Stack>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Skeleton variant="text" width="60%" height={24} />
                            {[1, 2, 3].map((item) => (
                                <Stack key={item} spacing={1}>
                                    <Skeleton variant="text" width="90%" />
                                    <Skeleton variant="text" width="70%" />
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            </Stack>
        </Stack>
    </Container>
);

export default AuthLoadingState;
