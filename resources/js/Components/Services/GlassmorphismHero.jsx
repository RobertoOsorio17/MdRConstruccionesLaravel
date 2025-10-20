import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Stack,
    Chip,
    IconButton,
    InputBase,
    FormControl,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Construction as ConstructionIcon,
    Star as StarIcon,
    TrendingUp as TrendingIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

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
        hover: '0 16px 48px rgba(0, 0, 0, 0.15)'
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

const GlassmorphismHero = ({ 
    onSearchChange, 
    onFilterChange, 
    searchTerm = '', 
    filterType = 'all',
    stats = {}
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange?.(localSearchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearchTerm, onSearchChange]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            rotate: [-2, 2, -2],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const statsData = [
        { label: 'Servicios Disponibles', value: stats.total_services || '12+', icon: ConstructionIcon },
        { label: 'Proyectos Completados', value: stats.completed_projects || '150+', icon: CheckIcon },
        { label: 'Satisfacción Cliente', value: stats.satisfaction || '98%', icon: StarIcon },
        { label: 'Años Experiencia', value: stats.experience || '10+', icon: TrendingIcon }
    ];

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                background: isDark
                    ? `linear-gradient(135deg, 
                        rgba(15,23,42,1) 0%,
                        rgba(2,6,23,1) 60%,
                        rgba(15,23,42,1) 100%)`
                    : `linear-gradient(135deg, 
                        ${THEME.primary[50]} 0%, 
                        ${THEME.primary[100]} 50%, 
                        ${THEME.primary[50]} 100%)`,
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isDark
                        ? `radial-gradient(circle at 30% 20%, rgba(59,130,246,0.15) 0%, transparent 50%),
                           radial-gradient(circle at 70% 80%, rgba(99,102,241,0.12) 0%, transparent 50%)`
                        : `radial-gradient(circle at 30% 20%, ${THEME.primary[200]}40 0%, transparent 50%),
                           radial-gradient(circle at 70% 80%, ${THEME.primary[300]}30 0%, transparent 50%)`,
                    pointerEvents: 'none'
                }
            }}
        >
            {/* Floating Background Elements */}
            <motion.div
                variants={floatingVariants}
                animate="animate"
                style={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${THEME.primary[400]}20, ${THEME.primary[600]}10)`,
                    backdropFilter: 'blur(12px)',
                    zIndex: 0
                }}
            />
            
            <motion.div
                variants={floatingVariants}
                animate="animate"
                style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '5%',
                    width: 80,
                    height: 80,
                    borderRadius: '30%',
                    background: `linear-gradient(135deg, ${THEME.primary[300]}15, ${THEME.primary[500]}08)`,
                    backdropFilter: 'blur(12px)',
                    zIndex: 0,
                    animationDelay: '2s'
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Grid container spacing={6} alignItems="center">
                        {/* Hero Content */}
                        <Grid item xs={12} lg={7}>
                            <Stack spacing={4}>
                                {/* Main Title */}
                                <motion.div variants={itemVariants}>
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                                            fontWeight: 800,
                                            lineHeight: 1.1,
                                            color: isDark ? '#e5e7eb' : THEME.text.primary,
                                            mb: 2
                                        }}
                                    >
                                        Servicios{' '}
                                        <Box
                                            component="span"
                                            sx={{
                                                background: `linear-gradient(135deg, ${THEME.primary[500]}, ${THEME.primary[700]})`,
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                position: 'relative'
                                            }}
                                        >
                                            Premium
                                        </Box>
                                    </Typography>
                                </motion.div>

                                {/* Subtitle */}
                                <motion.div variants={itemVariants}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: isDark ? '#94a3b8' : THEME.text.secondary,
                                            lineHeight: 1.6,
                                            maxWidth: '600px',
                                            fontSize: { xs: '1.1rem', md: '1.25rem' }
                                        }}
                                    >
                                        Transformamos espacios con servicios integrales de construcción y reforma. 
                                        Calidad profesional, garantía total y resultados excepcionales.
                                    </Typography>
                                </motion.div>

                                {/* Search Bar */}
                                <motion.div variants={itemVariants}>
                                    <Paper
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 1,
                                            borderRadius: 3,
                                            background: isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)' : GLASS_THEME.glass.primary,
                                            backdropFilter: GLASS_THEME.blur.md,
                                            border: isDark ? '1px solid rgba(255,255,255,0.12)' : (isSearchFocused ? GLASS_THEME.border.accent : GLASS_THEME.border.glass),
                                            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : (isSearchFocused ? GLASS_THEME.shadow.hover : GLASS_THEME.shadow.glass),
                                            transition: 'all 0.3s ease',
                                            maxWidth: 500
                                        }}
                                    >
                                        <IconButton sx={{ p: 1.5 }}>
                                            <SearchIcon sx={{ color: isDark ? '#60a5fa' : THEME.primary[500] }} />
                                        </IconButton>
                                        <InputBase
                                            placeholder="Buscar servicios..."
                                            value={localSearchTerm}
                                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => setIsSearchFocused(false)}
                                            sx={{
                                                flex: 1,
                                                px: 1,
                                                fontSize: '1rem',
                                                '& input::placeholder': {
                                                    color: isDark ? '#94a3b8' : THEME.text.muted,
                                                    opacity: 1
                                                }
                                            }}
                                        />
                                        <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                                            <Select
                                                value={filterType}
                                                onChange={(e) => onFilterChange?.(e.target.value)}
                                                displayEmpty
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                    '& .MuiSelect-select': {
                                                        py: 1,
                                                        fontSize: '0.9rem',
                                                        color: isDark ? '#cbd5e1' : THEME.text.secondary
                                                    }
                                                }}
                                            >
                                                <MenuItem value="all">Todos</MenuItem>
                                                <MenuItem value="featured">Destacados</MenuItem>
                                                <MenuItem value="popular">Populares</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Paper>
                                </motion.div>

                                {/* Quick Stats */}
                                <motion.div variants={itemVariants}>
                                    <Grid container spacing={2}>
                                        {statsData.map((stat, index) => (
                                            <Grid item xs={6} sm={3} key={stat.label}>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.5 + index * 0.1 }}
                                                >
                                                    <Paper
                                                        sx={{
                                                            p: 2,
                                                            textAlign: 'center',
                                                            borderRadius: 2,
                                                            background: GLASS_THEME.glass.secondary,
                                                            backdropFilter: GLASS_THEME.blur.sm,
                                                            border: GLASS_THEME.border.glass,
                                                            boxShadow: GLASS_THEME.shadow.glass,
                                                            transition: 'transform 0.3s ease',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px)'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ mb: 1 }}>
                                                            <stat.icon sx={{ 
                                                                fontSize: 24, 
                                                                color: THEME.primary[500] 
                                                            }} />
                                                        </Box>
                                                        <Typography 
                                                            variant="h6" 
                                                            sx={{ 
                                                                fontWeight: 700, 
                                                                color: THEME.text.primary,
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            {stat.value}
                                                        </Typography>
                                                        <Typography 
                                                            variant="caption" 
                                                            sx={{ 
                                                                color: THEME.text.muted,
                                                                fontSize: '0.75rem',
                                                                lineHeight: 1.2
                                                            }}
                                                        >
                                                            {stat.label}
                                                        </Typography>
                                                    </Paper>
                                                </motion.div>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </motion.div>
                            </Stack>
                        </Grid>

                        {/* Hero Visual */}
                        <Grid item xs={12} lg={5}>
                            <motion.div
                                variants={itemVariants}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: 400
                                    }}
                                >
                                    {/* Central Glass Card */}
                                    <Paper
                                        sx={{
                                            p: 4,
                                            borderRadius: 4,
                                            background: GLASS_THEME.glass.primary,
                                            backdropFilter: GLASS_THEME.blur.lg,
                                            border: GLASS_THEME.border.glass,
                                            boxShadow: GLASS_THEME.shadow.glass,
                                            textAlign: 'center',
                                            maxWidth: 300,
                                            transform: 'rotate(-2deg)',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': {
                                                transform: 'rotate(0deg) scale(1.05)'
                                            }
                                        }}
                                    >
                                        <ConstructionIcon 
                                            sx={{ 
                                                fontSize: 64, 
                                                color: THEME.primary[500],
                                                mb: 2
                                            }} 
                                        />
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                fontWeight: 700, 
                                                color: THEME.text.primary,
                                                mb: 1
                                            }}
                                        >
                                            Calidad Garantizada
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ color: THEME.text.secondary }}
                                        >
                                            Más de 10 años transformando espacios con excelencia profesional
                                        </Typography>
                                    </Paper>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
};

export default GlassmorphismHero;
