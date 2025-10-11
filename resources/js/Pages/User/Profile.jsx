import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Box,
    Container,
    Typography,
    Avatar,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Stack,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Language as WebsiteIcon,
    Email as EmailIcon,
    PersonAdd as FollowIcon,
    PersonRemove as UnfollowIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import VerificationBadge from '@/Components/User/VerificationBadge';
import EnhancedTabNavigation from '@/Components/User/EnhancedTabNavigation';
import PostsTab from '@/Components/User/Tabs/PostsTab';
import LikedPostsTab from '@/Components/User/Tabs/LikedPostsTab';
import SavedPostsTab from '@/Components/User/Tabs/SavedPostsTab';
import CommentsTab from '@/Components/User/Tabs/CommentsTab';
import FavoriteServicesTab from '@/Components/User/Tabs/FavoriteServicesTab';

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

const UserProfile = ({
    profileUser,
    userPosts = [],
    likedPosts = [],
    savedPosts = [],
    userComments = [],
    stats,
    isFollowing,
    isOwnProfile,
    favoriteServices = [],
    auth
}) => {
    const [activeTab, setActiveTab] = useState('posts');
    const [following, setFollowing] = useState(isFollowing);
    const [followLoading, setFollowLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(stats?.followersCount || 0);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    // Tab change handler
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    // Follow/Unfollow handler
    const handleFollowToggle = async () => {
        if (!auth.user) {
            setNotification({
                open: true,
                message: 'Debes iniciar sesión para seguir usuarios',
                severity: 'warning'
            });
            return;
        }

        setFollowLoading(true);

        try {
            const response = await fetch(`/users/${profileUser.id}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();

            if (data.success) {
                setFollowing(data.isFollowing);
                setFollowersCount(data.followersCount);
                setNotification({
                    open: true,
                    message: data.message,
                    severity: 'success'
                });
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error al seguir/dejar de seguir:', error);
            setNotification({
                open: true,
                message: 'Error al procesar la acción. Inténtalo de nuevo.',
                severity: 'error'
            });
        } finally {
            setFollowLoading(false);
        }
    };

    // ✅ FIX: Implement actual interaction handlers with API calls
    const handleLike = async (postId) => {
        try {
            const response = await axios.post(`/posts/${postId}/like`);
            if (response.data.success) {
                // Refresh the page data to update like counts
                router.reload({ only: ['user'] });
            }
        } catch (error) {
            console.error('Error liking post:', error);
            setNotification({
                open: true,
                message: 'Error al dar like. Inténtalo de nuevo.',
                severity: 'error'
            });
        }
    };

    const handleBookmark = async (postId) => {
        try {
            const response = await axios.post(`/posts/${postId}/bookmark`);
            if (response.data.success) {
                // Refresh the page data to update bookmark status
                router.reload({ only: ['user'] });
            }
        } catch (error) {
            console.error('Error bookmarking post:', error);
            setNotification({
                open: true,
                message: 'Error al guardar. Inténtalo de nuevo.',
                severity: 'error'
            });
        }
    };

    const handleShare = (post) => {
        const url = window.location.origin + `/blog/${post.slug}`;

        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.excerpt || post.content?.substring(0, 100),
                url: url
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(url).then(() => {
                setNotification({
                    open: true,
                    message: 'Enlace copiado al portapapeles',
                    severity: 'success'
                });
            });
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const response = await axios.post(`/comments/${commentId}/like`);
            if (response.data.success) {
                router.reload({ only: ['user'] });
            }
        } catch (error) {
            console.error('Error liking comment:', error);
            setNotification({
                open: true,
                message: 'Error al dar like al comentario.',
                severity: 'error'
            });
        }
    };

    const handleDislikeComment = async (commentId) => {
        try {
            const response = await axios.post(`/comments/${commentId}/dislike`);
            if (response.data.success) {
                router.reload({ only: ['user'] });
            }
        } catch (error) {
            console.error('Error disliking comment:', error);
            setNotification({
                open: true,
                message: 'Error al dar dislike al comentario.',
                severity: 'error'
            });
        }
    };

    const handleRemoveFavoriteService = async (serviceId) => {
        try {
            const response = await axios.delete(`/api/services/${serviceId}/favorite`);
            if (response.data.success) {
                router.reload({ only: ['user'] });
                setNotification({
                    open: true,
                    message: 'Servicio eliminado de favoritos',
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('Error removing favorite service:', error);
            setNotification({
                open: true,
                message: 'Error al eliminar de favoritos.',
                severity: 'error'
            });
        }
    };

    const handleContactService = (service) => {
        console.log('Contact service:', service);
    };

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <PostsTab
                        posts={userPosts}
                        currentUser={auth.user}
                        onLike={handleLike}
                        onBookmark={handleBookmark}
                        onShare={handleShare}
                    />
                );
            case 'liked':
                return (
                    <LikedPostsTab
                        posts={likedPosts}
                        currentUser={auth.user}
                        onUnlike={handleLike}
                        onBookmark={handleBookmark}
                        onShare={handleShare}
                    />
                );
            case 'saved':
                return (
                    <SavedPostsTab
                        posts={savedPosts}
                        currentUser={auth.user}
                        onLike={handleLike}
                        onRemoveBookmark={handleBookmark}
                        onShare={handleShare}
                    />
                );
            case 'comments':
                return (
                    <CommentsTab
                        comments={userComments}
                        currentUser={auth.user}
                        onLikeComment={handleLikeComment}
                        onDislikeComment={handleDislikeComment}
                        profileUserId={profileUser.id}
                        isOwnProfile={isOwnProfile}
                    />
                );
            case 'services':
                return (
                    <FavoriteServicesTab
                        services={favoriteServices}
                        currentUser={auth.user}
                        onRemoveFavorite={handleRemoveFavoriteService}
                        onContactService={handleContactService}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <MainLayout>
            <Head title={`${profileUser.name} - Perfil`} />

            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at 20% 80%, ${THEME.primary}20 0%, transparent 50%),
                                   radial-gradient(circle at 80% 20%, ${THEME.success}20 0%, transparent 50%),
                                   radial-gradient(circle at 40% 40%, ${THEME.accent}15 0%, transparent 50%)`,
                        pointerEvents: 'none'
                    }
                }}
            >
                <Container
                    maxWidth="xl"
                    sx={{
                        py: 4,
                        position: 'relative',
                        zIndex: 1,
                        px: { xs: 2, sm: 3, md: 4 }
                    }}
                >
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card
                            sx={{
                                mb: 4,
                                backgroundColor: THEME.glass,
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 4,
                                overflow: 'hidden'
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                        <Avatar
                                            src={profileUser.avatar}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                mx: { xs: 'auto', md: 0 },
                                                mb: 2,
                                                border: '4px solid rgba(255, 255, 255, 0.3)',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                            }}
                                        >
                                            {profileUser.name?.charAt(0)}
                                        </Avatar>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' }, mb: 1 }}>
                                                <Typography variant="h4" fontWeight={700} color={THEME.text.primary}>
                                                    {profileUser.name}
                                                </Typography>
                                                <VerificationBadge
                                                    user={profileUser}
                                                    variant="premium"
                                                    size="medium"
                                                    showText={true}
                                                />
                                            </Box>

                                            {profileUser.profession && (
                                                <Typography variant="h6" color={THEME.text.secondary} gutterBottom>
                                                    {profileUser.profession}
                                                </Typography>
                                            )}

                                            {profileUser.bio && (
                                                <Typography variant="body1" color={THEME.text.secondary} sx={{ mb: 2 }}>
                                                    {profileUser.bio}
                                                </Typography>
                                            )}

                                            <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                                                {profileUser.location && (
                                                    <Chip
                                                        icon={<LocationIcon />}
                                                        label={profileUser.location}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                )}
                                                {profileUser.website && (
                                                    <Chip
                                                        icon={<WebsiteIcon />}
                                                        label="Sitio web"
                                                        variant="outlined"
                                                        size="small"
                                                        component="a"
                                                        href={profileUser.website}
                                                        target="_blank"
                                                        clickable
                                                    />
                                                )}
                                                <Chip
                                                    icon={<EmailIcon />}
                                                    label="Contactar"
                                                    variant="outlined"
                                                    size="small"
                                                    clickable
                                                />
                                            </Stack>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                                        {isOwnProfile ? (
                                            <Button
                                                variant="contained"
                                                startIcon={<EditIcon />}
                                                href="/profile/edit"
                                                sx={{
                                                    backgroundColor: THEME.primary,
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: THEME.secondary
                                                    }
                                                }}
                                            >
                                                Editar Perfil
                                            </Button>
                                        ) : (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Button
                                                    variant={following ? "outlined" : "contained"}
                                                    startIcon={followLoading ? <CircularProgress size={16} color="inherit" /> : (following ? <UnfollowIcon /> : <FollowIcon />)}
                                                    onClick={handleFollowToggle}
                                                    disabled={followLoading}
                                                    sx={{
                                                        backgroundColor: following ? 'transparent' : THEME.primary,
                                                        color: following ? THEME.primary : 'white',
                                                        borderColor: THEME.primary,
                                                        mb: 1,
                                                        '&:hover': {
                                                            backgroundColor: following ? THEME.primary : THEME.secondary,
                                                            color: 'white'
                                                        },
                                                        '&:disabled': {
                                                            opacity: 0.7
                                                        }
                                                    }}
                                                >
                                                    {followLoading ? 'Procesando...' : (following ? 'Dejar de seguir' : 'Seguir')}
                                                </Button>
                                                <Typography variant="caption" display="block" color={THEME.text.secondary}>
                                                    {followersCount} seguidores
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Enhanced Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <EnhancedTabNavigation
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            stats={stats}
                            isOwnProfile={isOwnProfile}
                        />
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </Container>
            </Box>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
};

export default UserProfile;