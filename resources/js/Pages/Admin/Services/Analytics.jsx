import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    LinearProgress,
    alpha,
    useTheme,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Visibility as ViewsIcon,
    Favorite as FavoriteIcon,
    Star as StarIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ServiceAnalytics = ({ initialData }) => {
    const theme = useTheme();
    const [period, setPeriod] = useState('30');
    const [analyticsData, setAnalyticsData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = async (selectedPeriod) => {
        setLoading(true);
        try {
            const response = await fetch(route('admin.analytics.services', { period: selectedPeriod }));
            const data = await response.json();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (period !== '30') {
            fetchAnalytics(period);
        }
    }, [period]);

    const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card
                sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                    height: '100%',
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)}, ${alpha(theme.palette[color].main, 0.2)})`,
                                color: theme.palette[color].main,
                            }}
                        >
                            {icon}
                        </Box>
                        {trend && (
                            <Chip
                                label={`${trend > 0 ? '+' : ''}${trend}%`}
                                color={trend > 0 ? 'success' : trend < 0 ? 'error' : 'default'}
                                size="small"
                            />
                        )}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {value}
                    </Typography>
                    <Typography variant="h6" color="text.primary" sx={{ mb: 0.5 }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <AdminLayoutNew>
            <Head title="Analíticas de Servicios" />
            
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Analíticas de Servicios
                    </Typography>
                    
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Período</InputLabel>
                        <Select
                            value={period}
                            label="Período"
                            onChange={(e) => setPeriod(e.target.value)}
                            sx={{
                                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                        >
                            <MenuItem value="7">Últimos 7 días</MenuItem>
                            <MenuItem value="30">Últimos 30 días</MenuItem>
                            <MenuItem value="90">Últimos 90 días</MenuItem>
                            <MenuItem value="365">Último año</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total de Vistas"
                            value={analyticsData?.performance?.total_views?.toLocaleString() || '0'}
                            icon={<ViewsIcon />}
                            color="primary"
                            subtitle="En el período seleccionado"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Favoritos Totales"
                            value={analyticsData?.favorites?.length || '0'}
                            icon={<FavoriteIcon />}
                            color="error"
                            subtitle="Servicios marcados como favoritos"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Promedio de Vistas"
                            value={Math.round(analyticsData?.performance?.avg_views || 0)}
                            icon={<TrendingUpIcon />}
                            color="success"
                            subtitle="Por servicio"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Tasa de Conversión"
                            value={`${analyticsData?.conversion?.conversion_rate?.toFixed(1) || '0.0'}%`}
                            icon={<StarIcon />}
                            color="warning"
                            subtitle="Vistas a favoritos"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Top Services by Views */}
                    <Grid item xs={12} md={6}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card
                                sx={{
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    borderRadius: 3,
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Servicios Más Vistos
                                    </Typography>
                                    
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Servicio</TableCell>
                                                    <TableCell align="right">Vistas</TableCell>
                                                    <TableCell align="center">Estado</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {analyticsData?.views?.slice(0, 5).map((service, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {service.title}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2">
                                                                {service.total_views?.toLocaleString() || '0'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={service.is_featured ? 'Destacado' : 'Normal'}
                                                                color={service.is_featured ? 'warning' : 'default'}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Top Services by Favorites */}
                    <Grid item xs={12} md={6}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card
                                sx={{
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    borderRadius: 3,
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Servicios Más Favoritos
                                    </Typography>
                                    
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Servicio</TableCell>
                                                    <TableCell align="right">Favoritos</TableCell>
                                                    <TableCell align="center">Categoría</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {analyticsData?.favorites?.slice(0, 5).map((service, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {service.title}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2">
                                                                {service.favorite_count}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={service.category || 'Sin categoría'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>
        </AdminLayoutNew>
    );
};

export default ServiceAnalytics;
