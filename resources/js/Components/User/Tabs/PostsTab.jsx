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
    Avatar,
    Collapse,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    FavoriteOutlined,
    FavoriteBorderOutlined,
    BookmarkBorderOutlined,
    BookmarkOutlined,
    ShareOutlined,
    ExpandMoreOutlined,
    ExpandLessOutlined,
    SearchOutlined,
    VisibilityOutlined,
    CommentOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

const PostsTab = ({ posts = [], currentUser, onLike, onBookmark, onShare }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPosts, setExpandedPosts] = useState(new Set());

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleExpanded = (postId) => {
        const newExpanded = new Set(expandedPosts);
        if (newExpanded.has(postId)) {
            newExpanded.delete(postId);
        } else {
            newExpanded.add(postId);
        }
        setExpandedPosts(newExpanded);
    };

    const handleLike = async (post) => {
        if (onLike) {
            await onLike(post.id);
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
                    placeholder="Buscar posts..."
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

            {/* Posts Grid */}
            <Grid container spacing={3}>
                <AnimatePresence>
                    {filteredPosts.map((post) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={post.id}>
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
                                        '&:hover': {
                                            backgroundColor: THEME.surface,
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        {/* Author Info */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar
                                                src={post.author?.avatar}
                                                sx={{ width: 32, height: 32, mr: 1 }}
                                            >
                                                {post.author?.name?.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="caption" color={THEME.text.secondary}>
                                                    {format(new Date(post.published_at), 'dd MMM yyyy', { locale: es })}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Title */}
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
                                            {post.title}
                                        </Typography>

                                        {/* Categories */}
                                        {post.categories && post.categories.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
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
                                            color={THEME.text.secondary}
                                            sx={{
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: expandedPosts.has(post.id) ? 'none' : 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {post.excerpt || post.content?.substring(0, 150) + '...'}
                                        </Typography>

                                        {/* Expand Button */}
                                        {post.content && post.content.length > 150 && (
                                            <Button
                                                size="small"
                                                onClick={() => toggleExpanded(post.id)}
                                                endIcon={expandedPosts.has(post.id) ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                                                sx={{ color: THEME.primary, p: 0, mb: 2 }}
                                            >
                                                {expandedPosts.has(post.id) ? 'Ver menos' : 'Ver más'}
                                            </Button>
                                        )}

                                        {/* Expanded Content */}
                                        <Collapse in={expandedPosts.has(post.id)}>
                                            <Typography
                                                variant="body2"
                                                color={THEME.text.secondary}
                                                sx={{ mb: 2 }}
                                            >
                                                {post.content}
                                            </Typography>
                                        </Collapse>

                                        {/* Stats */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <VisibilityOutlined sx={{ fontSize: 16, color: THEME.text.light }} />
                                                <Typography variant="caption" color={THEME.text.light}>
                                                    {post.views_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <FavoriteOutlined sx={{ fontSize: 16, color: THEME.text.light }} />
                                                <Typography variant="caption" color={THEME.text.light}>
                                                    {post.likes_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CommentOutlined sx={{ fontSize: 16, color: THEME.text.light }} />
                                                <Typography variant="caption" color={THEME.text.light}>
                                                    {post.approved_comments_count || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleLike(post)}
                                                sx={{
                                                    color: post.user_liked ? THEME.error : THEME.text.secondary,
                                                    '&:hover': {
                                                        backgroundColor: post.user_liked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                                    }
                                                }}
                                            >
                                                {post.user_liked ? <FavoriteOutlined /> : <FavoriteBorderOutlined />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleBookmark(post)}
                                                sx={{
                                                    color: post.user_bookmarked ? THEME.accent : THEME.text.secondary,
                                                    '&:hover': {
                                                        backgroundColor: post.user_bookmarked ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                                    }
                                                }}
                                            >
                                                {post.user_bookmarked ? <BookmarkOutlined /> : <BookmarkBorderOutlined />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleShare(post)}
                                                sx={{ color: THEME.text.secondary }}
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
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
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
                    <Typography variant="h6" color={THEME.text.secondary} gutterBottom>
                        {searchTerm ? 'No se encontraron posts' : 'No hay posts publicados'}
                    </Typography>
                    <Typography variant="body2" color={THEME.text.light}>
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los posts aparecerán aquí cuando sean publicados'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default PostsTab;
