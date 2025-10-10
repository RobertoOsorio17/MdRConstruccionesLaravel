import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Tooltip,
    IconButton,
    Collapse,
    LinearProgress,
    Badge
} from '@mui/material';
import {
    Psychology as AIIcon,
    TrendingUp as TrendingIcon,
    People as CollaborativeIcon,
    Article as ContentIcon,
    Star as PersonalizedIcon,
    ExpandMore as ExpandIcon,
    ExpandLess as CollapseIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

const RecommendationCard = ({ post, position, onView, showExplanation = false, compact = false }) => {
    const [expanded, setExpanded] = useState(false);

    const mlData = post.ml_data || post.explanation || {};
    const source = mlData.source || mlData.algorithm_used || 'hybrid';
    const confidence = mlData.confidence || mlData.confidence_level || 0;
    const reason = mlData.reason || mlData.primary_reason || 'Recomendado para ti';

    // Iconos y colores por algoritmo
    const algorithmConfig = {
        content_based: {
            icon: <ContentIcon />,
            color: '#2196F3',
            label: 'Contenido Similar',
            description: 'Basado en similitud de contenido'
        },
        collaborative: {
            icon: <CollaborativeIcon />,
            color: '#4CAF50',
            label: 'Filtrado Colaborativo',
            description: 'Usuarios similares disfrutaron esto'
        },
        personalized: {
            icon: <PersonalizedIcon />,
            color: '#FF9800',
            label: 'Personalizado',
            description: 'Adaptado a tus preferencias'
        },
        trending: {
            icon: <TrendingIcon />,
            color: '#E91E63',
            label: 'Trending',
            description: 'Popular recientemente'
        },
        hybrid: {
            icon: <AIIcon />,
            color: '#9C27B0',
            label: 'IA Híbrida',
            description: 'Combinación de algoritmos'
        }
    };

    const config = algorithmConfig[source] || algorithmConfig.hybrid;

    const handleClick = () => {
        if (onView) {
            onView({
                post_id: post.id,
                source: source,
                score: mlData.score || confidence,
                position: position,
                confidence: confidence,
                reason: reason
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: position * 0.05 }}
            whileHover={{ y: compact ? -2 : -4, x: compact ? 4 : 0 }}
        >
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: compact ? 'row' : 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: compact ? 2 : 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: compact
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: compact
                        ? '1px solid rgba(5, 150, 105, 0.15)'
                        : '1px solid rgba(5, 150, 105, 0.1)',
                    boxShadow: compact
                        ? '0 2px 8px rgba(5, 150, 105, 0.08)'
                        : '0 4px 12px rgba(5, 150, 105, 0.1)',
                    '&:hover': {
                        boxShadow: compact
                            ? '0 4px 16px rgba(5, 150, 105, 0.15)'
                            : '0 8px 24px rgba(5, 150, 105, 0.2)',
                        borderColor: 'primary.main',
                        '& .card-image': {
                            transform: 'scale(1.1)',
                        }
                    },
                    ...(compact && {
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '3px',
                            background: 'linear-gradient(180deg, #059669, #10b981)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                        },
                        '&:hover::before': {
                            opacity: 1,
                        }
                    })
                }}
            >
                {/* Badge de posición */}
                {!compact && position <= 3 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -10,
                            left: -10,
                            zIndex: 10,
                            backgroundColor: config.color,
                            color: 'white',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            boxShadow: 2
                        }}
                    >
                        #{position}
                    </Box>
                )}

                {/* Imagen */}
                <Link href={route('blog.show', post.slug)} onClick={handleClick}>
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            width: compact ? 100 : '100%',
                            height: compact ? 100 : 200,
                            flexShrink: 0,
                        }}
                    >
                        <CardMedia
                            component="img"
                            image={post.cover_image || '/images/default-post.jpg'}
                            alt={post.title}
                            className="card-image"
                            sx={{
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%',
                                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        />
                        {compact && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, transparent 100%)',
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                    </Box>
                </Link>

                <CardContent sx={{ flexGrow: 1, pb: 1, p: compact ? 1.5 : 2 }}>
                    {/* Chip de algoritmo */}
                    {!compact && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Tooltip title={config.description}>
                                <Chip
                                    icon={config.icon}
                                    label={config.label}
                                    size="small"
                                    sx={{
                                        backgroundColor: config.color,
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        height: 24,
                                        '& .MuiChip-icon': {
                                            color: 'white',
                                            fontSize: '1rem'
                                        }
                                    }}
                                />
                            </Tooltip>

                            {/* Confianza */}
                            {confidence > 0 && (
                                <Tooltip title={`Confianza: ${Math.round(confidence * 100)}%`}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AIIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {Math.round(confidence * 100)}%
                                        </Typography>
                                    </Box>
                                </Tooltip>
                            )}

                            {/* Botón de explicación */}
                            {showExplanation && mlData.details && (
                                <IconButton
                                    size="small"
                                    onClick={() => setExpanded(!expanded)}
                                    sx={{ ml: 'auto', p: 0.5 }}
                                >
                                    {expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                                </IconButton>
                            )}
                        </Box>
                    )}

                    {/* Título */}
                    <Link href={route('blog.show', post.slug)} onClick={handleClick}>
                        <Typography
                            variant={compact ? "subtitle2" : "h6"}
                            sx={{
                                fontWeight: 600,
                                mb: compact ? 0.5 : 1,
                                fontSize: compact ? '0.875rem' : '1rem',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: compact ? 2 : 3,
                                WebkitBoxOrient: 'vertical',
                                color: 'text.primary',
                                textDecoration: 'none',
                                transition: 'color 0.2s ease',
                                '&:hover': {
                                    color: 'primary.main'
                                }
                            }}
                        >
                            {post.title}
                        </Typography>
                    </Link>

                    {/* Razón de recomendación - Solo en modo compacto */}
                    {compact && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                                        fontSize: '0.65rem'
                                    }}
                                >
                                    💡
                                </Box>
                                {reason}
                            </Typography>
                        </Box>
                    )}

                    {/* Razón de recomendación - Modo normal */}
                    {!compact && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: '0.875rem',
                                fontStyle: 'italic',
                                mb: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            💡 {reason}
                        </Typography>
                    )}

                    {/* Categorías - Solo en modo normal */}
                    {!compact && post.categories && post.categories.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                            {post.categories.slice(0, 2).map(category => (
                                <Chip
                                    key={category.id}
                                    label={category.name}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Explicación expandible */}
                    {showExplanation && mlData.details && (
                        <Collapse in={expanded}>
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 1.5,
                                    backgroundColor: 'action.hover',
                                    borderRadius: 2,
                                    borderLeft: `3px solid ${config.color}`
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    🔍 Por qué te recomendamos esto:
                                </Typography>
                                
                                {Object.entries(mlData.details).map(([key, value]) => {
                                    if (!value) return null;
                                    
                                    return (
                                        <Typography
                                            key={key}
                                            variant="caption"
                                            component="div"
                                            sx={{ mb: 0.5 }}
                                        >
                                            • {value}
                                        </Typography>
                                    );
                                })}

                                {/* Barra de confianza */}
                                {confidence > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Nivel de confianza
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={confidence * 100}
                                            sx={{
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: 'action.selected',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: config.color
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Collapse>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default RecommendationCard;

