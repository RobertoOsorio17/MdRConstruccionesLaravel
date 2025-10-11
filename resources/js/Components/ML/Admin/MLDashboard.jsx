import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Chip,
    LinearProgress,
    Divider,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Psychology as AIIcon,
    TrendingUp as MetricsIcon,
    Settings as SettingsIcon,
    Science as ABTestIcon,
    HealthAndSafety as HealthIcon,
    Storage as DataIcon,
    Speed as PerformanceIcon,
    Group as ClusterIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import MLService from '@/Services/MLService';

const MLDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [health, setHealth] = useState(null);
    const [clustering, setClustering] = useState(null);
    const [trainDialogOpen, setTrainDialogOpen] = useState(false);
    const [trainOptions, setTrainOptions] = useState({
        mode: 'full',
        batchSize: 100,
        async: true,
        clearCache: true,
        notify: false
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [metricsData, healthData, clusteringData] = await Promise.all([
                MLService.getSystemMetrics('7d'),
                MLService.getHealthStatus(),
                MLService.getClusteringAnalysis()
            ]);

            setMetrics(metricsData.data);
            setHealth(healthData.data);
            setClustering(clusteringData.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrainModels = async () => {
        setLoading(true);
        try {
            const result = await MLService.trainModels(trainOptions);
            
            if (result.success) {
                alert('Entrenamiento iniciado exitosamente');
                setTrainDialogOpen(false);
                loadDashboardData();
            }
        } catch (error) {
            alert('Error al entrenar modelos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRetrainClustering = async () => {
        setLoading(true);
        try {
            const result = await MLService.retrainClustering();
            
            if (result.success) {
                alert('Clustering re-entrenado exitosamente');
                loadDashboardData();
            }
        } catch (error) {
            alert('Error al re-entrenar clustering: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !metrics) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        🤖 Panel de Control ML
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitoreo y administración del sistema de Machine Learning
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadDashboardData}
                        disabled={loading}
                    >
                        Actualizar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AIIcon />}
                        onClick={() => setTrainDialogOpen(true)}
                        disabled={loading}
                    >
                        Entrenar Modelos
                    </Button>
                </Box>
            </Box>

            {/* Health Status */}
            {health && (
                <Alert
                    severity={health.status === 'healthy' ? 'success' : 'warning'}
                    sx={{ mb: 3 }}
                    icon={<HealthIcon />}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Estado del Sistema: {health.status === 'healthy' ? 'Saludable' : 'Requiere Atención'}
                    </Typography>
                    <Typography variant="caption">
                        Última actualización: {new Date(health.last_training).toLocaleString()}
                    </Typography>
                </Alert>
            )}

            {/* Métricas principales */}
            {metrics && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <motion.div whileHover={{ y: -4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <DataIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {metrics.total_interactions?.toLocaleString() || 0}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Interacciones Totales
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <motion.div whileHover={{ y: -4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <MetricsIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {metrics.avg_confidence ? `${Math.round(metrics.avg_confidence * 100)}%` : 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Confianza Promedio
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <motion.div whileHover={{ y: -4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <PerformanceIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {metrics.ctr ? `${(metrics.ctr * 100).toFixed(2)}%` : 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                CTR
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <motion.div whileHover={{ y: -4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ClusterIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {clustering?.num_clusters || 0}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Clusters Activos
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            )}

            {/* Clustering Analysis */}
            {clustering && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                📊 Análisis de Clustering
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={handleRetrainClustering}
                                disabled={loading}
                            >
                                Re-entrenar
                            </Button>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Silhouette Score
                                </Typography>
                                <Typography variant="h6">
                                    {clustering.silhouette_score?.toFixed(3) || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Davies-Bouldin Index
                                </Typography>
                                <Typography variant="h6">
                                    {clustering.davies_bouldin_index?.toFixed(3) || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Inertia
                                </Typography>
                                <Typography variant="h6">
                                    {clustering.inertia?.toFixed(2) || 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Train Dialog */}
            <Dialog open={trainDialogOpen} onClose={() => setTrainDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Entrenar Modelos ML</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Modo de Entrenamiento</InputLabel>
                            <Select
                                value={trainOptions.mode}
                                onChange={(e) => setTrainOptions({ ...trainOptions, mode: e.target.value })}
                            >
                                <MenuItem value="full">Completo</MenuItem>
                                <MenuItem value="posts_only">Solo Posts</MenuItem>
                                <MenuItem value="profiles_only">Solo Perfiles</MenuItem>
                                <MenuItem value="incremental">Incremental</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Tamaño de Batch"
                            type="number"
                            value={trainOptions.batchSize}
                            onChange={(e) => setTrainOptions({ ...trainOptions, batchSize: parseInt(e.target.value) })}
                            sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={trainOptions.async}
                                    onChange={(e) => setTrainOptions({ ...trainOptions, async: e.target.checked })}
                                />
                            }
                            label="Entrenamiento Asíncrono"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={trainOptions.clearCache}
                                    onChange={(e) => setTrainOptions({ ...trainOptions, clearCache: e.target.checked })}
                                />
                            }
                            label="Limpiar Caché"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTrainDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleTrainModels} variant="contained" disabled={loading}>
                        Iniciar Entrenamiento
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MLDashboard;

