import React, { useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    IconButton,
    Box,
    Avatar,
    TextField,
    InputAdornment,
    Divider
} from '@mui/material';
import {
    ThumbUpOutlined,
    ThumbUpAlt,
    ThumbDownOutlined,
    ThumbDownAlt,
    SearchOutlined,
    CommentOutlined,
    LaunchOutlined,
    VerifiedOutlined
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

const CommentsTab = ({ comments = [], currentUser, onLikeComment, onDislikeComment }) => {
    const [searchTerm, setSearchTerm] = useState('');



    const filteredComments = comments.filter(comment => {
        if (!comment) return false;

        // Check if comment has content (could be 'body' or 'content')
        const commentText = comment.content || comment.body;
        if (!commentText) return false;

        const contentMatch = commentText.toLowerCase().includes(searchTerm.toLowerCase());
        const titleMatch = comment.post?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

        return contentMatch || titleMatch;
    });

    const handleLikeComment = async (comment) => {
        if (onLikeComment) {
            await onLikeComment(comment.id);
        }
    };

    const handleDislikeComment = async (comment) => {
        if (onDislikeComment) {
            await onDislikeComment(comment.id);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar comentarios..."
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

            {/* Comments Grid */}
            <Grid container spacing={2}>
                <AnimatePresence>
                    {filteredComments.map((comment) => (
                        <Grid item xs={12} key={comment.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ y: -1 }}
                            >
                                <Card
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        backgroundColor: THEME.glass,
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        minHeight: 120,
                                        '&:hover': {
                                            backgroundColor: THEME.surface,
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                            transform: 'translateY(-1px)',
                                        }
                                    }}
                                >
                                    {/* Left side - Avatar */}
                                    <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start' }}>
                                        <Avatar
                                            src={comment.user?.avatar}
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                backgroundColor: THEME.primary,
                                                fontSize: '1.1rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            {comment.user?.name?.charAt(0) || comment.author_name?.charAt(0) || 'U'}
                                        </Avatar>
                                    </Box>

                                    {/* Main content */}
                                    <CardContent sx={{ flexGrow: 1, p: 2, pt: 2 }}>
                                        {/* Header with user info and post context */}
                                        <Box sx={{ mb: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={600} color={THEME.text.primary}>
                                                    {comment.user?.name || comment.author_name || 'Usuario'}
                                                </Typography>
                                                {comment.user?.is_verified && (
                                                    <VerifiedOutlined sx={{ fontSize: 16, color: THEME.success }} />
                                                )}
                                                <Typography variant="caption" color={THEME.text.light}>
                                                    •
                                                </Typography>
                                                <Typography variant="caption" color={THEME.text.light}>
                                                    {format(new Date(comment.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                                                </Typography>
                                            </Box>

                                            <Typography variant="caption" color={THEME.text.light}>
                                                Comentario en:
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color={THEME.primary}
                                                    sx={{
                                                        ml: 0.5,
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        '&:hover': { textDecoration: 'underline' }
                                                    }}
                                                    onClick={() => {
                                                        if (comment.post?.slug) {
                                                            window.open(`/blog/${comment.post.slug}#comment-${comment.id}`, '_blank');
                                                        }
                                                    }}
                                                >
                                                    {comment.post?.title || 'Post no disponible'}
                                                </Typography>
                                            </Typography>
                                        </Box>

                                        {/* Comment Content */}
                                        <Typography
                                            variant="body2"
                                            color={THEME.text.primary}
                                            sx={{
                                                mb: 1.5,
                                                lineHeight: 1.5,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {comment.body || comment.content || 'Contenido no disponible'}
                                        </Typography>

                                        {/* Stats and Actions */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="caption" color={THEME.text.light}>
                                                    {comment.likes_count || 0} 👍
                                                </Typography>
                                                <Typography variant="caption" color={THEME.text.light}>
                                                    {comment.dislikes_count || 0} 👎
                                                </Typography>
                                                <Typography variant="caption" color={THEME.text.light}>
                                                    {comment.replies_count || 0} respuestas
                                                </Typography>
                                            </Box>

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<LaunchOutlined />}
                                                onClick={() => {
                                                    if (comment.post?.slug) {
                                                        window.open(`/blog/${comment.post.slug}#comment-${comment.id}`, '_blank');
                                                    }
                                                }}
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    py: 0.5,
                                                    px: 1,
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                    color: THEME.text.light,
                                                    '&:hover': {
                                                        borderColor: THEME.primary,
                                                        color: THEME.primary,
                                                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                                    }
                                                }}
                                            >
                                                Ver en post
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            {/* Empty State */}
            {filteredComments.length === 0 && (
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
                    <CommentOutlined sx={{ fontSize: 48, color: THEME.text.light, mb: 2 }} />
                    <Typography variant="h6" color={THEME.text.secondary} gutterBottom>
                        {searchTerm ? 'No se encontraron comentarios' : 'No has hecho comentarios'}
                    </Typography>
                    <Typography variant="body2" color={THEME.text.light}>
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Tus comentarios aparecerán aquí cuando participes en las discusiones'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default CommentsTab;
