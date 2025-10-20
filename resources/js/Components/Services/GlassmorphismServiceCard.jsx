import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Avatar,
    Divider,
    useTheme
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    Star as StarIcon,
    CheckCircle as CheckIcon,
    Schedule as ScheduleIcon,
    Euro as EuroIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Share as ShareIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';

// Premium glassmorphism design system
const GLASS_THEME = {
    glass: {
        primary: `linear-gradient(145deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(255, 255, 255, 0.85) 50%,
            rgba(255, 255, 255, 0.9) 100%
        )`,
        secondary: `linear-gradient(145deg, 
            rgba(248, 250, 252, 0.9) 0%, 
            rgba(241, 245, 249, 0.8) 100%
        )`,
        accent: `linear-gradient(145deg, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(147, 197, 253, 0.05) 100%
        )`
    },
    blur: {
        sm: 'blur(8px)',
        md: 'blur(12px)',
        lg: 'blur(12px)'
    },
    border: {
        glass: '1px solid rgba(255, 255, 255, 0.3)',
        accent: '1px solid rgba(59, 130, 246, 0.2)'
    },
    shadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
        hover: '0 16px 48px rgba(0, 0, 0, 0.15)',
        accent: '0 8px 32px rgba(59, 130, 246, 0.2)'
    }
};

const THEME = {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    },
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
    }
};

const GlassmorphismServiceCard = ({
    service,
    index = 0,
    onFavoriteToggle,
    onShare,
    featured = false
}) => {
    const theme = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorited(!isFavorited);
        onFavoriteToggle?.(service.id, !isFavorited);
    };

    const handleShareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onShare?.(service);
    };

    // Animation variants
    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        hover: {
            y: -8,
            scale: 1.02,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const contentVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                delay: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.4 }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            style={{ height: '100%', width: '100%' }}
        >
            <Card
                component={Link}
                href={`/servicios/${service.slug}`}
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    background: theme.palette.mode === 'dark'
                        ? (featured
                            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
                            : 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)')
                        : (featured ? GLASS_THEME.glass.accent : GLASS_THEME.glass.primary),
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: theme.palette.mode === 'dark'
                        ? (featured ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)')
                        : (featured ? GLASS_THEME.border.accent : GLASS_THEME.border.glass),
                    boxShadow: isHovered ? GLASS_THEME.shadow.hover : GLASS_THEME.shadow.glass,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: featured
                            ? (theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(99,102,241,0.10) 100%)'
                                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)')
                            : (theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'),
                        pointerEvents: 'none',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    },
                    '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        boxShadow: featured
                            ? '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)'
                            : '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                        '&::before': {
                            opacity: 1
                        },
                        '& .card-icon': {
                            transform: 'scale(1.15) rotate(5deg)'
                        },
                        '& .card-cta': {
                            transform: 'translateX(4px)'
                        }
                    }
                }}
            >
                {/* Badges Container */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 2,
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        maxWidth: 'calc(100% - 120px)' // Espacio para action buttons
                    }}
                >
                    {/* Featured Badge */}
                    <AnimatePresence>
                        {featured && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Chip
                                    icon={<StarIcon sx={{ fontSize: 14, color: 'white !important' }} />}
                                    label="Destacado"
                                    size="small"
                                    sx={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                                        '& .MuiChip-label': {
                                            px: 1.5
                                        }
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Popular Badge */}
                    {service.reviews_count > 10 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Chip
                                label="Popular"
                                size="small"
                                sx={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                                    '& .MuiChip-label': {
                                        px: 1.5
                                    }
                                }}
                            />
                        </motion.div>
                    )}

                    {/* New Badge */}
                    {service.is_new && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Chip
                                label="Nuevo"
                                size="small"
                                sx={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                                    '& .MuiChip-label': {
                                        px: 1.5
                                    }
                                }}
                            />
                        </motion.div>
                    )}
                </Box>

                {/* Action Buttons */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 2,
                        display: 'flex',
                        gap: 1,
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <Tooltip title={isFavorited ? "Quitar de favoritos" : "Añadir a favoritos"}>
                        <IconButton
                            size="small"
                            onClick={handleFavoriteClick}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 1)',
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            {isFavorited ? (
                                <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                            ) : (
                                <FavoriteBorderIcon sx={{ fontSize: 16, color: THEME.text.secondary }} />
                            )}
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Compartir servicio">
                        <IconButton
                            size="small"
                            onClick={handleShareClick}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 1)',
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            <ShareIcon sx={{ fontSize: 16, color: THEME.text.secondary }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 1 }}>
                    <motion.div variants={contentVariants}>
                        {/* Service Icon */}
                        <motion.div variants={itemVariants}>
                            <Box
                                className="card-icon"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 64,
                                    height: 64,
                                    borderRadius: 3,
                                    background: `linear-gradient(135deg, ${THEME.primary[500]} 0%, ${THEME.primary[600]} 100%)`,
                                    mb: 3,
                                    boxShadow: `0 8px 24px ${THEME.primary[500]}30`,
                                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {service.icon && (
                                    <Box sx={{ color: 'white', fontSize: 32 }}>
                                        {service.icon}
                                    </Box>
                                )}
                            </Box>
                        </motion.div>

                        {/* Service Title */}
                        <motion.div variants={itemVariants}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : THEME.text.primary,
                                    lineHeight: 1.3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}
                            >
                                {service.title}
                            </Typography>
                        </motion.div>

                        {/* Service Description */}
                        <motion.div variants={itemVariants}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: theme.palette.mode === 'dark' ? '#94a3b8' : THEME.text.secondary,
                                    mb: 3,
                                    lineHeight: 1.6,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}
                            >
                                {service.excerpt}
                            </Typography>
                        </motion.div>

                        {/* Service Features */}
                        {service.features && service.features.length > 0 && (
                            <motion.div variants={itemVariants}>
                                <Stack spacing={1} sx={{ mb: 3 }}>
                                    {service.features.slice(0, 3).map((feature, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CheckIcon sx={{ fontSize: 16, color: THEME.primary[500] }} />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: theme.palette.mode === 'dark' ? '#94a3b8' : THEME.text.secondary
                                                }}
                                            >
                                                {feature}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </motion.div>
                        )}

                        <Divider sx={{ my: 2, opacity: theme.palette.mode === 'dark' ? 0.2 : 0.3 }} />

                        {/* Service Meta */}
                        <motion.div variants={itemVariants}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <ScheduleIcon sx={{
                                        fontSize: 16,
                                        color: theme.palette.mode === 'dark' ? '#64748b' : THEME.text.muted
                                    }} />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.mode === 'dark' ? '#64748b' : THEME.text.muted
                                        }}
                                    >
                                        {service.duration || '2-4 semanas'}
                                    </Typography>
                                </Stack>

                                {service.price_range && (
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <EuroIcon sx={{ fontSize: 14, color: THEME.primary[500] }} />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: THEME.primary[600],
                                                fontWeight: 600
                                            }}
                                        >
                                            {service.price_range}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </motion.div>

                        {/* CTA Button */}
                        <motion.div variants={itemVariants}>
                            <Button
                                fullWidth
                                variant="contained"
                                className="card-cta"
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    background: `linear-gradient(135deg, ${THEME.primary[500]} 0%, ${THEME.primary[600]} 100%)`,
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: `0 4px 16px ${THEME.primary[500]}30`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${THEME.primary[600]} 0%, ${THEME.primary[700]} 100%)`,
                                        boxShadow: `0 8px 24px ${THEME.primary[500]}40`,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Ver Detalles
                            </Button>
                        </motion.div>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default GlassmorphismServiceCard;
