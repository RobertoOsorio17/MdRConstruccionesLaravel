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
    CircularProgress,
    alpha,
    useTheme,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    CheckCircle as CompletedIcon,
    Schedule as InProgressIcon,
    Pause as PausedIcon,
    Cancel as CancelledIcon,
    Timeline as TimelineIcon,
    Euro as EuroIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProjectAnalytics = ({ initialData }) => {
    const theme = useTheme();
    const [period, setPeriod] = useState('30');
    const [analyticsData, setAnalyticsData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = async (selectedPeriod) => {
        setLoading(true);
        try {
            const response = await fetch(route('admin.analytics.projects', { period: selectedPeriod }));
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

    const StatCard = ({ title, value, icon, color, subtitle, progress }) => (
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
                        {progress !== undefined && (
                            <CircularProgress
                                variant="determinate"
                                value={progress}
                                size={40}
                                thickness={4}
                                sx={{
                                    color: theme.palette[color].main,
                                }}
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'paused': return 'warning';
            case 'cancelled': return 'error';
            case 'planning': return 'info';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CompletedIcon />;
            case 'in_progress': return <InProgressIcon />;
            case 'paused': return <PausedIcon />;
            case 'cancelled': return <CancelledIcon />;
            default: return <TimelineIcon />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'in_progress': return 'En Progreso';
            case 'paused': return 'Pausado';
            case 'cancelled': return 'Cancelado';
            case 'planning': return 'Planificación';
            default: return status;
        }
    };

    return (
        <AdminLayoutNew>
            <Head title="Analíticas de Proyectos" />
            
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Analíticas de Proyectos
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
                            title="Proyectos Totales"
                            value={analyticsData?.timeline_analysis?.total_projects || '0'}
                            icon={<TimelineIcon />}
                            color="primary"
                            subtitle="En el período seleccionado"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Tasa de Finalización"
                            value={`${analyticsData?.performance_metrics?.on_time_completion_rate?.toFixed(1) || '0.0'}%`}
                            icon={<CompletedIcon />}
                            color="success"
                            subtitle="Proyectos completados a tiempo"
                            progress={analyticsData?.performance_metrics?.on_time_completion_rate || 0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Duración Promedio"
                            value={`${Math.round(analyticsData?.timeline_analysis?.avg_duration_days || 0)} días`}
                            icon={<AssessmentIcon />}
                            color="info"
                            subtitle="Tiempo promedio de proyecto"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Presupuesto Total"
                            value={`${(analyticsData?.budget_total || 0).toLocaleString()}€`}
                            icon={<EuroIcon />}
                            color="warning"
                            subtitle="Suma de todos los presupuestos"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Status Distribution */}
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
                                        Distribución por Estado
                                    </Typography>
                                    
                                    <Box sx={{ space: 2 }}>
                                        {Object.entries(analyticsData?.status_distribution || {}).map(([status, count]) => (
                                            <Box key={status} sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip
                                                            icon={getStatusIcon(status)}
                                                            label={getStatusLabel(status)}
                                                            color={getStatusColor(status)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {count}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(count / (analyticsData?.timeline_analysis?.total_projects || 1)) * 100}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: alpha(theme.palette[getStatusColor(status)].main, 0.1),
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 3,
                                                            backgroundColor: theme.palette[getStatusColor(status)].main,
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Recent Completions */}
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
                                        Finalizaciones por Mes
                                    </Typography>
                                    
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Mes</TableCell>
                                                    <TableCell align="right">Completados</TableCell>
                                                    <TableCell align="center">Progreso</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {analyticsData?.completion_trends?.slice(0, 6).map((month, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {month.month}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2">
                                                                {month.completions || 0}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min((month.completions || 0) * 20, 100)}
                                                                sx={{
                                                                    width: 60,
                                                                    height: 4,
                                                                    borderRadius: 2,
                                                                }}
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

export default ProjectAnalytics;
