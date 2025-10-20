import React, { useState } from 'react';
import {

    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    IconButton,
    Chip,
    Box,
    Avatar,
    TextField,
    InputAdornment,
    useTheme
} from '@mui/material';
import {
    FavoriteOutlined,
    FavoriteBorderOutlined,
    BookmarkBorderOutlined,
    BookmarkOutlined,
    ShareOutlined,
    SearchOutlined,
    VisibilityOutlined,
    CommentOutlined,
    VerifiedOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import designSystem from '@/theme/designSystem';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const THEME = {
    primary: designSystem.colors.primary[600],
    secondary: designSystem.colors.secondary[500],
    accent: designSystem.colors.accent.amber[500],
    success: designSystem.colors.success[600],
    warning: designSystem.colors.warning[500],
    error: designSystem.colors.error[500],
    background: designSystem.colors.surface.secondary,
    surface: designSystem.colors.surface.primary,
    glass: designSystem.colors.glass.white,
    text: {
        primary: designSystem.colors.text.primary,
        secondary: designSystem.colors.text.secondary,
        light: designSystem.colors.text.muted
    }
};

const LikedPostsTab = ({ posts = [], currentUser, onUnlike, onBookmark, onShare }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const GLASS = isDark ? designSystem.glassmorphism.dark : designSystem.glassmorphism.light;
    const BORDER_SOFT = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.18)';
    const HOVER_BG = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUnlike = async (post) => {
        if (onUnlike) {
            await onUnlike(post.id);
        }
    };

    const handleBookmark = async (post) => {
        if (onBookmark) {
            await onBookmark(post.id);
        }
    };

    const handleShare = (post) => {
        if (onShare) {
            onShare(post);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar posts que te gustan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlined sx={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                        ),
                        sx: {
                            ...GLASS,
                            borderRadius: 3,
                            '& .MuiOutlinedInput-notchedOutline': { border: BORDER_SOFT },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.35)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: THEME.primary,
                                borderWidth: 2
                            }
                        }
                    }}
                />
            </Box>

            {/* Posts Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                    gap: 3,
                    alignItems: 'stretch'
                }}
            >
                <AnimatePresence>
                    {filteredPosts.map((post) => (
                        <Box key={post.id} sx={{ height: '100%' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card
                                    sx={{
                                        height: 420, // âœ… Fixed height for consistency
                                        minHeight: 420, // âœ… Ensure minimum height
                                        maxHeight: 420, // âœ… Prevent overflow
                                        display: 'flex',
                                        flexDirection: 'column',
                                        ...designSystem.glassmorphism.light,
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        '&::before': { content: '""', position: 'absolute', top: 0, left: '-150%', width: '50%', height: '100%', background: 'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.20) 50%, rgba(255,255,255,0.05) 100%)', transform: 'skewX(-20deg)', transition: 'left 0.6s ease', pointerEvents: 'none' },
                                        '&:hover::before': { left: '150%' },
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        '&:hover': {
                                            boxShadow: designSystem.shadows.colored.primaryHover,
                                            borderColor: THEME.primary,
                                            transform: 'translateY(-6px)'
                                        }
                                    }}
                                >
                                    {/* Liked Indicator */}
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

                                    <CardContent sx={{
                                        flexGrow: 1,
                                        p: 3,
                                        display: 'flex', // âœ… Flex layout
                                        flexDirection: 'column', // âœ… Column layout
                                        minHeight: 0, // âœ… Allow flex children to shrink properly
                                        overflow: 'hidden' // âœ… Prevent content overflow
                                    }}>
                                        {/* Author Info */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, minHeight: 48, flexShrink: 0 }}>
                                            <Avatar
                                                src={post.author?.avatar}
                                                sx={{ width: 32, height: 32, mr: 1 }}
                                            >
                                                {post.author?.name?.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography variant="caption" fontWeight={600} color={theme.palette.text.primary}>
                                                        {post.author?.name}
                                                    </Typography>
                                                    {post.author?.is_verified && (
                                                        <VerifiedOutlined sx={{ fontSize: 14, color: THEME.primary }} />
                                                    )}
                                                </Box>
                                                <Typography variant="caption" color={theme.palette.text.secondary}>
                                                    {format(new Date(post.published_at), 'dd MMM yyyy', { locale: es })}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Title */}
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: theme.palette.text.primary,
                                                mb: 1.5,
                                                lineHeight: 1.3,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                height: '2.6em', // âœ… Fixed height (1.3 * 2 = 2.6em)
                                                flexShrink: 0 // âœ… Prevent title from shrinking
                                            }}
                                        >
                                            {post.title}
                                        </Typography>

                                        {/* Categories */}
                                        {post.categories && post.categories.length > 0 && (
                                            <Box sx={{ mb: 1.5, minHeight: 32, flexShrink: 0 }}>
                                                {post.categories.slice(0, 2).map((category) => (
                                                    <Chip
                                                        key={category.id}
                                                        label={category.name}
                                                        size="small"
                                                        sx={{
                                                            mr: 1,
                                                            backgroundColor: category.color || THEME.primary,
                                                            color: 'white',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}

                                        {/* Excerpt */}
                                        <Typography
                                            variant="body2"
                                            color={theme.palette.text.secondary}
                                            sx={{
                                                mb: 1.5,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: 1.6,
                                                height: '4.8em', // âœ… Fixed height (1.6 * 3 = 4.8em)
                                                flexShrink: 0 // âœ… Prevent excerpt from shrinking
                                            }}
                                        >
                                            {post.excerpt || post.content?.substring(0, 150) + '...'}
                                        </Typography>

                                        {/* Stats */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto', minHeight: 24, flexShrink: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <VisibilityOutlined sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                                <Typography variant="caption" color={theme.palette.text.secondary}>
                                                    {post.views_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <FavoriteOutlined sx={{ fontSize: 16, color: THEME.error }} />
                                                <Typography variant="caption" color={theme.palette.text.secondary}>
                                                    {post.likes_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CommentOutlined sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                                <Typography variant="caption" color={theme.palette.text.secondary}>
                                                    {post.approved_comments_count || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleUnlike(post)}
                                                sx={{
                                                    color: THEME.error,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                                    }
                                                }}
                                            >
                                                <FavoriteOutlined />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleBookmark(post)}
                                                sx={{
                                                    color: post.user_bookmarked ? THEME.accent : theme.palette.text.secondary,
                                                    '&:hover': {
                                                        backgroundColor: post.user_bookmarked ? 'rgba(245, 158, 11, 0.1)' : HOVER_BG
                                                    }
                                                }}
                                            >
                                                {post.user_bookmarked ? <BookmarkOutlined /> : <BookmarkBorderOutlined />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleShare(post)}
                                                sx={{ color: theme.palette.text.secondary }}
                                            >
                                                <ShareOutlined />
                                            </IconButton>
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            href={`/blog/${post.slug}`}
                                            sx={{
                                                borderColor: THEME.primary,
                                                color: THEME.primary,
                                                '&:hover': {
                                                    backgroundColor: THEME.primary,
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            Ver post
                                        </Button>
                                    </CardActions>
                                </Card>
                            </motion.div>
                        </Box>
                    ))}
                </AnimatePresence>
            </Box>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        ...GLASS,
                        borderRadius: 4,
                        border: BORDER_SOFT
                    }}
                >
                    <FavoriteOutlined sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                    <Typography variant="h6" color={theme.palette.text.secondary} gutterBottom>
                        {searchTerm ? 'No se encontraron posts' : 'No has dado me gusta a ningún post'}
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los posts que te gusten aparecerán aquí'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default LikedPostsTab;




