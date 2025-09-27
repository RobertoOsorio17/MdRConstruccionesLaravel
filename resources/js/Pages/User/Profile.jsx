import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import {
    LocationOn as LocationIcon,
    Work as WorkIcon,
    Language as WebsiteIcon,
    Email as EmailIcon,
    PersonAdd as FollowIcon,
    PersonRemove as UnfollowIcon,
    Edit as EditIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    GitHub as GitHubIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Favorite as FavoriteIcon,
    Bookmark as BookmarkIcon,
    Search as SearchIcon,
    Star as StarIcon,
    TrendingUp as TrendingIcon,
    Settings as SettingsIcon,
    Phone as PhoneIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Construction as ConstructionIcon,
    Public as PublicIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import axios from 'axios';
import NotificationSnackbar from '@/Components/NotificationSnackbar';

// Premium Theme Configuration
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
        800: '#1e40af',
        900: '#1e3a8a'
    },
    secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
    },
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f'
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
    },
    accent: {
        orange: '#f97316',
        emerald: '#10b981',
        purple: '#8b5cf6',
        rose: '#f43f5e',
        amber: '#f59e0b'
    }
};

const UserProfile = ({ profileUser, stats, isFollowing, isOwnProfile, favoriteServices, auth }) => {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState(0);
    const [userFavoriteServices, setUserFavoriteServices] = useState(favoriteServices || []);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [mounted, setMounted] = useState(false);
    const [following, setFollowing] = useState(isFollowing);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const showNotification = (message, severity = 'info') => {
        setNotification({ open: true, message, severity });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const getSocialIcon = (platform) => {
        const icons = {
            twitter: TwitterIcon,
            linkedin: LinkedInIcon,
            facebook: FacebookIcon,
            instagram: InstagramIcon,
            github: GitHubIcon
        };
        return icons[platform] || WebsiteIcon;
    };

    useEffect(() => {
        setMounted(true);
        if (isOwnProfile) {
            fetchFavoriteServices();
        }

        // Show flash messages (like registration success)
        if (flash?.success) {
            showNotification(flash.success, 'success');
        } else if (flash?.error) {
            showNotification(flash.error, 'error');
        }
    }, [isOwnProfile, flash]);

    const fetchFavoriteServices = async () => {
        try {
            setLoadingFavorites(true);
            const response = await axios.get('/api/services/favorites');
            if (response.data.success) {
                setUserFavoriteServices(response.data.favorites);
            }
        } catch (error) {
            console.error('Error fetching favorite services:', error);
        } finally {
            setLoadingFavorites(false);
        }
    };

    const handleFollow = async () => {
        if (!auth.isAuthenticated) {
            showNotification('Debes iniciar sesión para seguir usuarios', 'warning');
            return;
        }

        try {
            const response = await axios.post(`/users/${profileUser.id}/follow`);
            
            if (response.data.success) {
                setFollowing(response.data.isFollowing);
                setFollowersCount(response.data.followersCount);
                showNotification(response.data.message, 'success');
            }
        } catch (error) {
            showNotification('Error al procesar la acción', 'error');
        }
    };

    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
    };

    const filteredFavorites = userFavoriteServices.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    if (!mounted) {
        return (
            <MainLayout>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
                </Container>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head title={`${profileUser.name} - Perfil de Usuario`} />
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {/* Premium Profile Header */}
                    <motion.div variants={itemVariants}>
                        <Paper
                            elevation={0}
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '24px',
                                mb: 4,
                                background: `linear-gradient(135deg, 
                                    ${THEME.primary[50]} 0%, 
                                    ${THEME.secondary[50]} 50%, 
                                    ${THEME.primary[100]} 100%
                                )`,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid rgba(255, 255, 255, 0.3)`,
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: `linear-gradient(135deg, 
                                        rgba(255, 255, 255, 0.9) 0%, 
                                        rgba(255, 255, 255, 0.7) 100%
                                    )`,
                                    backdropFilter: 'blur(10px)',
                                    zIndex: 1
                                }
                            }}
                        >
                            <Box sx={{ position: 'relative', zIndex: 2, p: 4 }}>
                                <Grid container spacing={4} alignItems="center">
                                    <Grid item xs={12} md={3}>
                                        <Box textAlign="center">
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.5 }}
                                            >
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    badgeContent={
                                                        profileUser.profile_visibility ? (
                                                            <PublicIcon sx={{ 
                                                                color: THEME.success[500], 
                                                                fontSize: 20,
                                                                background: 'white',
                                                                borderRadius: '50%',
                                                                p: 0.5
                                                            }} />
                                                        ) : (
                                                            <PrivateIcon sx={{ 
                                                                color: THEME.warning[500], 
                                                                fontSize: 20,
                                                                background: 'white',
                                                                borderRadius: '50%',
                                                                p: 0.5
                                                            }} />
                                                        )
                                                    }
                                                >
                                                    <Avatar
                                                        src={profileUser.avatar_url}
                                                        sx={{
                                                            width: 120,
                                                            height: 120,
                                                            border: `4px solid ${THEME.primary[500]}`,
                                                            boxShadow: `0 8px 32px ${THEME.primary[500]}30`,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                                boxShadow: `0 12px 40px ${THEME.primary[500]}40`
                                                            }
                                                        }}
                                                    >
                                                        <PersonIcon sx={{ fontSize: 60 }} />
                                                    </Avatar>
                                                </Badge>
                                            </motion.div>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={9}>
                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                <Box>
                                                    <Typography
                                                        variant="h3"
                                                        fontWeight="bold"
                                                        sx={{
                                                            color: THEME.secondary[800],
                                                            mb: 1,
                                                            background: `linear-gradient(135deg, ${THEME.primary[600]}, ${THEME.secondary[600]})`,
                                                            backgroundClip: 'text',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent'
                                                        }}
                                                    >
                                                        {profileUser.name}
                                                    </Typography>

                                                    {profileUser.profession && (
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                color: THEME.secondary[600],
                                                                mb: 2,
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            {profileUser.profession}
                                                        </Typography>
                                                    )}

                                                    {profileUser.bio && (
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                color: THEME.secondary[700],
                                                                mb: 3,
                                                                lineHeight: 1.6
                                                            }}
                                                        >
                                                            {profileUser.bio}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <Stack direction="row" spacing={1}>
                                                    {isOwnProfile ? (
                                                        <Button
                                                            component={Link}
                                                            href="/profile/edit"
                                                            variant="contained"
                                                            startIcon={<EditIcon />}
                                                            sx={{
                                                                background: `linear-gradient(135deg, ${THEME.primary[500]}, ${THEME.primary[600]})`,
                                                                borderRadius: '12px',
                                                                px: 3,
                                                                py: 1.5,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                boxShadow: `0 4px 20px ${THEME.primary[500]}30`,
                                                                '&:hover': {
                                                                    background: `linear-gradient(135deg, ${THEME.primary[600]}, ${THEME.primary[700]})`,
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: `0 8px 25px ${THEME.primary[500]}40`
                                                                }
                                                            }}
                                                        >
                                                            Editar Perfil
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={handleFollow}
                                                            variant={following ? "outlined" : "contained"}
                                                            startIcon={following ? <UnfollowIcon /> : <FollowIcon />}
                                                            sx={{
                                                                background: following ? 'transparent' : `linear-gradient(135deg, ${THEME.primary[500]}, ${THEME.primary[600]})`,
                                                                borderRadius: '12px',
                                                                px: 3,
                                                                py: 1.5,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                border: following ? `2px solid ${THEME.primary[500]}` : 'none',
                                                                color: following ? THEME.primary[600] : 'white',
                                                                boxShadow: following ? 'none' : `0 4px 20px ${THEME.primary[500]}30`,
                                                                '&:hover': {
                                                                    background: following ? `${THEME.primary[50]}` : `linear-gradient(135deg, ${THEME.primary[600]}, ${THEME.primary[700]})`,
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: `0 8px 25px ${THEME.primary[500]}40`
                                                                }
                                                            }}
                                                        >
                                                            {following ? 'Siguiendo' : 'Seguir'}
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>

                                            {/* User Details */}
                                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                                {profileUser.location && (
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <LocationIcon sx={{ color: THEME.secondary[500], fontSize: 20 }} />
                                                            <Typography variant="body2" sx={{ color: THEME.secondary[600] }}>
                                                                {profileUser.location}
                                                            </Typography>
                                                        </Stack>
                                                    </Grid>
                                                )}

                                                {profileUser.website && (
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <WebsiteIcon sx={{ color: THEME.secondary[500], fontSize: 20 }} />
                                                            <Typography
                                                                variant="body2"
                                                                component="a"
                                                                href={profileUser.website}
                                                                target="_blank"
                                                                sx={{
                                                                    color: THEME.primary[600],
                                                                    textDecoration: 'none',
                                                                    '&:hover': { textDecoration: 'underline' }
                                                                }}
                                                            >
                                                                {profileUser.website}
                                                            </Typography>
                                                        </Stack>
                                                    </Grid>
                                                )}

                                                {profileUser.phone && (
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <PhoneIcon sx={{ color: THEME.secondary[500], fontSize: 20 }} />
                                                            <Typography variant="body2" sx={{ color: THEME.secondary[600] }}>
                                                                {profileUser.phone}
                                                            </Typography>
                                                        </Stack>
                                                    </Grid>
                                                )}
                                            </Grid>

                                            {/* Social Links */}
                                            {profileUser.social_links && Object.keys(profileUser.social_links).length > 0 && (
                                                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                                                    {Object.entries(profileUser.social_links).map(([platform, url]) => {
                                                        const IconComponent = getSocialIcon(platform);
                                                        return (
                                                            <Tooltip key={platform} title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                                                                <IconButton
                                                                    component="a"
                                                                    href={url}
                                                                    target="_blank"
                                                                    sx={{
                                                                        background: `linear-gradient(135deg,
                                                                            rgba(255, 255, 255, 0.9) 0%,
                                                                            rgba(255, 255, 255, 0.7) 100%
                                                                        )`,
                                                                        backdropFilter: 'blur(10px)',
                                                                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                                        borderRadius: '12px',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-2px)',
                                                                            boxShadow: `0 8px 25px ${THEME.primary[500]}20`
                                                                        }
                                                                    }}
                                                                >
                                                                    <IconComponent sx={{ color: THEME.primary[600] }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </Stack>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div variants={itemVariants}>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {[
                                { label: 'Servicios Favoritos', value: stats.favoriteServicesCount, icon: FavoriteBorderIcon, color: THEME.primary },
                                { label: 'Miembro desde', value: new Date(stats.joinedDate).getFullYear(), icon: CalendarIcon, color: THEME.success },
                                { label: 'Perfil Completo', value: `${stats.profileCompleteness}%`, icon: PersonIcon, color: THEME.warning },
                                { label: 'Última Actividad', value: new Date(stats.lastActivity).toLocaleDateString('es-ES'), icon: TrendingIcon, color: THEME.error }
                            ].map((stat, index) => (
                                <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                borderRadius: '16px',
                                                background: `linear-gradient(135deg,
                                                    rgba(255, 255, 255, 0.9) 0%,
                                                    rgba(255, 255, 255, 0.7) 100%
                                                )`,
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 12px 40px ${stat.color[500]}20`
                                                }
                                            }}
                                        >
                                            <stat.icon sx={{
                                                fontSize: 32,
                                                color: stat.color[500],
                                                mb: 1
                                            }} />
                                            <Typography
                                                variant="h4"
                                                fontWeight="bold"
                                                sx={{ color: stat.color[600], mb: 0.5 }}
                                            >
                                                {stat.value}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: THEME.secondary[600] }}
                                            >
                                                {stat.label}
                                            </Typography>
                                        </Paper>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>

                    {/* Tabs Section */}
                    {isOwnProfile && (
                        <motion.div variants={itemVariants}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: '20px',
                                    background: `linear-gradient(135deg,
                                        rgba(255, 255, 255, 0.9) 0%,
                                        rgba(255, 255, 255, 0.7) 100%
                                    )`,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                                    overflow: 'hidden'
                                }}
                            >
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    sx={{
                                        px: 3,
                                        pt: 2,
                                        '& .MuiTab-root': {
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            color: THEME.secondary[600],
                                            '&.Mui-selected': {
                                                color: THEME.primary[600]
                                            }
                                        },
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: THEME.primary[500],
                                            height: 3,
                                            borderRadius: '2px'
                                        }
                                    }}
                                >
                                    <Tab
                                        label="Servicios Favoritos"
                                        icon={<FavoriteBorderIcon />}
                                        iconPosition="start"
                                    />
                                    <Tab
                                        label="Posts que Me Gustan"
                                        icon={<FavoriteIcon />}
                                        iconPosition="start"
                                    />
                                    <Tab
                                        label="Posts Guardados"
                                        icon={<BookmarkIcon />}
                                        iconPosition="start"
                                    />
                                    <Tab
                                        label="Actividad Reciente"
                                        icon={<TrendingIcon />}
                                        iconPosition="start"
                                    />
                                    <Tab
                                        label="Configuración"
                                        icon={<SettingsIcon />}
                                        iconPosition="start"
                                    />
                                </Tabs>

                                <Box sx={{ p: 3 }}>
                                    {/* Favorite Services Tab */}
                                    {activeTab === 0 && (
                                        <Fade in={activeTab === 0}>
                                            <Box>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                                    <Typography
                                                        variant="h5"
                                                        fontWeight="bold"
                                                        sx={{ color: THEME.secondary[800] }}
                                                    >
                                                        Mis Servicios Favoritos
                                                    </Typography>
                                                    <TextField
                                                        placeholder="Buscar servicios..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        size="small"
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <SearchIcon sx={{ color: THEME.secondary[400] }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: '12px',
                                                                background: 'rgba(255, 255, 255, 0.8)',
                                                                backdropFilter: 'blur(10px)'
                                                            }
                                                        }}
                                                    />
                                                </Stack>

                                                {loadingFavorites ? (
                                                    <Grid container spacing={3}>
                                                        {[1, 2, 3, 4].map((item) => (
                                                            <Grid item key={item} xs={12} sm={6} md={3}>
                                                                <Skeleton
                                                                    variant="rectangular"
                                                                    height={200}
                                                                    sx={{ borderRadius: 2 }}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                ) : filteredFavorites.length > 0 ? (
                                                    <Grid container spacing={3}>
                                                        {filteredFavorites.map((service, index) => (
                                                            <Grid item key={service.id} xs={12} sm={6} md={4}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: index * 0.1 }}
                                                                >
                                                                    <Card
                                                                        component={Link}
                                                                        href={`/servicios/${service.slug}`}
                                                                        sx={{
                                                                            borderRadius: '16px',
                                                                            background: `linear-gradient(135deg,
                                                                                rgba(255, 255, 255, 0.95) 0%,
                                                                                rgba(255, 255, 255, 0.85) 100%
                                                                            )`,
                                                                            backdropFilter: 'blur(10px)',
                                                                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                                                                            transition: 'all 0.3s ease',
                                                                            textDecoration: 'none',
                                                                            '&:hover': {
                                                                                transform: 'translateY(-8px)',
                                                                                boxShadow: `0 16px 40px ${THEME.primary[500]}20`
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CardContent sx={{ p: 3 }}>
                                                                            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                                                                                <Box
                                                                                    sx={{
                                                                                        width: 48,
                                                                                        height: 48,
                                                                                        borderRadius: '12px',
                                                                                        background: `linear-gradient(135deg, ${THEME.primary[500]}, ${THEME.primary[600]})`,
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center'
                                                                                    }}
                                                                                >
                                                                                    <ConstructionIcon sx={{ color: 'white', fontSize: 24 }} />
                                                                                </Box>
                                                                                {service.featured && (
                                                                                    <Chip
                                                                                        label="Destacado"
                                                                                        size="small"
                                                                                        sx={{
                                                                                            background: `linear-gradient(135deg, ${THEME.warning[400]}, ${THEME.warning[500]})`,
                                                                                            color: 'white',
                                                                                            fontWeight: 600
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </Stack>

                                                                            <Typography
                                                                                variant="h6"
                                                                                fontWeight="bold"
                                                                                sx={{
                                                                                    color: THEME.secondary[800],
                                                                                    mb: 1,
                                                                                    lineHeight: 1.3
                                                                                }}
                                                                            >
                                                                                {service.title}
                                                                            </Typography>

                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    color: THEME.secondary[600],
                                                                                    mb: 2,
                                                                                    lineHeight: 1.5
                                                                                }}
                                                                            >
                                                                                {service.excerpt}
                                                                            </Typography>

                                                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                                <Typography
                                                                                    variant="caption"
                                                                                    sx={{ color: THEME.secondary[500] }}
                                                                                >
                                                                                    Añadido el {new Date(service.favorited_at).toLocaleDateString('es-ES')}
                                                                                </Typography>
                                                                                <StarIcon sx={{ color: THEME.warning[500], fontSize: 20 }} />
                                                                            </Stack>
                                                                        </CardContent>
                                                                    </Card>
                                                                </motion.div>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                ) : (
                                                    <Box textAlign="center" py={6}>
                                                        <FavoriteBorderIcon
                                                            sx={{
                                                                fontSize: 64,
                                                                color: THEME.secondary[300],
                                                                mb: 2
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="h6"
                                                            sx={{ color: THEME.secondary[500], mb: 1 }}
                                                        >
                                                            No tienes servicios favoritos
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: THEME.secondary[400], mb: 3 }}
                                                        >
                                                            Explora nuestros servicios y marca tus favoritos
                                                        </Typography>
                                                        <Button
                                                            component={Link}
                                                            href="/servicios"
                                                            variant="contained"
                                                            sx={{
                                                                background: `linear-gradient(135deg, ${THEME.primary[500]}, ${THEME.primary[600]})`,
                                                                borderRadius: '12px',
                                                                px: 3,
                                                                py: 1.5,
                                                                textTransform: 'none',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            Ver Servicios
                                                        </Button>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Fade>
                                    )}

                                    {/* Liked Posts Tab */}
                                    {activeTab === 1 && (
                                        <Fade in={activeTab === 1}>
                                            <Box textAlign="center" py={6}>
                                                <FavoriteIcon
                                                    sx={{
                                                        fontSize: 64,
                                                        color: THEME.accent.rose,
                                                        mb: 2
                                                    }}
                                                />
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    Posts que te gustan
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                    Aquí aparecerán todos los artículos que has marcado como me gusta
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    href="/my/liked-posts"
                                                    variant="contained"
                                                    startIcon={<FavoriteIcon />}
                                                    sx={{
                                                        borderRadius: 3,
                                                        px: 4,
                                                        py: 1.5,
                                                        background: `linear-gradient(45deg, ${THEME.accent.rose}, ${THEME.accent.purple})`,
                                                        '&:hover': {
                                                            background: `linear-gradient(45deg, ${THEME.accent.purple}, ${THEME.accent.rose})`,
                                                        }
                                                    }}
                                                >
                                                    Ver Posts que Me Gustan
                                                </Button>
                                            </Box>
                                        </Fade>
                                    )}

                                    {/* Saved Posts Tab */}
                                    {activeTab === 2 && (
                                        <Fade in={activeTab === 2}>
                                            <Box textAlign="center" py={6}>
                                                <BookmarkIcon
                                                    sx={{
                                                        fontSize: 64,
                                                        color: THEME.primary[600],
                                                        mb: 2
                                                    }}
                                                />
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    Posts guardados
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                    Aquí aparecerán todos los artículos que has guardado para leer más tarde
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    href="/my/saved-posts"
                                                    variant="contained"
                                                    startIcon={<BookmarkIcon />}
                                                    sx={{
                                                        borderRadius: 3,
                                                        px: 4,
                                                        py: 1.5,
                                                        background: `linear-gradient(45deg, ${THEME.primary[600]}, ${THEME.accent.emerald})`,
                                                        '&:hover': {
                                                            background: `linear-gradient(45deg, ${THEME.accent.emerald}, ${THEME.primary[600]})`,
                                                        }
                                                    }}
                                                >
                                                    Ver Posts Guardados
                                                </Button>
                                            </Box>
                                        </Fade>
                                    )}

                                    {/* Activity Tab */}
                                    {activeTab === 3 && (
                                        <Fade in={activeTab === 3}>
                                            <Box textAlign="center" py={6}>
                                                <TrendingIcon
                                                    sx={{
                                                        fontSize: 64,
                                                        color: THEME.secondary[300],
                                                        mb: 2
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    sx={{ color: THEME.secondary[500] }}
                                                >
                                                    Actividad reciente próximamente
                                                </Typography>
                                            </Box>
                                        </Fade>
                                    )}

                                    {/* Settings Tab */}
                                    {activeTab === 4 && (
                                        <Fade in={activeTab === 4}>
                                            <Box textAlign="center" py={6}>
                                                <SettingsIcon
                                                    sx={{
                                                        fontSize: 64,
                                                        color: THEME.secondary[300],
                                                        mb: 2
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    sx={{ color: THEME.secondary[500], mb: 2 }}
                                                >
                                                    Configuración de perfil
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    href="/profile/edit"
                                                    variant="contained"
                                                    startIcon={<EditIcon />}
                                                    sx={{
                                                        background: `linear-gradient(135deg, ${THEME.primary[500]}, ${THEME.primary[600]})`,
                                                        borderRadius: '12px',
                                                        px: 3,
                                                        py: 1.5,
                                                        textTransform: 'none',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Editar Perfil
                                                </Button>
                                            </Box>
                                        </Fade>
                                    )}
                                </Box>
                            </Paper>
                        </motion.div>
                    )}
                </Container>
            </motion.div>

            <NotificationSnackbar
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={closeNotification}
            />
        </MainLayout>
    );
};

export default UserProfile;
