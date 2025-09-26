import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    Avatar,
    Tooltip,
    IconButton,
    Collapse,
    Badge,
    Grid,
    Divider,
    Alert
} from '@mui/material';
import {
    Psychology as AIIcon,
    TrendingUp as TrendingIcon,
    Category as CategoryIcon,
    Tag as TagIcon,
    Schedule as TimeIcon,
    Visibility as ViewIcon,
    ExpandMore as ExpandIcon,
    ExpandLess as CollapseIcon,
    Info as InfoIcon,
    Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMLRecommendations } from '@/Hooks/useMLRecommendations';

const MLInsights = ({ currentPostId, variant = 'full' }) => {
    const [expanded, setExpanded] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    
    const { 
        insights, 
        getMLInsights, 
        mlRecommendations, 
        getMLStats,
        getRecommendationExplanation,
        loading 
    } = useMLRecommendations();

    useEffect(() => {
        getMLInsights();
    }, [getMLInsights]);

    const mlStats = getMLStats();

    if (variant === 'compact') {
        return (
            <Card 
                elevation={0}
                sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3
                }}
            >
                <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AIIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={600}>
                            IA Personalizada
                        </Typography>
                        {insights && (
                            <Chip 
                                label={`${insights.posts_read} posts leídos`} 
                                size="small"
                                sx={{ 
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontSize: '0.75rem'
                                }}
                            />
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const algorithmColors = {
        'content_based': '#2196F3',
        'collaborative': '#4CAF50', 
        'personalized': '#FF9800',
        'trending': '#E91E63'
    };

    const algorithmNames = {
        'content_based': 'Similitud de Contenido',
        'collaborative': 'Filtrado Colaborativo',
        'personalized': 'Personalizado',
        'trending': 'Trending'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card 
                elevation={0}
                sx={{ 
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    mb: 3
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                <AIIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    🤖 Inteligencia Artificial
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Recomendaciones personalizadas basadas en tu comportamiento
                                </Typography>
                            </Box>
                        </Box>
                        
                        <IconButton 
                            onClick={() => setExpanded(!expanded)}
                            sx={{ color: 'white' }}
                        >
                            {expanded ? <CollapseIcon /> : <ExpandIcon />}
                        </IconButton>
                    </Box>

                    {/* Stats principales */}
                    {insights && (
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight={700}>
                                        {insights.posts_read}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        Posts Leídos
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight={700}>
                                        {insights.reading_time}m
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        Tiempo Promedio
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight={700}>
                                        {insights.engagement_rate}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        Engagement
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight={700}>
                                        {insights.recommendations_accuracy}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        Precisión IA
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    {/* Algoritmo dominante */}
                    {mlStats && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                                🎯 Algoritmo Principal: <strong>{algorithmNames[mlStats.top_algorithm] || mlStats.top_algorithm}</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {Object.entries(mlStats.sources_distribution).map(([source, count]) => (
                                    <Chip
                                        key={source}
                                        label={`${algorithmNames[source] || source}: ${count}`}
                                        size="small"
                                        sx={{
                                            backgroundColor: algorithmColors[source] || '#9E9E9E',
                                            color: 'white',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Collapse in={expanded}>
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                                    
                                    {insights ? (
                                        <Box>
                                            {/* Perfil de usuario */}
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                                    👤 Tu Perfil de Lectura
                                                </Typography>
                                                {insights.cluster_description && (
                                                    <Alert 
                                                        severity="info" 
                                                        sx={{ 
                                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                                            color: 'white',
                                                            '& .MuiAlert-icon': { color: 'white' }
                                                        }}
                                                    >
                                                        {insights.cluster_description}
                                                    </Alert>
                                                )}
                                            </Box>

                                            {/* Categorías favoritas */}
                                            {insights.top_categories && insights.top_categories.length > 0 && (
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CategoryIcon fontSize="small" />
                                                        Categorías Favoritas
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        {insights.top_categories.map((category, index) => (
                                                            <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                                                    {category.name}
                                                                </Typography>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={category.preference_score}
                                                                    sx={{ 
                                                                        flex: 1, 
                                                                        height: 6, 
                                                                        borderRadius: 3,
                                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            backgroundColor: 'white'
                                                                        }
                                                                    }}
                                                                />
                                                                <Typography variant="caption">
                                                                    {category.preference_score}%
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Patrones de lectura */}
                                            {insights.reading_patterns && (
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <TimeIcon fontSize="small" />
                                                        Patrones de Lectura
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="body2">
                                                                <strong>Horario preferido:</strong><br />
                                                                {insights.reading_patterns.preferred_time}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="body2">
                                                                <strong>Duración promedio:</strong><br />
                                                                {insights.reading_patterns.avg_session_duration}m
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            )}

                                            {/* Botón para ver detalles técnicos */}
                                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                                <IconButton 
                                                    onClick={() => setShowDetails(!showDetails)}
                                                    sx={{ color: 'white' }}
                                                >
                                                    <AnalyticsIcon />
                                                </IconButton>
                                                <Typography variant="caption" display="block">
                                                    {showDetails ? 'Ocultar' : 'Ver'} Detalles Técnicos
                                                </Typography>
                                            </Box>

                                            {/* Detalles técnicos */}
                                            <Collapse in={showDetails}>
                                                {mlStats && (
                                                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                            🔬 Análisis Técnico
                                                        </Typography>
                                                        <Typography variant="caption" component="div">
                                                            <strong>Total recomendaciones:</strong> {mlStats.total_recommendations}
                                                        </Typography>
                                                        <Typography variant="caption" component="div">
                                                            <strong>Confianza promedio:</strong> {mlStats.avg_confidence}%
                                                        </Typography>
                                                        <Typography variant="caption" component="div">
                                                            <strong>Algoritmo dominante:</strong> {algorithmNames[mlStats.top_algorithm]}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Collapse>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                🚀 Sigue explorando para obtener insights personalizados
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.6 }}>
                                                La IA necesita más datos para generar recomendaciones precisas
                                            </Typography>
                                        </Box>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Collapse>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default MLInsights;