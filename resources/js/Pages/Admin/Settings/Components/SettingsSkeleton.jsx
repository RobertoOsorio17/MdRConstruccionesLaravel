import React from 'react';
import {
    Box,
    Container,
    Paper,
    Skeleton,
    Stack,
    useTheme,
    alpha,
} from '@mui/material';

/**
 * Skeleton loader for Settings page
 * Displays while settings are loading
 */
export default function SettingsSkeleton() {
    const theme = useTheme();

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
            {/* Hero Skeleton */}
            <Paper
                sx={{
                    p: { xs: 3, md: 4 },
                    mb: 4,
                    background: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.15,
                    )}, ${alpha(theme.palette.primary.light, 0.08)})`,
                    backdropFilter: 'blur(12px)',
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                <Stack spacing={2}>
                    <Skeleton
                        variant="text"
                        width="40%"
                        height={40}
                        sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                        variant="text"
                        width="70%"
                        height={24}
                        sx={{ borderRadius: 1 }}
                    />
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mt: 2 }}
                        alignItems="center"
                    >
                        <Skeleton
                            variant="rectangular"
                            width={140}
                            height={40}
                            sx={{ borderRadius: 2 }}
                        />
                        <Skeleton
                            variant="rectangular"
                            width={140}
                            height={40}
                            sx={{ borderRadius: 2 }}
                        />
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                        />
                    </Stack>
                </Stack>
            </Paper>

            {/* Main Content Skeleton */}
            <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Sidebar Skeleton */}
                <Paper
                    sx={{
                        width: 280,
                        p: 2,
                        backgroundColor: alpha(
                            theme.palette.background.paper,
                            0.8,
                        ),
                        backdropFilter: 'blur(12px)',
                        borderRadius: 3,
                        display: { xs: 'none', md: 'block' },
                    }}
                >
                    <Skeleton
                        variant="text"
                        width="60%"
                        height={32}
                        sx={{ mb: 2, borderRadius: 1 }}
                    />
                    <Stack spacing={1.5}>
                        {[...Array(8)].map((_, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <Skeleton
                                    variant="circular"
                                    width={36}
                                    height={36}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton
                                        variant="text"
                                        width="80%"
                                        height={20}
                                        sx={{ borderRadius: 1 }}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width="60%"
                                        height={16}
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </Paper>

                {/* Settings Fields Skeleton */}
                <Box sx={{ flex: 1 }}>
                    <Paper
                        sx={{
                            p: 3,
                            backgroundColor: alpha(
                                theme.palette.background.paper,
                                0.8,
                            ),
                            backdropFilter: 'blur(12px)',
                            borderRadius: 3,
                        }}
                    >
                        <Stack spacing={3}>
                            <Box>
                                <Skeleton
                                    variant="text"
                                    width="30%"
                                    height={28}
                                    sx={{ mb: 1, borderRadius: 1 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="50%"
                                    height={20}
                                    sx={{ borderRadius: 1 }}
                                />
                            </Box>

                            {[...Array(5)].map((_, index) => (
                                <Box key={index}>
                                    <Skeleton
                                        variant="text"
                                        width="25%"
                                        height={24}
                                        sx={{ mb: 1, borderRadius: 1 }}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width="60%"
                                        height={18}
                                        sx={{ mb: 1.5, borderRadius: 1 }}
                                    />
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height={56}
                                        sx={{ borderRadius: 2 }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
}

