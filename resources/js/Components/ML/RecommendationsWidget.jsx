import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    ToggleButtonGroup,
    ToggleButton,
    Skeleton,
    Fade,
    useTheme
} from '@mui/material';
import {
    Psychology as AIIcon,
    TrendingUp as TrendingIcon,
    People as CollaborativeIcon,
    Article as ContentIcon,
    AutoAwesome as HybridIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMLRecommendations } from '@/Hooks/useMLRecommendations';
import RecommendationCard from './RecommendationCard';

const RecommendationsWidget = ({
    currentPostId = null,
    limit = 6,
    showAlgorithmSelector = false,
    showExplanations = false,
    title = '🤖 Recomendaciones Personalizadas',
    variant = 'grid', // 'grid' | 'carousel' | 'list'
    compact = false // Modo compacto para sidebar
}) => {
    const theme = useTheme();
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('hybrid');
    const [recommendations, setRecommendations] = useState([]);
    
    const { 
        getMLRecommendations, 
        trackRecommendationClick,
        loading,
        error 
    } = useMLRecommendations();

    // Cargar recomendaciones
    useEffect(() => {
        loadRecommendations();
    }, [currentPostId, selectedAlgorithm, limit]);

    const loadRecommendations = async () => {
        try {
            const recs = await getMLRecommendations(currentPostId, {
                limit,
                algorithm: selectedAlgorithm,
                diversityBoost: 0.3,
                includeExplanation: showExplanations
            });
            
            setRecommendations(recs || []);
        } catch (err) {
            console.error('Error loading recommendations:', err);
        }
    };

    const handleAlgorithmChange = (event, newAlgorithm) => {
        if (newAlgorithm !== null) {
            setSelectedAlgorithm(newAlgorithm);
        }
    };

    const handleRecommendationClick = async (data) => {
        await trackRecommendationClick(data.post_id, data);
    };

    // Algoritmos disponibles
    const algorithms = [
        { value: 'hybrid', label: 'Híbrido', icon: <HybridIcon /> },
        { value: 'content_based', label: 'Contenido', icon: <ContentIcon /> },
        { value: 'collaborative', label: 'Colaborativo', icon: <CollaborativeIcon /> },
        { value: 'trending', label: 'Trending', icon: <TrendingIcon /> }
    ];

    return (
        <Box
            sx={{
                py: compact ? 0 : 4,
                ...(compact && {
                    p: 2.5,
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.98) 0%, rgba(18, 18, 18, 0.95) 100%)'
                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(5, 150, 105, 0.1)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        : '0 8px 32px rgba(5, 150, 105, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        background: 'linear-gradient(180deg, #059669, #10b981)',
                    }
                })
            }}
        >
            {/* Header */}
            <Box sx={{ mb: compact ? 2 : 3 }}>
                <Typography
                    variant={compact ? "h6" : "h4"}
                    sx={{
                        fontWeight: 700,
                        mb: compact ? 1 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: 'primary.main',
                        fontSize: compact ? '1rem' : undefined,
                    }}
                >
                    {title}
                </Typography>

                {!compact && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Contenido seleccionado especialmente para ti usando inteligencia artificial
                    </Typography>
                )}

                {/* Selector de algoritmo */}
                {showAlgorithmSelector && (
                    <ToggleButtonGroup
                        value={selectedAlgorithm}
                        exclusive
                        onChange={handleAlgorithmChange}
                        size="small"
                        sx={{ mb: 2 }}
                    >
                        {algorithms.map(algo => (
                            <ToggleButton
                                key={algo.value}
                                value={algo.value}
                                sx={{
                                    px: 2,
                                    py: 1,
                                    textTransform: 'none',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {algo.icon}
                                    {algo.label}
                                </Box>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                )}
            </Box>

            {/* Loading State */}
            {loading && (
                <Grid container spacing={3}>
                    {[...Array(limit)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 1 }} />
                            <Skeleton variant="text" width="80%" />
                            <Skeleton variant="text" width="60%" />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Recommendations Grid */}
            {!loading && !error && recommendations.length > 0 && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedAlgorithm}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={compact ? 2 : 3}>
                            {recommendations.map((post, index) => (
                                <Grid item xs={12} key={post.id}>
                                    <RecommendationCard
                                        post={post}
                                        position={index + 1}
                                        onView={handleRecommendationClick}
                                        showExplanation={showExplanations}
                                        compact={compact}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Empty State */}
            {!loading && !error && recommendations.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 2,
                        backgroundColor: 'action.hover',
                        borderRadius: 3
                    }}
                >
                    <AIIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No hay recomendaciones disponibles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sigue explorando contenido para que podamos personalizar tus recomendaciones
                    </Typography>
                </Box>
            )}

            {/* Stats Footer */}
            {!loading && recommendations.length > 0 && (
                <Box
                    sx={{
                        mt: compact ? 2 : 3,
                        p: compact ? 1.5 : 2,
                        backgroundColor: compact ? 'rgba(5, 150, 105, 0.05)' : 'action.hover',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        border: compact ? '1px solid rgba(5, 150, 105, 0.1)' : 'none',
                    }}
                >
                    <AIIcon sx={{ color: 'primary.main', fontSize: compact ? 18 : 24 }} />
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: compact ? '0.75rem' : '0.875rem' }}
                    >
                        {recommendations.length} recomendaciones usando{' '}
                        <strong style={{ color: '#059669' }}>
                            {algorithms.find(a => a.value === selectedAlgorithm)?.label}
                        </strong>
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default RecommendationsWidget;

