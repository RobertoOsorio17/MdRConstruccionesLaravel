/**
 * UserProfile - Página de perfil de usuario rediseñada
 * 
 * @refactored Octubre 2025 - Sistema unificado, diseño mejorado
 */

import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Box,
    Paper,
    Snackbar,
    Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';

import UserProfileHeader from '@/Components/User/UserProfileHeader';
import EnhancedTabNavigation from '@/Components/User/EnhancedTabNavigation';
import PostsTab from '@/Components/User/Tabs/PostsTab';
import LikedPostsTab from '@/Components/User/Tabs/LikedPostsTab';
import SavedPostsTab from '@/Components/User/Tabs/SavedPostsTab';
import CommentsTab from '@/Components/User/Tabs/CommentsTab';

import designSystem from '@/theme/designSystem';

// Removed - Using designSystem colors

const UserProfile = ({
    profileUser,
    userPosts = [],
    likedPosts = [],
    savedPosts = [],
    userComments = [],
    stats,
    isFollowing,
    isOwnProfile,
    auth
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
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
                router.reload({ only: ['userPosts', 'likedPosts', 'savedPosts', 'stats'] });
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
                router.reload({ only: ['userPosts', 'likedPosts', 'savedPosts', 'stats'] });
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
                router.reload({ only: ['userComments', 'stats'] });
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
                router.reload({ only: ['userComments', 'stats'] });
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

    const handleRemoveFavorite = async (serviceId) => {
        try {
            const response = await axios.post(`/services/${serviceId}/favorite`);
            if (response.data.success) {
                router.reload({ only: ['profileUser', 'stats'] });
                setNotification({
                    open: true,
                    message: 'Servicio eliminado de favoritos.',
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            setNotification({
                open: true,
                message: 'Error al eliminar de favoritos. Inténtalo de nuevo.',
                severity: 'error'
            });
        }
    };

    const handleContactService = (service) => {
        // Redirigir a la página del servicio con anchor a la sección de contacto
        router.visit(`/servicios/${service.slug}#contact`);
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

            default:
                return null;
        }
    };

    return (
        <MainLayout>
            <Head title={`${profileUser.name} - Perfil`} />

            {/* Background Layer */}
            <Box
                sx={{
                    minHeight: '100vh',
                    background: isDark
                        ? `linear-gradient(135deg, ${designSystem.colors.secondary[900]} 0%, ${designSystem.colors.secondary[800]} 50%, ${designSystem.colors.secondary[900]} 100%)`
                        : `linear-gradient(135deg, ${designSystem.colors.primary[50]} 0%, ${designSystem.colors.surface.secondary} 50%, ${designSystem.colors.success[50]} 100%)`,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isDark
                            ? `radial-gradient(circle at 20% 80%, ${designSystem.colors.info[700]}33 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, ${designSystem.colors.success[700]}33 0%, transparent 50%)`
                            : `radial-gradient(circle at 20% 80%, ${designSystem.colors.primary[200]}40 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, ${designSystem.colors.success[200]}40 0%, transparent 50%)`,
                        pointerEvents: 'none'
                    }
                }}
            >
                {/* Profile Header - Full Width with better stats display */}
                <Box sx={{ width: '100%', px: { xs: 0, md: 3 }, pt: 3 }}>
                    <UserProfileHeader
                        user={profileUser}
                        stats={stats}
                        isOwnProfile={isOwnProfile}
                        isFollowing={following}
                        followersCount={followersCount}
                        onFollowToggle={handleFollowToggle}
                        followLoading={followLoading}
                    />
                </Box>

                {/* Enhanced Tab Navigation - Centered with max width */}
                <Box sx={{ width: '100%', px: { xs: 0, md: 4 }, mt: 3 }}>
                    <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Paper elevation={0} sx={{
                                ...(theme.palette.mode === 'dark' ? designSystem.glassmorphism.dark : designSystem.glassmorphism.medium),
                                borderRadius: { xs: 0, md: 4 },
                                backdropFilter: 'saturate(160%) blur(20px)',
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(17,24,39,0.55) 0%, rgba(2,6,23,0.4) 100%)'
                                    : 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
                                border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.28)',
                                boxShadow: designSystem.shadows.glass,
                                px: { xs: 0, md: 2 },
                                py: { xs: 0.5, md: 1 },
                                position: 'sticky',
                                top: { xs: 'calc(env(safe-area-inset-top, 0px) + 8px)', md: 16 },
                                zIndex: (theme) => theme.zIndex.appBar - 5
                            }}>
                                <EnhancedTabNavigation
                                    activeTab={activeTab}
                                    onTabChange={handleTabChange}
                                    stats={stats}
                                    isOwnProfile={isOwnProfile}
                                />
                            </Paper>
                        </motion.div>
                    </Box>
                </Box>

                {/* Tab Content - Full width with responsive grid */}
                <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, py: 4, pb: 8 }}>
                    <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
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
                    </Box>
                </Box>
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
