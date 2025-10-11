import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Skeleton,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    alpha
} from '@mui/material';
import { motion } from 'framer-motion';

// Glassmorphism theme
const THEME = {
    glass: 'rgba(255, 255, 255, 0.1)',
    surface: 'rgba(255, 255, 255, 0.15)',
    primary: '#2563eb',
    text: {
        primary: 'rgba(255, 255, 255, 0.95)',
        secondary: 'rgba(255, 255, 255, 0.7)',
        light: 'rgba(255, 255, 255, 0.6)'
    }
};

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => {
    const theme = useTheme();
    
    return (
        <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item * 0.1 }}
                    >
                        <Card
                            sx={{
                                backgroundColor: THEME.glass,
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 3,
                                overflow: 'hidden',
                                height: 140
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Skeleton
                                        variant="circular"
                                        width={48}
                                        height={48}
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            mr: 2
                                        }}
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Skeleton
                                            variant="text"
                                            width="60%"
                                            height={24}
                                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                        />
                                    </Box>
                                </Box>
                                <Skeleton
                                    variant="text"
                                    width="40%"
                                    height={32}
                                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 1 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={16}
                                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            ))}
        </Grid>
    );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <TableContainer
            component={Paper}
            sx={{
                backgroundColor: THEME.glass,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                overflow: 'hidden'
            }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, index) => (
                            <TableCell key={index}>
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={24}
                                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: (rowIndex * columns + colIndex) * 0.05 }}
                                    >
                                        <Skeleton
                                            variant="text"
                                            width={colIndex === 0 ? "60%" : "90%"}
                                            height={20}
                                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                        />
                                    </motion.div>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// Chart Skeleton
export const ChartSkeleton = ({ height = 300 }) => {
    // ✅ FIX: Pre-calculate bar heights outside render to avoid Math.random() causing re-renders
    const barHeights = React.useMemo(() =>
        [65, 45, 75, 55, 85, 40, 70], // Predefined heights for consistent animation
        []
    );

    return (
        <Card
            sx={{
                backgroundColor: THEME.glass,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                height
            }}
        >
            <CardContent sx={{ p: 3, height: '100%' }}>
                <Box sx={{ mb: 2 }}>
                    <Skeleton
                        variant="text"
                        width="40%"
                        height={28}
                        sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 1 }}
                    />
                    <Skeleton
                        variant="text"
                        width="60%"
                        height={16}
                        sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    />
                </Box>

                <Box sx={{ height: height - 120, position: 'relative' }}>
                    {/* Chart bars simulation */}
                    <Box sx={{ display: 'flex', alignItems: 'end', height: '100%', gap: 1 }}>
                        {barHeights.map((barHeight, index) => (
                            <motion.div
                                key={index}
                                initial={{ height: 0 }}
                                animate={{ height: `${barHeight}%` }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px 4px 0 0'
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

// Form Skeleton
export const FormSkeleton = () => {
    return (
        <Card
            sx={{
                backgroundColor: THEME.glass,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                overflow: 'hidden'
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <Skeleton
                    variant="text"
                    width="30%"
                    height={32}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }}
                />
                
                {Array.from({ length: 4 }).map((_, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                        <Skeleton
                            variant="text"
                            width="20%"
                            height={20}
                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 1 }}
                        />
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={56}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 1
                            }}
                        />
                    </Box>
                ))}
                
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Skeleton
                        variant="rectangular"
                        width={120}
                        height={40}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1
                        }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={100}
                        height={40}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

// Card Grid Skeleton
export const CardGridSkeleton = ({ items = 6, columns = 3 }) => {
    return (
        <Grid container spacing={3}>
            {Array.from({ length: items }).map((_, index) => (
                <Grid item xs={12} sm={6} md={12} key={index}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card
                            sx={{
                                backgroundColor: THEME.glass,
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 3,
                                overflow: 'hidden',
                                height: 200
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Skeleton
                                    variant="rectangular"
                                    width="100%"
                                    height={80}
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: 2,
                                        mb: 2
                                    }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={24}
                                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 1 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="60%"
                                    height={16}
                                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            ))}
        </Grid>
    );
};

// Page Skeleton (Full page loading)
export const PageSkeleton = () => {
    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Skeleton
                    variant="text"
                    width="30%"
                    height={40}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 1 }}
                />
                <Skeleton
                    variant="text"
                    width="50%"
                    height={20}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                />
            </Box>
            
            {/* Stats */}
            <DashboardStatsSkeleton />
            
            {/* Charts */}
            <Box sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <ChartSkeleton height={400} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <ChartSkeleton height={400} />
                    </Grid>
                </Grid>
            </Box>
            
            {/* Table */}
            <TableSkeleton rows={8} columns={5} />
        </Box>
    );
};

export default {
    DashboardStatsSkeleton,
    TableSkeleton,
    ChartSkeleton,
    FormSkeleton,
    CardGridSkeleton,
    PageSkeleton
};
