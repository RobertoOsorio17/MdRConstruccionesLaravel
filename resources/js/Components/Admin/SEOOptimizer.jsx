import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    LinearProgress,
    Chip,
    Stack,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SEOIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    TrendingUp as TrendingIcon,
    Visibility as VisibilityIcon,
    Speed as SpeedIcon
} from '@mui/icons-material';

const SEOOptimizer = ({ 
    title, 
    excerpt, 
    content, 
    seoTitle, 
    onSeoTitleChange, 
    seoDescription, 
    onSeoDescriptionChange,
    slug 
}) => {
    const theme = useTheme();
    const [seoScore, setSeoScore] = useState(0);
    const [seoAnalysis, setSeoAnalysis] = useState([]);

    // Análisis SEO en tiempo real
    useEffect(() => {
        const analysis = [];
        let score = 0;

        // Análisis del título
        const titleLength = (seoTitle || title || '').length;
        if (titleLength >= 30 && titleLength <= 60) {
            analysis.push({
                type: 'success',
                category: 'Título',
                message: 'Longitud del título óptima (30-60 caracteres)',
                points: 15
            });
            score += 15;
        } else if (titleLength > 0) {
            analysis.push({
                type: 'warning',
                category: 'Título',
                message: `Título ${titleLength < 30 ? 'muy corto' : 'muy largo'} (${titleLength} caracteres)`,
                points: 5
            });
            score += 5;
        } else {
            analysis.push({
                type: 'error',
                category: 'Título',
                message: 'Falta el título SEO',
                points: 0
            });
        }

        // Análisis de la descripción
        const descLength = (seoDescription || excerpt || '').length;
        if (descLength >= 120 && descLength <= 160) {
            analysis.push({
                type: 'success',
                category: 'Descripción',
                message: 'Longitud de descripción óptima (120-160 caracteres)',
                points: 15
            });
            score += 15;
        } else if (descLength > 0) {
            analysis.push({
                type: 'warning',
                category: 'Descripción',
                message: `Descripción ${descLength < 120 ? 'muy corta' : 'muy larga'} (${descLength} caracteres)`,
                points: 5
            });
            score += 5;
        } else {
            analysis.push({
                type: 'error',
                category: 'Descripción',
                message: 'Falta la descripción SEO',
                points: 0
            });
        }

        // Análisis del contenido
        const contentLength = (content || '').replace(/<[^>]*>/g, '').length;
        if (contentLength >= 300) {
            analysis.push({
                type: 'success',
                category: 'Contenido',
                message: `Contenido suficiente (${contentLength} caracteres)`,
                points: 10
            });
            score += 10;
        } else {
            analysis.push({
                type: 'warning',
                category: 'Contenido',
                message: `Contenido insuficiente (${contentLength} caracteres, mínimo 300)`,
                points: 3
            });
            score += 3;
        }

        // Análisis del slug
        if (slug && slug.length > 0) {
            const slugWords = slug.split('-').length;
            if (slugWords >= 3 && slugWords <= 6) {
                analysis.push({
                    type: 'success',
                    category: 'URL',
                    message: 'URL amigable y descriptiva',
                    points: 10
                });
                score += 10;
            } else {
                analysis.push({
                    type: 'warning',
                    category: 'URL',
                    message: 'URL podría ser más descriptiva',
                    points: 5
                });
                score += 5;
            }
        }

        // Análisis de imágenes en el contenido
        const imageMatches = (content || '').match(/<img[^>]*>/g);
        const imageCount = imageMatches ? imageMatches.length : 0;
        if (imageCount > 0) {
            analysis.push({
                type: 'success',
                category: 'Imágenes',
                message: `${imageCount} imagen(es) encontrada(s)`,
                points: 5
            });
            score += 5;
        } else {
            analysis.push({
                type: 'warning',
                category: 'Imágenes',
                message: 'Considera agregar imágenes para mejorar el engagement',
                points: 0
            });
        }

        // Análisis de enlaces
        const linkMatches = (content || '').match(/<a[^>]*>/g);
        const linkCount = linkMatches ? linkMatches.length : 0;
        if (linkCount > 0) {
            analysis.push({
                type: 'success',
                category: 'Enlaces',
                message: `${linkCount} enlace(s) encontrado(s)`,
                points: 5
            });
            score += 5;
        }

        // Análisis de encabezados
        const headingMatches = (content || '').match(/<h[1-6][^>]*>/g);
        const headingCount = headingMatches ? headingMatches.length : 0;
        if (headingCount >= 2) {
            analysis.push({
                type: 'success',
                category: 'Estructura',
                message: `Buena estructura con ${headingCount} encabezado(s)`,
                points: 10
            });
            score += 10;
        } else if (headingCount === 1) {
            analysis.push({
                type: 'warning',
                category: 'Estructura',
                message: 'Considera agregar más encabezados para mejor estructura',
                points: 5
            });
            score += 5;
        } else {
            analysis.push({
                type: 'warning',
                category: 'Estructura',
                message: 'Falta estructura de encabezados (H1, H2, H3, etc.)',
                points: 0
            });
        }

        setSeoScore(Math.min(score, 100));
        setSeoAnalysis(analysis);
    }, [title, excerpt, content, seoTitle, seoDescription, slug]);

    const getScoreColor = (score) => {
        if (score >= 80) return theme.palette.success.main;
        if (score >= 60) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excelente';
        if (score >= 60) return 'Bueno';
        if (score >= 40) return 'Regular';
        return 'Necesita mejoras';
    };

    const getIconByType = (type) => {
        switch (type) {
            case 'success': return <CheckIcon color="success" />;
            case 'warning': return <WarningIcon color="warning" />;
            case 'error': return <ErrorIcon color="error" />;
            default: return <VisibilityIcon />;
        }
    };

    return (
        <Card
            sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 3,
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <SEOIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                        Optimización SEO
                    </Typography>
                    <Chip
                        icon={<TrendingIcon />}
                        label={`${seoScore}/100 - ${getScoreLabel(seoScore)}`}
                        size="small"
                        sx={{
                            backgroundColor: alpha(getScoreColor(seoScore), 0.1),
                            color: getScoreColor(seoScore),
                            border: `1px solid ${alpha(getScoreColor(seoScore), 0.3)}`,
                            fontWeight: 'bold'
                        }}
                    />
                </Box>

                {/* SEO Score Progress */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Puntuación SEO
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={getScoreColor(seoScore)}>
                            {seoScore}/100
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={seoScore}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(theme.palette.grey[500], 0.2),
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: getScoreColor(seoScore),
                                borderRadius: 4,
                            }
                        }}
                    />
                </Box>

                <Stack spacing={3}>
                    {/* SEO Title */}
                    <TextField
                        fullWidth
                        label="Título SEO"
                        value={seoTitle}
                        onChange={(e) => onSeoTitleChange(e.target.value)}
                        placeholder={title || 'Título optimizado para motores de búsqueda'}
                        helperText={`${(seoTitle || '').length}/60 caracteres recomendados`}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                backdropFilter: 'blur(10px)',
                            }
                        }}
                    />

                    {/* SEO Description */}
                    <TextField
                        fullWidth
                        label="Descripción SEO"
                        value={seoDescription}
                        onChange={(e) => onSeoDescriptionChange(e.target.value)}
                        placeholder={excerpt || 'Descripción que aparecerá en los resultados de búsqueda'}
                        multiline
                        rows={3}
                        helperText={`${(seoDescription || '').length}/160 caracteres recomendados`}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                backdropFilter: 'blur(10px)',
                            }
                        }}
                    />

                    {/* SEO Analysis */}
                    <Accordion
                        sx={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.3),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            borderRadius: 2,
                            '&:before': { display: 'none' }
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SpeedIcon fontSize="small" />
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Análisis Detallado ({seoAnalysis.length} elementos)
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List dense>
                                {seoAnalysis.map((item, index) => (
                                    <ListItem key={index} sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            {getIconByType(item.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={item.category}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem' }}
                                                    />
                                                    <Typography variant="body2">
                                                        {item.message}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={`+${item.points} puntos`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    {/* SEO Tips */}
                    {seoScore < 80 && (
                        <Alert 
                            severity="info" 
                            icon={<TrendingIcon />}
                            sx={{
                                backgroundColor: alpha(theme.palette.info.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Consejos para mejorar:</strong> Optimiza el título y descripción, agrega más contenido, 
                                incluye imágenes con texto alternativo y estructura el contenido con encabezados.
                            </Typography>
                        </Alert>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default SEOOptimizer;
