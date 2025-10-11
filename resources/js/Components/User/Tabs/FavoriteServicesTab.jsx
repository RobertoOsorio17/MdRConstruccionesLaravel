import React, { useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    IconButton,
    Chip,
    Box,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    FavoriteOutlined,
    DeleteOutlined,
    SearchOutlined,
    LaunchOutlined,
    StarOutlined,
    BuildOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const THEME = {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: 'rgba(255, 255, 255, 0.05)',
    surface: 'rgba(255, 255, 255, 0.1)',
    glass: 'rgba(255, 255, 255, 0.15)',
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        light: '#94a3b8'
    }
};

const FavoriteServicesTab = ({ services = [], currentUser, onRemoveFavorite, onContactService }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemoveFavorite = async (service) => {
        if (onRemoveFavorite) {
            await onRemoveFavorite(service.id);
        }
    };

    const handleContactService = (service) => {
        if (onContactService) {
            onContactService(service);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar servicios favoritos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlined sx={{ color: THEME.text.secondary }} />
                            </InputAdornment>
                        ),
                        sx: {
                            backgroundColor: THEME.glass,
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                border: `2px solid ${THEME.primary}`,
                            }
                        }
                    }}
                />
            </Box>

            {/* Services Grid */}
            <Grid container spacing={3}>
                <AnimatePresence>
                    {filteredServices.map((service) => (
                        <Grid item xs={12} sm={6} md={4} key={service.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: THEME.glass,
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        '&:hover': {
                                            backgroundColor: THEME.surface,
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                        }
                                    }}
                                >
                                    {/* Favorite Indicator */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            backgroundColor: THEME.error,
                                            borderRadius: '50%',
                                            p: 0.5,
                                            zIndex: 1
                                        }}
                                    >
                                        <FavoriteOutlined sx={{ fontSize: 16, color: 'white' }} />
                                    </Box>

                                    {/* Service Image/Icon */}
                                    <Box
                                        sx={{
                                            height: 120,
                                            background: service.image 
                                                ? `url(${service.image})` 
                                                : `linear-gradient(135deg, ${THEME.primary}, ${THEME.accent})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}
                                    >
                                        {!service.image && (
                                            <BuildOutlined sx={{ fontSize: 48, color: 'white', opacity: 0.8 }} />
                                        )}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                                p: 1
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                                                {service.category || 'Servicio'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        {/* Service Name */}
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: THEME.text.primary,
                                                mb: 2,
                                                lineHeight: 1.3,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {service.name}
                                        </Typography>

                                        {/* Service Category */}
                                        {service.category && (
                                            <Box sx={{ mb: 2 }}>
                                                <Chip
                                                    label={service.category}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: THEME.primary,
                                                        color: 'white',
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        {/* Service Description */}
                                        <Typography
                                            variant="body2"
                                            color={THEME.text.secondary}
                                            sx={{
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {service.description || 'Descripción del servicio no disponible.'}
                                        </Typography>

                                        {/* Service Features */}
                                        {service.features && service.features.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" color={THEME.text.light} gutterBottom>
                                                    Características:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                    {service.features.slice(0, 3).map((feature, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={feature}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                height: 24,
                                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                                                color: THEME.text.secondary
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Service Rating */}
                                        {service.rating && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <StarOutlined sx={{ fontSize: 16, color: THEME.accent }} />
                                                <Typography variant="caption" color={THEME.text.secondary}>
                                                    {service.rating}/5 ({service.reviews_count || 0} reseñas)
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Price Range */}
                                        {service.price_range && (
                                            <Typography
                                                variant="subtitle2"
                                                color={THEME.success}
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {service.price_range}
                                            </Typography>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveFavorite(service)}
                                                sx={{
                                                    color: THEME.error,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                                    }
                                                }}
                                            >
                                                <DeleteOutlined />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => window.open(`/servicios/${service.slug}`, '_blank')}
                                                sx={{ color: THEME.text.secondary }}
                                            >
                                                <LaunchOutlined />
                                            </IconButton>
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleContactService(service)}
                                            sx={{
                                                backgroundColor: THEME.primary,
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: THEME.secondary
                                                }
                                            }}
                                        >
                                            Contactar
                                        </Button>
                                    </CardActions>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            {/* Empty State */}
            {filteredServices.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        backgroundColor: THEME.glass,
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <FavoriteOutlined sx={{ fontSize: 48, color: THEME.text.light, mb: 2 }} />
                    <Typography variant="h6" color={THEME.text.secondary} gutterBottom>
                        {searchTerm ? 'No se encontraron servicios' : 'No tienes servicios favoritos'}
                    </Typography>
                    <Typography variant="body2" color={THEME.text.light}>
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los servicios que marques como favoritos aparecerán aquí'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default FavoriteServicesTab;
